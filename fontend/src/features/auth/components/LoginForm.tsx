"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppDispatch, RootState } from '../../../stores/store';
import { loginUser, clearError } from '../stores/authSlice';
import { User, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading, error, user } = useSelector((state: RootState) => state.auth);

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    useEffect(() => {
        if (error) dispatch(clearError());
    }, [email, password, dispatch]);

    // Chuyển hướng sau khi đăng nhập thành công
    useEffect(() => {
        if (user) {
            const params = new URLSearchParams(window.location.search);
            const redirectParam = params.get('redirect');

            if (redirectParam) {
                router.push(redirectParam);
                return;
            }

            // Mặc định dựa trên Role
            if (user.role === 'ORGANIZER') {
                router.push('/organizer');
            } else if (user.role === 'STAFF') {
                if (user.staffRole === 'MANAGER' || user.staffRole === 'EVENT_MANAGER') {
                    router.push('/staff/manager');
                } else {
                    router.push('/staff');
                }
            } else if (user.role === 'VENDOR') {
                router.push('/vendor');
            } else {
                router.push('/');
            }
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-red-600 tracking-tighter cursor-pointer">
                    CONCERTMUSIC
                </h1>
                <p className="text-gray-500 mt-2 text-sm font-medium">Đăng nhập để khám phá sự kiện</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            placeholder="Nhập email của bạn"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-black"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Nhập mật khẩu"
                            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-gray-600">
                        <input type="checkbox" className="mr-2 text-red-600 focus:ring-red-500 rounded border-gray-300" />
                        Ghi nhớ đăng nhập
                    </label>
                    <Link href="/forgot-password" title='Quên mật khẩu?' className="text-red-600 font-medium hover:underline">Quên mật khẩu?</Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex justify-center items-center shadow-md disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Đăng nhập'
                    )}
                </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2">
                <div className="h-[1px] bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hoặc tiếp tục với</span>
                <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>

            <div className="mt-6">
                <button
                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`}
                    type="button"
                    className="w-full bg-white hover:bg-slate-50 text-gray-700 font-semibold py-3 rounded-lg transition duration-200 flex justify-center items-center gap-3 border border-gray-200 shadow-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Google</span>
                </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
                Chưa có tài khoản? <Link href="/register" className="text-red-600 font-semibold hover:underline">Đăng ký ngay</Link>
            </div>
        </div>
    );
};
