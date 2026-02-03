import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('ユーザーが見つかりません');
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async create(dto: CreateUserDto) {
        const existingUser = await this.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('このメールアドレスは既に登録されています');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                role: dto.role || 'WORKER',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        await this.findById(id);

        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async delete(id: string) {
        await this.findById(id);

        await this.prisma.user.delete({
            where: { id },
        });

        return { message: 'ユーザーを削除しました' };
    }

    async getWorkers() {
        return this.prisma.user.findMany({
            where: {
                role: 'WORKER',
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
            orderBy: { name: 'asc' },
        });
    }
}
