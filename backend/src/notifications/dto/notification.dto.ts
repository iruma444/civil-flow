import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsEnum(['INFO', 'WARNING', 'ALERT', 'REMINDER'])
  type?: 'INFO' | 'WARNING' | 'ALERT' | 'REMINDER';

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
