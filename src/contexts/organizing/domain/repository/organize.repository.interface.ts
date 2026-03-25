import { OrganizeAggregate } from '../aggregate/organize.aggregate';

export interface IOrganizeRepository {
    findById(id: string): Promise<OrganizeAggregate | null>;
    findByConcertId(concertId: string): Promise<OrganizeAggregate | null>;
    save(organize: OrganizeAggregate): Promise<void>;
}

export const IORGANIZE_REPOSITORY = Symbol('IOrganizeRepository');
