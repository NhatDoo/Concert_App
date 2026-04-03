"use client";

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
    Loader2,
    LogOut,
    Bell,
    Search,
    CalendarCheck,
    Users,
    XCircle,
    CheckCircle
} from 'lucide-react';
import { RootState, AppDispatch } from '../../src/stores/store';
import { logout } from '../../src/features/auth/stores/authSlice';

// Sub-components
import { JobBoard } from '../../src/features/staff/components/JobBoard';
import { JobDetailsDrawer } from '../../src/features/staff/components/JobDetailsDrawer';
import { ManagementHub } from '../../src/features/staff/components/ManagementHub';
import { MyTasks } from '../../src/features/staff/components/MyTasks';
import { CreateJobModal } from '../../src/features/staff/components/CreateJobModal';

import { JobPost, Application, Task, StaffRecord } from '../../src/features/staff/components/types';

export default function StaffDashboard() {
    const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [activeTab, setActiveTab] = useState<'tasks' | 'recruitment' | 'management'>('tasks');
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

    const fetchStaffData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // 1. Fetch Staff Records (tasks, etc.)
            const staffRes = await fetch(`${apiUrl}/organize/staff/me?userId=${user.id}`);
            const staffData = await staffRes.json();
            setStaffRecords(Array.isArray(staffData) ? staffData : [staffData]);

            // 2. Fetch All Jobs
            const jobsRes = await fetch(`${apiUrl}/organize/jobs`);
            const jobsData = await jobsRes.json();
            setAllJobs(jobsData);

            // 3. Fetch My Applications
            const myAppRes = await fetch(`${apiUrl}/organize/applications?applicantId=${staffData[0]?.id || ''}`);
            if (myAppRes.ok) {
                const myAppData = await myAppRes.json();
                setMyApplications(myAppData);
            }

            // 4. If Manager, fetch their job posts
            if (staffData[0]) {
                const managerJobsRes = await fetch(`${apiUrl}/organize/jobs?authorId=${staffData[0].id}&includeClosed=true`);
                const managerJobsData = await managerJobsRes.json();
                setManagerJobPosts(managerJobsData);
            }
        } catch (e) {
            console.error("Failed to fetch staff data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (user) fetchStaffData();
    }, [user, authLoading]);

    // Redirection for Managers
    useEffect(() => {
        const hasManagerRecord = staffRecords.some(r =>
            r.role === 'MANAGER' ||
            ['EVENT_MANAGER', 'PRODUCTION_MANAGER', 'TECHNICAL_MANAGER', 'MARKETING_MANAGER', 'TALENT_MANAGER'].includes(r.role)
        );
        if (hasManagerRecord) {
            router.push('/staff/manager');
        }
    }, [staffRecords, router]);

    const handleApply = async () => {
        if (!selectedJob || !staffRecords[0]) return;

        if (!cvFile) {
            notify('error', 'Vui lòng đính kèm CV (PDF) của bạn.');
            return;
        }

        setIsApplying(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // 1. Upload CV to MinIo
            const formData = new FormData();
            formData.append('file', cvFile);

            const uploadRes = await fetch(`${apiUrl}/organize/applications/upload-cv`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                throw new Error('Lỗi khi tải lên CV. Vui lòng thử lại.');
            }

            const { url: cvUrl } = await uploadRes.json();

            // 2. Submit Application
            const res = await fetch(`${apiUrl}/organize/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobPostId: selectedJob.id,
                    applicantId: staffRecords[0].id,
                    cvUrl: cvUrl,
                    message: applicationNote
                })
            });
            if (res.ok) {
                notify('success', 'Đã nộp hồ sơ thành công!');
                setShowApplyModal(false);
                setSelectedJob(null);
                setApplicationNote('');
                setCvFile(null);
                fetchStaffData();
            } else {
                const errorData = await res.json();
                notify('error', `Không thể ứng tuyển: ${errorData.message || 'Lỗi không xác định'}`);
            }
        } catch (e: any) {
            notify('error', e.message || 'Lỗi kết nối máy chủ.');
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

    const handleLogout = () => { dispatch(logout()); router.push('/login'); };

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
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600 pb-20">
            {/* Modern Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <span className="text-white font-black text-xl italic">T</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">STAFF HUB</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isManagerRole ? 'Recruiter Account' : 'Worker Account'}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center bg-slate-100 p-1.5 rounded-2xl font-bold text-xs border border-slate-200">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <CalendarCheck className="w-4 h-4" />
                            CÔNG VIỆC
                        </button>

                        {!isManagerRole && (
                            <button
                                onClick={() => setActiveTab('recruitment')}
                                className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'recruitment' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Search className="w-4 h-4" />
                                TÌM VIỆC LÀM
                            </button>
                        )}

                        {isManagerRole && (
                            <button
                                onClick={() => setActiveTab('management')}
                                className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'management' ? 'bg-white text-purple-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Users className="w-4 h-4" />
                                TUYỂN DỤNG
                            </button>
                        )}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-10 w-px bg-slate-200 mx-2"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 bg-slate-900 px-5 py-3 rounded-2xl text-white font-black text-xs hover:bg-red-600 transition-all shadow-xl shadow-slate-200"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">THOÁT</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {activeTab === 'tasks' && (
                    <MyTasks staffRecords={staffRecords} loading={loading} />
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
                        onEditJob={() => { }} // Not implemented in main staff page, use manager dashboard
                        onDeleteJob={() => { }}
                        onToggleStatus={() => { }}
                    />
                )}
            </main>

            {/* Modals & Drawers */}
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

            {/* Apply Modal */}
            {showApplyModal && selectedJob && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-9 group font-bold">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                                <CalendarCheck className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase">Gửi hồ sơ ứng tuyển</h2>
                            <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">{selectedJob.title}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 uppercase tracking-widest pl-1">Tải lên hồ sơ (CV - PDF)*</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-3 focus:bg-white focus:border-blue-600 outline-none transition-all text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 uppercase tracking-widest pl-1">Lời nhắn gửi Nhà tuyển dụng</label>
                                <textarea
                                    rows={3}
                                    placeholder="Chia sẻ ngắn gọn về kinh nghiệm hoặc lý do bạn muốn tham gia..."
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-600 outline-none transition-all resize-none text-slate-700"
                                    value={applicationNote}
                                    onChange={(e) => setApplicationNote(e.target.value)}
                                />
                            </div>
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-50 flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-xl text-white">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] text-blue-700 uppercase leading-relaxed tracking-tighter">
                                    Ticketbox sẽ tự động đính kèm thông tin liên hệ và lý lịch cơ bản của bạn.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button onClick={() => setShowApplyModal(false)} className="py-4 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">HỦY BỎ</button>
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="py-4 rounded-2xl bg-blue-600 text-white hover:bg-black transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                            >
                                {isApplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>NỘP ĐƠN NGAY</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {notification && (
                <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 font-black tracking-tight text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {notification.message}
                </div>
            )}
        </div>
    );
}
