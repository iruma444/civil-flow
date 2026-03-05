import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';

@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 休暇申請作成
   */
  async create(userId: string, dto: CreateLeaveDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('終了日は開始日以降を指定してください');
    }

    // 重複チェック
    const overlap = await this.prisma.leave.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
      },
    });

    if (overlap) {
      throw new BadRequestException('指定期間に既存の休暇申請があります');
    }

    return this.prisma.leave.create({
      data: {
        userId,
        leaveType: dto.leaveType,
        startDate,
        endDate,
        reason: dto.reason,
      },
    });
  }

  /**
   * 自分の休暇申請一覧
   */
  async getMyLeaves(userId: string) {
    return this.prisma.leave.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * 全休暇申請一覧（管理者用）
   */
  async getAllLeaves(status?: string) {
    const whereClause = status
      ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' }
      : {};

    return this.prisma.leave.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 休暇申請の承認/却下（管理者用）
   */
  async updateStatus(leaveId: string, adminId: string, dto: UpdateLeaveStatusDto) {
    const leave = await this.prisma.leave.findUnique({ where: { id: leaveId } });

    if (!leave) {
      throw new NotFoundException('休暇申請が見つかりません');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('この申請は既に処理されています');
    }

    return this.prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: dto.status,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * 休暇申請のキャンセル（本人のみ）
   */
  async cancel(leaveId: string, userId: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id: leaveId } });

    if (!leave) {
      throw new NotFoundException('休暇申請が見つかりません');
    }

    if (leave.userId !== userId) {
      throw new BadRequestException('この申請をキャンセルする権限がありません');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('申請中の休暇のみキャンセルできます');
    }

    return this.prisma.leave.update({
      where: { id: leaveId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * 休暇種別の日本語ラベル取得
   */
  getLeaveTypes() {
    return [
      { value: 'PAID', label: '有給休暇' },
      { value: 'UNPAID', label: '無給休暇' },
      { value: 'SICK', label: '病欠' },
      { value: 'SPECIAL', label: '特別休暇' },
      { value: 'COMPENSATORY', label: '代休' },
    ];
  }
}
