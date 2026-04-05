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
    Loader2,
    ClipboardList,
    ShoppingBag,
    ShieldCheck,
    Award
} from 'lucide-react';
import { RootState } from '../../../stores/store';
import { ManagementHub } from './ManagementHub';
import { TeamHub } from './TeamHub';
import { EventPhaseWorkflow } from './EventPhaseWorkflow';
import { StaffDiscover } from './StaffDiscover';
import { CreateJobModal } from './CreateJobModal';
import { EditJobModal } from './EditJobModal';
import { StaffProfile } from './StaffProfile';
import { JobBoard } from './JobBoard';
import { JobDetailsDrawer } from './JobDetailsDrawer';
import { StaffApplyModal } from './StaffApplyModal';
import { JobPost } from './types';
import { useJobManagement } from '../hooks/useJobManagement';

export const ManagerDashboard = () => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const {
        loading,
        staffRecords,
        managerJobs,
        selectedJob,
        jobApplications,
        isCreating,
        isSaving,
        discoverJobs,
        myApplications,
        isApplying,
        notification,
        fetchJobApplications,
        fetchDiscoverJobs,
        createJob,
        updateJob,
        deleteJob,
        toggleStatus,
        reviewApplication,
        applyToJob,
        notify
    } = useJobManagement(user, token);

    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPost | null>(null);
    const [selectedDiscoverJob, setSelectedDiscoverJob] = useState<JobPost | null>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
        await createJob(newJob, () => {
            setShowCreateModal(false);
            setNewJob({ title: '', description: '', requirements: '', salary: '', location: '', companyName: '', companyLogo: '' });
        });
    };

    const handleEditJob = async (id: string, data: any) => {
        await updateJob(id, data, () => {
            setEditingJob(null);
        });
    };

    const [stats, setStats] = useState({ activeJobs: 0, totalApps: 0, pendingReview: 0 });

    useEffect(() => {
        if (activeTab === 'job-board') fetchDiscoverJobs('EVENT_MANAGER');
    }, [activeTab, fetchDiscoverJobs]);

    useEffect(() => {
        const activeCount = managerJobs.filter((j: any) => j.status === 'OPEN').length;
        setStats({
            activeJobs: activeCount,
            totalApps: 0,
            pendingReview: 0
        });
    }, [managerJobs]);

    if (loading) return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center font-bold">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
            <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px]">Manager Hub Loading...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex [font-family:var(--font-outfit)] selection:bg-rose-500/10">
            <aside className={`w-80 border-r border-slate-200/60 flex flex-col p-8 sticky top-0 h-screen bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.02)] z-40`}>
                <div className="flex items-center gap-4 mb-16 px-2">
                    <div className={`w-11 h-11 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30`}>
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-black tracking-tight text-slate-900 uppercase`}>UNIT MANAGER</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Trưởng bộ phận</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Tổng quan Hub' },
                        { id: 'job-board', icon: Briefcase, label: 'Sàn Việc Làm' },
                        { id: 'team', icon: Users, label: 'Nhân sự Team' },
                        { id: 'settings', icon: Settings, label: 'Hồ sơ & Hệ thống' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-bold ${activeTab === item.id
                                ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-rose-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-amber-600'}`} />
                                <span className="text-[10px] uppercase tracking-widest leading-none">{item.label}</span>
                            </div>
                            {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:bg-white hover:border-amber-100 hover:shadow-md transition-all duration-500">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-100 text-rose-600 flex items-center justify-center font-black shadow-inner`}>
                            {user?.name?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Manager'}</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Manager Đơn vị</p>
                        </div>
                        <button onClick={() => router.push('/logout')} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-12 space-y-12">
                {notification && (
                    <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-10 duration-500 ${notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'}`}>
                        {notification.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                        <p className="font-black text-xs uppercase tracking-widest">{notification.msg}</p>
                    </div>
                )}

                <header className="flex justify-between items-end">
                    <div className="animate-in fade-in slide-in-from-left-5 duration-700">
                        <p className="text-rose-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Management Dashboard</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Chào, {user?.name?.split(' ')[0]}</h2>
                        <p className="text-slate-500 text-sm mt-4 font-medium">
                            Bạn đang quản trị tin tuyển dụng và đội ngũ nhân sự của bộ phận.
                        </p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-4 border-[#f8fafc] bg-white shadow-sm overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="avatar" />
                                </div>
                            ))}
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
                                { label: 'Hiệu quả dự kiến', value: '94%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-transparent' },
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
                                                Unit Intel
                                            </div>
                                        </div>
                                        <h3 className="text-5xl text-slate-900 mb-1 font-black tracking-tight">{s.value}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.25em] font-black">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <section className="bg-white/60 backdrop-blur-xl rounded-[3.5rem] border border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] p-12">
                            <ManagementHub
                                managerJobPosts={managerJobs}
                                selectedManagerJob={selectedJob}
                                jobApplications={jobApplications}
                                onSelectJob={(id) => fetchJobApplications(id)}
                                onReview={reviewApplication}
                                onCreateJob={() => setShowCreateModal(true)}
                                onEditJob={(job) => setEditingJob(job)}
                                onDeleteJob={deleteJob}
                                onToggleStatus={toggleStatus}
                                accentColor="rose-600"
                            />
                        </section>
                    </>
                )}

                {activeTab === 'team' && (
                    <TeamHub organizerId={staffRecords[0]?.organizerId || user?.id} token={token} />
                )}

                {activeTab === 'job-board' && (
                    <JobBoard
                        jobs={discoverJobs.filter(j =>
                            j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            j.companyName.toLowerCase().includes(searchTerm.toLowerCase())
                        )}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onSelectJob={setSelectedDiscoverJob}
                        loading={loading}
                    />
                )}

                {activeTab === 'settings' && (
                    <StaffProfile
                        user={user}
                        token={token}
                        accentColor="rose-600"
                        onUpdateSuccess={(msg) => notify('success', msg)}
                    />
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

            <JobDetailsDrawer
                job={selectedDiscoverJob}
                onClose={() => setSelectedDiscoverJob(null)}
                onApply={() => setShowApplyModal(true)}
                isAlreadyApplied={myApplications.some(app => app.jobPostId === selectedDiscoverJob?.id)}
            />

            <StaffApplyModal
                show={showApplyModal}
                job={selectedDiscoverJob}
                onClose={() => setShowApplyModal(false)}
                isApplying={isApplying}
                onSubmit={async (cvUrl, msg) => {
                    if (selectedDiscoverJob) {
                        await applyToJob(selectedDiscoverJob.id, cvUrl, msg, () => {
                            setShowApplyModal(false);
                            setSelectedDiscoverJob(null);
                        });
                    }
                }}
            />
        </div>
    );
};
