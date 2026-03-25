import { Performance } from '../../../domain/entity/performance.entity';

export class PerformanceMapper {
    static toDomain(raw: any): Performance {
        return new Performance(
            raw.id,
            raw.concertId,
            raw.artistId, // Store artistId as string reference
            raw.name,
            raw.durationMinutes,
            raw.startTime
        );
    }

    static toPersistence(performance: Performance) {
        return {
            id: performance.getId(),
            concertId: performance.getConcertId(),
            artistId: performance.getArtistId(),
            name: performance.getName(),
            durationMinutes: performance.getDuration(),
            startTime: performance.getStartTime()
        };
    }
}
