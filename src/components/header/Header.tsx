"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import HeaderShell from './HeaderShell';

const Header = () => {
    const [activeInspiration, setActiveInspiration] = useState<string | null>(null);
    const [tabPosition, setTabPosition] = useState<DOMRect | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInspirationEnter = useCallback((inspirationName: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveInspiration(inspirationName);
    }, []);

    const handleGetTabPosition = useCallback((rect: DOMRect) => {
        setTabPosition(rect);
    }, []);

    const handleInspirationLeave = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            setActiveInspiration(null);
            setTabPosition(null);
        }, 150);
    }, []);

    const clearInspirationTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const closeMegaMenu = useCallback(() => {
        setActiveInspiration(null);
        setTabPosition(null);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <HeaderShell
            activeInspiration={activeInspiration}
            tabPosition={tabPosition}
            onInspirationEnter={handleInspirationEnter}
            onGetTabPosition={handleGetTabPosition}
            onInspirationLeave={handleInspirationLeave}
            onClearTimeout={clearInspirationTimeout}
            onCloseMegaMenu={closeMegaMenu}
        />
    );
};

export default Header;