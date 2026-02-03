import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 通知作成（管理者用）
     */
    async create(dto: CreateNotificationDto) {
        const notification = await this.prisma.notification.create({
            data: {
                title: dto.title,
                content: dto.content,
                type: dto.type || 'INFO',
                isGlobal: dto.isGlobal ?? true,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            },
        });

        // 全体通知の場合、全ユーザーにUserNotificationを作成
        if (notification.isGlobal) {
            const users = await this.prisma.user.findMany({
                where: { isActive: true },
                select: { id: true },
            });

            await this.prisma.userNotification.createMany({
                data: users.map((user) => ({
                    userId: user.id,
                    notificationId: notification.id,
                })),
            });
        }

        return notification;
    }

    /**
     * 自分の通知一覧
     */
    async getMyNotifications(userId: string) {
        const userNotifications = await this.prisma.userNotification.findMany({
            where: { userId },
            include: {
                notification: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return userNotifications.map((un) => ({
            id: un.id,
            notificationId: un.notificationId,
            title: un.notification.title,
            content: un.notification.content,
            type: un.notification.type,
            isRead: un.isRead,
            readAt: un.readAt,
            createdAt: un.notification.createdAt,
        }));
    }

    /**
     * 未読通知数
     */
    async getUnreadCount(userId: string) {
        const count = await this.prisma.userNotification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    /**
     * 通知を既読にする
     */
    async markAsRead(userId: string, notificationId: string) {
        const userNotification = await this.prisma.userNotification.findFirst({
            where: { userId, notificationId },
        });

        if (!userNotification) {
            throw new NotFoundException('通知が見つかりません');
        }

        return this.prisma.userNotification.update({
            where: { id: userNotification.id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    /**
     * 全通知を既読にする
     */
    async markAllAsRead(userId: string) {
        await this.prisma.userNotification.updateMany({
            where: { userId, isRead: false },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
        return { message: '全ての通知を既読にしました' };
    }

    /**
     * 全通知一覧（管理者用）
     */
    async getAllNotifications() {
        return this.prisma.notification.findMany({
            include: {
                _count: {
                    select: { recipients: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * 通知削除（管理者用）
     */
    async delete(notificationId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            throw new NotFoundException('通知が見つかりません');
        }

        await this.prisma.notification.delete({
            where: { id: notificationId },
        });

        return { message: '通知を削除しました' };
    }
}
