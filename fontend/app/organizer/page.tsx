"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RootState } from '../../src/stores/store';
import { PlusCircle, Music, Ticket, Calendar, DollarSign, Trash2, Edit, Loader2, CheckCircle, XCircle, Users, Briefcase, LayoutDashboard } from 'lucide-react';
import { ManagementHub } from '../../src/features/staff/components/ManagementHub';
import { CreateJobModal } from '../../src/features/staff/components/CreateJobModal';
import { EditJobModal } from '../../src/features/staff/components/EditJobModal';
import { useJobManagement } from '../../src/features/staff/hooks/useJobManagement';
import { JobPost } from '../../src/features/staff/components/types';

export default function OrganizerDashboard() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [events, setEvents] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalTicketsSold: 0, totalRevenue: 0, totalConcerts: 0, activeConcerts: 0 });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', startDate: '', location: '', image: null as File | null });
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'events' | 'recruitment'>('events');

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

                const statsRes = await fetch(`${apiUrl}/organize/stats/${user.id}`);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
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

            {/* Header Dashboard */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Ban Tổ Chức</h1>
                            <p className="text-gray-500 mt-2">Chào mừng {user.name}, quản lý sự kiện của bạn hiệu quả hơn.</p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'events' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Sự kiện
                            </button>
                            <button
                                onClick={() => setActiveTab('recruitment')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'recruitment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Tuyển dụng
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

            {activeTab === 'events' ? (
                <>
                    {/* Stats Overview */}
                    <div className="container mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                <p className="text-sm font-medium text-gray-500 mb-1">Vé đã bán</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalTicketsSold.toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl">
                                <Ticket className="w-6 h-6" />
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
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Doanh thu</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* List Events */}
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
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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

                    {/* Create Concert Modal */}
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
            ) : (
                <div className="container mx-auto px-4 mt-12">
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
                        accentColor="red-600"
                        filterApplicantRole="EVENT_MANAGER"
                    />
                </div>
            )}

            {/* Create Job Modal */}
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

            {/* Edit Job Modal */}
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
        </div>
    );
}