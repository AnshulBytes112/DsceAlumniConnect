import { mockCredentials } from '@/data/mockData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api'; // Uses Vite env var or fallback

export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    graduationYear: number;
    department: string;
    contactNumber: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleSignInRequest {
    idToken: string;
}

export interface AuthResponse {
    id: string;
    email: string;
    profilePicture: string | null;
    jwtToken: string;
    lastname: string;
    firstname: string;
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

    async signup(data: SignUpRequest): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/signup`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error: ErrorResponse = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        return response.json();
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        // Mock Bypass
        if (data.email.trim() === mockCredentials.email && data.password.trim() === mockCredentials.password) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockCredentials.user), 500);
            });
        }

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
}

export const apiClient = new ApiClient(API_BASE_URL);

export function setApiBaseUrl(url: string) {
    // helper to change base url at runtime if needed
    (apiClient as any).baseUrl = url;
}
