import React from 'react';
import { PlusCircle, XCircle, Loader2 } from 'lucide-react';

interface CreateJobModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newJob: {
        title: string;
        description: string;
        requirements: string;
        salary: string;
        location: string;
        companyName: string;
        companyLogo: string;
    };
    setNewJob: (job: any) => void;
    isCreatingJob: boolean;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
    show,
    onClose,
    onSubmit,
    newJob,
    setNewJob,
    isCreatingJob
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 font-sans">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-500 border border-white flex flex-col">
                {/* Modal Header */}
                <div className="bg-rose-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <PlusCircle className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Đăng tin tuyển dụng</h2>
                        </div>
                        <p className="text-[10px] text-rose-100 uppercase tracking-widest font-black opacity-80 pl-12">Tìm kiếm cộng sự hoàn hảo cho sự kiện</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 relative z-10 group">
                        <XCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-12 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Vị trí ứng tuyển</label>
                            <input
                                required
                                placeholder="VD: Crew Sound System"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 focus:shadow-[0_0_20px_-5px_rgba(225,29,72,0.2)] outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={newJob.title}
                                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Dự kiến Lương</label>
                            <input
                                placeholder="VD: 5.000.000 VNĐ / Show"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 focus:shadow-[0_0_20px_-5px_rgba(225,29,72,0.2)] outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={newJob.salary}
                                onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Địa điểm làm việc</label>
                            <input
                                placeholder="VD: SVĐ Mỹ Đình, Hà Nội"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 focus:shadow-[0_0_20px_-5px_rgba(225,29,72,0.2)] outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={newJob.location}
                                onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Tên Tổ chức / Show</label>
                            <input
                                placeholder="VD: Sky Tour 2026"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 focus:shadow-[0_0_20px_-5px_rgba(225,29,72,0.2)] outline-none transition-all duration-300 font-bold placeholder:text-slate-300"
                                value={newJob.companyName}
                                onChange={e => setNewJob({ ...newJob, companyName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Mô tả công việc</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Mô tả ngắn gọn về nhiệm vụ..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:bg-white focus:border-rose-500 focus:shadow-[0_0_20px_-5px_rgba(225,29,72,0.2)] outline-none resize-none transition-all duration-300 font-bold placeholder:text-slate-300"
                            value={newJob.description}
                            onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Yêu cầu năng lực</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Những kỹ năng cần thiết..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:bg-white focus:border-rose-500 focus:shadow-[0_0_20px_-5px_rgba(225,29,72,0.2)] outline-none resize-none transition-all duration-300 font-bold placeholder:text-slate-300"
                            value={newJob.requirements}
                            onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isCreatingJob}
                        className="w-full bg-rose-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(225,29,72,0.4)] hover:shadow-slate-900/20 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreatingJob ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                <span>Phát hành tin tuyển dụng</span>
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
