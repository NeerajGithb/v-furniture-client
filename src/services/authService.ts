// Frontend auth service - makes HTTP calls to API endpoints
import { BasePrivateService } from "./baseService";
import toast from "react-hot-toast";

// Use the same types as the backend schemas for consistency
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  photoURL?: string;
}

interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

interface SendResetCodeRequest {
  email: string;
}

interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

interface ResendOTPRequest {
  email: string;
}

// Response interfaces
interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  message: string;
  user: AuthUser;
}

interface RegisterResponse {
  message: string;
  user?: AuthUser;
  requiresVerification?: boolean;
}

interface CodeResponse {
  success: boolean;
  message?: string;
}

class AuthService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Login user with email and password
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/auth?action=login", data);

    if (response.success) {
      toast.success("Welcome back! Login successful.");
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Login failed. Please try again.",
      );
    }
  }

  // Register new user account
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.post<RegisterResponse>(
      "/auth?action=register",
      data,
    );

    if (response.success) {
      if (response.data?.requiresVerification) {
        toast.success(
          "Account created! Please check your email for verification code.",
        );
      } else {
        toast.success("Account created successfully! Welcome aboard.");
      }
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Registration failed. Please try again.",
      );
    }
  }

  // Send password reset code to email
  async sendResetCode(data: SendResetCodeRequest): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>(
      "/auth?action=send-reset-code",
      data,
    );

    if (response.success) {
      toast.success("Reset code sent! Check your email.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Failed to send reset code.");
    }
  }

  // Verify password reset code
  async verifyResetCode(data: VerifyResetCodeRequest): Promise<CodeResponse> {
    const response = await this.post<{ valid: boolean }>(
      "/auth?action=verify-reset-code",
      data,
    );

    if (response.success && response.data?.valid) {
      toast.success("Code verified! Set your new password.");
      return { success: true };
    } else {
      throw new Error(response.error?.message || "Verification failed.");
    }
  }

  // Reset user password
  async resetPassword(data: ResetPasswordRequest): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>(
      "/auth?action=reset-password",
      data,
    );

    if (response.success) {
      toast.success("Password reset successful! You can now login.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Password reset failed.");
    }
  }

  // Verify email verification code
  async verifyEmailCode(data: VerifyEmailCodeRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      "/auth?action=verify-email",
      data,
    );

    if (response.success) {
      toast.success("Email verified successfully! Welcome aboard.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Verification failed.");
    }
  }

  // Resend email verification OTP
  async resendOTP(data: ResendOTPRequest): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>(
      "/auth?action=resend-otp",
      data,
    );

    if (response.success) {
      toast.success("Verification code resent! Check your email.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Failed to resend code.");
    }
  }

  // Logout current user
  async logout(): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>("/auth?action=logout", {});

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Logout failed.");
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
