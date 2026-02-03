import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';

export class CreateSiteDto {
    @IsString({ message: '現場名を入力してください' })
    name: string;

    @IsString({ message: '住所を入力してください' })
    address: string;

    @IsNumber({}, { message: '緯度は数値で入力してください' })
    @Min(-90, { message: '緯度は-90から90の範囲で入力してください' })
    @Max(90, { message: '緯度は-90から90の範囲で入力してください' })
    latitude: number;

    @IsNumber({}, { message: '経度は数値で入力してください' })
    @Min(-180, { message: '経度は-180から180の範囲で入力してください' })
    @Max(180, { message: '経度は-180から180の範囲で入力してください' })
    longitude: number;

    @IsOptional()
    @IsNumber({}, { message: '有効範囲は数値で入力してください' })
    @Min(10, { message: '有効範囲は10メートル以上で入力してください' })
    radius?: number;

    @IsDateString({}, { message: '工期開始日の形式が正しくありません' })
    startDate: string;

    @IsOptional()
    @IsDateString({}, { message: '工期終了日の形式が正しくありません' })
    endDate?: string;
}

export class UpdateSiteDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(10)
    radius?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
