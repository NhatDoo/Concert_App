import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { IOrganizeRepository } from '../../../domain/repository/organize.repository.interface';
import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';
import { OrganizeMapper } from './organize.mapper';

@Injectable()
export class PrismaOrganizeRepository implements IOrganizeRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<OrganizeAggregate | null> {
        const raw = await this.prisma.organize.findUnique({
            where: { id },
            include: {
                location: true,
                equipments: {
                    include: { detail_divide: true }
                },
                logistics: true,
                concert: {
                    include: {
                        staffs: {
                            include: { tasks: true }
                        }
                    }
                }
            }
        });

        if (!raw) return null;
        return OrganizeMapper.toDomain(raw);
    }

    async findByConcertId(concertId: string): Promise<OrganizeAggregate | null> {
        const raw = await this.prisma.organize.findUnique({
            where: { concertId },
            include: {
                location: true,
                equipments: {
                    include: { detail_divide: true }
                },
                logistics: true,
                concert: {
                    include: {
                        staffs: {
                            include: { tasks: true }
                        }
                    }
                }
            }
        });

        if (!raw) return null;
        return OrganizeMapper.toDomain(raw);
    }

    async save(organize: OrganizeAggregate): Promise<void> {
        const persistence = OrganizeMapper.toPersistence(organize);

        // Transaction is safe for aggregate multi-table updates
        await this.prisma.$transaction(async (tx) => {

            // 1. Handle Location creation/upsert
            if (persistence.location) {
                await tx.location.upsert({
                    where: { id: persistence.location.id },
                    update: {
                        name: persistence.location.name,
                        address: persistence.location.address,
                        capacity: persistence.location.capacity
                    },
                    create: {
                        id: persistence.location.id,
                        name: persistence.location.name,
                        address: persistence.location.address,
                        capacity: persistence.location.capacity
                    }
                });
            }

            // 2. Upsert Organize Root
            await tx.organize.upsert({
                where: { id: persistence.id },
                update: {
                    locationId: persistence.location?.id || null,
                },
                create: {
                    id: persistence.id,
                    concertId: persistence.concertId,
                    locationId: persistence.location?.id || null,
                }
            });

            // 3. Resync Logistics (Delete all & Recreate to avoid complex diffing or upsert individually)
            await tx.logistics.deleteMany({ where: { organizeId: persistence.id } });
            if (persistence.logistics.length > 0) {
                await tx.logistics.createMany({
                    data: persistence.logistics.map(l => ({
                        id: l.id,
                        organizeId: persistence.id,
                        taskName: l.taskName,
                        vendor: l.vendor,
                        cost: l.cost,
                        status: l.status
                    }))
                });
            }

            // 4. Resync Equipments (Divide)
            await tx.divide.deleteMany({ where: { organizeId: persistence.id } });
            for (const equipment of persistence.equipments) {
                await tx.divide.create({
                    data: {
                        id: equipment.id,
                        organizeId: persistence.id,
                        name: equipment.name,
                        detail_divide: {
                            create: equipment.detail_divide.map(d => ({
                                name: d.name
                            }))
                        }
                    }
                });
            }

            // 5. Resync Staff (Staff is connected to Concert, not Organize directly in Schema)
            // But OrganizeAggregate manages it.
            await tx.staff.deleteMany({ where: { concertId: persistence.concertId } });
            if (persistence.staffs.length > 0) {
                for (const s of persistence.staffs) {
                    await tx.staff.create({
                        data: {
                            id: s.id,
                            userId: s.userId,
                            name: s.name,
                            role: s.role,
                            concertId: persistence.concertId,
                            tasks: {
                                create: s.tasks.map(t => ({
                                    id: t.id,
                                    description: t.description,
                                    status: t.status
                                }))
                            }
                        }
                    });
                }
            }
        });
    }
}
