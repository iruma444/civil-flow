import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'メールアドレスの形式が正しくありません' })
    email: string;

    @IsString({ message: 'パスワードを入力してください' })
    @MinLength(6, { message: 'パスワードは6文字以上で入力してください' })
    password: string;
}
