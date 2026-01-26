import { useState } from 'react';
import { QuickLinks } from './QuickLinks';
import AuthModal from '../auth/AuthModal';

interface SidebarFooterProps {
    onLinkClick: () => void;
}

export const SidebarFooter = ({ onLinkClick }: SidebarFooterProps) => {
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <>
            <QuickLinks onLinkClick={onLinkClick} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
};