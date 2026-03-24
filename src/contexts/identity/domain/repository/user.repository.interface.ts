import { User } from '../entity/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
}

export const IUSER_REPOSITORY = Symbol('IUserRepository');
