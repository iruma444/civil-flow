import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WorkType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkLogDto } from './dto/work-log.dto';

@Injectable()
export class WorkLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 作業種別の一覧を取得
   */
  getWorkTypes() {
    const workTypeLabels: Record<WorkType, string> = {
      EXCAVATION: '掘削',
      CONCRETE_POURING: 'コンクリート打設',
      REBAR_WORK: '鉄筋工事',
      FORMWORK: '型枠工事',
      FOUNDATION: '基礎工事',
      PAVING: '舗装',
      DRAINAGE: '排水工事',
      SURVEYING: '測量',
      SAFETY_CHECK: '安全確認',
      CLEANUP: '清掃・片付け',
      OTHER: 'その他',
    };

    return Object.entries(workTypeLabels).map(([value, label]) => ({
      value,
      label,
    }));
  }

  /**
   * 日報を作成
   */
  async create(userId: string, dto: CreateWorkLogDto) {
    // 勤怠記録の存在確認と所有者チェック
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: dto.attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('勤怠記録が見つかりません');
    }

    if (attendance.userId !== userId) {
      throw new ForbiddenException('この勤怠記録にアクセスする権限がありません');
    }

    return this.prisma.workLog.create({
      data: {
        attendanceId: dto.attendanceId,
        userId,
        workType: dto.workType,
        description: dto.description,
      },
    });
  }

  /**
   * 自分の日報一覧を取得
   */
  async getMyWorkLogs(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      workType?: WorkType;
    },
  ) {
    const where = {
      userId,
      ...(options?.workType && { workType: options.workType }),
      ...(options?.startDate &&
        options?.endDate && {
          createdAt: {
            gte: options.startDate,
            lte: options.endDate,
          },
        }),
    };

    return this.prisma.workLog.findMany({
      where,
      include: {
        attendance: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 管理者用：全日報を取得
   */
  async getAllWorkLogs(
    options?: {
      startDate?: Date;
      endDate?: Date;
      workType?: WorkType;
      userId?: string;
      siteId?: string;
    },
    page = 1,
    limit = 50,
  ) {
    const skip = (page - 1) * limit;

    const where = {
      ...(options?.userId && { userId: options.userId }),
      ...(options?.workType && { workType: options.workType }),
      ...(options?.startDate &&
        options?.endDate && {
          createdAt: {
            gte: options.startDate,
            lte: options.endDate,
          },
        }),
      ...(options?.siteId && {
        attendance: {
          siteId: options.siteId,
        },
      }),
    };

    const [workLogs, total] = await Promise.all([
      this.prisma.workLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attendance: {
            include: {
              site: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.workLog.count({ where }),
    ]);

    return {
      data: workLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 日報を削除
   */
  async delete(userId: string, id: string, isAdmin: boolean) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
    });

    if (!workLog) {
      throw new NotFoundException('日報が見つかりません');
    }

    if (!isAdmin && workLog.userId !== userId) {
      throw new ForbiddenException('この日報を削除する権限がありません');
    }

    await this.prisma.workLog.delete({
      where: { id },
    });

    return { message: '日報を削除しました' };
  }
}
