import { Concert } from '../../../domain/entity/concert.entity';
import { StartDate } from '../../../domain/VO/startdate.vo';

export class ConcertMapper {
    static toDomain(raw: any): Concert | null {
        if (!raw) return null;

        return Concert.hydrate(
            raw.id,
            raw.organizerId,
            raw.name,
            StartDate.hydrate(raw.startDate),
            raw.location
        );
    }

    static toPersistence(concert: Concert) {
        return {
            id: concert.getId(),
            organizerId: concert.getOrganizerId(),
            name: concert.getName(),
            startDate: concert.getDate().getValue(),
            location: concert.getLocation(),
        };
    }
}
