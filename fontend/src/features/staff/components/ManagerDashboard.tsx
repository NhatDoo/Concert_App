"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Settings,
    Bell,
    LogOut,
    Plus,
    TrendingUp,
    Target,
    CheckCircle,
    Clock,
    Search,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { RootState } from '../../../stores/store';
import { ManagementHub } from './ManagementHub';
import { TeamHub } from './TeamHub';
import { CreateJobModal } from './CreateJobModal';
import { EditJobModal } from './EditJobModal';
import { JobPost, Application } from './types';

export const ManagerDashboard = () => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [staffRecords, setStaffRecords] = useState<any[]>([]);
    const [managerJobs, setManagerJobs] = useState<JobPost[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
    const [jobApplications, setJobApplications] = useState<Application[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPost | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        companyName: '',
        companyLogo: ''
    });

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsCreating(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    ...newJob,
                    organizerId: staffRecords[0]?.organizerId || user?.id,
                    authorId: staffRecords[0]?.id || user?.id
                })
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewJob({ title: '', description: '', requirements: '', salary: '', location: '', companyName: '', companyLogo: '' });
                fetchData();
            } else {
                const errorData = await res.json();
                alert(`Không thể tạo tin tuyển dụng: ${Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Lỗi không xác định'}`);
            }
        } catch (e) {
        } finally { setIsCreating(false); }
    };

    const handleEditJob = async (id: string, data: any) => {
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setEditingJob(null);
                fetchData();
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.message}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này? Tất cả hồ sơ ứng tuyển cũng sẽ bị xóa.')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${id}`, {
                method: 'DELETE',
                headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
            });
            if (res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/organize/jobs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    // Stats
    const [stats, setStats] = useState({ activeJobs: 0, totalApps: 0, pendingReview: 0 });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // 1. Get Manager Info
            const staffRes = await fetch(`${apiUrl}/organize/staff/me?userId=${user.id}`);
            const staffData = await staffRes.json();
            const manager = Array.isArray(staffData) ? staffData[0] : staffData;
            setStaffRecords([manager]);

            // 2. Get Manager's Jobs
            const authorIdToFetch = manager?.id || user.id;
            const jobsRes = await fetch(`${apiUrl}/organize/jobs?authorId=${authorIdToFetch}&includeClosed=true`);
            const jobsData = await jobsRes.json();
            setManagerJobs(Array.isArray(jobsData) ? jobsData : []);

            // 3. Stats Calculation
            const allJobs = Array.isArray(jobsData) ? jobsData : [];
            const activeCount = allJobs.filter((j: any) => j.status === 'OPEN').length;

            // For total applications, we'd ideally have an endpoint, but we can estimate or leave as is if not available.
            // Let's at least fix the activeJobs count.
            setStats({
                activeJobs: activeCount,
                totalApps: 0, // This needs a separate query or join in backend to be accurate
                pendingReview: 0
            });

            if (allJobs.length > 0) {
                fetchJobApplications(allJobs[0].id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobApplications = async (jobId: string) => {
        const job = managerJobs.find(j => j.id === jobId) || managerJobs[0];
        setSelectedJob(job);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${jobId}/applications`);
            if (res.ok) {
                const data = await res.json();
                setJobApplications(Array.isArray(data) ? data : []);
            } else {
                setJobApplications([]);
            }
        } catch (e) { }
    };

    const handleReview = async (applicationId: string, status: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/organize/applications/${applicationId}/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ status })
            });
            if (selectedJob) fetchJobApplications(selectedJob.id);
        } catch (e) { }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    if (loading) return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center font-bold">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
            <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px]">Manager Hub Loading...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans selection:bg-rose-500/10">
            {/* Premium Light Sidebar */}
            <aside className="w-80 border-r border-slate-200/60 flex flex-col p-8 sticky top-0 h-screen bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.02)] z-40">
                <div className="flex items-center gap-4 mb-16 px-2">
                    <div className="w-11 h-11 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">MANAGER</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan' },
                        { id: 'team', icon: Users, label: 'Nhân sự Team' },
                        { id: 'settings', icon: Settings, label: 'Cài đặt Hub' },
                    ].map((item, i) => (
                        <button key={i} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-bold ${activeTab === item.id ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-rose-600'}`}>
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-rose-600'}`} />
                                <span className="text-xs uppercase tracking-widest leading-none">{item.label}</span>
                            </div>
                            {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:bg-white hover:border-rose-100 hover:shadow-md transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-rose-600 font-black shadow-inner">
                            {user?.name?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Manager'}</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Administrator</p>
                        </div>
                        <button onClick={() => router.push('/logout')} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-12 space-y-12">
                {/* Header Area */}
                <header className="flex justify-between items-end">
                    <div className="animate-in fade-in slide-in-from-left-5 duration-700">
                        <p className="text-rose-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Management Dashboard</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Chào buổi sáng, {user?.name?.split(' ')[0]}</h2>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Bạn đang quản trị <span className="text-slate-900 font-bold">{managerJobs.length} tin tuyển dụng</span> và {stats.pendingReview} hồ sơ đang đợi.</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-4 border-[#f8fafc] bg-white shadow-sm overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="avatar" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-4 border-[#f8fafc] bg-rose-600 flex items-center justify-center text-[10px] text-white font-black shadow-lg shadow-rose-500/20">
                                +12
                            </div>
                        </div>
                        <div className="h-12 w-[1px] bg-slate-200"></div>
                        <button className="p-4 bg-white border border-slate-100 rounded-2xl relative text-slate-400 hover:text-rose-600 hover:shadow-md transition-all duration-300">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Tin tuyển dụng', value: stats.activeJobs, icon: Briefcase, color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500/10 to-transparent' },
                                { label: 'Tổng đơn ứng tuyển', value: stats.totalApps, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-transparent' },
                                { label: 'Tỉ lệ phản hồi', value: '98%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-transparent' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-rose-100 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-500 group relative overflow-hidden group">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} translate-y-full group-hover:translate-y-0 transition-transform duration-700`}></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`p-4 rounded-2xl ${s.bg} ${s.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                                <s.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                                                <Clock className="w-3 h-3" />
                                                7 Days
                                            </div>
                                        </div>
                                        <h3 className="text-5xl text-slate-900 mb-1 font-black tracking-tight">{s.value}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.25em] font-black">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <section className="bg-white/60 backdrop-blur-xl rounded-[3.5rem] border border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] p-12 animate-in fade-in zoom-in-95 duration-1000">
                            <ManagementHub
                                managerJobPosts={managerJobs}
                                selectedManagerJob={selectedJob}
                                jobApplications={jobApplications}
                                onSelectJob={fetchJobApplications}
                                onReview={handleReview}
                                onCreateJob={() => setShowCreateModal(true)}
                                onEditJob={(job) => setEditingJob(job)}
                                onDeleteJob={handleDeleteJob}
                                onToggleStatus={handleToggleStatus}
                            />
                        </section>
                    </>
                )}

                {activeTab === 'team' && (
                    <TeamHub organizerId={staffRecords[0]?.organizerId || user?.id} token={token} />
                )}
            </main>

            <CreateJobModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateJob}
                newJob={newJob}
                setNewJob={setNewJob}
                isCreatingJob={isCreating}
            />
            <EditJobModal
                show={!!editingJob}
                job={editingJob}
                onClose={() => setEditingJob(null)}
                onSave={handleEditJob}
                isSaving={isSaving}
            />
        </div>
    );
};
