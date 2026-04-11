"use client";

import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Shield, Search, Loader2, Star, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/stores/store';
import { ManagerTeamHub } from '../../../src/features/staff/components/ManagerTeamHub';

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
            ) : staffs.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có nhân sự nào</h3>
                    <p className="text-slate-500 max-w-xs mx-auto font-medium">Hãy phê duyệt các ứng viên trong mục Tuyển dụng để xây dựng đội ngũ của bạn.</p>
                </div>
            ) : (
                <ManagerTeamHub
                    token={token}
                    organizerId={currentUser?.id}
                  
                />
            )}
        </div>
    );
}
