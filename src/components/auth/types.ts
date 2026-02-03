// components/auth/types.ts

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AuthState {
  isLogin: boolean;
  showPassword: boolean;
  loading: boolean;
  emailPassError: string | null;
  showForgotPassword: boolean;
  isOAuth: boolean;
}

export interface ResetPasswordState {
  step: 1 | 2 | 3;
  enteredEmail: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
  codeError: string;
  passError: string | null;
}

export interface AuthFormProps {
  loading: boolean;
  error: string | null;
  isOAuth: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClearError: () => void;
  onSwitchMode?: () => void;
  onForgotPassword?: () => void;
  onGoogleLogin: () => void;
}

export interface ResetStepProps {
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface OTPInputProps extends ResetStepProps {
  code: string;
  email: string;
  onCodeChange: (code: string) => void;
  onResend: () => void;
}

export interface ResetPasswordStepProps extends ResetStepProps {
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
}
