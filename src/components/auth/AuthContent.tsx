// components/auth/AuthContent.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import LoginForm from './login/LoginForm';
import SignupForm from './login/SignupForm';
import ResetEmailStep from './reset/ResetEmailStep';
import VerifyCodeStep from './reset/VerifyCodeStep';
import ResetPasswordStep from './reset/ResetPasswordStep';
import toast from 'react-hot-toast';

const smoothEasing: [number, number, number, number] = [0.4, 0, 0.2, 1];
const easeOut: [number, number, number, number] = [0.0, 0.0, 0.2, 1];
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: {
            x: { duration: 0.4, ease: smoothEasing },
            opacity: { duration: 0.3, ease: easeOut },
        },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        transition: { duration: 0.3, ease: smoothEasing },
    }),
};

interface AuthContentProps {
    isLogin: boolean;
    showForgotPassword: boolean;
    showEmailVerification: boolean;
    loading: boolean;
    error: string | null;
    isOAuth: boolean;
    showPassword: boolean;
    resetStep: 1 | 2 | 3;
    resetEmail: string;
    resetCode: string;
    newPassword: string;
    confirmPassword: string;
    codeError: string;
    passError: string | null;
    verificationEmail: string;
    verificationCode: string;
    verificationCodeError: string;
    onToggleMode: () => void;
    onTogglePassword: () => void;
    onClearError: () => void;
    onShowForgotPassword: () => void;
    onHideForgotPassword: () => void;
    onGoogleLogin: () => void;
    onEmailAuth: (e: React.FormEvent<HTMLFormElement>) => void;
    onSendResetCode: (e: React.FormEvent<HTMLFormElement>) => void;
    onVerifyCode: (e: React.FormEvent<HTMLFormElement>) => void;
    onResetPassword: (e: React.FormEvent<HTMLFormElement>) => void;
    onVerifyEmail: (e: React.FormEvent<HTMLFormElement>) => void;
    onResendVerificationCode: () => void;
    onCodeChange: (code: string) => void;
    onPasswordChange: (password: string) => void;
    onConfirmPasswordChange: (password: string) => void;
    onVerificationCodeChange: (code: string) => void;
}

