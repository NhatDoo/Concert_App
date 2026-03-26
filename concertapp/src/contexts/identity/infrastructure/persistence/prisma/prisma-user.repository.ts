import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { IUserRepository } from '../../../domain/repository/user.repository.interface';
import { User } from '../../../domain/entity/user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({
            where: { id: id }
        });
        if (!raw) return null;
        return UserMapper.toDomain(raw);
    }

    async findByEmail(email: string): Promise<User | null> {
        const raw = await this.prisma.user.findUnique({
            where: { email: email }
        });
        if (!raw) return null;
        return UserMapper.toDomain(raw);
    }

    async save(user: User): Promise<void> {
        const persistence = UserMapper.toPersistence(user);

        // Upsert because this handles both create and update for aggregates seamlessly
        await this.prisma.user.upsert({
            where: { id: persistence.id },
            update: {
                name: persistence.name,
                phoneNumber: persistence.phoneNumber,
                email: persistence.email,
                password: persistence.password,
                role: persistence.role,
                refreshToken: persistence.refreshToken
            },
            create: {
                id: persistence.id,
                name: persistence.name,
                phoneNumber: persistence.phoneNumber,
                email: persistence.email,
                password: persistence.password,
                role: persistence.role,
                refreshToken: persistence.refreshToken
            }
        });
    }
}
