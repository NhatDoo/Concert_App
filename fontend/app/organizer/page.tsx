"use client";

import React, { useEffect, useState, Suspense } from 'react';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { RootState } from '../../src/stores/store';
import {
    Music, Ticket, Calendar, DollarSign, Trash2, Edit, Loader2,
    CheckCircle, XCircle, Users, Briefcase, LayoutDashboard,
    PlusCircle, Mic2, Tv, Map, Star, Tag, Clock, MapPin, Plus
} from 'lucide-react';

// Sub-components
import { SummaryStats } from '../../src/features/organizer/components/SummaryStats';
import { ConcertTable } from '../../src/features/organizer/components/ConcertTable';
import { ConcertFormModal } from '../../src/features/organizer/components/ConcertFormModal';
import { RevenueView } from '../../src/features/organizer/components/RevenueView';

// Staff related
import { ManagementHub } from '../../src/features/staff/components/ManagementHub';
import { CreateJobModal } from '../../src/features/staff/components/CreateJobModal';
import { EditJobModal } from '../../src/features/staff/components/EditJobModal';
import { useJobManagement } from '../../src/features/staff/hooks/useJobManagement';
import { JobPost } from '../../src/features/staff/components/types';
import { TeamHub } from '../../src/features/staff/components/TeamHub';

const CATEGORIES = [
    { id: "music", name: "Nhạc Sống", icon: Music, color: "bg-blue-50 text-blue-600" },
    { id: "comedy", name: "Hài Kịch", icon: Mic2, color: "bg-purple-50 text-purple-600" },
    { id: "nightlife", name: "Nightlife", icon: Star, color: "bg-indigo-50 text-indigo-600" },
    { id: "arts", name: "Sân Khấu", icon: Tv, color: "bg-pink-50 text-pink-600" },
    { id: "sports", name: "Thể Thao", icon: Map, color: "bg-green-50 text-green-600" },
    { id: "more", name: "Khác", icon: Ticket, color: "bg-gray-50 text-gray-600" },
];

