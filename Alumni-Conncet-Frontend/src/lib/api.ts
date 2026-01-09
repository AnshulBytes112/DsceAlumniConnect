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

    private async handleApiError(response: Response, defaultMessage: string): Promise<never> {
        let errorMessage = `${defaultMessage} (${response.status})`;
        try {
            const error: ErrorResponse = await response.json();
            errorMessage = error.message || errorMessage;
        } catch {
            // If JSON parsing fails, use the status text
            errorMessage = `${defaultMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    private async get<T>(endpoint: string): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('API: GET', url);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(true),
        });
        console.log('API: Response status:', response.status);
        console.log('API: Response headers:', response.headers);
        
        if (!response.ok) {
            // Handle 404 gracefully for lists
            if (response.status === 404) return [] as any;
            throw new Error(`Failed to fetch ${endpoint}`);
        }
        
        const data = await response.json();
        console.log('API: Raw response data:', data);
        return data;
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
        console.log('API: getUpcomingEvents called');
        // Temporarily disabled mock user check to test real RSVP functionality
        if (false && this.isMockUser()) {
            console.log('API: Using mock data');
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
        console.log('API: Fetching events from /dashboard/events');
        const events = await this.get<EventDTO[]>('/dashboard/events');
        console.log('API: Received events:', events);
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
                email: mockCredentials.email,
                profilePicture: null,
                resumeUrl: null,
                firstName: 'Test',
                lastName: 'User',
                role: 'Mock User Role',
                headline: 'Mock User Headline',
                profileComplete: true,
                graduationYear: 2020,
                department: 'Computer Science'
            };
        }

        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to fetch profile';
            try {
                const error: ErrorResponse = await response.json();
                errorMessage = error.message || errorMessage;
            } catch {
                // If response is not JSON, use status text
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            
            // For 403 errors, provide a more user-friendly message
            if (response.status === 403) {
                console.warn('Access forbidden to profile endpoint. This might be due to permissions or backend configuration.');
                // Return a default profile for better UX instead of throwing an error
                return {
                    id: 'unknown',
                    email: 'unknown@example.com',
                    profilePicture: null,
                    resumeUrl: null,
                    firstName: 'User',
                    lastName: '',
                    role: 'Alumni',
                    headline: 'DSCE Alumni',
                    profileComplete: false,
                    graduationYear: undefined,
                    department: undefined
                };
            }
            
            throw new Error(errorMessage);
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
            await this.handleApiError(response, 'Failed to get dashboard stats');
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
        userRsvpStatus?: string;
    }>> {
        console.log('API: getUpcomingEvents called');
        // Temporarily disabled mock user check to test real RSVP functionality
        if (false && this.isMockUser()) {
            console.log('API: Using mock data');
            return upcomingEvents.map(e => ({
                id: e.id,
                day: e.day,
                month: e.month,
                title: e.title,
                time: e.time,
                location: e.location,
                userRsvpStatus: undefined
            }));
        }
        console.log('API: Fetching events from /dashboard/events');
        const response = await fetch(`${this.baseUrl}/dashboard/events`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        console.log('API: Response status:', response.status);
        if (!response.ok) {
            await this.handleApiError(response, 'Failed to get upcoming events');
        }

        const data = await response.json();
        console.log('API: Raw response data:', data);
        return data.map((event: {
            id: string;
            day: string;
            month: string;
            title: string;
            time: string;
            location: string;
            userRsvpStatus?: string | null;
        }) => ({
            ...event,
            userRsvpStatus: event.userRsvpStatus === null ? undefined : event.userRsvpStatus
        }));
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

        const response = await fetch(`${this.baseUrl}/dashboard/fundings`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            console.log('Fundings API failed:', response.status);
            return []; // Return empty array on error
        }

        return response.json();
    }

    async createProjectFunding(funding: ProjectFundingRequest): Promise<ProjectFundingRequest> {
        const response = await fetch(`${this.baseUrl}/dashboard/fundings`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(funding),
        });

        if (!response.ok) {
            await this.handleApiError(response, 'Failed to create project funding');
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

    // Post API methods
    async getAllPosts(page: number = 0, size: number = 10): Promise<PostResponse[]> {
        if (this.isMockUser()) {
            // Return mock posts for demo user
            return dashboardPosts.map(post => ({
                id: post.id.toString(),
                authorId: 'mock-author-id',
                authorName: post.author,
                authorAvatar: post.avatar,
                authorRole: post.role,
                graduationYear: post.graduationYear,
                department: post.department,
                content: post.content,
                createdAt: new Date().toISOString(),
                likes: post.likes,
                comments: post.comments,
                shares: post.shares || 0,
                media: post.media?.map(m => m.url) || [],
                hashtags: post.hashtags || [],
                mentions: post.mentions || [],
                isLiked: false,
                isAuthor: false,
                isBookmarked: false
            }));
        }
        
        const response = await fetch(`${this.baseUrl}/posts?page=${page}&size=${size}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to fetch posts');
        }

        const posts = await response.json();
        
        console.log('API: Posts fetched from backend with graduation year and department');
        return posts;
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
        if (this.isMockUser()) {
            // Return a mock post for demo user with graduation year and department
            const mockPost: PostResponse = {
                id: `mock-post-${Date.now()}`,
                authorId: 'mock-author-id',
                authorName: 'Test User',
                authorAvatar: 'https://github.com/shadcn.png',
                authorRole: 'Mock User',
                graduationYear: 2020,
                department: 'Computer Science',
                content: post.content,
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: 0,
                shares: 0,
                media: post.media || [],
                hashtags: post.hashtags || [],
                mentions: post.mentions || [],
                isLiked: false,
                isAuthor: true,
                isBookmarked: false
            };
            return mockPost;
        }

        // Get current user's profile to include graduation year and department
        try {
            const userProfile = await this.getProfile();
            
            // Add graduation year and department to the post request
            const postWithAuthData = {
                ...post,
                graduationYear: userProfile.graduationYear,
                department: userProfile.department
            };

            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: JSON.stringify(postWithAuthData),
            });

            if (!response.ok) {
                const error: ErrorResponse = await response.json();
                throw new Error(error.message || 'Failed to create post');
            }

            return response.json();
        } catch (error) {
            // If we can't get the user profile, create post without auth data
            console.warn('Could not fetch user profile for post creation, proceeding without graduation year and department');
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
        if (this.isMockUser()) {
            // For mock user, just return a simple response
            // In a real implementation, this would update the like status
            throw new Error('Like functionality not available for mock users');
        }

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

    // Comment API methods
    async createComment(comment: CreateCommentRequest): Promise<CommentResponse> {
        if (this.isMockUser()) {
            // Return a mock comment for demo user
            const mockComment: CommentResponse = {
                id: `mock-comment-${Date.now()}`,
                postId: comment.postId,
                authorId: 'mock-author-id',
                authorName: 'Test User',
                authorAvatar: 'https://github.com/shadcn.png',
                authorRole: 'Mock User',
                content: comment.content,
                createdAt: new Date().toISOString(),
                likes: 0,
                isLiked: false,
                isAuthor: true,
                isDeleted: false
            };
            return mockComment;
        }

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
        if (this.isMockUser()) {
            // Return empty array for mock users
            return [];
        }

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
        if (this.isMockUser()) {
            // Mock users can't delete comments
            throw new Error('Comment functionality not available for mock users');
        }

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
    // helper to change base url at runtime if needed
    (apiClient as any).baseUrl = url;
}
