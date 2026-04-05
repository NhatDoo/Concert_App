import React, { useState } from 'react';
import { User, Phone, Mail, FileText, Upload, Save, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useStaffProfile } from '../hooks/useStaffProfile';

interface StaffProfileProps {
    user: any;
    token: string | null;
    accentColor?: string; // 'rose-600' or 'amber-600' for different roles
    onUpdateSuccess?: (msg: string) => void;
}

export const StaffProfile = ({ user, token, accentColor = 'rose-600', onUpdateSuccess }: StaffProfileProps) => {
    const {
        profileData,
        setProfileData,
        loading,
        isSaving,
        uploading,
        updateProfile,
        uploadCv
    } = useStaffProfile(user, token);

    const [editing, setEditing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateProfile(profileData);
        if (success) {
            setEditing(false);
            if (onUpdateSuccess) onUpdateSuccess('Hồ sơ đã được cập nhật thành công!');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadCv(file);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className={`w-8 h-8 text-${accentColor} animate-spin mb-4`} />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Tải thông tin hồ sơ...</p>
        </div>
    );

    const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-opacity-20 outline-none transition-all duration-300 " + (accentColor === 'rose-600' ? "focus:ring-rose-600 focus:border-rose-300" : "focus:ring-amber-600 focus:border-amber-300");

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-black/5 p-10 overflow-hidden relative group">
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${accentColor}/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000`}></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-4xl font-black text-slate-400 shadow-inner group-hover:scale-105 transition-transform duration-500">
                        {profileData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{profileData.name || 'Staff Member'}</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">{user?.role || 'Staff'}</p>
                            </div>
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className={`px-6 py-3 rounded-2xl border border-slate-100 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all duration-300 text-slate-500 hover:text-${accentColor}`}
                                >
                                    Sửa thông tin
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 group/item">
                                <div className={`p-3 rounded-xl bg-slate-50 text-slate-400 group-hover/item:text-${accentColor} transition-colors`}>
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-slate-500">{profileData.phoneNumber || 'Chưa cập nhật SĐT'}</span>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className={`p-3 rounded-xl bg-slate-50 text-slate-400 group-hover/item:text-${accentColor} transition-colors`}>
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-slate-500">{profileData.email || 'Chưa cập nhật Email'}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4">Giới thiệu bản thân (Bio)</h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                {profileData.bio || "Bạn chưa viết bất cứ điều gì về mình. Một bio thú vị giúp Nhà tuyển dụng chú ý đến bạn hơn!"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {editing ? (
                <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Họ và Tên</label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Số điện thoại</label>
                            <input
                                type="text"
                                value={profileData.phoneNumber}
                                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Địa chỉ Email</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Profile CV (Gia hạn/Cập nhật)</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept=".pdf,.doc,.docx"
                                />
                                <div className={`w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all duration-300 group-hover:border-${accentColor}/50`}>
                                    {uploading ? (
                                        <Loader2 className={`w-5 h-5 text-${accentColor} animate-spin`} />
                                    ) : (
                                        <Upload className={`w-5 h-5 text-slate-400 group-hover:text-${accentColor}`} />
                                    )}
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {profileData.cvUrl ? "Thay đổi File CV" : "Tải lên CV (PDF/Word)"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Lời giới thiệu (Bio)</label>
                        <textarea
                            rows={4}
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            className={`${inputClasses} resize-none`}
                            placeholder="Kể về kinh nghiệm và kỹ năng của bạn..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSaving || uploading}
                            className={`flex-1 py-5 rounded-[2rem] bg-${accentColor} text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-${accentColor}/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Lưu cấu hình hồ sơ
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="px-10 py-5 rounded-[2rem] border border-slate-100 text-slate-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all duration-300"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-between group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-${accentColor}/5 rounded-bl-full`}></div>
                        <div className="flex items-center gap-6 mb-8">
                            <div className={`w-14 h-14 rounded-2xl bg-${accentColor}/10 flex items-center justify-center text-${accentColor}`}>
                                <FileText className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Hồ sơ CV</h4>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">Dành cho việc ứng tuyển</p>
                            </div>
                        </div>

                        {profileData.cvUrl ? (
                            <a
                                href={profileData.cvUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-lg`}
                            >
                                <ExternalLink className="w-4 h-4" />
                                Xem CV Hiện tại
                            </a>
                        ) : (
                            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chưa đính kèm CV</p>
                            </div>
                        )}
                    </div>

                    <div className={`bg-${accentColor} rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden text-white shadow-2xl shadow-${accentColor}/20`}>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Save className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight leading-none uppercase">Trạng thái Profile</h4>
                                <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mt-2">Đồng bộ Identity & Staffing</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Sẵn sàng hoạt động</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
