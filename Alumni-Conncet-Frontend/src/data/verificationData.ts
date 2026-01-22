// Mock data for verification system (for offline/demo purposes)

export interface PendingVerification {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  linkedinUrl?: string;
  graduationYear: number;
  department: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const mockPendingVerifications: PendingVerification[] = [
  {
    id: '1',
    firstName: 'Rahul',
    lastName: 'Kumar',
    email: 'rahul.kumar@dsce.edu.in',
    linkedinUrl: 'https://linkedin.com/in/rahulkumar',
    graduationYear: 2024,
    department: 'Computer Science',
    appliedAt: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@gmail.com',
    linkedinUrl: 'https://linkedin.com/in/priyasharma',
    graduationYear: 2023,
    department: 'Electronics',
    appliedAt: '2024-01-14T15:45:00Z',
    status: 'pending'
  },
  {
    id: '3',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@dsce.edu.in',
    graduationYear: 2022,
    department: 'Mechanical',
    appliedAt: '2024-01-13T09:20:00Z',
    status: 'pending'
  },
  {
    id: '4',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@dsce.edu.in',
    linkedinUrl: 'https://linkedin.com/in/snehareddy',
    graduationYear: 2025,
    department: 'Civil',
    appliedAt: '2024-01-12T14:10:00Z',
    status: 'pending'
  }
];

export const adminCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

export const allowedEmailDomains = [
  '@dsce.edu.in',
  '@gmail.com',
  '@yahoo.com',
  '@hotmail.com',
  '@outlook.com'
];

export function isCollegeEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@dsce.edu.in');
}

export function validateLinkedInUrl(url: string): boolean {
  if (!url) return true; // Optional field
  return url.toLowerCase().includes('linkedin.com/in/');
}

