const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api'; // Uses Vite env var or fallback

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

export interface AuthResponse {
    id: string;
    email: string;
    profilePicture: string | null;
    resumeUrl: string | null;
    jwtToken: string;
    firstName: string;
    lastName: string;
    profileComplete: boolean;
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

    async getProfile(): Promise<any> {
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
