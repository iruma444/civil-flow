import { IsOptional, IsString, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { WorkType } from '@prisma/client';

export class CreateWorkLogDto {
    @IsUUID('4', { message: '勤怠IDの形式が正しくありません' })
    attendanceId: string;

    @IsEnum(WorkType, { message: '作業種別の形式が正しくありません' })
    workType: WorkType;

    @IsOptional()
    @IsString()
    description?: string;
}

export class WorkLogQueryDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(WorkType)
    workType?: WorkType;
}
