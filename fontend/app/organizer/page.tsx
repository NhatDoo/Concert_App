"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RootState } from '../../src/stores/store';
import { PlusCircle, Music, Ticket, Calendar, DollarSign, Trash2, Edit, Loader2, CheckCircle, XCircle, Users, Briefcase, LayoutDashboard, User, Clock, Star, Plus, ClipboardList } from 'lucide-react';
import { ManagementHub } from '../../src/features/staff/components/ManagementHub';
import { CreateJobModal } from '../../src/features/staff/components/CreateJobModal';
import { EditJobModal } from '../../src/features/staff/components/EditJobModal';
import { useJobManagement } from '../../src/features/staff/hooks/useJobManagement';
import { JobPost } from '../../src/features/staff/components/types';
import { TeamHub } from '../../src/features/staff/components/TeamHub';

export default function OrganizerDashboard() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [events, setEvents] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalTicketsSold: 0,
        totalRevenue: 0,
        totalConcerts: 0,
        activeConcerts: 0,
        staffStats: { totalStaff: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0, taskCompletionRate: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', startDate: '', location: '', image: null as File | null });
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'events' | 'staff' | 'revenue'>('events');
    const [staffSubTab, setStaffSubTab] = useState<'stats' | 'teamhub' | 'recruitment'>('stats');

    const {
        loading: jobsLoading,
        managerJobs,
        selectedJob,
        jobApplications,
        isCreating: jobCreating,
        isSaving: jobSaving,
        fetchJobApplications,
        createJob,
        updateJob,
        deleteJob,
        toggleStatus,
        reviewApplication,
        staffRecords,
        fetchData: refreshJobs
    } = useJobManagement(user, token);

    const [showCreateJobModal, setShowCreateJobModal] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPost | null>(null);
    const [newJob, setNewJob] = useState({ title: '', description: '', requirements: '', salary: '', location: '', companyName: '', companyLogo: '' });

    const notify = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    const [assignTaskModal, setAssignTaskModal] = useState<{ staffId: string, concertId: string, staffName: string } | null>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskLocation, setTaskLocation] = useState('');
    const [taskTime, setTaskTime] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    const fetchStats = async () => {
        if (!user) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/stats/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignTaskModal || !taskTitle.trim()) return;
        if (!assignTaskModal.concertId) {
            notify('error', 'Nhân viên này chưa được gán vào sự kiện nào!');
            return;
        }

        setIsAssigning(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Pack metadata into description field since schema can't change
            const packedDescription = JSON.stringify({
                title: taskTitle,
                desc: taskDescription,
                location: taskLocation,
                time: taskTime
            });

            const res = await fetch(`${apiUrl}/organize/${assignTaskModal.concertId}/staff/${assignTaskModal.staffId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: packedDescription,
                    status: 'PENDING'
                })
            });

            if (res.ok) {
                notify('success', 'Đã giao việc thành công!');
                setAssignTaskModal(null);
                setTaskTitle('');
                setTaskDescription('');
                setTaskLocation('');
                setTaskTime('');
                fetchStats();
            } else {
                notify('error', 'Lỗi khi giao việc');
            }
        } catch (error) {
            notify('error', 'Lỗi kết nối');
        } finally {
            setIsAssigning(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'ORGANIZER') {
            router.push('/');
            return;
        }

        const fetchMyConcerts = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

                // 1. Ensure Staff Record exists for recruitment features (Organizer record)
                const staffCheck = await fetch(`${apiUrl}/organize/staff/provision-organizer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, name: user.name })
                });

                if (staffCheck.ok) {
                    // Refresh jobs data from the hook to get the latest staff record
                    refreshJobs();
                }

                // 2. Fetch Concerts
                const response = await fetch(`${apiUrl}/concerts`);
                if (response.ok) {
                    const data = await response.json();
                    const myConcerts = data.filter((item: any) => item.organizerId === user.id);
                    setEvents(myConcerts);
                }

                fetchStats();
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyConcerts();
    }, [user, router]);

    const handleCreateConcert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.name || !createForm.startDate || !createForm.location) return;

        setIsCreating(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const formData = new FormData();
            formData.append('organizerId', user!.id);
            formData.append('name', createForm.name);
            formData.append('startDate', createForm.startDate);
            formData.append('location', createForm.location);
            if (createForm.image) {
                formData.append('image', createForm.image);
            }

            const response = await fetch(`${apiUrl}/concerts`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setShowModal(false);
                setCreateForm({ name: '', startDate: '', location: '', image: null });
                notify('success', 'Đã tạo sự kiện mới thành công!');
                const res = await fetch(`${apiUrl}/concerts`);
                const data = await res.json();
                setEvents(data.filter((item: any) => item.organizerId === user!.id));
            } else {
                const error = await response.json();
                notify('error', error.message || 'Lỗi khi tạo sự kiện');
            }
        } catch (error) {
            notify('error', 'Không thể kết nối đến máy chủ');
            console.error('Failed to create concert', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateJobPost = async (e: React.FormEvent) => {
        e.preventDefault();
        await createJob(newJob, () => {
            setShowCreateJobModal(false);
            setNewJob({ title: '', description: '', requirements: '', salary: '', location: '', companyName: '', companyLogo: '' });
        });
    };

    const handleEditJob = async (id: string, data: any) => {
        await updateJob(id, data, () => {
            setEditingJob(null);
        });
    };

    if (!user || user.role !== 'ORGANIZER') return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-gray-900">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-20 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all animate-in fade-in slide-in-from-right-10 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {notification.msg}
                </div>
            )}

            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Ban Tổ Chức</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-gray-500 italic">Chào mừng {user.name}, quản lý sự kiện của bạn hiệu quả hơn.</p>
                                <Link href="/profile" className="text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-red-50 hover:text-red-600 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                                    <User className="w-3 h-3" /> Hồ sơ cá nhân
                                </Link>
                            </div>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Sự kiện
                            </button>
                            <button
                                onClick={() => setActiveTab('staff')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'staff' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Users className="w-4 h-4" />
                                Nhân sự
                            </button>
                            <button
                                onClick={() => setActiveTab('revenue')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'revenue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <DollarSign className="w-4 h-4" />
                                Doanh thu
                            </button>
                        </div>
                        {activeTab === 'events' && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg w-full md:w-auto justify-center"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Tạo sự kiện mới
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {activeTab === 'events' && (
                <>
                    <div className="container mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Tổng sự kiện</p>
                                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                                <Music className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Sắp diễn ra</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeConcerts}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 flex items-center justify-center rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Danh sách sự kiện của bạn</h2>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
                        ) : events.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Music className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có sự kiện nào</h3>
                                <p className="text-gray-500 mb-6">Bạn chưa tạo bất kỳ sự kiện nào. Hãy bắt đầu ngay để thu hút khán giả.</p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow"
                                >
                                    Tạo sự kiện ngay
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-12">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                                                <th className="px-6 py-4 font-semibold">Tên sự kiện</th>
                                                <th className="px-6 py-4 font-semibold">Ngày diễn ra</th>
                                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {events.map((event, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <img src={event.imageUrl || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a'} alt="C" className="w-16 h-12 rounded object-cover" />
                                                            <span className="font-bold text-gray-900">{event.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                                        {new Date(event.startDate).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                                            Đang mở bán
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-3 text-gray-400">
                                                            <button className="hover:text-amber-500 transition" title="Chỉnh sửa"><Edit className="w-5 h-5" /></button>
                                                            <Link href={`/organizer/concerts/${event.id}/tickets`} className="hover:text-blue-500 transition" title="Quản lý vé">
                                                                <Ticket className="w-5 h-5" />
                                                            </Link>
                                                            <Link href={`/organizer/concerts/${event.id}/operations`} className="hover:text-red-500 transition" title="Quản lý vận hành (Operations)">
                                                                <ClipboardList className="w-5 h-5" />
                                                            </Link>
                                                            <Link href={`/organizer/concerts/${event.id}/program`} className="hover:text-purple-500 transition" title="Lịch diễn (Line-up)">
                                                                <Music className="w-5 h-5" />
                                                            </Link>
                                                            <Link href={`/organizer/concerts/${event.id}/staff`} className="hover:text-cyan-500 transition" title="Quản lý nhân sự">
                                                                <Users className="w-5 h-5" />
                                                            </Link>
                                                            <button className="hover:text-red-500 transition" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <PlusCircle className="w-6 h-6 text-red-500" />
                                        Tạo sự kiện mới
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition">
                                        <PlusCircle className="w-6 h-6 rotate-45" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateConcert} className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Tên sự kiện</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition text-black"
                                            placeholder="VD: Sky Tour 2026"
                                            value={createForm.name}
                                            onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Ngày diễn ra</label>
                                            <input
                                                required
                                                type="datetime-local"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition text-black"
                                                value={createForm.startDate}
                                                onChange={e => setCreateForm({ ...createForm, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Địa điểm</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition text-black"
                                                placeholder="VD: Sân vận động Mỹ Đình"
                                                value={createForm.location}
                                                onChange={e => setCreateForm({ ...createForm, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Ảnh bìa (Thumbnail)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                            onChange={e => setCreateForm({ ...createForm, image: e.target.files?.[0] || null })}
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={isCreating}
                                            className="flex-1 bg-red-600 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                                        >
                                            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bắt đầu tạo sự kiện'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-6 py-4 font-bold text-gray-500 hover:text-gray-900 transition"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'revenue' && (
                <div className="container mx-auto px-4 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Tổng doanh thu</p>
                                <p className="text-4xl font-black text-gray-900">{stats.totalRevenue.toLocaleString('vi-VN')} <span className="text-xl text-gray-400">VND</span></p>
                            </div>
                            <div className="w-16 h-16 bg-green-50 text-green-600 flex items-center justify-center rounded-2xl">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Vé đã bán</p>
                                <p className="text-4xl font-black text-gray-900">{stats.totalTicketsSold.toLocaleString('vi-VN')} <span className="text-xl text-gray-400">vé</span></p>
                            </div>
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 flex items-center justify-center rounded-2xl">
                                <Ticket className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="container mx-auto px-4 mt-8 mb-12 space-y-6">
                    {/* Sub Menu cho Staff */}
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 overflow-x-auto shadow-sm w-fit">
                        <button
                            onClick={() => setStaffSubTab('stats')}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${staffSubTab === 'stats' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >Thống kê & Đánh giá</button>
                        <button
                            onClick={() => setStaffSubTab('teamhub')}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${staffSubTab === 'teamhub' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >Sơ đồ tổ chức & Giao việc</button>
                        <button
                            onClick={() => setStaffSubTab('recruitment')}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${staffSubTab === 'recruitment' ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >Tuyển dụng</button>
                    </div>

                    {staffSubTab === 'stats' && (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-100 transition-all">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Tổng nhân sự</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.staffStats.totalStaff}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-100 transition-all">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Nhiệm vụ (Xong/Tổng)</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {stats.staffStats.completedTasks}/{stats.staffStats.totalTasks}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-amber-100 transition-all">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Đang chờ</p>
                                        <p className="text-3xl font-bold text-amber-600">{stats.staffStats.pendingTasks}</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-emerald-100 transition-all">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Hiệu suất chung</p>
                                        <p className="text-3xl font-bold text-emerald-600">{stats.staffStats.taskCompletionRate}%</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                        <Star className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Staff Performance Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-50">
                                    <h3 className="font-bold text-gray-900">Chi tiết hiệu suất nhân viên</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nhân viên</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Vai trò</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Nhiệm vụ</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Hoàn thành</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Tỷ lệ</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(stats.staffStats as any).staffDetails?.length > 0 ? (stats.staffStats as any).staffDetails.map((staff: any) => (
                                                <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-between group/row">
                                                            <div>
                                                                <div className="font-bold text-gray-900">{staff.name}</div>
                                                                <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{staff.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">
                                                            {staff.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-600">
                                                        {staff.totalTasks}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-emerald-600">
                                                        {staff.completedTasks}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="text-xs font-bold text-gray-900 mb-1">{staff.rate}%</div>
                                                        <div className="w-20 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                                            <div
                                                                className={`h-full ${staff.rate >= 80 ? 'bg-emerald-500' : staff.rate >= 40 ? 'bg-amber-500' : 'bg-red-500'} transition-all`}
                                                                style={{ width: `${staff.rate}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${staff.rate === 100 ? 'bg-emerald-50 text-emerald-600' :
                                                            staff.totalTasks === 0 ? 'bg-gray-50 text-gray-400' :
                                                                'bg-amber-50 text-amber-600'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${staff.rate === 100 ? 'bg-emerald-600' :
                                                                staff.totalTasks === 0 ? 'bg-gray-400' :
                                                                    'bg-amber-600 animate-pulse'
                                                                }`}></div>
                                                            {staff.rate === 100 ? 'Hoàn thành' : staff.totalTasks === 0 ? 'Chưa giao' : 'Đang làm'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                                        Chưa có dữ liệu nhân sự chi tiết
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {staffSubTab === 'teamhub' && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <TeamHub
                                organizerId={user.id}
                                token={token}
                                onAssignTask={(staffId, concertId, name) => setAssignTaskModal({ staffId, concertId, staffName: name })}
                            />
                        </div>
                    )}

                    {staffSubTab === 'recruitment' && (
                        <div>
                            <ManagementHub
                                managerJobPosts={managerJobs}
                                selectedManagerJob={selectedJob}
                                jobApplications={jobApplications}
                                onSelectJob={fetchJobApplications}
                                onReview={reviewApplication}
                                onCreateJob={() => setShowCreateJobModal(true)}
                                onEditJob={(job) => setEditingJob(job)}
                                onDeleteJob={deleteJob}
                                onToggleStatus={toggleStatus}
                                accentColor="green-600"
                                filterApplicantRole={['EVENT_MANAGER', 'VENDOR', 'MANAGER', 'STAFF']}
                            />
                        </div>
                    )}
                </div>
            )}

            {showCreateJobModal && (
                <CreateJobModal
                    show={showCreateJobModal}
                    onClose={() => setShowCreateJobModal(false)}
                    onSubmit={handleCreateJobPost}
                    newJob={newJob}
                    setNewJob={setNewJob}
                    isCreatingJob={jobCreating}
                    accentColor="red-600"
                />
            )}

            {editingJob && (
                <EditJobModal
                    show={!!editingJob}
                    onClose={() => setEditingJob(null)}
                    onSave={handleEditJob}
                    job={editingJob}
                    isSaving={jobSaving}
                    accentColor="red-600"
                />
            )}
            {assignTaskModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="bg-red-600 p-8 text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <ClipboardList className="w-8 h-8 opacity-80" />
                                Giao nhiệm vụ
                            </h2>
                            <p className="mt-2 text-red-100 font-medium opacity-80 truncate">
                                Nhân viên: {assignTaskModal.staffName}
                            </p>
                        </div>
                        <form onSubmit={handleAssignTask} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Tên nhiệm vụ</label>
                                <input
                                    required
                                    autoFocus
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all text-gray-900 font-medium"
                                    placeholder="Ví dụ: Kiểm tra âm thanh"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Vị trí</label>
                                    <input
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all text-gray-900 font-medium"
                                        placeholder="Sân khấu, Cổng..."
                                        value={taskLocation}
                                        onChange={(e) => setTaskLocation(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Thời gian</label>
                                    <input
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all text-gray-900 font-medium text-xs"
                                        placeholder="Giao lúc, Hạn chót..."
                                        value={taskTime}
                                        onChange={(e) => setTaskTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Mô tả công việc</label>
                                <textarea
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all text-gray-900 font-medium min-h-[80px] resize-none"
                                    placeholder="Chi tiết yêu cầu..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAssignTaskModal(null);
                                        setTaskTitle('');
                                        setTaskDescription('');
                                        setTaskLocation('');
                                        setTaskTime('');
                                    }}
                                    className="py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAssigning || !taskTitle.trim()}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {isAssigning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận giao'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}