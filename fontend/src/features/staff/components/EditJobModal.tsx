import React, { useEffect, useState } from 'react';
import { Edit3, XCircle, Loader2, Save } from 'lucide-react';
import { JobPost } from './types';

interface EditJobModalProps {
    show: boolean;
    job: JobPost | null;
    onClose: () => void;
    onSave: (id: string, data: Partial<EditJobForm>) => Promise<void>;
    isSaving: boolean;
}

interface EditJobForm {
    title: string;
    description: string;
    requirements: string;
    salary: string;
    location: string;
    companyName: string;
    companyLogo: string;
    status: 'OPEN' | 'CLOSED';
}

export const EditJobModal: React.FC<EditJobModalProps> = ({ show, job, onClose, onSave, isSaving }) => {
    const [form, setForm] = useState<EditJobForm>({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        companyName: '',
        companyLogo: '',
        status: 'OPEN',
    });

    useEffect(() => {
        if (job) {
            setForm({
                title: job.title || '',
                description: job.description || '',
                requirements: job.requirements || '',
                salary: job.salary || '',
                location: job.location || '',
                companyName: job.companyName || '',
                companyLogo: job.companyLogo || '',
                status: (job as any).status || 'OPEN',
            });
        }
    }, [job]);

    if (!show || !job) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(job.id, form);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 font-sans">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-500 border border-white flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Edit3 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Chỉnh sửa tin</h2>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black pl-12 truncate max-w-xs">{job.title}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 relative z-10 group">
                        <XCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-8 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Trạng thái tin đăng</p>
                            <p className="font-black text-slate-900 mt-1">
                                {form.status === 'OPEN'
                                    ? <span className="text-emerald-600">● Đang tuyển dụng</span>
                                    : <span className="text-rose-600">● Đã đóng</span>}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, status: f.status === 'OPEN' ? 'CLOSED' : 'OPEN' }))}
                            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${form.status === 'OPEN'
                                ? 'bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white'
                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                        >
                            {form.status === 'OPEN' ? 'Đóng tin' : 'Mở lại'}
                        </button>
                    </div>

                    {/* Title & Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Vị trí ứng tuyển</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-slate-900 outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Dự kiến Lương</label>
                            <input
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-slate-900 outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={form.salary}
                                onChange={e => setForm({ ...form, salary: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Location & CompanyName */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Địa chỉ công ty</label>
                            <input
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-slate-900 outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Tên Ban tổ chức</label>
                            <input
                                placeholder="Để trống = hiển thị mặc định"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-slate-900 outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={form.companyName}
                                onChange={e => setForm({ ...form, companyName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Link Logo Tổ chức (URL)</label>
                        <input
                            placeholder="VD: https://example.com/logo.png"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-slate-900 outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                            value={form.companyLogo}
                            onChange={e => setForm({ ...form, companyLogo: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Mô tả công việc</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:bg-white focus:border-slate-900 outline-none resize-none transition-all duration-300 font-bold placeholder:text-slate-300"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Yêu cầu năng lực</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:bg-white focus:border-slate-900 outline-none resize-none transition-all duration-300 font-bold placeholder:text-slate-300"
                            value={form.requirements}
                            onChange={e => setForm({ ...form, requirements: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                <span>Lưu thay đổi</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};
