export type AccountStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'DISAPPROVED'
  | 'INACTIVE'
  | 'REQUESTED_TERMINATION';

export type UserType =
  | 'ADMIN'
  | 'PRODUTOR_RURAL'
  | 'GASTRONOMO'
  | 'PRODUTOR_ARTESANAL';

export interface User {
  id: string;
  salePointId: string | null;
  name: string;
  email: string;
  documentsStatus: AccountStatus;
  type: UserType;
  status: AccountStatus;
  phone?: string | null;
  cpfCnpj?: string | null;
  category: 'PRODUTOR_RURAL' | 'COMERCIANTE' | 'ARTESAO' | 'OUTRO';
  document?: string | null;
  profilePictureUrl?: string | null;
  createdAt: Date; // Datas são recebidas como strings
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User | null;
  success: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  type: UserType;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token?: string | null;
}

export interface LoginResponse {
  message: string;
  user: User;
  success: boolean;
}
