"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Briefcase, Users, Calendar, MapPin, DollarSign, X, CheckCircle2, AlertCircle, Loader2, Edit2, Trash2, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/stores/store';

interface JobPost {
    id: string;
    title: string;
    description: string;
    requirements: string;
    status: string;
    location: string | null;
    salary: string | null;
    createdAt: string;
    _count?: {
        applications: number;
    };
}

interface Application {
    id: string;
    status: string;
    cvUrl: string;
    createdAt: string;
    applicant: {
        name: string;
        user: {
            email: string;
            phoneNumber: string;
        };
    };
}

export default function VendorRecruitment() {
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary: '',
    });

    const { token } = useSelector((state: RootState) => state.auth);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/vendor/jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchJobs();
    }, [token]);

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/vendor/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsAddModalOpen(false);
                setFormData({ title: '', description: '', requirements: '', location: '', salary: '' });
                fetchJobs();
            }
        } catch (error) {
            console.error('Error creating job:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (!confirm('Xóa tin tuyển dụng này?')) return;
        try {
            const response = await fetch(`${API_URL}/vendor/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchJobs();
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    const viewApplications = async (job: JobPost) => {
        setSelectedJob(job);
        try {
            const response = await fetch(`${API_URL}/vendor/jobs/${job.id}/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
                setIsApplicationsModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const handleReview = async (appId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await fetch(`${API_URL}/vendor/applications/${appId}/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (response.ok && selectedJob) {
                viewApplications(selectedJob);
            }
        } catch (error) {
            console.error('Error reviewing application:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tuyển dụng nhân sự</h1>
                    <p className="text-slate-500 font-medium">Đăng tin mời thầu hoặc tuyển nhân viên hỗ trợ sự kiện.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} strokeWidth={3} />
                    Đăng tin mới
                </button>
            </div>

            {/* Jobs List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                        <Briefcase size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có tin tuyển dụng</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Bạn có thể tuyển thêm bảo vệ, kỹ thuật viên hoặc nhân viên kho thông qua hệ thống Job Board.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-indigo-600 font-black uppercase tracking-widest text-xs hover:text-indigo-700 transition-colors"
                    >
                        + Tạo tin đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{job.title}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đăng ngày {new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                        <MapPin size={16} className="text-indigo-500" />
                                        {job.location || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                        <DollarSign size={16} className="text-emerald-500" />
                                        {job.salary || 'Thỏa thuận'}
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{job.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-900">{job._count?.applications || 0} hồ sơ đã nộp</span>
                                </div>
                                <button
                                    onClick={() => viewApplications(job)}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg"
                                >
                                    Xem ứng viên
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Job Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Đăng tin tuyển dụng</h3>
                                <p className="text-slate-500 font-medium text-sm">Mô tả công việc và các yêu cầu kỹ năng.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateJob} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tiêu đề công việc</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        placeholder="VD: Nhân viên kỹ thuật âm thanh sự kiện"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Địa điểm</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        placeholder="TP. Hồ Chí Minh"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mức lương</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        placeholder="10 - 15 triệu"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả công việc</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-bold h-24 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yêu cầu ứng viên</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-bold h-24 resize-none"
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Hủy</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-3 py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang đăng...' : 'Đăng tuyển dụng'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Applications Modal */}
            {isApplicationsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsApplicationsModalOpen(false)}></div>
                    <div className="bg-slate-50 rounded-[3rem] w-full max-w-4xl max-h-[80vh] relative z-10 overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-10 bg-white border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách ứng viên</h3>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Tin: <span className="text-indigo-600">{selectedJob?.title}</span></p>
                            </div>
                            <button onClick={() => setIsApplicationsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 space-y-4">
                            {applications.length === 0 ? (
                                <div className="text-center py-20 text-slate-400 font-bold italic">Chưa có ứng viên nào ứng tuyển.</div>
                            ) : (
                                applications.map((app) => (
                                    <div key={app.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                                {app.applicant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">{app.applicant.name}</h4>
                                                <p className="text-xs font-bold text-slate-500">{app.applicant.user.email} • {app.applicant.user.phoneNumber}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <a
                                                href={app.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                <FileText size={16} />
                                                Xem CV
                                            </a>

                                            {app.status === 'PENDING' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReview(app.id, 'APPROVED')}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 hover:bg-emerald-600 transition-all"
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(app.id, 'REJECTED')}
                                                        className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all font-bold"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                    }`}>
                                                    {app.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
