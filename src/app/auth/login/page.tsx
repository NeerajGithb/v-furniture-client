"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AuthModal from '@/components/auth/AuthModal';
import { useNavigate } from '@/components/NavigationLoader';
export default function LoginPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(true);
    const { user } = useCurrentUser();
    const navigate = useNavigate();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    useEffect(() => {
        if (user?.id) {
            navigate.push(returnUrl);
        }
    }, [user, navigate, returnUrl]);
    return (<div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0f1419]">
        <AuthModal isOpen={isAuthOpen} onClose={() => {
            setIsAuthOpen(false);
            navigate.push(returnUrl);
        }} />
    </div>);
}