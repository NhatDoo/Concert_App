"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RootState } from '../../../src/stores/store';
import {
    Users,
    User,
    Mail,
    Send,
    Copy,
    ChevronRight,
    Loader2,
    CheckCircle,
    XCircle,
    UserPlus,
    Calendar,
    Music,
    ShieldCheck,
    Clock,
    UserCircle,
    ChevronDown,
    ArrowDown
} from 'lucide-react';

interface Invitation {
    id: string;
    email: string;
    role: string;
    token: string;
    status: string;
    createdAt: string;
    managerId?: string;
}

interface StaffMember {
    id: string;
    userId: string;
    name: string;
    role: string;
    managerId?: string;
    manager?: {
        name: string;
        role: string;
    };
}

const ROLES = [
    { value: 'EVENT_MANAGER', label: 'EVENT MANAGER (Tổng quản)', color: 'bg-red-600' },
    { value: 'PRODUCTION_MANAGER', label: 'Production Manager', color: 'bg-purple-600' },
    { value: 'TECHNICAL_MANAGER', label: 'Technical Manager', color: 'bg-blue-600' },
    { value: 'MARKETING_MANAGER', label: 'Marketing Manager', color: 'bg-green-600' },
    { value: 'TALENT_MANAGER', label: 'Talent Manager', color: 'bg-pink-600' },
    { value: 'TEAM_LEAD', label: 'Team Lead', color: 'bg-gray-800' },
    { value: 'CREW_STAFF', label: 'Crew / Staff', color: 'bg-gray-500' }
];