function DashboardContent() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Use 'events' as default to match server rendering, then sync in useEffect
    const [activeTab, setActiveTab] = useState<'events' | 'staff' | 'revenue'>('events');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const tab = searchParams.get('tab');
        if (tab === 'staff' || tab === 'revenue' || tab === 'events') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Return a loading state or nothing until mounted to prevent hydration mismatch
    // if the logic is very sensitive to client-side only data
    // For now, let's just ensure activeTab is stable.

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

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [seatSummary, setSeatSummary] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({
        name: '',
        startDate: '',
        location: '',
        image: null as File | null,
        seatMap: null as File | null,
        seats: '',
        categoryIds: [] as string[],
        hashtags: ''
    });

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
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        companyName: '',
        companyLogo: '',
        concertId: ''
    });

    const notify = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    const resetConcertForm = () => {
        setCreateForm({
            name: '',
            startDate: '',
            location: '',
            image: null,
            seatMap: null,
            seats: '',
            categoryIds: [],
            hashtags: ''
        });
        setSeatSummary(null);
    };

    const downloadSeatTemplate = () => {
        const templateRows = [
            { label: 'A1', ticketType: 'VIP', price: 1500000 },
            { label: 'A2', ticketType: 'VIP', price: 1500000 },
            { label: 'B1', ticketType: 'REGULAR', price: 700000 },
            { label: 'B2', ticketType: 'REGULAR', price: 700000 },
        ];
        const worksheet = XLSX.utils.json_to_sheet(templateRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Seats');
        XLSX.writeFile(workbook, 'seat-template.xlsx');
    };

    const importSeatExcel = async (file: File | null) => {
        if (!file) {
            setCreateForm(prev => ({ ...prev, seats: '' }));
            setSeatSummary(null);
            return;
        }

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

            const seats = rows.map((row, index) => {
                const label = String(row.label ?? '').trim();
                const ticketType = String(row.ticketType ?? '').trim();
                const rawPrice = row.price;
                const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);

                if (!label || !ticketType || Number.isNaN(price)) {
                    throw new Error(`Dong ${index + 2} khong hop le`);
                }

                return { label, ticketType, price };
            });

            if (seats.length === 0) {
                throw new Error('File Excel khong co du lieu ghe');
            }

            const labels = seats.map(seat => seat.label);
            if (new Set(labels).size !== labels.length) {
                throw new Error('File Excel co ghe bi trung label');
            }

            setCreateForm(prev => ({ ...prev, seats: JSON.stringify(seats) }));
            setSeatSummary(`Da nap ${seats.length} ghe tu file ${file.name}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Khong doc duoc file Excel';
            setCreateForm(prev => ({ ...prev, seats: '' }));
            setSeatSummary(null);
            notify('error', message);
        }
    };

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

    const fetchMyConcerts = async () => {
        if (!user?.id) return;
        setLoading(true);
        console.log('[fetchMyConcerts] Fetching for organizer:', user.id);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            // Use specialized endpoint for organizer
            const response = await fetch(`${apiUrl}/concerts/organizer/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                console.log('[fetchMyConcerts] Received data:', data);
                setEvents(data);
            } else {
                console.error('[fetchMyConcerts] Failed to fetch:', response.status);
            }
        } catch (error) {
            console.error('[fetchMyConcerts] Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const allowedRoles = ['ORGANIZER', 'EVENT_MANAGER', 'MANAGER'];
        if (!user || !user.role || !allowedRoles.includes(user.role)) {
            router.push('/');
            return;
        }
        fetchMyConcerts();
        fetchStats();
    }, [user]);

    const handleCreateConcert = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const formData = new FormData();
            formData.append('organizerId', user!.id);
            formData.append('name', createForm.name);
            formData.append('startDate', createForm.startDate);
            formData.append('location', createForm.location);
            if (createForm.image) formData.append('image', createForm.image);
            if (createForm.seatMap) formData.append('seatMap', createForm.seatMap);
            if (createForm.seats.trim()) formData.append('seats', createForm.seats);
            formData.append('categories', JSON.stringify(createForm.categoryIds));
            formData.append('hashtags', createForm.hashtags);

            const response = await fetch(`${apiUrl}/concerts`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setShowModal(false);
                resetConcertForm();
                notify('success', 'Đã tạo sự kiện mới thành công!');
                fetchMyConcerts();
            } else {
                const error = await response.json();
                notify('error', error.message || 'Lỗi khi tạo sự kiện');
            }
        } catch (error) {
            notify('error', 'Lỗi kết nối');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateConcert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEventId) return;
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const formData = new FormData();
            formData.append('organizerId', user!.id);
            formData.append('name', createForm.name);
            formData.append('startDate', createForm.startDate);
            formData.append('location', createForm.location);
            if (createForm.image) formData.append('image', createForm.image);
            if (createForm.seatMap) formData.append('seatMap', createForm.seatMap);
            formData.append('seats', createForm.seats);
            formData.append('categories', JSON.stringify(createForm.categoryIds));
            formData.append('hashtags', createForm.hashtags);

            const response = await fetch(`${apiUrl}/concerts/${editingEventId}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                setShowEditModal(false);
                setEditingEventId(null);
                resetConcertForm();
                notify('success', 'Cập nhật sự kiện thành công!');
                fetchMyConcerts();
            } else {
                const error = await response.json();
                notify('error', error.message || 'Lỗi khi cập nhật');
            }
        } catch (error) {
            notify('error', 'Lỗi kết nối');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (event: any) => {
        setEditingEventId(event.id);
        setCreateForm({
            name: event.name || '',
            startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
            location: event.location || '',
            image: null,
            seatMap: null,
            seats: event.seats ? JSON.stringify(event.seats.map((seat: any) => ({
                label: seat.label,
                ticketType: seat.ticketType,
                price: seat.price,
            })), null, 2) : '',
            categoryIds: event.categoryIds || [],
            hashtags: (event.hashtags || []).join(' ')
        });
        setSeatSummary(event.seats?.length ? `Da tai san ${event.seats.length} ghe hien co` : null);
        setShowEditModal(true);
    };

    const handleDeleteConcert = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/concerts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                notify('success', 'Đã xóa sự kiện thành công');
                fetchMyConcerts();
            } else {
                notify('error', 'Lỗi khi xóa sự kiện');
            }
        } catch (error) {
            notify('error', 'Lỗi kết nối');
        }
    };

    const handleAssignTaskRedirect = (staffId: string, concertId: string, staffName: string) => {
        console.log('Assign task to', staffName);
        // Need to implement task assignment logic here if needed
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-10 font-sans">
            {/* Header / Banner section */}
            <div className="bg-gray-900 text-white pt-12 pb-20 rounded-b-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 blur-3xl bg-gradient-to-r from-red-500 to-purple-600 animate-pulse"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-red-500/30">Organizer Dashboard</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                                Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">{mounted ? user?.name : ''}</span>
                            </h1>
                            <p className="text-gray-400 mt-2 font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                Hôm nay bạn có 3 buổi biểu diễn sắp tới.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-white text-gray-900 hover:bg-red-500 hover:text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl hover:shadow-red-500/30 flex items-center justify-center gap-3 group"
                        >
                            <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                            TẠO SỰ KIỆN MỚI
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-20 right-6 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-right-4 duration-300 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <p className="font-bold text-sm">{notification.msg}</p>
                </div>
            )}

            {/* Menu Navigation */}
            <div className="container mx-auto px-4 -mt-10 mb-10">
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-3xl border border-gray-100 shadow-xl w-fit mx-auto overflow-x-auto">
                    <button
                        onClick={() => {
                            setActiveTab('events');
                            router.push('/organizer?tab=events');
                        }}
                        className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 tracking-widest uppercase ${activeTab === 'events' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Music className="w-4 h-4" /> Sự kiện
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('staff');
                            router.push('/organizer?tab=staff');
                        }}
                        className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 tracking-widest uppercase ${activeTab === 'staff' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Users className="w-4 h-4" /> Nhân sự
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('revenue');
                            router.push('/organizer?tab=revenue');
                        }}
                        className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 tracking-widest uppercase ${activeTab === 'revenue' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <DollarSign className="w-4 h-4" /> Doanh thu
                    </button>
                </div>
            </div>

            {/* Views */}
            {activeTab === 'events' && (
                <div className="container mx-auto px-4">
                    <SummaryStats stats={stats} eventsCount={events.length} />
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Danh sách sự kiện</h2>
                        </div>
                        <ConcertTable
                            events={events}
                            loading={loading}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteConcert}
                            onCreateClick={() => setShowModal(true)}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'revenue' && <RevenueView stats={stats} />}

            {activeTab === 'staff' && (
                <div className="container mx-auto px-4 mb-12 space-y-6">
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 overflow-x-auto shadow-sm w-fit">
                        <button
                            onClick={() => setStaffSubTab('stats')}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${staffSubTab === 'stats' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >Tuyển dụng (Recruitment)</button>
                        <button
                            onClick={() => setStaffSubTab('teamhub')}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${staffSubTab === 'teamhub' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >Team Hub & Tasks</button>
                    </div>

                    {staffSubTab === 'stats' && (
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <ManagementHub
                                managerJobPosts={managerJobs}
                                selectedManagerJob={selectedJob}
                                jobApplications={jobApplications}
                                onSelectJob={fetchJobApplications}
                                onReview={reviewApplication}
                                onCreateJob={() => setShowCreateJobModal(true)}
                                onEditJob={setEditingJob}
                                onDeleteJob={deleteJob}
                                onToggleStatus={toggleStatus}
                                accentColor="blue-600"
                            />
                        </div>
                    )}

                    {staffSubTab === 'teamhub' && (
                        <TeamHub
                            organizerId={user?.id || ""}
                            token={token}
                            onAssignTask={handleAssignTaskRedirect}
                        />
                    )}
                </div>
            )}

            {/* Modals */}
            <ConcertFormModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetConcertForm();
                }}
                onSubmit={handleCreateConcert}
                formData={createForm}
                setFormData={setCreateForm}
                onSeatExcelSelected={importSeatExcel}
                onDownloadSeatTemplate={downloadSeatTemplate}
                isSubmitting={isSubmitting}
                mode="create"
                categories={CATEGORIES}
                seatSummary={seatSummary}
            />

            <ConcertFormModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    resetConcertForm();
                }}
                onSubmit={handleUpdateConcert}
                formData={createForm}
                setFormData={setCreateForm}
                onSeatExcelSelected={importSeatExcel}
                onDownloadSeatTemplate={downloadSeatTemplate}
                isSubmitting={isSubmitting}
                mode="edit"
                categories={CATEGORIES}
                seatSummary={seatSummary}
            />

            {showCreateJobModal && (
                <CreateJobModal
                    show={showCreateJobModal}
                    onClose={() => setShowCreateJobModal(false)}
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await createJob(newJob);
                        setShowCreateJobModal(false);
                    }}
                    newJob={newJob}
                    setNewJob={setNewJob}
                    isCreatingJob={jobCreating}
                    concerts={events}
                    accentColor="blue-600"
                />
            )}

            {editingJob && (
                <EditJobModal
                    show={!!editingJob}
                    job={editingJob}
                    onClose={() => setEditingJob(null)}
                    onSave={async (id, data) => {
                        await updateJob(id, data);
                        setEditingJob(null);
                    }}
                    isSaving={jobSaving}
                    accentColor="blue-600"
                />
            )}
        </div>
    );
}

export default function OrganizerDashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Đang tải...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
