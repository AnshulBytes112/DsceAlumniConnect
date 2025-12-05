const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api'; // Uses Vite env var or fallback to relative path for proxy

export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleSignInRequest {
    accessToken: string;
}

export interface UserProfile {
    id: string;
    email: string;
    profilePicture: string | null;
    resumeUrl: string | null;
    firstName: string;
    lastName: string;
    role?: string;
    headline?: string;
    profileComplete: boolean;
    graduationYear?: number;
    department?: string;
    contactNumber?: string;
    bio?: string;
    location?: string;
    linkedinProfile?: string;
    website?: string;
    workExperiences?: Array<{
        company?: string;
        jobTitle?: string;
        date?: string;
        descriptions?: string[];
    }>;
    educations?: Array<{
        school?: string;
        degree?: string;
        date?: string;
        gpa?: string;
        descriptions?: string[];
    }>;
    projects?: Array<{
        project?: string;
        date?: string;
        descriptions?: string[];
    }>;
    skills?: string[];
    featuredSkills?: Array<{
        skill?: string;
        rating?: number;
    }>;
}

export interface AuthResponse extends UserProfile {
    jwtToken: string;
}

export interface ErrorResponse {
    message: string;
    status: number;
    errors?: any;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders(includeAuth = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private getHeadersForFormData(includeAuth = false): HeadersInit {
        const headers: HeadersInit = {};

        if (includeAuth) {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async signup(data: SignUpRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/signup`, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                let errorMessage = 'Signup failed';
                try {
                    const error: ErrorResponse = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unexpected error occurred during signup');
        }
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    async googleSignIn(data: GoogleSignInRequest): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/google`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Google sign-in failed');
        }

        return response.json();
    }

    async setupProfile(data: {
        profileData?: any;
        profilePicture?: File;
        resume?: File;
    }): Promise<any> {
        const formData = new FormData();

        if (data.profileData) {
            formData.append('data', JSON.stringify(data.profileData));
        }
        if (data.profilePicture instanceof File) {
            formData.append('profile', data.profilePicture);
        }
        if (data.resume instanceof File) {
            formData.append('resume', data.resume);
        }

        const response = await fetch(`${this.baseUrl}/profile/setup`, {
            method: 'POST',
            headers: this.getHeadersForFormData(true),
            body: formData,
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Profile setup failed');
        }

        return response.json();
    }

    async getProfile(): Promise<UserProfile> {
        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to get profile');
        }

        return response.json();
    }

    async getDashboardStats(): Promise<{
        jobsApplied: number;
        events: number;
        mentorships: number;
    }> {
        const response = await fetch(`${this.baseUrl}/dashboard/stats`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to get dashboard stats');
        }

        return response.json();
    }

    async getAnnouncements(): Promise<Array<{
        id: number;
        title: string;
        description: string;
        time: string;
    }>> {
        const response = await fetch(`${this.baseUrl}/dashboard/announcements`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to get announcements');
        }

        return response.json();
    }

    async getJobApplications(): Promise<Array<{
        company: string;
        role: string;
        status: 'Applied' | 'Interview' | 'Rejected';
        date: string;
    }>> {
        const response = await fetch(`${this.baseUrl}/dashboard/job-applications`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to get job applications');
        }

        return response.json();
    }

    async getUpcomingEvents(): Promise<Array<{
        day: string;
        month: string;
        title: string;
        time: string;
        location: string;
    }>> {
        const response = await fetch(`${this.baseUrl}/dashboard/events`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to get upcoming events');
        }

        return response.json();
    }

    async getProjectFundings(): Promise<Array<{
        title: string;
        amount: string;
        status: 'Approved' | 'Pending' | 'In Review';
        date: string;
    }>> {
        const response = await fetch(`${this.baseUrl}/dashboard/fundings`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to get project fundings');
        }

        return response.json();
    }

    async updateProfile(data: any): Promise<any> {
        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        return response.json();
    }

    async uploadResume(resume: File, replaceExisting: boolean = false): Promise<any> {
        const formData = new FormData();
        formData.append('file', resume);

        const response = await fetch(`${this.baseUrl}/profile/resume?replaceExisting=${replaceExisting}`, {
            method: 'POST',
            headers: this.getHeadersForFormData(true),
            body: formData,
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to upload resume');
        }

        return response.json();
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

export function setApiBaseUrl(url: string) {
    // helper to change base url at runtime if needed
    (apiClient as any).baseUrl = url;
}
