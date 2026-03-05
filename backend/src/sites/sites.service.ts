import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';

export interface SiteWithWorkerCount {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  currentWorkerCount: number;
}

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.site.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
    });

    if (!site) {
      throw new NotFoundException('現場が見つかりません');
    }

    return site;
  }

  async create(dto: CreateSiteDto) {
    return this.prisma.site.create({
      data: {
        name: dto.name,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radius: dto.radius || 100,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async update(id: string, dto: UpdateSiteDto) {
    await this.findById(id);

    return this.prisma.site.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.site.delete({
      where: { id },
    });

    return { message: '現場を削除しました' };
  }

  /**
   * 現場ダッシュボード - 各現場の稼働人数を取得
   */
  async getDashboard(): Promise<SiteWithWorkerCount[]> {
    const sites = await this.prisma.site.findMany({
      where: { isActive: true },
      include: {
        attendances: {
          where: {
            clockOut: null, // まだ退勤していない人
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sites.map((site) => ({
      id: site.id,
      name: site.name,
      address: site.address,
      latitude: site.latitude,
      longitude: site.longitude,
      radius: site.radius,
      startDate: site.startDate,
      endDate: site.endDate,
      isActive: site.isActive,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
      currentWorkerCount: site.attendances.length,
    }));
  }

  /**
   * 特定の現場の稼働中作業員一覧を取得
   */
  async getActiveWorkers(siteId: string) {
    await this.findById(siteId);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        siteId,
        clockOut: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { clockIn: 'asc' },
    });

    return attendances.map((a) => ({
      attendanceId: a.id,
      clockIn: a.clockIn,
      user: a.user,
    }));
  }
}