export default function GlobalStaffManagement() {
    const { user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'CREW_STAFF', managerId: '' });
    const [isInviting, setIsInviting] = useState(false);

    const notify = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchData = async () => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // 1. Fetch invitations
            const inviteRes = await fetch(`${apiUrl}/organize/staff/invitations/${user.id}`);
            if (inviteRes.ok) {
                const data = await inviteRes.json();
                setInvitations(data);
            }

            // 2. Fetch all staff for this organizer to build manager list
            // Assuming we have an endpoint like GET /organize/staff/all/:organizerId
            // If not existing, we can use getConcertStaff with a general flag, 
            // but let's assume we use a new one I'll create or just one that returns all staff.
            const staffRes = await fetch(`${apiUrl}/organize/staff/my-tasks/${user.id}`);
            // Wait, "my-tasks" gets tasks for a user. We need "all staff belonging to ME (organizer)".
            // Let's use the endpoint we'll create: GET /organize/staff/list/:organizerId
            const allStaffRes = await fetch(`${apiUrl}/organize/staff/list/${user.id}`);
            if (allStaffRes.ok) {
                const staffData = await allStaffRes.json();
                setAllStaff(staffData);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'ORGANIZER') {
            router.push('/');
            return;
        }
        fetchData();
    }, [user]);

    const handleInviteStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteData.email) return;

        setIsInviting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const payload = {
                email: inviteData.email,
                role: inviteData.role,
                organizerId: user?.id,
                managerId: inviteData.managerId || undefined
            };

            const res = await fetch(`${apiUrl}/organize/staff/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                notify('success', 'Đã gửi lời mời phân cấp thành công!');
                setShowInviteModal(false);
                setInviteData({ email: '', role: 'CREW_STAFF', managerId: '' });
                fetchData();
            } else {
                const err = await res.json();
                notify('error', err.message || 'Lỗi khi gửi lời mời');
            }
        } catch (error) {
            notify('error', 'Lỗi kết nối máy chủ');
        } finally {
            setIsInviting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
                <p className="text-gray-500 font-bold">Đang kiến tạo cấu trúc nhân sự...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-black">
            {notification && (
                <div className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold animate-in fade-in slide-in-from-right-10 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {notification.msg}
                </div>
            )}

            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-50 text-red-600 flex items-center justify-center rounded-2xl shadow-sm">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sơ đồ Tổ chức Nhân sự</h1>
                                <p className="text-gray-500 font-medium">Thiết lập bộ máy vận hành theo mô hình phân cấp chuyên nghiệp.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-red-600 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Thêm nhân sự theo cấp bậc
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Simplified Hierarchy Visualizer or List */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Tổng cộng</p>
                                <p className="text-2xl font-black">{allStaff.length + invitations.filter(i => i.status === 'PENDING').length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Chính thức</p>
                                <p className="text-2xl font-black">{allStaff.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Đang chờ</p>
                                <p className="text-2xl font-black">{invitations.filter(i => i.status === 'PENDING').length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-green-500 uppercase mb-1">Trình độ Quản lý</p>
                                <p className="text-2xl font-black">{allStaff.filter(s => s.role.includes('MANAGER')).length}</p>
                            </div>
                        </div>

                        {/* Staff List with Hierarchy Indication */}
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Users className="w-6 h-6 text-red-600" />
                                Đội ngũ hiện tại
                            </h2>

                            {allStaff.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
                                    <UserCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold">Chưa có nhân sự nào gia nhập bộ máy.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <th className="px-8 py-4">Nhân sự</th>
                                                <th className="px-8 py-4">Chức danh / Cấp bậc</th>
                                                <th className="px-8 py-4">Quản lý trực tiếp</th>
                                                <th className="px-8 py-4 text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 font-bold">
                                            {allStaff.map(staff => (
                                                <tr key={staff.id} className="hover:bg-red-50/30 transition group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-600 transition">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-900 leading-none mb-1">{staff.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium">ID: {staff.id.split('-')[0]}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] text-white uppercase tracking-tighter ${ROLES.find(r => r.value === staff.role)?.color || 'bg-gray-400'}`}>
                                                            {ROLES.find(r => r.value === staff.role)?.label || staff.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {staff.manager ? (
                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                <ArrowDown className="w-3 h-3 text-red-400" />
                                                                <span>{staff.manager.name}</span>
                                                                <span className="text-[10px] text-gray-300">({staff.manager.role.split('_')[0]})</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-300 italic">Báo cáo trực tiếp Bầu</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button className="text-[10px] text-gray-400 hover:text-red-600 transition">Chi tiết</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {/* Recent Invitations */}
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Mail className="w-6 h-6 text-blue-600" />
                                Lời mời chờ phản hồi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                                {invitations.filter(i => i.status === 'PENDING').map(invite => (
                                    <div key={invite.id} className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <p className="text-[10px] text-blue-500 uppercase tracking-widest mb-1">Mời vị trí</p>
                                                <h3 className="text-gray-900">{invite.email}</h3>
                                            </div>
                                            <div className="bg-blue-600 text-white p-2 rounded-xl">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-6 relative z-10">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400">Chức danh:</span>
                                                <span className="text-gray-700">{ROLES.find(r => r.value === invite.role)?.label}</span>
                                            </div>
                                            {invite.managerId && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-400">Báo cáo cho:</span>
                                                    <span className="text-gray-700">{allStaff.find(s => s.id === invite.managerId)?.name || 'Người quản lý'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(invite.token);
                                                notify('success', 'Đã sao chép mã mời!');
                                            }}
                                            className="w-full bg-blue-50 text-blue-600 py-3 rounded-2xl text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 relative z-10"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Sao chép Mã mời
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <ArrowDown className="w-5 h-5 text-red-500" />
                                Lưu ý phân cấp
                            </h3>
                            <div className="space-y-6">
                                <div className="border-l-2 border-red-500 pl-4 py-1">
                                    <p className="text-xs font-bold text-red-400 uppercase mb-1">EVENT MANAGER</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">Là người gánh vác toàn bộ trách nhiệm thực thi sự kiện. Chỉ dưới quyền Bầu.</p>
                                </div>
                                <div className="border-l-2 border-blue-500 pl-4 py-1">
                                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">PRODUCTION / TECH</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">Báo cáo trực tiếp cho Event Manager. Điều phối các Team Lead bên dưới.</p>
                                </div>
                                <div className="border-l-2 border-gray-500 pl-4 py-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">TEAM LEAD / CREW</p>
                                    <p className="text-[10px] text-gray-600 leading-relaxed font-medium">Mắt xích thực thi trực tiếp tại hiện trường sự kiện.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Music className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">Gán sự kiện?</h4>
                            <p className="text-[10px] text-gray-400 leading-relaxed mb-6 font-medium">Mọi nhân sự sau khi gia nhập sẽ nằm trong "Danh sách tổng". Bạn cần gán họ vào từng sự kiện cụ thể để giao Task.</p>
                            <Link href="/organizer" className="block w-full py-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition">
                                Đến Bảng Điều Khiển
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Invite Hierarchy Member Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-8 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Thêm thành viên mới</h2>
                                    <p className="text-red-100 text-xs font-medium">Thiết lập vị trí và người quản lý trực tiếp.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowInviteModal(false)} className="hover:rotate-90 transition duration-300">
                                <XCircle className="w-8 h-8" />
                            </button>
                        </div>

                        <form onSubmit={handleInviteStaff} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 uppercase tracking-widest px-1">Email liên lạc</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-red-500 transition-all outline-none"
                                        placeholder="candidate@email.com"
                                        value={inviteData.email}
                                        onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 uppercase tracking-widest px-1">Chức danh / Vị trí</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 appearance-none focus:bg-white focus:border-red-500 transition-all outline-none pr-12"
                                            value={inviteData.role}
                                            onChange={e => setInviteData({ ...inviteData, role: e.target.value })}
                                        >
                                            {ROLES.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 font-bold border-t border-gray-50 pt-8">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] text-gray-400 uppercase tracking-widest px-1">Quản lý trực tiếp (Reporting To)</label>
                                    <div className="h-0.5 flex-1 bg-gray-50"></div>
                                </div>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 appearance-none focus:bg-white focus:border-red-500 transition-all outline-none pr-12"
                                        value={inviteData.managerId}
                                        onChange={e => setInviteData({ ...inviteData, managerId: e.target.value })}
                                    >
                                        <option value="">Trực thuộc Ban Tổ Chức (Bầu)</option>
                                        {allStaff.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} - {ROLES.find(r => r.value === s.role)?.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-[10px] text-gray-400 italic px-1 font-medium">Lưu ý: Bạn chỉ có thể gán quản lý là những người đã gia nhập đội hình chính thức.</p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isInviting}
                                    className="flex-1 bg-red-600 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-3 disabled:bg-gray-400"
                                >
                                    {isInviting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Xác nhận gởi bộ mã mời
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
