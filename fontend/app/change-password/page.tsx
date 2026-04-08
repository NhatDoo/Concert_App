"use client";

import { useState, useEffect } from "react";
import { Lock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../src/stores/store";
import Link from "next/link";

export default function ChangePassword() {
    const router = useRouter();
    const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading && !user) {
            const hasToken = localStorage.getItem('ticketbox_token');
            if (!hasToken) {
                router.push("/login");
            }
        }
    }, [user, authLoading, router, mounted]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus("error");
            setErrorMessage("Mật khẩu mới không khớp.");
            return;
        }

        if (newPassword.length < 8) {
            setStatus("error");
            setErrorMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
            if (!user?.id) {
                throw new Error("Bạn cần đăng nhập để đổi mật khẩu.");
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('ticketbox_token')}`
                },
                body: JSON.stringify({ userId: user.id, oldPassword, newPassword }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
            }

            setStatus("success");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    if (!mounted || authLoading || (!user && (typeof window !== 'undefined' && localStorage.getItem('ticketbox_token')))) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50/50 p-6 px-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Đổi mật khẩu</h2>
                        <p className="text-slate-500 mt-1 text-sm">
                            Đảm bảo tài khoản của bạn sử dụng mật khẩu mạnh để luôn an toàn.
                        </p>
                    </div>
                    <Link href="/profile" className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-red-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>

                <div className="p-8">
                    {status === "success" ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 animate-in slide-in-from-top-2">
                            <div className="flex items-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3" />
                                <div>
                                    <h3 className="font-bold text-emerald-800">Đổi mật khẩu thành công</h3>
                                    <p className="text-emerald-600 text-sm mt-1">Mật khẩu của bạn đã được cập nhật.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setStatus("idle")}
                                className="mt-4 text-sm font-bold text-emerald-700 hover:underline"
                            >
                                Đóng thông báo
                            </button>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="oldPassword" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-300" />
                                </div>
                                <input
                                    id="oldPassword"
                                    name="oldPassword"
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-100 border-2 border-slate-100 rounded-2xl focus:bg-slate-100 focus:border-red-500 focus:text-black focus:font-black outline-none transition font-bold text-slate-500 shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="newPassword" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Mật khẩu mới</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-100 border-2 border-slate-100 rounded-2xl focus:bg-slate-100 focus:border-red-500 focus:text-black focus:font-black outline-none transition font-bold text-slate-500 shadow-inner"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-100 border-2 border-slate-100 rounded-2xl focus:bg-slate-100 focus:border-red-500 focus:text-black focus:font-black outline-none transition font-bold text-slate-500 shadow-inner"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-2xl p-4 font-bold flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                {errorMessage}
                            </div>
                        )}

                        <div className="pt-4 flex justify-end gap-4">
                            <Link
                                href="/profile"
                                className="px-8 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="flex items-center justify-center py-3.5 px-8 border border-transparent rounded-2xl shadow-xl shadow-red-50 text-sm font-black text-white bg-red-600 hover:bg-black transition-all disabled:opacity-50 uppercase tracking-widest"
                            >
                                {status === "loading" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {status === "loading" ? "Đang lưu..." : "Lưu mật khẩu"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
