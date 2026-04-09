import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';
import { Location } from '../../../domain/entity/location.entity';
import { Divide } from '../../../domain/entity/devide.entity';
import { DetailDivide } from '../../../domain/entity/detail_devide';
import { Logistics, LogisticsStatus } from '../../../domain/entity/logistics.entity';
import { Staff } from '../../../domain/entity/staff.entity';
import { StaffRole } from '../../../domain/VO/staff.role';
import { StaffTask, StaffTaskStatus } from '../../../domain/entity/staff-task.entity';
import { EventRequirement, EventRequirementStatus } from '../../../domain/entity/event-requirement.entity';
import { Zone } from '../../../domain/entity/zone.entity';
import { Shift } from '../../../domain/entity/shift.entity';
import { ShiftAssignment } from '../../../domain/entity/shift-assignment.entity';

export class OrganizeMapper {
    static toDomain(raw: any): OrganizeAggregate | null {
        if (!raw) return null;

        let locationVal: Location | null = null;
        if (raw.location) {
            locationVal = new Location(
                raw.location.id,
                raw.location.name,
                raw.location.address,
                raw.location.capacity
            );
        }

        const equipments: Divide[] = (raw.equipments || []).map((e: any) => {
            const details = (e.detail_divide || []).map((d: any) => new DetailDivide(d.id, d.name, d.divideId));
            return new Divide(e.id, e.name, details);
        });

        const logistics: Logistics[] = (raw.logistics || []).map((l: any) =>
            new Logistics(l.id, l.taskName, l.vendor, l.cost, l.status as LogisticsStatus)
        );

        const staffs: Staff[] = (raw.concert?.staffs || []).map((s: any) => {
            const tasks = (s.tasks || []).map((t: any) => new StaffTask(
                t.id,
                t.taskName || 'Untitled Task',
                t.description,
                t.status as StaffTaskStatus,
                t.staffId,
                t.managerId || '',
                t.dueDate || new Date()
            ));
            return new Staff(s.id, s.userId, s.name, StaffRole.create(s.role), s.concertId, tasks);
        });

        const requirements: EventRequirement[] = (raw.concert?.requirements || []).map((req: any) =>
            new EventRequirement(
                req.id,
                req.title,
                req.description,
                req.authorId,
                req.vendorId,
                req.staffNeeded,
                req.budgetAllocated,
                req.status as EventRequirementStatus,
                req.createdAt,
                req.updatedAt
            )
        );

        const zones: Zone[] = (raw.concert?.zones || []).map((z: any) => {
            const shifts = (z.shifts || []).map((sh: any) => {
                const assignments = (sh.assignments || []).map((a: any) =>
                    new ShiftAssignment(a.id, a.shiftId, a.staffId, a.status, a.checkIn, a.checkOut)
                );
                return new Shift(sh.id, sh.managerId, sh.title, sh.description, sh.startTime, sh.endTime, sh.headcount, assignments);
            });
            return new Zone(z.id, z.name, z.description, z.capacity, shifts);
        });

        return OrganizeAggregate.hydrate(
            raw.id,
            raw.concertId,
            locationVal,
            equipments,
            logistics,
            staffs,
            requirements,
            zones
        );
    }

    static toPersistence(organize: OrganizeAggregate) {
        const location = organize.getLocation();

        return {
            id: organize.getId(),
            concertId: organize.getConcertId(),
            location: location ? {
                id: location.getId(),
                name: location.getName(),
                address: location.getAddress(),
                capacity: location.getCapacity()
            } : null,
            equipments: organize.getEquipments().map(e => ({
                id: e.getId(),
                name: e.getName(),
                detail_divide: e.detail_divide.map(d => ({
                    id: d.getId(),
                    name: d.getName(),
                    divideId: e.getId()
                }))
            })),
            logistics: organize.getLogistics().map(l => ({
                id: l.id,
                taskName: l.taskName,
                vendor: l.vendor,
                cost: l.cost,
                status: l.status
            })),
            staffs: organize.getStaffs().map(s => ({
                id: s.getId(),
                userId: s.getUserId(),
                name: s.getName(),
                role: s.getRole().getValue(),
                concertId: s.getConcertId(),
                tasks: s.getTasks().map(t => ({
                    id: t.getId(),
                    taskName: t.getTaskName(),
                    description: t.getDescription(),
                    status: t.getStatus(),
                    managerId: t.getManagerId(),
                    dueDate: t.getDueDate(),
                    staffId: t.getStaffId()
                }))
            })),
            requirements: organize.getRequirements().map(req => ({
                id: req.id,
                title: req.title,
                description: req.description,
                authorId: req.authorId,
                vendorId: req.vendorId,
                staffNeeded: req.staffNeeded,
                budgetAllocated: req.budgetAllocated,
                status: req.status,
                createdAt: req.createdAt,
                updatedAt: req.updatedAt
            })),
            zones: organize.getZones().map(z => ({
                id: z.id,
                name: z.name,
                description: z.description,
                capacity: z.capacity,
                shifts: z.getShifts().map(sh => ({
                    id: sh.id,
                    managerId: sh.managerId,
                    title: sh.title,
                    description: sh.description,
                    startTime: sh.startTime,
                    endTime: sh.endTime,
                    headcount: sh.headcount,
                    assignments: sh.getAssignments().map(a => ({
                        id: a.id,
                        shiftId: a.shiftId,
                        staffId: a.staffId,
                        status: a.status,
                        checkIn: a.checkIn,
                        checkOut: a.checkOut
                    }))
                }))
            }))
        };
    }
}
