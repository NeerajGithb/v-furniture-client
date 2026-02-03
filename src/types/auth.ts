// Auth-related types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface SendResetCodeRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface LoginResponse {
  success: boolean;
  user?: any;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  requiresVerification?: boolean;
  user?: any;
  message?: string;
}

export interface CodeResponse {
  success: boolean;
  message?: string;
}
