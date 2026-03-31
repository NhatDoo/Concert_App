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
    author: {
        id: string;
        name: string;
        role: string;
        user?: { phoneNumber: string; email: string };
    };
}

export interface Application {
    id: string;
    status: string;
    createdAt: string;
    cvUrl?: string;
    message?: string;
    applicant: {
        name: string;
        cvUrl?: string;
        bio?: string;
        user?: { email: string; phoneNumber: string };
    };
    jobPostId: string;
    jobPost?: { title: string };
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    deadline?: string;
    concert?: { name: string; date: string; location: string };
}

export interface StaffRecord {
    id: string;
    name: string;
    role: string;
    organizerId?: string;
    tasks: Task[];
}
