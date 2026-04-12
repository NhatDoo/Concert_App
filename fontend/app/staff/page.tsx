"use client";

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Settings,
    Search,
    Bell,
    LogOut,
    CheckCircle,
    Clock,
    ChevronRight,
    Loader2,
    CalendarCheck,
    Plus,
    XCircle,
    Star,
    MapPin,
    ShieldCheck,
    ClipboardList
} from 'lucide-react';
import { RootState, AppDispatch } from '../../src/stores/store';
import { logout } from '../../src/features/auth/stores/authSlice';

// Sub-components
import { JobBoard } from '../../src/features/staff/components/JobBoard';
import { JobDetailsDrawer } from '../../src/features/staff/components/JobDetailsDrawer';
import { StaffApplyModal } from '../../src/features/staff/components/StaffApplyModal';
import { JobPost, Application, Task, StaffRecord } from '../../src/features/staff/components/types';
import { StaffProfile } from '../../src/features/staff/components/StaffProfile';
import { CreateJobModal } from '../../src/features/staff/components/CreateJobModal';
import { ManagementHub } from '../../src/features/staff/components/ManagementHub';
import { MyTasks } from '../../src/features/staff/components/MyTasks';

interface Invitation {
    id: string;
    email: string;
    role: string;
    token: string;
    status: string;
    createdAt: string;
    organizerId: string;
}

export default function StaffDashboard() {
    const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [activeTab, setActiveTab] = useState<'tasks' | 'recruitment' | 'management' | 'settings'>('tasks');
    const [staffRecords, setStaffRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [allJobs, setAllJobs] = useState<JobPost[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applicationNote, setApplicationNote] = useState('');
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [myApplications, setMyApplications] = useState<Application[]>([]);

    // Manager states
    const [managerJobPosts, setManagerJobPosts] = useState<JobPost[]>([]);
    const [selectedManagerJob, setSelectedManagerJob] = useState<JobPost | null>(null);
    const [jobApplications, setJobApplications] = useState<Application[]>([]);
    const [showCreateJobModal, setShowCreateJobModal] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', requirements: '', salary: '', location: '', companyName: '', companyLogo: '' });
    const [isCreatingJob, setIsCreatingJob] = useState(false);

    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const notify = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const [myInvitations, setMyInvitations] = useState<Invitation[]>([]);
    const [team, setTeam] = useState<any[]>([]);

    const fetchStaffData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // 1. Fetch Staff Records (tasks, etc.)
            const staffRes = await fetch(`${apiUrl}/organize/staff/me?userId=${user.id}`);
            const staffData = await staffRes.json();
            const staffArray = Array.isArray(staffData) ? staffData : [staffData];
            setStaffRecords(staffArray);

            const primaryStaff = staffArray[0];

            // 2. Fetch All Jobs
            const jobsRes = await fetch(`${apiUrl}/organize/jobs`);
            const jobsData = await jobsRes.json();
            setAllJobs(jobsData);

            // 3. Fetch My Applications
            if (primaryStaff?.id) {
                const myAppRes = await fetch(`${apiUrl}/organize/applications?applicantId=${primaryStaff.id}`);
                if (myAppRes.ok) {
                    const myAppData = await myAppRes.json();
                    setMyApplications(myAppData);
                }
            }

            // 4. Fetch My Recruitment & Team (if manager)
            const isManager = staffArray.some(r =>
                r.role === 'MANAGER' ||
                ['EVENT_MANAGER', 'PRODUCTION_MANAGER', 'TECHNICAL_MANAGER', 'MARKETING_MANAGER', 'TALENT_MANAGER'].includes(r.role)
            );

            if (isManager && primaryStaff?.id) {
                // Fetch manager's jobs
                const managerJobsRes = await fetch(`${apiUrl}/organize/jobs?authorId=${primaryStaff.id}`);
                if (managerJobsRes.ok) {
                    const managerJobsData = await managerJobsRes.json();
                    setManagerJobPosts(managerJobsData || []);
                }

                // Fetch manager's team
                const teamRes = await fetch(`${apiUrl}/organize/staff/list/${primaryStaff.organizerId}?managerId=${primaryStaff.id}`);
                if (teamRes.ok) {
                    const teamData = await teamRes.json();
                    setTeam(teamData || []);
                }
            }

            // 5. Fetch Invitations
            const inviteRes = await fetch(`${apiUrl}/organize/invitations/me?email=${user.email}`);
            if (inviteRes.ok) {
                const inviteData = await inviteRes.json();
                setMyInvitations(inviteData || []);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user && !authLoading) {
            router.push('/login');
        } else if (user) {
            fetchStaffData();
        }
    }, [user, authLoading]);

    const handleAcceptInvite = async (tokenStr: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/invitations/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: tokenStr, userId: user?.id })
            });

            if (res.ok) {
                notify('success', 'Bạn đã là một phần của ban tổ chức!');
                fetchStaffData();
            } else {
                const err = await res.json();
                notify('error', err.message || 'Lỗi khi chấp nhận lời mời');
            }
        } catch (e) {
            notify('error', 'Lỗi kết nối');
        }
    };

    const handleApplyWithModal = async (cvUrl: string, message: string) => {
        if (!selectedJob || !staffRecords[0]) return;
        setIsApplying(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/organize/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicantId: staffRecords[0].id,
                    jobPostId: selectedJob.id,
                    cvUrl,
                    message
                })
            });

            if (response.ok) {
                notify('success', 'Nộp đơn thành công!');
                setShowApplyModal(false);
                fetchStaffData();
            } else {
                const errorData = await response.json();
                notify('error', `Không thể ứng tuyển: ${errorData.message || 'Lỗi không xác định'}`);
            }
        } catch (e) {
            notify('error', 'Lỗi kết nối máy chủ.');
        } finally {
            setIsApplying(false);
        }
    };

    const fetchJobApplications = async (jobId: string) => {
        const job = managerJobPosts.find(j => j.id === jobId);
        setSelectedManagerJob(job || null);
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
            const res = await fetch(`${apiUrl}/organize/applications/${applicationId}/review`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                notify('success', status === 'APPROVED' ? 'Đã tiếp nhận nhân sự!' : 'Đã từ chối hồ sơ.');
                if (selectedManagerJob) fetchJobApplications(selectedManagerJob.id);
            }
        } catch (e) { }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffRecords[0]) return;
        setIsCreatingJob(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newJob,
                    organizerId: staffRecords[0].organizerId,
                    authorId: staffRecords[0].id
                })
            });
            if (res.ok) {
                notify('success', 'Đã đăng tin tuyển dụng!');
                setShowCreateJobModal(false);
                setNewJob({ title: '', description: '', requirements: '', salary: '', location: '', companyName: '', companyLogo: '' });
                fetchStaffData();
            }
        } catch (e) {
            notify('error', 'Lỗi khi đăng tin.');
        } finally { setIsCreatingJob(false); }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${jobId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                notify('success', 'Đã xóa tin tuyển dụng');
                fetchStaffData();
            }
        } catch (e) {
            notify('error', 'Lỗi khi xóa tin');
        }
    };

    const handleToggleStatus = async (jobId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${jobId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                notify('success', newStatus === 'OPEN' ? 'Đã mở lại tin tuyển dụng' : 'Đã đóng tin tuyển dụng');
                fetchStaffData();
            }
        } catch (e) {
            notify('error', 'Lỗi khi cập nhật trạng thái');
        }
    };

    const handleLogout = () => { dispatch(logout()); router.push('/login'); };

    const handleUpdateTaskStatus = async (concertId: string, staffId: string, taskId: string, currentStatus: string) => {
        let nextStatus = 'PENDING';
        if (currentStatus === 'PENDING') nextStatus = 'WORKING';
        else if (currentStatus === 'WORKING') nextStatus = 'COMPLETED';
        else nextStatus = 'PENDING';

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/staff/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) {
                fetchStaffData();
            }
        } catch (e) {
            notify('error', 'Không thể cập nhật trạng thái');
        }
    };

    if (authLoading || (loading && user)) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-bold">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-400 uppercase tracking-widest text-xs animate-pulse">Ticketbox Staff Hub is loading...</p>
        </div>
    );

    const isManagerRole = staffRecords.some(r =>
        r.role === 'MANAGER' ||
        ['EVENT_MANAGER', 'PRODUCTION_MANAGER', 'TECHNICAL_MANAGER', 'MARKETING_MANAGER', 'TALENT_MANAGER'].includes(r.role)
    );

    const filteredJobs = allJobs.filter(j =>
        (j.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (j.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getRoleColor = () => {
        const primaryStaff = staffRecords[0];
        if (!primaryStaff) return 'blue';
        if (primaryStaff.role === 'EVENT_MANAGER') return 'violet';
        if (primaryStaff.role === 'PRODUCTION_MANAGER') return 'indigo';
        if (primaryStaff.role === 'MANAGER') return 'blue';
        return 'blue';
    };

    const roleColor = getRoleColor();
    const colorClasses: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-600 shadow-blue-200',
        violet: 'text-violet-600 bg-violet-600 shadow-violet-200',
        indigo: 'text-indigo-600 bg-indigo-600 shadow-indigo-200',
    };

    const currentTheme = colorClasses[roleColor] || colorClasses.blue;
    const [mainText, mainBg, mainShadow] = currentTheme.split(' ');

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600 pb-20">
            {/* Modern Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 ${mainBg} rounded-2xl flex items-center justify-center shadow-lg ${mainShadow}`}>
                            <span className="text-white font-black text-xl italic">{roleColor.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-800">TICKETBOX<span className={`${mainText}`}>.{staffRecords[0]?.role || 'STAFF'}</span></h1>
                            <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Executive Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <nav className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
                            {[
                                { id: 'tasks', label: 'CÔNG VIỆC', icon: CalendarCheck },
                                { id: 'recruitment', label: 'TÌM VIỆC', icon: Search },
                                ...(isManagerRole ? [{ id: 'management', label: 'TUYỂN DỤNG', icon: Users }] : []),
                                { id: 'settings', label: 'HỒ SƠ', icon: Settings }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-8 py-3 rounded-xl flex items-center gap-3 transition-all font-black text-[11px] tracking-widest ${activeTab === tab.id
                                        ? `bg-white ${mainText} shadow-md shadow-slate-200/50 scale-[1.02]`
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="h-10 w-px bg-slate-200"></div>

                        <div className="flex items-center gap-6">
                            {/* Nút scan QR check-in */}
                            <Link href="/staff/scan" className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md flex items-center justify-center" title="Quét vé QR">
                                <Search className="w-5 h-5 flex-shrink-0" />
                            </Link>

                            <Link href="/profile" className="flex items-center gap-6 hover:opacity-80 transition-opacity group">
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{user?.name}</p>
                                    <p className={`text-[10px] ${mainText} font-bold uppercase`}>{staffRecords[0]?.role || 'APPLICANT'}</p>
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                {/* Invitations Section */}
                {myInvitations.length > 0 && (
                    <div className="mb-12 animate-in slide-in-from-top-10 duration-700">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-1 rounded-[3rem] shadow-2xl">
                            <div className="bg-white/95 backdrop-blur-md rounded-[2.8rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20">
                                <div className="flex items-center gap-8 text-center md:text-left">
                                    <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-blue-600 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full opacity-10"></div>
                                        <Bell className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 leading-none">LỜI MỜI HỢP TÁC MỚI</h3>
                                        <p className="text-slate-500 text-sm mt-3 font-medium uppercase tracking-widest">Bạn đang được mời tham gia vào đội ngũ sản xuất Concert.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {myInvitations.map(invite => (
                                        <div key={invite.id} className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] flex items-center gap-8 shadow-sm group hover:border-blue-200 transition-all">
                                            <div>
                                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-1">Vị trí đề xuất</p>
                                                <p className="font-black text-slate-800 text-lg italic">{invite.role}</p>
                                            </div>
                                            <button
                                                onClick={() => handleAcceptInvite(invite.token)}
                                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-blue-200 font-black text-xs uppercase tracking-widest"
                                            >
                                                CHẤP NHẬN NGAY
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="space-y-8">
                        {/* Task Stats for Staff */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Tổng nhiệm vụ</p>
                                    <p className="text-3xl font-black text-slate-900 leading-none">
                                        {staffRecords.reduce((acc, r) => acc + (r.tasks?.length || 0), 0)}
                                    </p>
                                </div>
                                <div className={`w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                                    <CalendarCheck className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-100 transition-all">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Đã hoàn thành</p>
                                    <p className="text-3xl font-black text-emerald-600 leading-none">
                                        {staffRecords.reduce((acc, r) => acc + (r.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0), 0)}
                                    </p>
                                </div>
                                <div className={`w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                                    <CheckCircle className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-amber-100 transition-all">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Đang thực hiện</p>
                                    <p className="text-3xl font-black text-amber-600 leading-none">
                                        {staffRecords.reduce((acc, r) => acc + (r.tasks?.filter((t: any) => t.status !== 'COMPLETED').length || 0), 0)}
                                    </p>
                                </div>
                                <div className={`w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                                    <Clock className="w-7 h-7" />
                                </div>
                            </div>
                        </div>

                        <MyTasks
                            staffRecords={staffRecords}
                            loading={loading}
                            onUpdateStatus={handleUpdateTaskStatus}
                        />
                    </div>
                )}

                {activeTab === 'recruitment' && (
                    <JobBoard
                        jobs={filteredJobs}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onSelectJob={setSelectedJob}
                        loading={loading}
                    />
                )}

                {activeTab === 'management' && (
                    <ManagementHub
                        managerJobPosts={managerJobPosts}
                        selectedManagerJob={selectedManagerJob}
                        jobApplications={jobApplications}
                        onSelectJob={fetchJobApplications}
                        onReview={handleReview}
                        onCreateJob={() => setShowCreateJobModal(true)}
                        onEditJob={(job) => { setSelectedManagerJob(job); }}
                        onDeleteJob={handleDeleteJob}
                        onToggleStatus={handleToggleStatus}
                        accentColor={`${roleColor}-600`}
                    />
                )}

                {activeTab === 'settings' && (
                    <StaffProfile
                        user={user}
                        token={null}
                        accentColor="blue-600"
                        onUpdateSuccess={(msg) => notify('success', msg)}
                    />
                )}
            </main>

            <JobDetailsDrawer
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onApply={() => setShowApplyModal(true)}
                isAlreadyApplied={myApplications.some(app => app.jobPostId === selectedJob?.id)}
            />

            <CreateJobModal
                show={showCreateJobModal}
                onClose={() => setShowCreateJobModal(false)}
                onSubmit={handleCreateJob}
                newJob={newJob}
                setNewJob={setNewJob}
                isCreatingJob={isCreatingJob}
            />

            <StaffApplyModal
                show={showApplyModal}
                job={selectedJob}
                onClose={() => setShowApplyModal(false)}
                isApplying={isApplying}
                onSubmit={handleApplyWithModal}
                accentColor="blue-600"
            />

            {/* Notifications */}
            {notification && (
                <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 ${notification.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    <p className="font-black text-xs uppercase tracking-widest">{notification.message}</p>
                </div>
            )}

            {/* Role-based Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 ${mainBg} rounded-lg flex items-center justify-center text-white font-black italic shadow-lg ${mainShadow}`}>
                        {roleColor.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                        Ticketbox <span className={mainText}>{staffRecords[0]?.role || 'Staff'}</span> Workspace
                    </p>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Công nghệ sản xuất Concert chuyên nghiệp
                </p>
            </footer>
        </div>
    );
}
