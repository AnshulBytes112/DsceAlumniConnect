const API_BASE_URL = 'http://localhost:8080'; // Uses Vite env var or fallback to relative path for proxy
import {
    dashboardAnnouncements,
    dashboardJobApplications,
    upcomingEvents,
    dashboardProjectFundings,
    mockCredentials,
    dashboardStats
} from '../data/mockData';

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
    achievements?: Array<{
        title?: string;
        description?: string;
        date?: string;
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

export interface EventDTO {
    id: string;
    day: string;
    month: string;
    title: string;
    time: string;
    starttime?: string;
    endtime?: string;
    location: string;
    description?: string;
    category?: string;
    maxParticipants?: number;
    registrationDeadline?: string;
    virtualLink?: string;
    organizerName?: string;
    organizerContact?: string;
    userRsvpStatus?: 'GOING' | 'MAYBE' | 'NOT_GOING' | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface AnnouncementDTO {
    id: number;
    title: string;
    description: string;
    time: string;
}

export interface ProjectFundingRequest {
    title: string;
    amount: string;
    status: 'Approved' | 'Pending' | 'In Review';
    date: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private isTokenExpired(): boolean {
        const tokenTimestamp = localStorage.getItem('tokenTimestamp');
        if (!tokenTimestamp) return true;
        
        const timestamp = parseInt(tokenTimestamp);
        const now = Date.now();
        return (now - timestamp) > (5 * 60 * 1000); // 5 minutes
    }

    private clearExpiredSession(): void {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenTimestamp');
    }

    private getHeaders(includeAuth = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                // Check if token is expired before using it
                if (this.isTokenExpired()) {
                    console.log('Token expired during API call, clearing session');
                    this.clearExpiredSession();
                    throw new Error('Token expired. Please log in again.');
                }
                headers['Authorization'] = `Bearer ${token}`;
                // Update token timestamp on successful API usage
                localStorage.setItem('tokenTimestamp', Date.now().toString());
            }
        }

        return headers;
    }

    private getHeadersForFormData(includeAuth = false): HeadersInit {
        const headers: HeadersInit = {};

        if (includeAuth) {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                // Check if token is expired before using it
                if (this.isTokenExpired()) {
                    console.log('Token expired during API call, clearing session');
                    this.clearExpiredSession();
                    throw new Error('Token expired. Please log in again.');
                }
                headers['Authorization'] = `Bearer ${token}`;
                // Update token timestamp on successful API usage
                localStorage.setItem('tokenTimestamp', Date.now().toString());
            }
        }

        return headers;
    }

    private isMockUser(): boolean {
        return localStorage.getItem('jwtToken') === mockCredentials.user.jwtToken;
    }

    private async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });
        if (!response.ok) {
            // Handle 404 gracefully for lists
            if (response.status === 404) return [] as any;
            throw new Error(`Failed to fetch ${endpoint}`);
        }
        return response.json();
    }

    private async post<T>(endpoint: string, body: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`Failed to post to ${endpoint}`);
        return response.json();
    }

    async getAllEvents(): Promise<EventDTO[]> {
        if (this.isMockUser()) {
            console.log('API: Using mock events data');
            return upcomingEvents.map(e => ({
                id: e.id,
                day: e.day,
                month: e.month,
                title: e.title,
                time: e.time,
                starttime: e.starttime,
                endtime: e.endtime,
                location: e.location,
                description: e.description,
                category: e.category,
                maxParticipants: e.maxParticipants,
                registrationDeadline: e.registrationDeadline,
                virtualLink: e.virtualLink,
                organizerName: e.organizerName,
                organizerContact: e.organizerContact,
                userRsvpStatus: null
            }));
        }
        console.log('API: Fetching events from /events endpoint');
        const events = await this.get<EventDTO[]>('/events');
        console.log('API: Raw events response:', events);
        return events;
    }

    async getDashboardEvents(): Promise<Array<{
        id: string;
        day: string;
        month: string;
        title: string;
        time: string;
        location: string;
        userRsvpStatus?: string;
    }>> {
        if (this.isMockUser()) {
            return upcomingEvents.map(e => ({
                id: e.id,
                day: e.day,
                month: e.month,
                title: e.title,
                time: e.time,
                starttime: e.starttime,
                endtime: e.endtime,
                location: e.location,
                description: e.description,
                category: e.category,
                maxParticipants: e.maxParticipants,
                registrationDeadline: e.registrationDeadline,
                virtualLink: e.virtualLink,
                organizerName: e.organizerName,
                organizerContact: e.organizerContact,
                userRsvpStatus: undefined
            }));
        }
        const events = await this.get<EventDTO[]>('/events');
        return events.map(event => ({
            ...event,
            userRsvpStatus: event.userRsvpStatus === null ? undefined : event.userRsvpStatus
        }));
    }

    async createEvent(event: Partial<EventDTO>): Promise<EventDTO> {
        return this.post<EventDTO>('/events', event);
    }

    async rsvpEvent(eventId: string, status: string): Promise<void> {
        await fetch(`${this.baseUrl}/events/${eventId}/rsvp`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ status }),
        }).then(response => {
            if (!response.ok) throw new Error('Failed to RSVP');
        });
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
        if (this.isMockUser()) {
            return {
                id: mockCredentials.user.id,
                email: mockCredentials.user.email,
                firstName: mockCredentials.user.firstname,
                lastName: mockCredentials.user.lastname,
                profilePicture: mockCredentials.user.profilePicture,
                resumeUrl: null,
                profileComplete: true, // Mock user is complete
                role: 'Student',
                headline: 'Student at DSCE',
                // Add dummy data for other fields to make profile page look populated
                skills: ['React', 'TypeScript', 'Node.js'],
                workExperiences: [],
                educations: [],
                projects: []
            };
        }
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
        if (this.isMockUser()) {
            const jobs = dashboardStats.find(s => s.label === 'Jobs Applied')?.value || '0';
            const events = dashboardStats.find(s => s.label === 'Events')?.value || '0';
            const mentorships = dashboardStats.find(s => s.label === 'Mentorships')?.value || '0';
            return {
                jobsApplied: parseInt(jobs),
                events: parseInt(events),
                mentorships: parseInt(mentorships)
            };
        }
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
        if (this.isMockUser()) {
            // dashboardAnnouncements from mockData matches the structure perfectly
            return dashboardAnnouncements;
        }

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
        if (this.isMockUser()) {
            // Need to cast the status string string to the union type
            return dashboardJobApplications.map(j => ({
                ...j,
                status: j.status as 'Applied' | 'Interview' | 'Rejected'
            }));
        }

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
        id: string;
        day: string;
        month: string;
        title: string;
        time: string;
        location: string;
    }>> {
        if (this.isMockUser()) {
            return upcomingEvents;
        }

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
        if (this.isMockUser()) {
            return dashboardProjectFundings as any;
        }

        const response = await fetch(`${this.baseUrl}/get-fundings`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to get project fundings');
        }

        return response.json();
    }

    async createProjectFunding(funding: ProjectFundingRequest): Promise<ProjectFundingRequest> {
        return this.post<ProjectFundingRequest>('/fundings', funding);
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

    async getAllAlumni(): Promise<UserProfile[]> {
        const response = await fetch(`${this.baseUrl}/alumni`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            // Fallback to mock data if backend fails
            console.warn('Backend alumni endpoint not available, using mock data');
            return [];
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