export default function AuthContent({
    isLogin,
    showForgotPassword,
    showEmailVerification,
    loading,
    error,
    isOAuth,
    showPassword,
    resetStep,
    resetEmail,
    resetCode,
    newPassword,
    confirmPassword,
    codeError,
    passError,
    verificationEmail,
    verificationCode,
    verificationCodeError,
    onToggleMode,
    onTogglePassword,
    onClearError,
    onShowForgotPassword,
    onHideForgotPassword,
    onGoogleLogin,
    onEmailAuth,
    onSendResetCode,
    onVerifyCode,
    onResetPassword,
    onVerifyEmail,
    onResendVerificationCode,
    onCodeChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onVerificationCodeChange,
}: AuthContentProps) {
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                    <motion.div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200 ${resetStep >= stepNum ? 'bg-black dark:bg-gray-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                        animate={{ scale: resetStep >= stepNum ? 1 : 0.9 }}
                        transition={{ duration: 0.3, ease: smoothEasing }}
                    >
                        {stepNum}
                    </motion.div>
                    {stepNum < 3 && (
                        <motion.div
                            className={`w-6 h-0.5 mx-1 ${resetStep > stepNum ? 'bg-black dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: resetStep > stepNum ? 1 : 0 }}
                            transition={{ duration: 0.4, ease: smoothEasing }}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    const handleResend = () => {
        toast.success('New code sent!');
    };

    return (
        <div className="text-center space-y-1">
            <motion.h2
                className="text-xl font-bold text-gray-900 dark:text-white"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.05, ease: smoothEasing }}
            >
                {showEmailVerification
                    ? 'Verify Your Email'
                    : showForgotPassword
                        ? 'Reset Password'
                        : isLogin
                            ? 'Welcome Back'
                            : 'Create Account'}
            </motion.h2>

            <motion.p
                className="text-xs text-gray-600 dark:text-gray-400"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.1, ease: smoothEasing }}
            >
                {showEmailVerification
                    ? 'Enter the verification code sent to your email'
                    : showForgotPassword
                        ? 'Follow the steps to reset your password'
                        : isLogin
                            ? 'Sign in to continue to your account'
                            : 'Get started with your free account'}
            </motion.p>

            <AnimatePresence mode="wait" custom={isLogin ? 1 : -1}>
                <motion.div
                    key={showEmailVerification ? 'verify' : showForgotPassword ? 'forgot' : isLogin ? 'login' : 'signup'}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={isLogin ? 1 : -1}
                    className="space-y-3 flex flex-col justify-center min-h-100"
                >
                    {showEmailVerification ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-center min-h-87.5">
                            <form onSubmit={onVerifyEmail} className="space-y-3">
                                <VerifyCodeStep
                                    loading={loading}
                                    error={verificationCodeError}
                                    code={verificationCode}
                                    email={verificationEmail}
                                    onCodeChange={onVerificationCodeChange}
                                    onResend={onResendVerificationCode}
                                />

                                <motion.button
                                    type="submit"
                                    className="w-full bg-black dark:bg-gray-800 text-white py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || verificationCode.length !== 6}
                                    whileHover={!loading ? { scale: 1.01 } : {}}
                                    whileTap={!loading ? { scale: 0.99 } : {}}
                                    transition={{ duration: 0.1 }}
                                >
                                    {loading ? 'Verifying...' : 'Verify Email'}
                                </motion.button>
                            </form>
                        </div>
                    ) : showForgotPassword ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-center min-h-87.5">
                            {renderStepIndicator()}

                            <form
                                onSubmit={
                                    resetStep === 1
                                        ? onSendResetCode
                                        : resetStep === 2
                                            ? onVerifyCode
                                            : onResetPassword
                                }
                                className="space-y-3"
                            >
                                <AnimatePresence mode="wait">
                                    {resetStep === 1 && (
                                        <ResetEmailStep loading={loading} error={error} onSubmit={onSendResetCode} />
                                    )}

                                    {resetStep === 2 && (
                                        <VerifyCodeStep
                                            loading={loading}
                                            error={codeError}
                                            code={resetCode}
                                            email={resetEmail}
                                            onCodeChange={onCodeChange}
                                            onResend={handleResend}
                                        />
                                    )}

                                    {resetStep === 3 && (
                                        <ResetPasswordStep
                                            loading={loading}
                                            error={passError}
                                            newPassword={newPassword}
                                            confirmPassword={confirmPassword}
                                            showPassword={showPassword}
                                            onPasswordChange={onPasswordChange}
                                            onConfirmPasswordChange={onConfirmPasswordChange}
                                            onTogglePassword={onTogglePassword}
                                            onSubmit={onResetPassword}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    type="submit"
                                    className="w-full bg-black dark:bg-gray-800 text-white py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || (resetStep === 2 && resetCode.length !== 6)}
                                    whileHover={!loading ? { scale: 1.01 } : {}}
                                    whileTap={!loading ? { scale: 0.99 } : {}}
                                    transition={{ duration: 0.1 }}
                                >
                                    {resetStep === 1
                                        ? loading
                                            ? 'Sending...'
                                            : 'Send Reset Code'
                                        : resetStep === 2
                                            ? loading
                                                ? 'Verifying...'
                                                : 'Verify Code'
                                            : loading
                                                ? 'Updating...'
                                                : 'Update Password'}
                                </motion.button>
                            </form>

                            <motion.button
                                onClick={onHideForgotPassword}
                                disabled={loading}
                                className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={!loading ? { x: -1 } : {}}
                                transition={{ duration: 0.1 }}
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Back to Login
                            </motion.button>
                        </div>
                    ) : isLogin ? (
                        <LoginForm
                            loading={loading}
                            error={error}
                            isOAuth={isOAuth}
                            showPassword={showPassword}
                            onTogglePassword={onTogglePassword}
                            onSubmit={onEmailAuth}
                            onClearError={onClearError}
                            onSwitchMode={onToggleMode}
                            onForgotPassword={onShowForgotPassword}
                            onGoogleLogin={onGoogleLogin}
                        />
                    ) : (
                        <SignupForm
                            loading={loading}
                            error={error}
                            isOAuth={isOAuth}
                            showPassword={showPassword}
                            onTogglePassword={onTogglePassword}
                            onSubmit={onEmailAuth}
                            onClearError={onClearError}
                            onSwitchMode={onToggleMode}
                            onGoogleLogin={onGoogleLogin}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}