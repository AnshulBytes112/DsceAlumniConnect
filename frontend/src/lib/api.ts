const API_BASE_URL = 'http://localhost:8080';
import {
    upcomingEvents,
    mockCredentials
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
    lat?: number;
    lng?: number;
    linkedinProfile?: string;
    website?: string;
    workExperiences?: Array<{
        company?: string;
        jobTitle?: string;
        date?: string;
        month?: string;
        year?: number;
        endMonth?: string;
        endYear?: number;
        currentlyWorking?: boolean;
        descriptions?: string[];
    }>;
    educations?: Array<{
        school?: string;
        degree?: string;
        date?: string;
        gpa?: string;
        month?: string;
        year?: number;
        endMonth?: string;
        endYear?: number;
        currentlyPursuing?: boolean;
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
    verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt?: string;
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
    starttime?: string;
    endtime?: string;
    time?: string;
    title: string;
    description?: string;
    category?: string;
    maxParticipants?: number;
    registeredCount?: number;
    registrationDeadline?: string;
    virtualLink?: string;
    organizerName?: string;
    organizerContact?: string;
    location: string;
    featured?: boolean;
    userRsvpStatus?: 'GOING' | 'MAYBE' | 'NOT_GOING' | null;
    createdAt?: string;
    updatedAt?: string;
    // Engagement metrics
    likes?: number;
    views?: number;
    comments?: number;
}

export interface AnnouncementDTO {
    id: string;
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
    isGlobal?: boolean;
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

export interface JobPostDTO {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    requirements: string;
    contactEmail: string;
    applicationLink: string;
    postedByName: string;
    postedById: string;
    createdAt: string;
    active: boolean;
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
        return (now - timestamp) > (5 * 60 * 1000); // 5 minutes (matches backend)
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
                    throw new Error('Your session has expired. Please log in again and try uploading your resume.');
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

        if (!response.ok) {
            let errorMsg = `Failed to post to ${endpoint}`;
            try {
                const errData = await response.json();
                if (errData && errData.message) errorMsg = errData.message;
            } catch (_) {
                try {
                    const text = await response.text();
                    if (text) errorMsg = text;
                } catch (__) {
                    errorMsg = `Error: ${response.status} ${response.statusText}`;
                }
            }
            throw new Error(errorMsg);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                return await response.json();
            } catch (e) {
                return {} as T;
            }
        }
        return {} as T;
    }

    private async put<T>(endpoint: string, body: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            let errorMsg = `Failed to put to ${endpoint}`;
            try {
                const errData = await response.json();
                if (errData && errData.message) errorMsg = errData.message;
            } catch (_) {
                try {
                    const text = await response.text();
                    if (text) errorMsg = text;
                } catch (__) {
                    errorMsg = `Error: ${response.status} ${response.statusText}`;
                }
            }
            throw new Error(errorMsg);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                return await response.json();
            } catch (e) {
                return {} as T;
            }
        }
        return {} as T;
    }

    private async delete(endpoint: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            let errorMsg = `Failed to delete ${endpoint}`;
            try {
                const errData = await response.json();
                if (errData && errData.message) errorMsg = errData.message;
            } catch (_) {
                try {
                    const text = await response.text();
                    if (text) errorMsg = text;
                } catch (__) {
                    errorMsg = `Error: ${response.status} ${response.statusText}`;
                }
            }
            throw new Error(errorMsg);
        }
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

    async getFeaturedEvents(): Promise<EventDTO[]> {
        return this.get<EventDTO[]>('/events/featured');
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
            time: event.time || '',
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
    // ADMIN EVENT MANAGEMENT
    // ------------------------------------------------------------------

    async getAllEventsForAdmin(): Promise<EventDTO[]> {
        return this.get<EventDTO[]>('/api/admin/events');
    }

    async featureEvent(eventId: string): Promise<EventDTO> {
        return this.post<EventDTO>(`/api/admin/events/${eventId}/feature`, {});
    }

    async unfeatureEvent(eventId: string): Promise<EventDTO> {
        return this.post<EventDTO>(`/api/admin/events/${eventId}/unfeature`, {});
    }

    async deleteEvent(eventId: string): Promise<void> {
        await fetch(`${this.baseUrl}/api/admin/events/${eventId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        }).then(response => {
            if (!response.ok) throw new Error('Failed to delete event');
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
            } catch { }
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

    async getAnnouncements(): Promise<AnnouncementDTO[]> {
        return this.get<AnnouncementDTO[]>('/api/dashboard/announcements');
    }

    async createAnnouncement(announcement: Partial<AnnouncementDTO>): Promise<AnnouncementDTO> {
        return this.post<AnnouncementDTO>('/api/dashboard/announcements', announcement);
    }

    async updateAnnouncement(id: string, announcement: Partial<AnnouncementDTO>): Promise<AnnouncementDTO> {
        return this.put<AnnouncementDTO>(`/api/dashboard/announcements/${id}`, announcement);
    }

    async deleteAnnouncement(id: string): Promise<void> {
        await this.delete(`/api/dashboard/announcements/${id}`);
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

    async getAlumniById(id: string): Promise<UserProfile | null> {
        const response = await fetch(`${this.baseUrl}/alumni/${id}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) return null;

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

        const result = await response.json();
        console.log('Resume upload response:', result);
        return result;
    }

    async uploadResumeAndReplace(resume: File) {
        const formData = new FormData();
        formData.append('file', resume);

        const response = await fetch(`${this.baseUrl}/profile/resume/update-parse`, {
            method: 'POST',
            headers: this.getHeadersForFormData(true),
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload and replace resume");

        const result = await response.json();
        console.log('Resume upload and replace response:', result);
        return result;
    }

    async getAnalytics(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/admin/analytics`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }

        return response.json();
    }

    async downloadResume(userId: string): Promise<Blob> {
        const response = await fetch(`${this.baseUrl}/api/files/users/${userId}/resume`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error(`Failed to download resume: ${response.statusText}`);
        }

        return response.blob();
    }

    // POSTS API --------------------------------------------------------

    async getAllPosts(page: number = 0, size: number = 10): Promise<PostResponse[]> {
        const response = await fetch(`${this.baseUrl}/api/posts?page=${page}&size=${size}`, {
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
        const response = await fetch(`${this.baseUrl}/api/posts/${id}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Failed to fetch post');
        }

        return response.json();
    }

    async uploadPostImages(files: File[]): Promise<string[]> {
        const uploadedUrls: string[] = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${this.baseUrl}/api/posts/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload image: ${file.name}`);
            }

            const result = await response.json();
            // Convert relative path to full URL
            const imageUrl = result.imageUrl.startsWith('http')
                ? result.imageUrl
                : `${this.baseUrl}/${result.imageUrl}`;
            uploadedUrls.push(imageUrl);
        }

        return uploadedUrls;
    }

    async createPost(post: PostRequest): Promise<PostResponse> {
        return this.post<PostResponse>('/api/posts', post);
    }

    async updatePost(id: string, post: Partial<PostRequest>): Promise<PostResponse> {
        return this.put<PostResponse>(`/api/posts/${id}`, post);
    }

    async deletePost(id: string): Promise<void> {
        await this.delete(`/api/posts/${id}`);
    }

    async toggleLikePost(id: string): Promise<void> {
        await this.post(`/api/posts/${id}/like`, {});
    }

    async sharePost(id: string): Promise<void> {
        await this.post(`/api/posts/${id}/share`, {});
    }

    async reportPost(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/posts/${id}/report`, {
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

    // ADMIN VERIFICATION API -------------------------------------------

    async getVerifications(): Promise<UserProfile[]> {
        const response = await fetch(`${this.baseUrl}/api/admin/verifications`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch pending verifications');
        return response.json();
    }

    async verifyUser(userId: string, action: 'approve' | 'reject'): Promise<UserProfile> {
        const response = await fetch(`${this.baseUrl}/api/admin/${action}/${userId}`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error(`Failed to ${action} user`);
        return response.json();
    }

    // ------------------------------------------------------------------
    // JOBS API
    // ------------------------------------------------------------------

    async getAllJobs(): Promise<JobPostDTO[]> {
        return this.get<JobPostDTO[]>('/api/jobs');
    }

    async getJobById(id: string): Promise<JobPostDTO> {
        return this.get<JobPostDTO>(`/api/jobs/${id}`);
    }

    async getMyJobs(): Promise<JobPostDTO[]> {
        return this.get<JobPostDTO[]>('/api/jobs/my-jobs');
    }

    async createJob(job: Partial<JobPostDTO>): Promise<JobPostDTO> {
        return this.post<JobPostDTO>('/api/jobs', job);
    }

    async deleteJob(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/jobs/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            throw new Error('Failed to delete job');
        }
    }

    // ------------------------------------------------------------------
    // DISCUSSION FORUMS API
    // ------------------------------------------------------------------

    // Groups
    async getAllDiscussionGroups(category?: string, search?: string): Promise<DiscussionGroup[]> {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.get<DiscussionGroup[]>(`/discussions/groups${query}`);
    }

    async getDiscussionGroupById(id: string): Promise<DiscussionGroup> {
        return this.get<DiscussionGroup>(`/discussions/groups/${id}`);
    }

    async createDiscussionGroup(group: Partial<DiscussionGroup>): Promise<DiscussionGroup> {
        return this.post<DiscussionGroup>('/discussions/groups', group);
    }

    async updateDiscussionGroup(id: string, group: Partial<DiscussionGroup>): Promise<DiscussionGroup> {
        const response = await fetch(`${this.baseUrl}/discussions/groups/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(group),
        });
        if (!response.ok) throw new Error('Failed to update group');
        return response.json();
    }

    async deleteDiscussionGroup(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/discussions/groups/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to delete group');
    }

    async joinDiscussionGroup(id: string): Promise<{ message: string }> {
        return this.post<{ message: string }>(`/discussions/groups/${id}/join`, {});
    }

    async leaveDiscussionGroup(id: string): Promise<{ message: string }> {
        return this.post<{ message: string }>(`/discussions/groups/${id}/leave`, {});
    }

    async getMyDiscussionGroups(): Promise<DiscussionGroup[]> {
        return this.get<DiscussionGroup[]>('/discussions/groups/my-groups');
    }

    async getDiscussionGroupCategories(): Promise<string[]> {
        return this.get<string[]>('/discussions/groups/categories');
    }

    // Topics
    async getTopicsByGroup(groupId: string, sortBy: 'activity' | 'newest' = 'activity'): Promise<DiscussionTopic[]> {
        return this.get<DiscussionTopic[]>(`/discussions/topics/group/${groupId}?sortBy=${sortBy}`);
    }

    async getDiscussionTopicById(id: string): Promise<DiscussionTopic> {
        return this.get<DiscussionTopic>(`/discussions/topics/${id}`);
    }

    async createDiscussionTopic(topic: Partial<DiscussionTopic>): Promise<DiscussionTopic> {
        return this.post<DiscussionTopic>('/discussions/topics', topic);
    }

    async updateDiscussionTopic(id: string, topic: Partial<DiscussionTopic>): Promise<DiscussionTopic> {
        const response = await fetch(`${this.baseUrl}/discussions/topics/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(topic),
        });
        if (!response.ok) throw new Error('Failed to update topic');
        return response.json();
    }

    async deleteDiscussionTopic(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/discussions/topics/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to delete topic');
    }

    async pinDiscussionTopic(id: string): Promise<{ message: string; isPinned: boolean }> {
        return this.post<{ message: string; isPinned: boolean }>(`/discussions/topics/${id}/pin`, {});
    }

    async lockDiscussionTopic(id: string): Promise<{ message: string; isLocked: boolean }> {
        return this.post<{ message: string; isLocked: boolean }>(`/discussions/topics/${id}/lock`, {});
    }

    async likeDiscussionTopic(id: string): Promise<{ message: string; likeCount: number; isLiked: boolean }> {
        return this.post<{ message: string; likeCount: number; isLiked: boolean }>(`/discussions/topics/${id}/like`, {});
    }

    // Posts
    async getPostsByTopic(topicId: string): Promise<DiscussionPost[]> {
        return this.get<DiscussionPost[]>(`/discussions/posts/topic/${topicId}`);
    }

    async createDiscussionPost(post: Partial<DiscussionPost>): Promise<DiscussionPost> {
        return this.post<DiscussionPost>('/discussions/posts', post);
    }

    async updateDiscussionPost(id: string, post: Partial<DiscussionPost>): Promise<DiscussionPost> {
        const response = await fetch(`${this.baseUrl}/discussions/posts/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(post),
        });
        if (!response.ok) throw new Error('Failed to update post');
        return response.json();
    }

    async deleteDiscussionPost(id: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/discussions/posts/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        if (!response.ok) throw new Error('Failed to delete post');
    }

    async likeDiscussionPost(id: string): Promise<{ message: string; likeCount: number; isLiked: boolean }> {
        return this.post<{ message: string; likeCount: number; isLiked: boolean }>(`/discussions/posts/${id}/like`, {});
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

// DISCUSSION FORUM TYPES
export interface DiscussionGroup {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    createdByName: string;
    category?: string;
    tags?: string[];
    icon?: string;
    color?: string;
    isPrivate: boolean;
    members?: string[];
    moderators?: string[];
    topicCount: number;
    postCount: number;
    memberCount: number;
    createdAt: string;
    updatedAt: string;
    lastTopicId?: string;
    lastTopicTitle?: string;
    lastPostAt?: string;
    lastPostBy?: string;
    lastPostByName?: string;
    isActive: boolean;
}

export interface DiscussionTopic {
    id: string;
    groupId: string;
    groupName: string;
    title: string;
    content?: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    authorRole?: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    replyCount: number;
    likeCount: number;
    likedBy?: string[];
    isPinned: boolean;
    isLocked: boolean;
    isDeleted: boolean;
    tags?: string[];
    lastReplyId?: string;
    lastReplyAt?: string;
    lastReplyBy?: string;
    lastReplyByName?: string;
}

export interface DiscussionPost {
    id: string;
    topicId: string;
    groupId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    authorRole?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    likedBy?: string[];
    isDeleted: boolean;
    parentPostId?: string;
    mentions?: string[];
}

// Make apiClient available globally for debugging
(window as any).apiClient = apiClient;

export function setApiBaseUrl(url: string) {
    (apiClient as any).baseUrl = url;
}
