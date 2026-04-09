"use client";

import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Shield, Search, Loader2, Star, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/stores/store';

interface Staff {
    id: string;
    name: string;
    role: string;
    user: {
        email: string;
        phoneNumber: string;
    };
}

export default function VendorStaffs() {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchStaffs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/vendor/staffs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStaffs(data);
            }
        } catch (error) {
            console.error('Error fetching staffs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (staffId: string) => {
        if (!confirm('Bạn có chắc chắn muốn thăng hạng nhân viên này lên MANAGER không?')) return;
        try {
            const res = await fetch(`${API_URL}/vendor/staffs/${staffId}/promote`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Thăng hạng thành công!');
                fetchStaffs();
            } else {
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (token) fetchStaffs();
    }, [token]);

    const filteredStaffs = staffs.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Đội ngũ nhân sự</h1>
                    <p className="text-slate-500 font-medium">Danh sách các nhân viên đã được duyệt và đang trực thuộc Vendor.</p>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, vị trí hoặc email..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 font-bold text-sm transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <Users size={18} className="text-amber-600" />
                    <span className="text-amber-900 font-black text-xs uppercase tracking-widest">{staffs.length} Thành viên</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải danh sách...</p>
                </div>
            ) : filteredStaffs.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có nhân sự nào</h3>
                    <p className="text-slate-500 max-w-xs mx-auto font-medium">Hãy phê duyệt các ứng viên trong mục Tuyển dụng để xây dựng đội ngũ của bạn.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaffs.map((staff) => (
                        <div key={staff.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                {staff.role === 'VENDOR_ADMIN' ? (
                                    <ShieldCheck size={20} className="text-amber-500" />
                                ) : (
                                    <UserCheck size={20} className="text-emerald-500" />
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-slate-50">
                                    {staff.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight truncate pr-8">{staff.name}</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${staff.role === 'VENDOR_ADMIN' ? 'text-amber-600' : 'text-slate-400'}`}>
                                        {staff.role}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail size={14} />
                                    </div>
                                    <span className="text-xs font-bold truncate">{staff.user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-900 transition-colors">
                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                                        <Phone size={14} />
                                    </div>
                                    <span className="text-xs font-bold">{staff.user.phoneNumber || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {staff.role !== 'VENDOR_ADMIN' && staff.role !== 'MANAGER' && (
                                <div className="mt-6 flex flex-col gap-2">
                                    <button
                                        onClick={() => handlePromote(staff.id)}
                                        className="w-full py-3 bg-amber-50 text-amber-600 font-bold text-xs uppercase tracking-widest rounded-xl border border-amber-100 hover:bg-amber-600 hover:text-white transition-all">
                                        🚀 Thăng cấp Quản lý
                                    </button>
                                </div>
                            )}
                            {staff.role !== 'VENDOR_ADMIN' && (
                                <div className="mt-2 flex flex-col gap-2">
                                    <button className="w-full py-3 bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                        📝 Giao nhiệm vụ
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
