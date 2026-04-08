export interface JobPost {
    id: string;
    title: string;
    description: string;
    requirements: string;
    companyName: string;
    companyLogo: string;
    location: string;
    salary: string;
    createdAt: string;
    status: string;
    authorId: string;
    organizerId: string;
    author: {
        id: string;
        name: string;
        role: string;
        user?: { phoneNumber: string; email: string };
    };
    category?: string;
}

export interface Application {
    id: string;
    status: string;
    createdAt: string;
    cvUrl?: string;
    message?: string;
    applicant: {
        id: string;
        name: string;
        role: string;
        cvUrl?: string;
        bio?: string;
        user?: { email: string; phoneNumber: string };
    };
    jobPostId: string;
    jobPost?: { title: string; organizerId: string; authorId: string };
}

export interface Task {
    id: string;
    taskName: string;
    description: string;
    status: string;
    dueDate?: string;
    managerId?: string;
    staffId: string;
    taskManager?: { id: string; name: string; role: string };
    concert?: { id: string; name: string; startDate: string; location?: string };
}

export interface StaffRecord {
    id: string;
    name: string;
    role: string;
    userId: string;
    organizerId?: string;
    concertId?: string;
    tasks: Task[];
    concert?: { id: string; name: string; startDate: string };
}
