import { PrismaClient, UserRole, WorkType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 管理者ユーザーを作成
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@civilflow.jp' },
        update: {},
        create: {
            email: 'admin@civilflow.jp',
            password: adminPassword,
            name: '管理者 太郎',
            role: UserRole.ADMIN,
        },
    });
    console.log(`✅ Created admin user: ${admin.email}`);

    // 作業員ユーザーを作成
    const workerPassword = await bcrypt.hash('worker123', 10);
    const workers = await Promise.all([
        prisma.user.upsert({
            where: { email: 'yamada@civilflow.jp' },
            update: {},
            create: {
                email: 'yamada@civilflow.jp',
                password: workerPassword,
                name: '山田 太郎',
                role: UserRole.WORKER,
            },
        }),
        prisma.user.upsert({
            where: { email: 'tanaka@civilflow.jp' },
            update: {},
            create: {
                email: 'tanaka@civilflow.jp',
                password: workerPassword,
                name: '田中 次郎',
                role: UserRole.WORKER,
            },
        }),
        prisma.user.upsert({
            where: { email: 'suzuki@civilflow.jp' },
            update: {},
            create: {
                email: 'suzuki@civilflow.jp',
                password: workerPassword,
                name: '鈴木 三郎',
                role: UserRole.WORKER,
            },
        }),
    ]);
    console.log(`✅ Created ${workers.length} worker users`);

    // 現場を作成
    const sites = await Promise.all([
        prisma.site.upsert({
            where: { id: 'site-tokyo-station' },
            update: {},
            create: {
                id: 'site-tokyo-station',
                name: '東京駅前再開発工事',
                address: '東京都千代田区丸の内1丁目',
                latitude: 35.6812,
                longitude: 139.7671,
                radius: 100,
                startDate: new Date('2024-01-15'),
                endDate: new Date('2025-03-31'),
            },
        }),
        prisma.site.upsert({
            where: { id: 'site-shibuya' },
            update: {},
            create: {
                id: 'site-shibuya',
                name: '渋谷道路拡張工事',
                address: '東京都渋谷区道玄坂2丁目',
                latitude: 35.6580,
                longitude: 139.7016,
                radius: 150,
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-12-31'),
            },
        }),
        prisma.site.upsert({
            where: { id: 'site-yokohama' },
            update: {},
            create: {
                id: 'site-yokohama',
                name: '横浜港湾整備事業',
                address: '神奈川県横浜市中区海岸通1丁目',
                latitude: 35.4437,
                longitude: 139.6380,
                radius: 200,
                startDate: new Date('2024-03-01'),
                endDate: null,
            },
        }),
    ]);
    console.log(`✅ Created ${sites.length} sites`);

    // サンプル勤怠データを作成
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(8, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(17, 30, 0, 0);

    const attendance = await prisma.attendance.create({
        data: {
            userId: workers[0].id,
            siteId: sites[0].id,
            clockIn: yesterday,
            clockOut: yesterdayEnd,
            clockInLat: 35.6812,
            clockInLng: 139.7671,
            clockOutLat: 35.6812,
            clockOutLng: 139.7672,
        },
    });
    console.log('✅ Created sample attendance record');

    // サンプル日報データを作成
    await prisma.workLog.createMany({
        data: [
            {
                attendanceId: attendance.id,
                userId: workers[0].id,
                workType: WorkType.EXCAVATION,
                description: '基礎部分の掘削作業を実施',
            },
            {
                attendanceId: attendance.id,
                userId: workers[0].id,
                workType: WorkType.SAFETY_CHECK,
                description: '作業前後の安全確認を実施',
            },
        ],
    });
    console.log('✅ Created sample work logs');

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
