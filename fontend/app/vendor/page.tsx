"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Users, Package, ClipboardList, Activity, ArrowUpRight, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/stores/store';

const StatCard = ({ icon, label, value, trend, color, link }: { icon: React.ReactNode, label: string, value: string | number, trend: string, color: string, link: string }) => (
    <Link href={link} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1 transition-all group overflow-hidden relative block text-left">
        <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br from-${color}-500 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>

        <div className="flex items-center justify-between mb-6">
            <div className={`p-4 bg-${color}-500/10 rounded-2xl text-${color}-600 shadow-xl shadow-${color}-500/10`}>
                {icon}
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                <ArrowUpRight size={14} />
                {trend}
            </div>
        </div>

        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em] mb-2">{label}</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </Link>
);

const ActivityItem = ({ title, time, type }: { title: string, time: string, type: 'EQUIPMENT' | 'PERSONNEL' | 'SYSTEM' }) => (
    <div className="flex items-center gap-4 py-6 border-b border-slate-100 last:border-0 group cursor-pointer hover:bg-slate-50 px-4 -mx-4 rounded-2xl transition-all">
        <div className={`w-3 h-3 rounded-full ${type === 'EQUIPMENT' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]' :
            type === 'PERSONNEL' ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.2)]' :
                'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            }`}></div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{title}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{time}</p>
        </div>
        <Zap size={16} className="text-slate-200 group-hover:text-amber-500/50 transition-colors" />
    </div>
);

export default function VendorDashboard() {
    const [stats, setStats] = useState({
        totalEquipments: 0,
        totalOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        totalJobs: 0,
        pendingApplications: 0
    });
    const { token, user } = useSelector((state: RootState) => state.auth);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/vendor/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching vendor stats:', error);
            }
        };
        fetchStats();
    }, [token, API_URL]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
                        Chào mừng trở lại, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600 uppercase">{user?.name || 'Vendor Partner'}</span>!
                    </h1>
                    <p className="text-slate-500 font-medium">Hệ thống đang hoạt động ổn định. Bạn có <span className="text-amber-600 font-black">{stats.pendingOrders} yêu cầu mới</span> hôm nay.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    <button className="px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">7 ngày</button>
                    <button className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-slate-900 text-white shadow-lg">30 ngày</button>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Truck size={24} />}
                    label="Trang thiết bị"
                    value={stats.totalEquipments}
                    trend="0%"
                    color="amber"
                    link="/vendor/equipment"
                />
                <StatCard
                    icon={<Package size={24} />}
                    label="Đơn hàng mới"
                    value={stats.pendingOrders}
                    trend="0%"
                    color="rose"
                    link="/vendor/logistics"
                />
                <StatCard
                    icon={<ClipboardList size={24} />}
                    label="Đang xử lý"
                    value={stats.preparingOrders}
                    trend="0"
                    color="indigo"
                    link="/vendor/logistics"
                />
                <StatCard
                    icon={<Users size={24} />}
                    label="Tuyển dụng"
                    value={stats.pendingApplications}
                    trend={stats.totalJobs + " tin đang đăng"}
                    color="emerald"
                    link="/vendor/recruitment"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Hoạt động gần đây</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tiến độ logistics thực tế</p>
                            </div>
                        </div>
                        <Link href="/vendor/logistics" className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-500 transition-colors">Xem tất cả</Link>
                    </div>

                    <div className="flex-1 space-y-2">
                        <ActivityItem
                            title="Đã vận chuyển 50 dàn loa Line-Array đến Sân vận động Mỹ Đình"
                            time="2 giờ trước"
                            type="EQUIPMENT"
                        />
                        <ActivityItem
                            title="Xác nhận 12 nhân kỹ thuật mới cho dự án Concert BlackPink"
                            time="4 giờ trước"
                            type="PERSONNEL"
                        />
                        <ActivityItem
                            title="Cập nhật hệ thống: Tự động hoá quản lý tồn kho phiên bản 2.1"
                            time="Yesterday"
                            type="SYSTEM"
                        />
                        <ActivityItem
                            title="Hoàn tất bảo trì định kỳ cho 24 xe vận tải hạng nặng"
                            time="Yesterday"
                            type="EQUIPMENT"
                        />
                        <ActivityItem
                            title="Yêu cầu cung ứng vật tư Backdrop cho khu vực VIP đã được duyệt"
                            time="2 days ago"
                            type="SYSTEM"
                        />
                    </div>
                </div>

                {/* Right Status Panel */}
                <div className="bg-gradient-to-br from-amber-600 to-rose-600 rounded-[2.5rem] p-10 shadow-2xl shadow-amber-900/20 text-white flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32"></div>

                    <div className="relative z-10">
                        <Truck size={48} className="mb-6 stroke-[1.5px]" />
                        <h3 className="text-3xl font-black tracking-tighter leading-[1.1] mb-4">
                            Sẵn sàng cho các sự kiện bùng nổ sắp tới?
                        </h3>
                        <p className="text-amber-100/80 font-medium mb-10 leading-relaxed">
                            Quản lý thiết bị của bạn thật tốt để duy trì điểm tín nhiệm cao trong cộng đồng Ticketbox.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <Link href="/vendor/equipment" className="block w-full py-4 bg-white text-amber-600 font-black rounded-2xl shadow-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs text-center">
                            Cập nhật thiết bị ngay
                        </Link>
                        <Link href="/vendor/recruitment" className="block w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs text-center border border-white/10 shadow-lg">
                            Tìm kiếm nhân sự mới
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center grayscale">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Space for Project {i} (In Development)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
