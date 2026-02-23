export interface PendingVerification {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    graduationYear: number;
    appliedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    linkedinUrl?: string;
}

export const mockPendingVerifications: PendingVerification[] = [
    {
        id: 'ver_001',
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.s@example.com',
        department: 'Computer Science',
        graduationYear: 2023,
        appliedAt: '2024-01-20T10:30:00Z',
        status: 'pending',
        linkedinUrl: 'https://linkedin.com/in/rahul-sharma'
    },
    {
        id: 'ver_002',
        firstName: 'Priya',
        lastName: 'Verma',
        email: 'priya.v@example.com',
        department: 'Information Science',
        graduationYear: 2022,
        appliedAt: '2024-01-19T14:15:00Z',
        status: 'pending',
        linkedinUrl: 'https://linkedin.com/in/priya-verma'
    },
    {
        id: 'ver_003',
        firstName: 'Amit',
        lastName: 'Kumar',
        email: 'amit.k@example.com',
        department: 'Electronics',
        graduationYear: 2021,
        appliedAt: '2024-01-18T09:45:00Z',
        status: 'pending'
    }
];
