import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { CurrentUser, Roles } from '../auth/auth.decorators';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  getMyNotifications(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getMyNotifications(user.id);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Put(':notificationId/read')
  markAsRead(@CurrentUser() user: { id: string }, @Param('notificationId') notificationId: string) {
    return this.notificationsService.markAsRead(user.id, notificationId);
  }

  @Put('read-all')
  markAllAsRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get('all')
  @Roles('ADMIN')
  getAllNotifications() {
    return this.notificationsService.getAllNotifications();
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
