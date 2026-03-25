import { OrganizeAggregate } from '../../../domain/aggregate/organize.aggregate';
import { Location } from '../../../domain/entity/location.entity';
import { Divide } from '../../../domain/entity/devide.entity';
import { DetailDivide } from '../../../domain/entity/detail_devide';
import { Logistics, LogisticsStatus } from '../../../domain/entity/logistics.entity';

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

        return OrganizeAggregate.hydrate(
            raw.id,
            raw.concertId,
            locationVal,
            equipments,
            logistics
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
            }))
        };
    }
}
