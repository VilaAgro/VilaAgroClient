export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'INACTIVE';
  category?: 'PRODUTOR_RURAL' | 'COMERCIANTE' | 'ARTESAO' | 'OUTRO';
  phone?: string;
  document?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
