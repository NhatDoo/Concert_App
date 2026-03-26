import { Artist } from '../entity/artist.entity';

export interface IArtistRepository {
    findById(id: string): Promise<Artist | null>;
    findAll(): Promise<Artist[]>;
    save(artist: Artist): Promise<void>;
    delete(id: string): Promise<void>;
}

export const IARTIST_REPOSITORY = Symbol('IArtistRepository');
