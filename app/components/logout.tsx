"use client";

import { signOut } from 'next-auth/react';
import { useAppDispatch } from '@/app/store';
import { addToast } from '@/app/store/slice/toast.slice';
import { useState } from 'react';

const Logout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    const handleLogout = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await signOut({ redirect: false });
            dispatch(addToast('Logged out successfully.', 'success'));
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed:', err);
            dispatch(addToast('Logout failed', 'failure'));
            setIsLoading(false);
        }
    };

    return (
        <span
            onClick={handleLogout}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
        >
            {isLoading ? 'Logging out...' : 'Logout'}
        </span>
    );
};

export default Logout;