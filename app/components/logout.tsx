"use client";

import { useLogoutMutation } from '../store/api/auth.api';
import { useAppDispatch } from '@/app/store';
import { addToast } from '@/app/store/slice/toast.slice';

const Logout = () => {
    const [logout, { isLoading }] = useLogoutMutation();
    const dispatch = useAppDispatch();

    const handleLogout = async () => {
        if (isLoading) return;
        try {
            await logout().unwrap();
            dispatch(addToast('Logged out successfully.', 'success'));
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed:', err);
            const logoutErr = err as { data?: { message?: string }; message?: string };
            const message = logoutErr?.data?.message || logoutErr?.message || 'Logout failed';
            dispatch(addToast(message, 'failure'));
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