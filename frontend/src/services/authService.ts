import apiClient, { handleApiError } from './apiClient';
import type { AxiosError } from 'axios';
import type {
  EventDTO as LibEventDTO,
  JobPostDTO as LibJobPostDTO,
  UserProfile as LibUserProfile,
  AuthResponse as LibAuthResponse
} from '@/lib/api';

/**
 * Authentication Service
 * Example of how to use the centralized apiClient
 * 
 * Replaces the old fetch() calls with Axios
 */

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  graduationBatch?: number;
  graduationDepartment?: string;
  usn?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleSignInRequest {
  accessToken: string;
}

export type AuthResponse = LibAuthResponse;

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signup(request: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', request);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Sign up failed: ${errorMessage}`);
    }
  }

  /**
   * Login with email and password
   */
  static async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', request);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Login failed: ${errorMessage}`);
    }
  }

  /**
   * Google OAuth login
   */
  static async googleLogin(request: GoogleSignInRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/google', request);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Google login failed: ${errorMessage}`);
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) return false;

      // Make authenticated request to verify token is valid
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      localStorage.removeItem('jwtToken');
      return false;
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
  }
}

/**
 * Events Service
 * Example of how to use apiClient for other resources
 */
export type EventDTO = LibEventDTO;

export class EventsService {
  /**
   * Get all events
   */
  static async getAllEvents(): Promise<EventDTO[]> {
    try {
      const response = await apiClient.get<EventDTO[]>('/events');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to fetch events: ${errorMessage}`);
    }
  }

  /**
   * Get featured events
   */
  static async getFeaturedEvents(): Promise<EventDTO[]> {
    try {
      const response = await apiClient.get<EventDTO[]>('/events/featured');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to fetch featured events: ${errorMessage}`);
    }
  }

  /**
   * Create new event (requires authentication)
   */
  static async createEvent(event: EventDTO): Promise<EventDTO> {
    try {
      const response = await apiClient.post<EventDTO>('/events', event);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to create event: ${errorMessage}`);
    }
  }

  /**
   * RSVP to an event
   */
  static async rsvpEvent(eventId: string, status: 'GOING' | 'MAYBE' | 'NOT_GOING'): Promise<void> {
    try {
      await apiClient.post(`/events/${eventId}/rsvp`, { status });
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to RSVP to event: ${errorMessage}`);
    }
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string): Promise<EventDTO> {
    try {
      const response = await apiClient.get<EventDTO>(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to fetch event: ${errorMessage}`);
    }
  }
}

/**
 * Dashboard Service
 */
export interface DashboardStats {
  jobsApplied: number;
  events: number;
  mentorships: number;
}

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch stats: ${errorMessage}`);
      return { jobsApplied: 0, events: 0, mentorships: 0 };
    }
  }

  /**
   * Get job applications
   */
  static async getJobApplications(): Promise<any[]> {
    try {
      const response = await apiClient.get('/dashboard/job-applications');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch job applications: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get announcements
   */
  static async getAnnouncements(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/dashboard/announcements');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch announcements: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(): Promise<any[]> {
    try {
      const response = await apiClient.get('/dashboard/events');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch events: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get project fundings
   */
  static async getProjectFundings(): Promise<any[]> {
    try {
      const response = await apiClient.get('/dashboard/fundings');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch fundings: ${errorMessage}`);
      return [];
    }
  }
}

/**
 * Jobs Service
 */
export type JobPostDTO = LibJobPostDTO;

export class JobsService {
  /**
   * Get all jobs
   */
  static async getAllJobs(): Promise<JobPostDTO[]> {
    try {
      const response = await apiClient.get<JobPostDTO[]>('/jobs');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch jobs: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get user's own jobs (posted jobs)
   */
  static async getMyJobs(): Promise<JobPostDTO[]> {
    try {
      const response = await apiClient.get<JobPostDTO[]>('/jobs/my-jobs');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch my jobs: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Create a new job posting
   */
  static async createJob(job: Omit<JobPostDTO, 'id' | 'postedById' | 'createdAt'>): Promise<JobPostDTO> {
    try {
      const response = await apiClient.post<JobPostDTO>('/jobs', job);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to create job: ${errorMessage}`);
    }
  }

  /**
   * Get job by ID
   */
  static async getJobById(jobId: string): Promise<JobPostDTO> {
    try {
      const response = await apiClient.get<JobPostDTO>(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to fetch job: ${errorMessage}`);
    }
  }

  /**
   * Update job posting
   */
  static async updateJob(jobId: string, job: Partial<JobPostDTO>): Promise<JobPostDTO> {
    try {
      const response = await apiClient.put<JobPostDTO>(`/jobs/${jobId}`, job);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to update job: ${errorMessage}`);
    }
  }

  /**
   * Delete job posting
   */
  static async deleteJob(jobId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/${jobId}`);
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to delete job: ${errorMessage}`);
    }
  }
}

/**
 * Profile Service
 */
export type UserProfileDTO = LibUserProfile;

export class ProfileService {
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfileDTO> {
    try {
      const response = await apiClient.get<UserProfileDTO>('/profile');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to fetch profile: ${errorMessage}`);
    }
  }

  /**
   * Get profile by user ID
   */
  static async getProfileById(userId: string): Promise<UserProfileDTO> {
    try {
      const response = await apiClient.get<UserProfileDTO>(`/alumni/${userId}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to fetch user profile: ${errorMessage}`);
    }
  }

  /**
   * Get all alumni profiles
   */
  static async getAllAlumni(): Promise<UserProfileDTO[]> {
    try {
      const response = await apiClient.get<UserProfileDTO[]>('/alumni');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      console.error(`Failed to fetch alumni: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Update current user profile
   */
  static async updateProfile(profile: Partial<UserProfileDTO>): Promise<UserProfileDTO> {
    try {
      const response = await apiClient.put<UserProfileDTO>('/profile', profile);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to update profile: ${errorMessage}`);
    }
  }

  /**
   * Setup profile (after sign up)
   */
  static async setupProfile(data: any): Promise<any> {
    try {
      const response = await apiClient.post('/profile/setup', data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to setup profile: ${errorMessage}`);
    }
  }

  /**
   * Upload resume
   */
  static async uploadResume(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/profile/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(`Failed to upload resume: ${errorMessage}`);
    }
  }
}
