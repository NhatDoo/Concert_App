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

    // Chuyển hướng về trang chủ khi đăng nhập thành công
    useEffect(() => {
        if (user) {
            router.push('/');
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
                    TICKETBOX
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
                    <a href="#" className="text-red-600 font-medium hover:underline">Quên mật khẩu?</a>
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

            <div className="mt-6 text-center text-sm text-gray-600">
                Chưa có tài khoản? <Link href="/register" className="text-red-600 font-semibold hover:underline">Đăng ký ngay</Link>
            </div>
        </div>
    );
};
