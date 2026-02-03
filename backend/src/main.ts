import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // グローバルプレフィックス
    app.setGlobalPrefix('api');

    // CORS設定
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    // グローバルバリデーションパイプ
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // グローバル例外フィルター
    app.useGlobalFilters(new HttpExceptionFilter());

    // グローバルレスポンス変換インターセプター
    app.useGlobalInterceptors(new TransformInterceptor());

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Civil-Flow Backend is running on: http://localhost:${port}/api`);
}
bootstrap();
