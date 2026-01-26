// components/auth/reset/ResetPasswordStep.tsx

'use client';

import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ResetPasswordStepProps } from '../types';

const smoothEasing: [number, number, number, number] = [0.4, 0, 0.2, 1];
const easeOut: [number, number, number, number] = [0.0, 0.0, 0.2, 1];
const stepVariants = {
    enter: { x: '20%', opacity: 0 },
    center: {
        x: 0,
        opacity: 1,
        transition: {
            x: { duration: 0.4, ease: smoothEasing },
            opacity: { duration: 0.3, ease: easeOut },
        },
    },
    exit: {
        x: '-20%',
        opacity: 0,
        transition: { duration: 0.3, ease: smoothEasing },
    },
};

export default function ResetPasswordStep({
    loading,
    error,
    newPassword,
    confirmPassword,
    showPassword,
    onPasswordChange,
    onConfirmPasswordChange,
    onTogglePassword,
}: ResetPasswordStepProps) {
    return (
        <motion.div
            key="step-3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-3"
        >
            <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full pl-8 pr-8 py-2 border-0 border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors bg-transparent text-sm disabled:opacity-50 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    disabled={loading}
                    onFocus={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.02)';
                    }}
                    onBlur={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                    }}
                />
                <button
                    type="button"
                    disabled={loading}
                    onClick={onTogglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white text-xs disabled:opacity-50"
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border-0 border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors bg-transparent text-sm disabled:opacity-50 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    disabled={loading}
                    onFocus={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.02)';
                    }}
                    onBlur={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                    }}
                />
            </div>

            {error && (
                <motion.div
                    className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, ease: smoothEasing }}
                >
                    {error}
                </motion.div>
            )}
        </motion.div>
    );
}