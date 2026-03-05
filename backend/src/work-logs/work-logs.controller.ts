import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto } from './dto/work-log.dto';
import { CurrentUser, Roles } from '../auth/auth.decorators';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.strategy';

@Controller('work-logs')
export class WorkLogsController {
  constructor(private readonly workLogsService: WorkLogsService) {}

  @Get('types')
  getWorkTypes() {
    return this.workLogsService.getWorkTypes();
  }

  @Get('my')
  async getMyWorkLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.workLogsService.getMyWorkLogs(user.id);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllWorkLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.workLogsService.getAllWorkLogs({}, page, limit);
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWorkLogDto) {
    return this.workLogsService.create(user.id, dto);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.workLogsService.delete(user.id, id, isAdmin);
  }
}
