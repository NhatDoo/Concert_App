"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Truck, Users, Settings, LogOut, Package, Wrench, ClipboardList } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../src/stores/store';
import { logout } from '../../src/features/auth/stores/authSlice';
import { useRouter } from 'next/navigation';

interface SidebarItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
}

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
            : 'text-slate-600 hover:bg-slate-100 hover:text-amber-600'
            }`}
    >
        <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-amber-500'} transition-colors`}>
            {icon}
        </span>
        <span className="font-bold text-sm tracking-wide">{label}</span>
    </Link>
);

export default function VendorLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    const navigation = [
        { href: '/vendor', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
        { href: '/vendor/equipment', icon: <Truck size={20} />, label: 'Trang thiết bị' },
        { href: '/vendor/staffs', icon: <Users size={20} />, label: 'Quản lý nhân sự' },
        { href: '/vendor/logistics', icon: <Package size={20} />, label: 'Hậu cần & Cung ứng' },
        { href: '/vendor/recruitment', icon: <ClipboardList size={20} />, label: 'Tuyển dụng & Hồ sơ' },
        { href: '/vendor/tasks', icon: <Wrench size={20} />, label: 'Nhiệm vụ & Lịch trình' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 shadow-sm z-50">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-amber-900/40">
                            <Truck size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900">VENDORS</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Menu chính</p>
                    {navigation.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.href}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-2">
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                <span className="text-amber-500 font-bold">{user?.name?.charAt(0) || 'V'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Vendor Partner'}</p>
                                <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group font-bold text-sm mb-4"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 min-h-screen">
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                        {navigation.find(n => n.href === pathname)?.label || 'Trang đối tác'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200/50">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>

                {/* Vendor specific footer */}
                <footer className="mt-auto border-t border-slate-200 bg-white/50 backdrop-blur-md p-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20">
                                <Truck size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 tracking-tight">VENDORS PORTAL</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hỗ trợ đối tác 24/7</p>
                            </div>
                        </div>
                        <div className="flex gap-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hỗ trợ</p>
                                <p className="text-xs font-bold text-slate-900">partner@ticketbox.vn</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kỹ thuật</p>
                                <p className="text-xs font-bold text-slate-900">dev.support@ticketbox.vn</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">
                            &copy; {new Date().getFullYear()} Ticketbox Ecosystem
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
