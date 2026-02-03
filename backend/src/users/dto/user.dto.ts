import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
    @IsEmail({}, { message: 'メールアドレスの形式が正しくありません' })
    email: string;

    @IsString({ message: 'パスワードを入力してください' })
    @MinLength(6, { message: 'パスワードは6文字以上で入力してください' })
    password: string;

    @IsString({ message: '名前を入力してください' })
    @MinLength(1, { message: '名前を入力してください' })
    name: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'ロールはADMINまたはWORKERを指定してください' })
    role?: UserRole;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
