"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppDispatch, RootState } from '../../../stores/store';
import { registerUser, clearError, resetRegisterSuccess } from '../stores/authSlice';
import { User, Lock, Loader2, Eye, EyeOff, Mail, Phone, Users, CheckCircle, ShieldCheck, Briefcase, Award, Truck } from 'lucide-react';

export const RegisterForm = () => {
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get('token');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(inviteToken ? 'STAFF' : 'USER');
    const [staffRole, setStaffRole] = useState('APPLICANT');
    const [companyName, setCompanyName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading, error, registerSuccess } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (error) dispatch(clearError());
    }, [name, email, phoneNumber, password, role, dispatch]);

    useEffect(() => {
        if (registerSuccess) {
            alert('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
            dispatch(resetRegisterSuccess());
            router.push('/login');
        }
    }, [registerSuccess, router, dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            alert('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        dispatch(registerUser({
            name,
            email,
            phoneNumber,
            password,
            role,
            companyName: role === 'VENDOR' ? companyName : undefined,
            staffRole: role === 'STAFF' ? staffRole : undefined,
        }));
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 mt-10 mb-10 text-slate-900 animate-in fade-in zoom-in-95 duration-500 [font-family:var(--font-outfit)]">
            <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-red-50 rounded-2xl mb-4">
                    <ShieldCheck className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    CONCERTMUSIC
                </h1>
                <p className="text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">Tạo tài khoản mới</p>

                {inviteToken && (
                    <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 flex items-center justify-center gap-3 text-sm font-black animate-bounce">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Đăng ký theo lời mời nhập đội
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl mb-6 border border-red-100 flex items-center gap-3">
                    <XCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Họ và tên</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="VD: Nguyễn Văn A"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-red-500 outline-none transition font-bold"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Email liên hệ</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="email@vi-du.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-red-500 outline-none transition font-bold"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Số điện thoại</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="090 123 4567"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-red-500 outline-none transition font-bold"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1 text-center">Bạn tham gia với vai trò</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            type="button"
                            disabled={!!inviteToken}
                            onClick={() => setRole('USER')}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === 'USER' ? 'border-red-600 bg-red-50 text-red-600 shadow-lg shadow-red-100' : 'border-slate-50 text-slate-300 hover:border-red-100 opacity-50'}`}
                        >
                            <User className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-black uppercase">Khán giả</span>
                        </button>

                        <button
                            type="button"
                            disabled={!!inviteToken}
                            onClick={() => setRole('VENDOR')}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === 'VENDOR' ? 'border-amber-600 bg-amber-50 text-amber-600 shadow-lg shadow-amber-100' : 'border-slate-50 text-slate-300 hover:border-amber-100 opacity-50'}`}
                        >
                            <Truck className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-black uppercase">Đối tác hậu cần</span>
                        </button>

                        <button
                            type="button"
                            disabled={!!inviteToken}
                            onClick={() => setRole('ORGANIZER')}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === 'ORGANIZER' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100' : 'border-slate-50 text-slate-300 hover:border-blue-100 opacity-50'}`}
                        >
                            <Lock className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-black uppercase">Nhà tổ chức</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole('STAFF')}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === 'STAFF' ? 'border-red-600 bg-red-50 text-red-600 shadow-lg shadow-red-100' : 'border-slate-50 text-slate-300 hover:border-red-100'}`}
                        >
                            <Users className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-black uppercase">Nhân sự sự kiện</span>
                        </button>
                    </div>

                    {role === 'VENDOR' && (
                        <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 mb-6 space-y-4 animate-in slide-in-from-top-2 duration-300 shadow-inner">
                            <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest text-center mb-2 flex items-center justify-center gap-2">
                                <Truck className="w-3 h-3" /> Thông tin đối tác hậu cần
                            </p>
                            <div className="relative group">
                                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300 group-focus-within:text-amber-600 transition-colors" />
                                <input
                                    type="text"
                                    required={role === 'VENDOR'}
                                    placeholder="Tên công ty / Tổ chức của bạn"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-amber-500 outline-none transition font-bold text-slate-800 placeholder:text-slate-300"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <p className="text-[9px] text-amber-500 italic font-bold text-center px-2">
                                🏢 Thông tin này sẽ được hiển thị trên hồ sơ đối tác của bạn.
                            </p>
                        </div>
                    )}

                    {role === 'STAFF' && (
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mb-6 space-y-4 animate-in slide-in-from-top-2 duration-300 shadow-inner">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-2">Đăng ký làm nhân sự</p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStaffRole('EVENT_MANAGER')}
                                    className={`py-4 px-6 rounded-2xl border-2 font-black text-[10px] transition-all flex items-center justify-between group ${staffRole === 'EVENT_MANAGER' ? 'bg-amber-600 text-white border-amber-600 shadow-xl shadow-amber-200' : 'bg-white text-slate-400 border-slate-100 hover:border-amber-200'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Award className={`w-4 h-4 ${staffRole === 'EVENT_MANAGER' ? 'text-white' : 'text-amber-500'}`} />
                                        <span className="uppercase tracking-widest">Event Manager (Tổng quản)</span>
                                    </div>
                                    {staffRole === 'EVENT_MANAGER' && <CheckCircle className="w-4 h-4" />}
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStaffRole('MANAGER')}
                                        className={`py-4 rounded-2xl border-2 font-black text-[10px] transition-all flex items-center justify-center gap-2 ${staffRole === 'MANAGER' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                    >
                                        <Briefcase className="w-4 h-4" />
                                        MANAGER
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStaffRole('APPLICANT')}
                                        className={`py-4 rounded-2xl border-2 font-black text-[10px] transition-all flex items-center justify-center gap-2 ${staffRole === 'APPLICANT' ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-100' : 'bg-white text-slate-400 border-slate-100 hover:border-rose-200'}`}
                                    >
                                        <Users className="w-4 h-4" />
                                        WORKER
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl border border-slate-50 text-center">
                                <p className="text-[9px] text-slate-500 italic font-bold leading-relaxed px-2">
                                    {staffRole === 'EVENT_MANAGER'
                                        ? "⚡ Tổng quản: Điều hành toàn quy trình từ Planning đến On-site."
                                        : staffRole === 'MANAGER'
                                            ? "💼 Manager: Quản lý tin tuyển dụng và đội ngũ chuyên môn."
                                            : "🛠️ Worker: Tìm kiếm việc làm và thực thi tại sự kiện."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Bảo mật mật khẩu</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="********"
                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-red-500 outline-none transition font-bold"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-black text-white font-black py-4 rounded-2xl transition-all duration-300 flex justify-center items-center shadow-xl shadow-red-100 disabled:opacity-70 uppercase tracking-widest"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            inviteToken ? 'Gia nhập ngay' : 'Đăng ký tài khoản'
                        )}
                    </button>

                    <div className="mt-8 text-center text-sm font-bold text-slate-400">
                        Đã có tài khoản? <Link href="/login" className="text-red-600 hover:text-black transition-colors">Đăng nhập ngay</Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

const XCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
    </svg>
);
