import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorators';

@Controller('leaves')
export class LeavesController {
    constructor(private readonly leavesService: LeavesService) { }

    @Get('types')
    getLeaveTypes() {
        return this.leavesService.getLeaveTypes();
    }

    @Post()
    create(
        @CurrentUser() user: { id: string },
        @Body() dto: CreateLeaveDto,
    ) {
        return this.leavesService.create(user.id, dto);
    }

    @Get('my')
    getMyLeaves(@CurrentUser() user: { id: string }) {
        return this.leavesService.getMyLeaves(user.id);
    }

    @Get('all')
    @Roles('ADMIN')
    getAllLeaves(@Query('status') status?: string) {
        return this.leavesService.getAllLeaves(status);
    }

    @Put(':id/status')
    @Roles('ADMIN')
    updateStatus(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() dto: UpdateLeaveStatusDto,
    ) {
        return this.leavesService.updateStatus(id, user.id, dto);
    }

    @Delete(':id')
    cancel(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.leavesService.cancel(id, user.id);
    }
}
