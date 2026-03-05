import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';
import { Roles } from '../auth/auth.decorators';
import { UserRole } from '@prisma/client';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  async findAll() {
    return this.sitesService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.sitesService.findActive();
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  async getDashboard() {
    return this.sitesService.getDashboard();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sitesService.findById(id);
  }

  @Get(':id/workers')
  @Roles(UserRole.ADMIN)
  async getActiveWorkers(@Param('id', ParseUUIDPipe) id: string) {
    return this.sitesService.getActiveWorkers(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSiteDto) {
    return this.sitesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.sitesService.delete(id);
  }
}
