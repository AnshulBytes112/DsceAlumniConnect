const API_BASE_URL = 'http://localhost:8080'; // Uses Vite env var or fallback to relative path for proxy
import {
    dashboardAnnouncements,
    dashboardJobApplications,
    upcomingEvents,
    dashboardProjectFundings,
    mockCredentials,
    dashboardStats,
    dashboardPosts
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

export interface PostRequest {
    content: string;
    media?: string[];
    hashtags?: string[];
    mentions?: string[];
    graduationYear?: number;
    department?: string;
}

export interface PostResponse {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorRole: string;
    graduationYear?: number;
    department?: string;
    content: string;
    createdAt: string;
    likes: number;
    comments: number;
    shares: number;
    media?: string[];
    hashtags?: string[];
    mentions?: string[];
    isLiked: boolean;
    isAuthor: boolean;
    isBookmarked: boolean;
}

export interface CommentResponse {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    authorRole: string;
    content: string;
    createdAt: string;
    likes: number;
    isLiked: boolean;
    isAuthor: boolean;
    isDeleted: boolean;
}

export interface CreateCommentRequest {
    postId: string;
    content: string;
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
            console.log('API: Using token:', token ? `${token.substring(0, 20)}...` : 'null');
            if (token) {
                if (this.isTokenExpired()) {
                    console.log('Token expired during API call, clearing session');
                    this.clearExpiredSession();
                    throw new Error('Token expired. Please log in again.');
                }
                headers['Authorization'] = `Bearer ${token}`;
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
                if (this.isTokenExpired()) {
                    console.log('Token expired during API call, clearing session');
                    this.clearExpiredSession();
                    throw new Error('Token expired. Please log in again.');
                }
                headers['Authorization'] = `Bearer ${token}`;
                localStorage.setItem('tokenTimestamp', Date.now().toString());
            }
        }

        return headers;
    }

    private isMockUser(): boolean {
        return localStorage.getItem('jwtToken') === mockCredentials.user.jwtToken;
    }

    private async get<T>(endpoint: string): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('API: GET', url);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(true),
        });
        console.log('API: Response status:', response.status);

        if (!response.ok) {
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

    // ------------------------------------------------------------------
    // EVENTS API
    // ------------------------------------------------------------------

    async getAllEvents(): Promise<EventDTO[]> {
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
                userRsvpStatus: null
            }));
        }
        return this.get<EventDTO[]>('/events');
    }

    // ✅ ADDED: Get single event by ID
    async getEventById(eventId: string): Promise<EventDTO> {
        console.log("API: Fetch event by ID:", eventId);

        const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
            method: "GET",
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch event");
        }

        return response.json();
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
        const events = await this.get<EventDTO[]>('/dashboard/events');
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

    // ------------------------------------------------------------------
    // ALL OTHER API METHODS (UNCHANGED)
    // ------------------------------------------------------------------

    async signup(data: SignUpRequest): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/signup`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        return response.json();
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
            let msg = 'Failed to fetch profile';
            try {
                const error = await response.json();
                msg = error.message || msg;
            } catch {}
            throw new Error(msg);
        }

        return response.json();
    }

    async getDashboardStats() {
        const response = await fetch(`${this.baseUrl}/dashboard/stats`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error("Failed to get stats");
        }

        return response.json();
    }

    async getAnnouncements() {
        const response = await fetch(`${this.baseUrl}/dashboard/announcements`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error("Failed to get announcements");
        }

        return response.json();
    }

    async getJobApplications() {
        const response = await fetch(`${this.baseUrl}/dashboard/job-applications`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error("Failed to get job applications");
        }

        return response.json();
    }

    async getUpcomingEvents() {
        const response = await fetch(`${this.baseUrl}/dashboard/events`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error("Failed to get events");

        return response.json();
    }

    async getProjectFundings() {
        const response = await fetch(`${this.baseUrl}/dashboard/fundings`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) return [];

        return response.json();
    }

    async createProjectFunding(funding: ProjectFundingRequest) {
        const response = await fetch(`${this.baseUrl}/dashboard/fundings`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(funding),
        });

        if (!response.ok) throw new Error("Failed to create funding");

        return response.json();
    }

    async updateProfile(data: any) {
        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update profile");
        }

        return response.json();
    }

    async getAllAlumni(): Promise<UserProfile[]> {
        const response = await fetch(`${this.baseUrl}/alumni`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) return [];

        return response.json();
    }

    async uploadResume(resume: File, replaceExisting: boolean = false) {
        const formData = new FormData();
        formData.append('file', resume);

        const response = await fetch(`${this.baseUrl}/profile/resume?replaceExisting=${replaceExisting}`, {
            method: 'POST',
            headers: this.getHeadersForFormData(true),
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload resume");

        return response.json();
    }

    // POSTS API --------------------------------------------------------

    async getAllPosts(page: number = 0, size: number = 10): Promise<PostResponse[]> {
        const response = await fetch(`${this.baseUrl}/posts?page=${page}&size=${size}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to fetch posts');
        }

        return response.json();
    }

    async getPostById(id: string): Promise<PostResponse> {
        const response = await fetch(`${this.baseUrl}/posts/${id}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to fetch post');
        }

        return response.json();
    }

    async createPost(post: PostRequest): Promise<PostResponse> {
        const response = await fetch(`${this.baseUrl}/posts`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(post),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to create post');
        }

        return response.json();
    }

    async updatePost(id: string, post: Partial<PostRequest>): Promise<PostResponse> {
        const response = await fetch(`${this.baseUrl}/posts/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(post),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to update post');
        }

        return response.json();
    }

    async deletePost(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/posts/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to delete post');
        }
    }

    async toggleLikePost(id: string): Promise<PostResponse> {
        const response = await fetch(`${this.baseUrl}/posts/${id}/like`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to like post');
        }

        return response.json();
    }

    async sharePost(id: string): Promise<PostResponse> {
        const response = await fetch(`${this.baseUrl}/posts/${id}/share`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to share post');
        }

        return response.json();
    }

    async reportPost(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/posts/${id}/report`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to report post');
        }
    }

    async getMyPosts(): Promise<PostResponse[]> {
        const response = await fetch(`${this.baseUrl}/posts/my-posts`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to fetch your posts');
        }

        return response.json();
    }

    // COMMENTS API -----------------------------------------------------

    async createComment(comment: CreateCommentRequest): Promise<CommentResponse> {
        const response = await fetch(`${this.baseUrl}/comments`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(comment),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to create comment');
        }

        return response.json();
    }

    async getCommentsByPostId(postId: string): Promise<CommentResponse[]> {
        const response = await fetch(`${this.baseUrl}/comments/post/${postId}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to fetch comments');
        }

        return response.json();
    }

    async deleteComment(commentId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/comments/${commentId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to delete comment');
        }
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Make apiClient available globally for debugging
(window as any).apiClient = apiClient;

export function setApiBaseUrl(url: string) {
    (apiClient as any).baseUrl = url;
}
