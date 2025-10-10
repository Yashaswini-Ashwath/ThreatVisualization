import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds

export const useInactivityLogout = (onLogout) => {
    const timeoutRef = useRef(null);

    const resetTimer = useCallback(() => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            onLogout();
        }, INACTIVITY_TIMEOUT);
    }, [onLogout]);

    useEffect(() => {
        // Events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Reset timer on any user activity
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [resetTimer]);
};
