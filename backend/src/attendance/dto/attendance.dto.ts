import { IsString, IsNumber, IsOptional, IsUUID, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkType } from '@prisma/client';

export class LocationDto {
    @IsNumber({}, { message: '緯度は数値で入力してください' })
    @Min(-90, { message: '緯度は-90から90の範囲で入力してください' })
    @Max(90, { message: '緯度は-90から90の範囲で入力してください' })
    latitude: number;

    @IsNumber({}, { message: '経度は数値で入力してください' })
    @Min(-180, { message: '経度は-180から180の範囲で入力してください' })
    @Max(180, { message: '経度は-180から180の範囲で入力してください' })
    longitude: number;
}

export class ClockInDto extends LocationDto {
    @IsUUID('4', { message: '現場IDの形式が正しくありません' })
    siteId: string;
}

export class WorkLogInputDto {
    @IsString({ message: '作業種別を選択してください' })
    workType: WorkType;

    @IsOptional()
    @IsString()
    description?: string;
}

export class ClockOutDto extends LocationDto {
    @IsArray({ message: '作業記録は配列で入力してください' })
    @ValidateNested({ each: true })
    @Type(() => WorkLogInputDto)
    workLogs: WorkLogInputDto[];
}
