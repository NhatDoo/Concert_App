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
                        },
                        requirements: true,
                        zones: {
                            include: {
                                shifts: {
                                    include: { assignments: true }
                                }
                            }
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

        await this.prisma.$transaction(async (tx) => {

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

            // Sync Staff Tasks while keeping Staff records primarily managed by recruitment flow
            // Note: In this architecture, it's safer to upsert staff tasks rather than deleting all staff
            for (const s of persistence.staffs) {
                // We only sync tasks here as staff membership is handled by applications/direct invite
                await tx.staffTask.deleteMany({ where: { staffId: s.id } });
                if (s.tasks.length > 0) {
                    await tx.staffTask.createMany({
                        data: s.tasks.map(t => ({
                            id: t.id,
                            staffId: s.id,
                            managerId: t.managerId,
                            taskName: t.taskName,
                            description: t.description,
                            status: t.status,
                            dueDate: t.dueDate
                        }))
                    });
                }
            }
            // Persist Requirements
            await tx.eventRequirement.deleteMany({ where: { concertId: persistence.concertId } });
            if (persistence.requirements.length > 0) {
                await tx.eventRequirement.createMany({
                    data: persistence.requirements.map(req => ({
                        id: req.id,
                        concertId: persistence.concertId,
                        authorId: req.authorId,
                        vendorId: req.vendorId,
                        title: req.title,
                        description: req.description,
                        status: req.status,
                        staffNeeded: req.staffNeeded,
                        equipmentNeeded: req.equipmentNeeded,
                        budgetAllocated: req.budgetAllocated,
                        createdAt: req.createdAt,
                        updatedAt: req.updatedAt 
                    }))
                });
            }

            // Persist Zones, Shifts, and Assignments
            await tx.shiftAssignment.deleteMany({ where: { shift: { zone: { concertId: persistence.concertId } } } });
            await tx.shift.deleteMany({ where: { zone: { concertId: persistence.concertId } } });
            await tx.zone.deleteMany({ where: { concertId: persistence.concertId } });

            for (const z of persistence.zones) {
                await tx.zone.create({
                    data: {
                        id: z.id,
                        concertId: persistence.concertId,
                        name: z.name,
                        description: z.description,
                        capacity: z.capacity,
                        shifts: {
                            create: z.shifts.map(sh => ({
                                id: sh.id,
                                managerId: sh.managerId,
                                title: sh.title,
                                description: sh.description,
                                startTime: sh.startTime,
                                endTime: sh.endTime,
                                headcount: sh.headcount,
                                assignments: {
                                    create: sh.assignments.map(a => ({
                                        id: a.id,
                                        staffId: a.staffId,
                                        status: a.status,
                                        checkIn: a.checkIn,
                                        checkOut: a.checkOut
                                    }))
                                }
                            }))
                        }
                    }
                });
            }
        });
    }
}
