import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @IsEmail({}, { message: 'メールアドレスの形式が正しくありません' })
  email: string;

  @IsString({ message: 'パスワードを入力してください' })
  @MinLength(6, { message: 'パスワードは6文字以上で入力してください' })
  password: string;
}

export class RegisterDto {
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
