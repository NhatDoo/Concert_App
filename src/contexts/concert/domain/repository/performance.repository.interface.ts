import { Performance } from '../entity/performance.entity';

export interface IPerformanceRepository {
    findById(id: string): Promise<Performance | null>;
    findByConcertId(concertId: string): Promise<Performance[]>;
    save(performance: Performance): Promise<void>;
    delete(id: string): Promise<void>;
}

export const IPERFORMANCE_REPOSITORY = Symbol('IPerformanceRepository');
