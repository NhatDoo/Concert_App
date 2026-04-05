import { JobPost } from "../entity/job-post.entity";

export interface IJobPostRepository {
    save(jobPost: JobPost): Promise<void>;
    update(jobPost: JobPost): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<JobPost | null>;
    findByOrganizer(organizerId: string): Promise<JobPost[]>;
    findAll(filters?: { authorId?: string; organizerId?: string; authorRole?: string; includeClosed?: boolean }): Promise<JobPost[]>;
}

export const IJOB_POST_REPOSITORY = Symbol('IJobPostRepository');
