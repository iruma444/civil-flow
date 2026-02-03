import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { AttendanceModule } from './attendance/attendance.module';
import { WorkLogsModule } from './work-logs/work-logs.module';
import { StatisticsModule } from './statistics/statistics.module';
import { LeavesModule } from './leaves/leaves.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WeatherModule } from './weather/weather.module';
import { ExportModule } from './export/export.module';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        SitesModule,
        AttendanceModule,
        WorkLogsModule,
        StatisticsModule,
        LeavesModule,
        NotificationsModule,
        WeatherModule,
        ExportModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }


