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
    CheckCircle,
    Clock,
    ChevronRight,
    Loader2,
    ClipboardList,
    ShoppingBag,
    ShieldCheck,
    Award,
    TrendingUp,
    Target
} from 'lucide-react';
import { RootState } from '../../../stores/store';
import { ManagementHub } from './ManagementHub';
import { EventPhaseWorkflow } from './EventPhaseWorkflow';
import { StaffDiscover } from './StaffDiscover';
import { TeamHub } from './TeamHub';
import { CreateJobModal } from './CreateJobModal';
import { EditJobModal } from './EditJobModal';
import { StaffProfile } from './StaffProfile';
import { JobBoard } from './JobBoard';
import { JobDetailsDrawer } from './JobDetailsDrawer';
import { StaffApplyModal } from './StaffApplyModal';
import { JobPost } from './types';
import { useJobManagement } from '../hooks/useJobManagement';

export const EventManagerDashboard = () => {
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
        createJob,
        updateJob,
        deleteJob,
        toggleStatus,
        reviewApplication,
        applyToJob,
        fetchDiscoverJobs,
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

    useEffect(() => {
        if (activeTab === 'job-board') fetchDiscoverJobs('ORGANIZER');
    }, [activeTab, fetchDiscoverJobs]);

    if (loading) return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center font-bold">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-6" />
            <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px]">Event Orchestration Hub Loading...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfcfd] text-slate-800 flex [font-family:var(--font-outfit)] selection:bg-amber-500/10">
            {/* GOLD PREMIUM SIDEBAR */}
            <aside className="w-80 border-r border-slate-200/40 flex flex-col p-8 sticky top-0 h-screen bg-white shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)] z-40">
                <div className="flex items-center gap-4 mb-16 px-2">
                    <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20 rotate-3">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">EVENT DIRECTOR</h1>
                        <p className="text-[9px] text-amber-600/80 uppercase tracking-[0.2em] font-black mt-1">Hệ thống Tổng quản</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-4">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Trung tâm Chỉ huy' },
                        { id: 'phases', icon: ClipboardList, label: 'Lộ trình Concert' },
                        { id: 'job-board', icon: Briefcase, label: 'Cơ hội cộng tác' },
                        { id: 'marketplace', icon: ShoppingBag, label: 'Sàn nhân sự (Market)' },
                        { id: 'team', icon: Users, label: 'Đối tác & Team' },
                        { id: 'settings', icon: Settings, label: 'Hồ sơ chuyên môn' },
                    ].map((item, i) => (
                        <button key={i} onClick={() => setActiveTab(item.id)} className={`w-full group flex items-center justify-between p-4 rounded-3xl transition-all duration-500 font-bold ${activeTab === item.id ? 'bg-amber-600 text-white shadow-2xl shadow-amber-600/30 -translate-y-1' : 'text-slate-500 hover:bg-amber-50 hover:text-amber-700'}`}>
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === item.id ? 'text-white scale-110' : 'text-slate-300 group-hover:scale-110'}`} />
                                <span className="text-[10px] uppercase tracking-[0.15em] leading-none">{item.label}</span>
                            </div>
                            {activeTab === item.id && <ChevronRight className="w-4 h-4 animate-pulse" />}
                        </button>
                    ))}
                </nav>

                <div className="mt-8 mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] border border-amber-100/50 shadow-inner group overflow-hidden relative">
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-200/20 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-md">
                            <Award className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Master Status</span>
                    </div>
                    <p className="text-[10px] text-amber-700/60 font-bold leading-relaxed">Bộ công cụ đặc quyền dành cho người điều hành mạch sống của Concert.</p>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:bg-white hover:border-amber-200 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 font-black shadow-inner uppercase">
                            {user?.name?.charAt(0) || 'D'}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Director'}</p>
                            <p className="text-[9px] text-amber-500 uppercase tracking-widest font-black">Event Manager</p>
                        </div>
                        <button onClick={() => router.push('/logout')} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT Area */}
            <main className="flex-1 overflow-y-auto p-12 space-y-12">
                {notification && (
                    <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-10 duration-700 bg-amber-600 border-amber-400 text-white`}>
                        <CheckCircle className="w-6 h-6" />
                        <p className="font-black text-[10px] uppercase tracking-[0.25em]">{notification.msg}</p>
                    </div>
                )}

                <header className="flex justify-between items-end">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-5 py-2 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">CONCERT ORCHESTRATION</span>
                            <div className="h-1 w-12 bg-amber-200 rounded-full"></div>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">Xin chào,<br /><span className="text-amber-600 underline decoration-amber-200 decoration-8 underline-offset-8 italic">{user?.name?.split(' ')[0]}</span></h2>
                        <p className="text-slate-400 text-sm mt-6 font-medium tracking-tight">Tầm nhìn của bạn đang kiến tạo nên nhịp đập cho sự kiện ngàn người.</p>
                    </div>

                    <div className="flex items-center gap-8 bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="flex -space-x-4">
                            {[11, 12, 13].map(i => (
                                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white shadow-xl overflow-hidden group hover:z-50 transition-all duration-300 hover:scale-110">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="avatar" />
                                </div>
                            ))}
                            <div className="w-12 h-12 rounded-2xl border-4 border-white bg-amber-600 flex items-center justify-center text-[10px] text-white font-black shadow-lg">
                                +8
                            </div>
                        </div>
                        <div className="h-10 w-px bg-slate-100"></div>
                        <div className="flex items-center gap-4 pr-2">
                            <button className="p-4 bg-slate-50 rounded-2xl relative text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-md transition-all duration-500">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-amber-500 rounded-full border-4 border-white"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Tổng nguồn lực', value: managerJobs.length, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-600/10' },
                                { label: 'Managers thực thi', value: '12', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-600/10' },
                                { label: 'Chỉ số ROI dự kiến', value: '86%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-600/10' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-amber-200 transition-all duration-500 group relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-500/5">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-1000`}></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-10">
                                            <div className={`p-5 rounded-2xl ${s.bg} ${s.color} shadow-lg shadow-black/5 group-hover:rotate-12 transition-transform duration-500`}>
                                                <s.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                Live Intel
                                            </div>
                                        </div>
                                        <h3 className="text-6xl text-slate-900 mb-2 font-black tracking-tighter">{s.value}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl rounded-[4rem] border border-white shadow-2xl p-12">
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
                                accentColor="amber-600"
                            />

                        </div>
                    </div>
                )}

                {activeTab === 'phases' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <EventPhaseWorkflow />
                    </div>
                )}

                {activeTab === 'marketplace' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <StaffDiscover
                            organizerId={staffRecords[0]?.organizerId || user?.id}
                            managerId={staffRecords[0]?.id}
                            filterRole="MANAGER"
                            onInviteSuccess={notify}
                        />
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <TeamHub organizerId={staffRecords[0]?.organizerId || user?.id} token={token} />
                    </div>
                )}

                {activeTab === 'job-board' && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
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
                    </div>
                )}

                {activeTab === 'settings' && (
                    <StaffProfile
                        user={user}
                        token={token}
                        accentColor="amber-600"
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
