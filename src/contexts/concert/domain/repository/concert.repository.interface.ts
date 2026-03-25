import { Concert } from '../entity/concert.entity';

export interface IConcertRepository {
    findById(id: string): Promise<Concert | null>;
    save(concert: Concert): Promise<void>;
}

export const ICONCERT_REPOSITORY = Symbol('IConcertRepository');
