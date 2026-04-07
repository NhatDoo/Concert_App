"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../../src/features/auth/stores/authSlice';
import { AppDispatch } from '../../../src/stores/store';

const CallbackHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            try {
                // Decode JWT to get user object
                const payloadBase64 = accessToken.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));

                dispatch(setAuth({
                    token: accessToken,
                    refreshToken: refreshToken,
                    user: {
                        id: decodedPayload.sub,
                        email: decodedPayload.email,
                        name: decodedPayload.name || decodedPayload.email.split('@')[0],
                        role: decodedPayload.role,
                        staffRole: decodedPayload.staffRole,
                    }
                }));

                // Redirect based on role
                if (decodedPayload.role === 'VENDOR') {
                    router.push('/vendor');
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Error decoding OAuth tokens:', error);
                router.push('/login?error=oauth_failed');
            }
        } else {
            router.push('/login?error=missing_tokens');
        }
    }, [router, searchParams, dispatch]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium animate-pulse">Đang hoàn tất đăng nhập...</p>
        </div>
    );
};

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Vui lòng chờ...</p>
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
