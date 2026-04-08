"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Edit3, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../src/stores/store";
import { setAuth } from "../../src/features/auth/stores/authSlice";

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { user: reduxUser, loading: authLoading } = useSelector((state: RootState) => state.auth);

    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Status
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading && !reduxUser) {
            const hasToken = typeof window !== 'undefined' ? localStorage.getItem('ticketbox_token') : null;
            if (!hasToken) {
                router.push("/login");
            }
        } else if (reduxUser) {
            setUser(reduxUser);
            setName(reduxUser.name || "");
            setPhoneNumber(reduxUser.phoneNumber || "");
        }
    }, [reduxUser, authLoading, router, mounted]);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/auth/profile/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('ticketbox_token') : ''}`
                },
                body: JSON.stringify({ userId: user.id, name, phoneNumber }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to update profile.");
            }

            const data = await res.json();

            const token = data.accessToken;
            // Decode Tag (UTF-8 safe)
            const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = JSON.parse(decodeURIComponent(atob(payloadBase64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')));

            dispatch(setAuth({
                token: data.accessToken,
                refreshToken: data.refreshToken,
                user: {
                    id: decodedPayload.sub,
                    email: decodedPayload.email,
                    name: decodedPayload.name,
                    role: decodedPayload.role,
                    staffRole: decodedPayload.staffRole,
                    phoneNumber: decodedPayload.phoneNumber || phoneNumber
                }
            }));

            setStatus("success");
            setMessage("Thông tin đã được cập nhật thành công.");
            setIsEditing(false);

            setTimeout(() => setStatus("idle"), 3000);
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "An unexpected error occurred.");
        }
    };

    if (!mounted || authLoading || (!reduxUser && (typeof window !== 'undefined' && localStorage.getItem('ticketbox_token')))) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 border-l-4 border-red-600 pl-4">Hồ sơ cá nhân</h1>
                        <p className="text-slate-500 mt-1">Quản lý thông tin tài khoản và bảo mật của bạn</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Mini Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
                            <div className="w-24 h-24 bg-gradient-to-tr from-red-500 to-pink-500 rounded-[2rem] mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-red-100 italic font-black text-3xl">
                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 truncate px-2">{user.name || "N/A"}</h2>
                            <p className="text-sm text-slate-400 font-medium">{user.role}</p>

                            <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
                                <Link
                                    href="/change-password"
                                    className="flex items-center gap-3 w-full p-3 rounded-2xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
                                >
                                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold">Đổi mật khẩu</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Info Section */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-red-600" />
                                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Thông tin cơ bản</h3>
                                </div>
                                {isEditing ? (
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setName(user.name || "");
                                            setPhoneNumber(user.phoneNumber || "");
                                        }}
                                        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                                    >
                                        Hủy
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-bold"
                                    >
                                        <Edit3 className="w-4 h-4" /> Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                {status === "success" && (
                                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
                                        <CheckCircle2 className="w-5 h-5" /> {message}
                                    </div>
                                )}

                                {status === "error" && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
                                        <AlertCircle className="w-5 h-5" /> {message}
                                    </div>
                                )}

                                <form onSubmit={handleUpdateInfo} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Họ và tên</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    required
                                                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition ${isEditing
                                                        ? "bg-slate-100 border-2 border-red-500 text-black font-black shadow-inner"
                                                        : "bg-slate-100 border-2 border-slate-100 text-slate-500 font-bold"
                                                        }`}
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Số điện thoại</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition ${isEditing
                                                        ? "bg-slate-100 border-2 border-red-500 text-black font-black shadow-inner"
                                                        : "bg-slate-100 border-2 border-slate-100 text-slate-500 font-bold"
                                                        }`}
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Địa chỉ Email (Không thể thay đổi)</label>
                                        <div className="relative group grayscale">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="email"
                                                disabled
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-500"
                                                value={user.email}
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="pt-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <button
                                                type="submit"
                                                disabled={status === "loading"}
                                                className="flex-1 bg-red-600 hover:bg-black text-white font-black py-4 rounded-2xl transition-all duration-300 flex justify-center items-center shadow-xl shadow-red-100 disabled:opacity-70 uppercase tracking-widest gap-2"
                                            >
                                                {status === "loading" ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Save className="w-5 h-5" /> Lưu thay đổi
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setName(user.name || "");
                                                    setPhoneNumber(user.phoneNumber || "");
                                                }}
                                                className="px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Security Snapshot Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Bảo mật tài khoản</h3>
                                <p className="text-slate-400 text-sm mb-6 max-w-sm">
                                    Mật khẩu của bạn là lớp bảo mật quan trọng nhất. Hãy thường xuyên thay đổi để bảo vệ tài khoản.
                                </p>
                                <Link
                                    href="/change-password"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10 text-sm font-bold transition-all group-hover:gap-4"
                                >
                                    Đổi mật khẩu ngay <Lock className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
