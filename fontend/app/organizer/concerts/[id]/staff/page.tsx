"use client";

import React, { useEffect, useState, use } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { RootState } from '../../../../../src/stores/store';
import {
    Users,
    UserPlus,
    Plus,
    ChevronLeft,
    CheckCircle2,
    Circle,
    ClipboardList,
    Loader2,
    CheckCircle,
    XCircle,
    ArrowRight,
    Download,
    Mail,
    Send,
    Copy,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';

interface Task {
    id: string;
    description: string;
    status: string;
}

interface Staff {
    id: string;
    userId: string;
    name: string;
    role: string;
    tasks: Task[];
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    token: string;
    status: string;
    createdAt: string;
}

export default function StaffManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: concertId } = use(params);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Form states
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const [newStaff, setNewStaff] = useState({ userId: '', name: '', role: 'Staff' });
    const [inviteData, setInviteData] = useState({ email: '', role: 'Security' });

    const [isSaving, setIsSaving] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    const [showAddTask, setShowAddTask] = useState<string | null>(null); // staffId
    const [newTaskDesc, setNewTaskDesc] = useState('');

    const notify = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchStaff = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/${concertId}/staff`);
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error('Failed to fetch staff', error);
        }
    };

    const fetchInvitations = async () => {
        if (!currentUser?.id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/staff/invitations/${currentUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setInvitations(data);
            }
        } catch (error) {
            console.error('Failed to fetch invitations', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchStaff(), fetchInvitations()]);
        setLoading(false);
    };

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ORGANIZER') {
            router.push('/');
            return;
        }
        loadData();
    }, [currentUser, concertId]);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStaff.userId || !newStaff.name) return;

        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/${concertId}/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStaff)
            });

            if (res.ok) {
                notify('success', 'Đã thêm nhân sự thành công!');
                setShowAddStaff(false);
                setNewStaff({ userId: '', name: '', role: 'Staff' });
                fetchStaff();
            } else {
                const err = await res.json();
                notify('error', err.message || 'Lỗi khi thêm nhân sự');
            }
        } catch (error) {
            notify('error', 'Lỗi kết nối máy chủ');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInviteStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteData.email) return;

        setIsInviting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/staff/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...inviteData,
                    organizerId: currentUser?.id
                })
            });

            if (res.ok) {
                notify('success', 'Đã gửi lời mời thành công!');
                setShowInviteModal(false);
                setInviteData({ email: '', role: 'Security' });
                fetchInvitations();
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

    const handleAddTask = async (staffId: string) => {
        if (!newTaskDesc.trim()) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/${concertId}/staff/${staffId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: newTaskDesc })
            });

            if (res.ok) {
                notify('success', 'Đã giao việc thành công!');
                setShowAddTask(null);
                setNewTaskDesc('');
                fetchStaff();
            }
        } catch (error) {
            notify('error', 'Lỗi khi giao việc');
        }
    };

    const handleUpdateTaskStatus = async (staffId: string, taskId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/${concertId}/staff/${staffId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });

            if (res.ok) {
                fetchStaff();
            }
        } catch (error) {
            notify('error', 'Lỗi cập nhật trạng thái');
        }
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                const staffMembers = data.map(row => ({
                    userId: String(row["Mã"] || row["UserId"] || row["ID"] || ""),
                    name: String(row["Tên"] || row["Name"] || row["Full Name"] || ""),
                    role: String(row["Vai trò"] || row["Role"] || "Staff")
                })).filter(m => m.userId && m.name);

                if (staffMembers.length === 0) {
                    notify('error', 'File Excel không đúng định dạng hoặc trống (Cần cột: Mã, Tên, Vai trò)!');
                    return;
                }

                setIsSaving(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/organize/${concertId}/staff/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ staffMembers })
                });

                if (res.ok) {
                    notify('success', `Đã nhập thành công ${staffMembers.length} nhân sự!`);
                    fetchStaff();
                } else {
                    notify('error', 'Lỗi khi lưu danh sách từ Excel');
                }
            } catch (err) {
                notify('error', 'Lỗi đọc file Excel');
                console.error(err);
            } finally {
                setIsSaving(false);
                e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const templateData = [
            { "Mã": "user-id-001", "Tên": "Nguyễn Văn A", "Vai trò": "Security" },
            { "Mã": "user-id-002", "Tên": "Trần Thị B", "Vai trò": "Reception" },
            { "Mã": "user-id-003", "Tên": "Lê Văn C", "Vai trò": "Technical" },
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NhanSu");
        XLSX.writeFile(wb, "Mau_nhap_nhan_su.xlsx");
    };

    const copyInviteLink = (token: string) => {
        const link = `${window.location.origin}/register?token=${token}`;
        navigator.clipboard.writeText(link);
        notify('success', 'Đã sao chép link mời vào bộ nhớ tạm!');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-10 text-black">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold animate-in fade-in slide-in-from-right-10 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {notification.msg}
                </div>
            )}

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Navigation */}
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/organizer" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                        Quay lại Dashboard
                    </Link>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={downloadTemplate}
                            className="bg-white text-blue-600 border border-blue-100 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition shadow-sm"
                            title="Tải file mẫu Excel"
                        >
                            <Download className="w-5 h-5" />
                            File mẫu
                        </button>
                        <input
                            type="file"
                            id="excel-upload"
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleExcelUpload}
                        />
                        <button
                            onClick={() => document.getElementById('excel-upload')?.click()}
                            disabled={isSaving}
                            className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
                        >
                            <ClipboardList className="w-5 h-5 text-green-600" />
                            Excel
                        </button>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg"
                        >
                            <Mail className="w-5 h-5" />
                            Mời nhân sự
                        </button>
                        <button
                            onClick={() => setShowAddStaff(true)}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
                        >
                            <UserPlus className="w-5 h-5" />
                            Thêm nhanh
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-cyan-100 text-cyan-600 flex items-center justify-center rounded-2xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Đội ngũ</h1>
                        <p className="text-gray-500 font-medium">Lời mời, nhiệm vụ và tiến độ công việc cho sự kiện.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Staff List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-6 h-6 text-cyan-600" />
                                Nhân sự hiện tại ({staffList.length})
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mb-4" />
                                <p className="text-gray-400 font-medium">Đang tải danh sách nhân sự...</p>
                            </div>
                        ) : staffList.length === 0 ? (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center shadow-sm">
                                <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa gán nhân sự cho sự kiện này</h3>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Sử dụng nút "Thêm nhanh" hoặc "Mời nhân sự" để bắt đầu.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                                        <div className="p-6 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl font-black text-cyan-600 border border-gray-100">
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{staff.name}</h3>
                                                    <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded uppercase">{staff.role}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowAddTask(staff.id)}
                                                className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-cyan-600 hover:border-cyan-200 transition"
                                                title="Giao việc mới"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                <ClipboardList className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-black ">Nhiệm vụ</span>
                                            </div>

                                            {staff.tasks.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic py-2">Chưa gán công việc...</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {staff.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => handleUpdateTaskStatus(staff.id, task.id, task.status)}
                                                            className={`group flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${task.status === 'COMPLETED' ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 hover:border-cyan-200'}`}
                                                        >
                                                            <div className="mt-0.5">
                                                                {task.status === 'COMPLETED' ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                                ) : (
                                                                    <Circle className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition" />
                                                                )}
                                                            </div>
                                                            <span className={`text-sm font-medium leading-tight ${task.status === 'COMPLETED' ? 'text-green-700 line-through opacity-70' : 'text-gray-700'}`}>
                                                                {task.description}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {showAddTask === staff.id && (
                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Mô tả công việc..."
                                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-500 text-black"
                                                        value={newTaskDesc}
                                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(staff.id)}
                                                    />
                                                    <button
                                                        onClick={() => handleAddTask(staff.id)}
                                                        className="bg-cyan-600 text-white p-2 rounded-xl hover:bg-cyan-700 shadow-sm"
                                                    >
                                                        <ArrowRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Invitation Tracking Panel */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Mail className="w-6 h-6 text-blue-600" />
                            Lời mời chờ phản hồi
                        </h2>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                            {invitations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Send className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 text-sm font-medium">Không có lời mời nào đang chờ</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {invitations.map((invite) => (
                                        <div key={invite.id} className={`p-4 rounded-2xl border transition ${invite.status === 'ACCEPTED' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-900 truncate text-sm">{invite.email}</p>
                                                    <p className="text-xs font-bold text-blue-600 uppercase mt-1">{invite.role}</p>
                                                </div>
                                                {invite.status === 'ACCEPTED' ? (
                                                    <div className="p-1 bg-green-100 rounded-full">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1 bg-amber-100 rounded-full animate-pulse">
                                                        <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                                                    </div>
                                                )}
                                            </div>

                                            {invite.status === 'PENDING' && (
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={() => copyInviteLink(invite.token)}
                                                        className="flex-1 bg-white border border-gray-200 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                        Copy Link
                                                    </button>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Gửi ngày: {new Date(invite.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tips card */}
                        <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-xl flex items-start gap-4">
                            <ShieldCheck className="w-8 h-8 text-blue-300 shrink-0" />
                            <div>
                                <h4 className="font-bold mb-1">Cơ chế tham gia</h4>
                                <p className="text-xs text-blue-100 leading-relaxed opacity-80">
                                    Khi nhân sự đăng ký tài khoản với email được mời hoặc qua link, họ sẽ tự động được gán vào đội ngũ của bạn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals Section */}

            {/* Invite Staff Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="bg-blue-600 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                <Mail className="w-6 h-6 text-blue-200" />
                                Mời nhân sự vào hệ thống
                            </h2>
                            <button onClick={() => setShowInviteModal(false)} className="text-blue-200 hover:text-white transition">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleInviteStaff} className="p-8 space-y-6">
                            <p className="text-sm text-gray-500 font-medium">
                                Hệ thống sẽ tạo một link mời chuyên biệt. Khi nhân viên đăng ký, họ sẽ được gắn ID của bạn.
                            </p>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email nhân viên</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition text-black"
                                        placeholder="nhanvien@email.com"
                                        value={inviteData.email}
                                        onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Vị trí mời</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition text-black"
                                    value={inviteData.role}
                                    onChange={e => setInviteData({ ...inviteData, role: e.target.value })}
                                >
                                    <option value="Security">Bảo an / An ninh</option>
                                    <option value="Technical">Kỹ thuật âm thanh/ánh sáng</option>
                                    <option value="Reception">Lễ tân / Check-in</option>
                                    <option value="Manager">Quản lý khu vực</option>
                                    <option value="Vendor">Nhà cung cấp / Đối tác (Vendor)</option>
                                    <option value="Staff">Nhân viên hiện trường</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isInviting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:bg-gray-300"
                            >
                                {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Gửi lời mời ngay
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Add Staff Modal */}
            {showAddStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="bg-gray-900 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                <UserPlus className="w-6 h-6 text-cyan-400" />
                                Thêm trực tiếp (Yêu cầu ID)
                            </h2>
                            <button onClick={() => setShowAddStaff(false)} className="text-gray-400 hover:text-white transition">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStaff} className="p-8 space-y-6">
                            <p className="text-sm text-gray-500 font-medium">Dùng cách này nếu nhân sự đã có tài khoản và gửi ID cho bạn.</p>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mã nhân sự (User ID)</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 transition text-black"
                                    placeholder="Copy ID tài khoản"
                                    value={newStaff.userId}
                                    onChange={e => setNewStaff({ ...newStaff, userId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Họ và Tên</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 transition text-black"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Vai trò</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 transition text-black"
                                    value={newStaff.role}
                                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                >
                                    <option value="Staff">Nhân viên hiện trường</option>
                                    <option value="Security">Bảo an / An ninh</option>
                                    <option value="Technical">Kỹ thuật âm thanh/ánh sáng</option>
                                    <option value="Reception">Lễ tân / Check-in</option>
                                    <option value="Manager">Quản lý khu vực</option>
                                    <option value="Vendor">Nhà cung cấp / Đối tác (Vendor)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-black hover:bg-gray-800 text-white font-black py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:bg-gray-300"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận thêm'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
