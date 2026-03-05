import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto, ClockOutDto } from './dto/attendance.dto';
import { getLocationValidationDetails } from './utils/geo.utils';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 出勤処理
   */
  async clockIn(userId: string, dto: ClockInDto) {
    // 現場の存在確認
    const site = await this.prisma.site.findUnique({
      where: { id: dto.siteId },
    });

    if (!site) {
      throw new NotFoundException('現場が見つかりません');
    }

    if (!site.isActive) {
      throw new BadRequestException('この現場は現在稼働していません');
    }

    // 既に出勤中かチェック
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        clockOut: null,
      },
    });

    if (existingAttendance) {
      throw new ConflictException('既に出勤中です。先に退勤してください');
    }

    // GPS位置情報の検証
    const locationDetails = getLocationValidationDetails(
      dto.latitude,
      dto.longitude,
      site.latitude,
      site.longitude,
      site.radius,
    );

    if (!locationDetails.isWithin) {
      throw new BadRequestException(
        `現場の有効範囲外です。現場から${locationDetails.distance}m離れています（有効範囲: ${locationDetails.radius}m）`,
      );
    }

    // 出勤記録を作成
    const attendance = await this.prisma.attendance.create({
      data: {
        userId,
        siteId: dto.siteId,
        clockIn: new Date(),
        clockInLat: dto.latitude,
        clockInLng: dto.longitude,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return {
      id: attendance.id,
      clockIn: attendance.clockIn,
      site: attendance.site,
      location: {
        latitude: attendance.clockInLat,
        longitude: attendance.clockInLng,
        distanceFromSite: locationDetails.distance,
      },
      message: `${attendance.site.name}に出勤しました`,
    };
  }

  /**
   * 退勤処理（日報連動）
   */
  async clockOut(userId: string, dto: ClockOutDto) {
    // 出勤中の記録を取得
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        clockOut: null,
      },
      include: {
        site: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('出勤記録が見つかりません。先に出勤してください');
    }

    // GPS位置情報の検証
    const locationDetails = getLocationValidationDetails(
      dto.latitude,
      dto.longitude,
      attendance.site.latitude,
      attendance.site.longitude,
      attendance.site.radius,
    );

    if (!locationDetails.isWithin) {
      throw new BadRequestException(
        `現場の有効範囲外です。現場から${locationDetails.distance}m離れています（有効範囲: ${locationDetails.radius}m）`,
      );
    }

    // 日報がない場合はエラー
    if (!dto.workLogs || dto.workLogs.length === 0) {
      throw new BadRequestException('作業記録を1件以上入力してください');
    }

    // トランザクションで退勤と日報を同時に保存
    const result = await this.prisma.$transaction(async (tx) => {
      // 退勤記録を更新
      const updatedAttendance = await tx.attendance.update({
        where: { id: attendance.id },
        data: {
          clockOut: new Date(),
          clockOutLat: dto.latitude,
          clockOutLng: dto.longitude,
        },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      });

      // 日報を作成
      const workLogs = await Promise.all(
        dto.workLogs.map((log) =>
          tx.workLog.create({
            data: {
              attendanceId: attendance.id,
              userId,
              workType: log.workType,
              description: log.description,
            },
          }),
        ),
      );

      return { attendance: updatedAttendance, workLogs };
    });

    // 勤務時間を計算（分）
    const workMinutes = Math.round(
      (result.attendance.clockOut!.getTime() - result.attendance.clockIn.getTime()) / 60000,
    );
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;

    return {
      id: result.attendance.id,
      clockIn: result.attendance.clockIn,
      clockOut: result.attendance.clockOut,
      workDuration: `${hours}時間${minutes}分`,
      site: result.attendance.site,
      workLogs: result.workLogs,
      location: {
        latitude: result.attendance.clockOutLat,
        longitude: result.attendance.clockOutLng,
        distanceFromSite: locationDetails.distance,
      },
      message: `${result.attendance.site.name}から退勤しました`,
    };
  }

  /**
   * 自分の現在の出勤状態を取得
   */
  async getCurrentStatus(userId: string) {
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        clockOut: null,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            radius: true,
          },
        },
      },
    });

    if (!attendance) {
      return {
        isClockedIn: false,
        attendance: null,
      };
    }

    return {
      isClockedIn: true,
      attendance: {
        id: attendance.id,
        clockIn: attendance.clockIn,
        site: attendance.site,
      },
    };
  }

  /**
   * 自分の勤怠履歴を取得
   */
  async getMyHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { userId },
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          workLogs: true,
        },
        orderBy: { clockIn: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.attendance.count({ where: { userId } }),
    ]);

    return {
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 管理者用：全勤怠履歴を取得
   */
  async getAllHistory(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          site: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          workLogs: true,
        },
        orderBy: { clockIn: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.attendance.count(),
    ]);

    return {
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
