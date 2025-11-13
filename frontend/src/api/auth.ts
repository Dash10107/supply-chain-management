import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<{ status: string; data: { user: User } }> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  getProfile: async (): Promise<{ status: string; data: { user: User } }> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
  getRoles: async (): Promise<{ status: string; data: Role[] }> => {
    const response = await apiClient.get('/roles');
    return response.data;
  },
};

