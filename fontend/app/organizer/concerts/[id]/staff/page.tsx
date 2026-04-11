"use client";

import React, { useEffect, useState, use } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { RootState } from "../../../../../src/stores/store";
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

    UserMinus,
} from "lucide-react";

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

export default function StaffManagementPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: concertId } = use(params);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        msg: string;
    } | null>(null);

    // Form states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [myStaffList, setMyStaffList] = useState<Staff[]>([]);
    const [isAssigning, setIsAssigning] = useState<string | null>(null);
    const [isUnassigning, setIsUnassigning] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string, code: string } | null>(null);
    const [deleteInput, setDeleteInput] = useState('');

    const [showAddTask, setShowAddTask] = useState<string | null>(null); // staffId
    const [newTaskDesc, setNewTaskDesc] = useState("");

    const notify = (type: "success" | "error", msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchStaff = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/organize/${concertId}/staff`);
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchStaff()]);
        setLoading(false);
    };

    useEffect(() => {
        if (!currentUser || currentUser.role !== "ORGANIZER") {
            router.push("/");
            return;
        }
        loadData();
    }, [currentUser, concertId]);

    const fetchMyStaff = async () => {
        if (!currentUser?.id) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(
                `${apiUrl}/organize/staff/list/${currentUser.id}`,
            );
            if (res.ok) {
                const data = await res.json();
                setMyStaffList(data);
            }
        } catch (error) {
            console.error("Failed to fetch my staff", error);
        }
    };

    const handleAssignStaff = async (staffId: string) => {
        setIsAssigning(staffId);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(
                `${apiUrl}/organize/${concertId}/staff/${staffId}/assign`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                },
            );

            if (res.ok) {
                notify("success", "Đã thêm nhân sự vào sự kiện!");
                fetchStaff(); // Refresh concert staff
            } else {
                notify("error", "Lỗi khi gán nhân sự");
            }
        } catch (error) {
            notify("error", "Lỗi kết nối máy chủ");
        } finally {
            setIsAssigning(null);
        }
    };

    const handleUnassignStaff = (staffId: string, name: string) => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setDeleteConfirm({ id: staffId, name, code });
        setDeleteInput('');
    };

    const confirmUnassign = async () => {
        if (!deleteConfirm) return;
        if (deleteInput !== deleteConfirm.code) {
            notify("error", "Mã xác nhận không đúng!");
            return;
        }

        setIsUnassigning(deleteConfirm.id);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(
                `${apiUrl}/organize/${concertId}/staff/${deleteConfirm.id}/unassign`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                },
            );

            if (res.ok) {
                notify("success", "Đã gỡ nhân sự khỏi sự kiện!");
                setDeleteConfirm(null);
                fetchStaff();
            } else {
                notify("error", "Lỗi khi gỡ nhân sự");
            }
        } catch (error) {
            notify("error", "Lỗi kết nối máy chủ");
        } finally {
            setIsUnassigning(null);
        }
    };

    const handleAddTask = async (staffId: string) => {
        if (!newTaskDesc.trim()) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(
                `${apiUrl}/organize/${concertId}/staff/${staffId}/tasks`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description: newTaskDesc }),
                },
            );

            if (res.ok) {
                notify("success", "Đã giao việc thành công!");
                setShowAddTask(null);
                setNewTaskDesc("");
                fetchStaff();
            }
        } catch (error) {
            notify("error", "Lỗi khi giao việc");
        }
    };

    const handleUpdateTaskStatus = async (
        staffId: string,
        taskId: string,
        currentStatus: string,
    ) => {
        const nextStatus = currentStatus === "PENDING" ? "COMPLETED" : "PENDING";

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(
                `${apiUrl}/organize/${concertId}/staff/${staffId}/tasks/${taskId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: nextStatus }),
                },
            );

            if (res.ok) {
                fetchStaff();
            }
        } catch (error) {
            notify("error", "Lỗi cập nhật trạng thái");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-10 text-black">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold animate-in fade-in slide-in-from-right-10 ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}
                >
                    {notification.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    {notification.msg}
                </div>
            )}

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Navigation */}
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href="/organizer"
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                        Quay lại Dashboard
                    </Link>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                setShowAssignModal(true);
                                fetchMyStaff();
                            }}
                            className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-700 transition shadow-lg"
                        >
                            <Users className="w-5 h-5" />
                            Chọn từ Đội ngũ
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-cyan-100 text-cyan-600 flex items-center justify-center rounded-2xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Quản lý Đội ngũ
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Lời mời, nhiệm vụ và tiến độ công việc cho sự kiện.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Staff List */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-6 h-6 text-cyan-600" />
                                Nhân sự hiện tại ({staffList.length})
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mb-4" />
                                <p className="text-gray-400 font-medium">
                                    Đang tải danh sách nhân sự...
                                </p>
                            </div>
                        ) : staffList.length === 0 ? (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center shadow-sm">
                                <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Chưa gán nhân sự cho sự kiện này
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                    Sử dụng nút "Chọn từ Đội ngũ" để bắt đầu gán thành viên.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {staffList.map((staff) => (
                                    <div
                                        key={staff.id}
                                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
                                    >
                                        <div className="p-6 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl font-black text-cyan-600 border border-gray-100">
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                                        {staff.name}
                                                    </h3>
                                                    <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded uppercase">
                                                        {staff.role}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setShowAddTask(staff.id)}
                                                    className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-cyan-600 hover:border-cyan-200 transition"
                                                    title="Giao việc mới"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleUnassignStaff(staff.id, staff.name)}
                                                    disabled={isUnassigning === staff.id}
                                                    className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                                                    title="Gỡ khỏi sự kiện"
                                                >
                                                    {isUnassigning === staff.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserMinus className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                <ClipboardList className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-black ">
                                                    Nhiệm vụ
                                                </span>
                                            </div>

                                            {staff.tasks.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic py-2">
                                                    Chưa gán công việc...
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {staff.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() =>
                                                                handleUpdateTaskStatus(
                                                                    staff.id,
                                                                    task.id,
                                                                    task.status,
                                                                )
                                                            }
                                                            className={`group flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${task.status === "COMPLETED" ? "bg-green-50 border-green-100" : "bg-white border-gray-100 hover:border-cyan-200"}`}
                                                        >
                                                            <div className="mt-0.5">
                                                                {task.status === "COMPLETED" ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                                ) : (
                                                                    <Circle className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 transition" />
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`text-sm font-medium leading-tight ${task.status === "COMPLETED" ? "text-green-700 line-through opacity-70" : "text-gray-700"}`}
                                                            >
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
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" && handleAddTask(staff.id)
                                                        }
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
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setDeleteConfirm(null)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full animate-in zoom-in-95 duration-300 border border-red-100">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 text-center uppercase tracking-tight mb-2">Xác nhận gỡ bỏ</h3>
                        <p className="text-slate-500 text-xs text-center font-bold mb-8 italic">
                            Bạn đang chuẩn bị loại <span className="text-red-600 underline font-black">{deleteConfirm.name}</span> ra khỏi sự kiện.<br />
                            Hành động này không thể hoàn tác. Vui lòng nhập mã để xác nhận.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 text-center mb-8 border border-slate-100">
                            <span className="text-3xl font-black tracking-[0.5em] text-slate-900 select-none">{deleteConfirm.code}</span>
                        </div>

                        <input
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 transition-all text-center text-xl font-black mb-6"
                            placeholder="Nhập mã xác nhận..."
                            autoFocus
                        />

                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmUnassign}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                            >
                                Xác nhận gỡ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Staff Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                        <div className="bg-cyan-600 p-6 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                <Users className="w-6 h-6 text-cyan-200" />
                                Thêm thủ công từ Đội ngũ Quản lý
                            </h2>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="text-cyan-200 hover:text-white transition"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                            {myStaffList.length === 0 ? (
                                <div className="text-center py-12">
                                    <h4 className="text-gray-500 font-bold mb-2">
                                        Không tìm thấy nhân sự
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Đội ngũ của bạn hiện chưa có nhân sự nào.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myStaffList
                                        .filter(
                                            (s) =>
                                                !staffList.find((ts) => ts.id === s.id) &&
                                                ['MANAGER', 'VENDOR', 'VENDOR_ADMIN'].includes(s.role?.toUpperCase()),
                                        )
                                        .map((staff) => (
                                            <div
                                                key={staff.id}
                                                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 font-black">
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">
                                                            {staff.name}
                                                        </h4>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mt-0.5">
                                                            {staff.role}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignStaff(staff.id)}
                                                    disabled={isAssigning === staff.id}
                                                    className="bg-cyan-50 hover:bg-cyan-600 text-cyan-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                                                >
                                                    {isAssigning === staff.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Plus className="w-4 h-4" />
                                                    )}
                                                    Thêm
                                                </button>
                                            </div>
                                        ))}
                                    {myStaffList.filter(
                                        (s) =>
                                            !staffList.find((ts) => ts.id === s.id) &&
                                            ['MANAGER', 'VENDOR', 'VENDOR_ADMIN'].includes(s.role?.toUpperCase()),
                                    ).length === 0 && (
                                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-gray-500 font-bold">
                                                    Tất cả nhân sự khả dụng đã được thêm vào sự kiện này.
                                                </p>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
