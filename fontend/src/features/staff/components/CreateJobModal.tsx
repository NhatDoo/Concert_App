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
        concertId?: string;
    };
    setNewJob: (job: any) => void;
    isCreatingJob: boolean;
    accentColor?: string;
    concerts?: { id: string; name: string }[];
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
    show,
    onClose,
    onSubmit,
    newJob,
    setNewJob,
    isCreatingJob,
    accentColor = 'rose-600',
    concerts = []
}) => {
    if (!show) return null;

    const bgAccent = `bg-${accentColor}`;
    const textAccent = `text-${accentColor}`;
    const shadowAccent = `shadow-${accentColor}/40`;
    const focusBorderAccent = `focus:border-${accentColor}`;
    const focusShadowAccent = `focus:shadow-${accentColor}/20`;
    const lightTextAccent = `text-${accentColor.split('-')[0]}-100`;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 font-sans">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-500 border border-white flex flex-col">
                {/* Modal Header */}
                <div className={`${bgAccent} p-10 text-white flex justify-between items-center relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <PlusCircle className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold uppercase tracking-tight">Đăng tin tuyển dụng</h2>
                        </div>
                        <p className={`text-[10px] ${lightTextAccent} uppercase tracking-widest font-bold opacity-80 pl-12`}>Tìm kiếm cộng sự hoàn hảo cho sự kiện</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 relative z-10 group">
                        <XCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-12 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Vị trí ứng tuyển</label>
                            <input
                                required
                                placeholder="VD: Crew Sound System"
                                className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white ${focusBorderAccent} ${focusShadowAccent} outline-none transition-all duration-300 font-bold placeholder:text-slate-300`}
                                value={newJob.title}
                                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Dự kiến Lương</label>
                            <input
                                placeholder="VD: 5.000.000 VNĐ / Show"
                                className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white ${focusBorderAccent} ${focusShadowAccent} outline-none transition-all duration-300 font-bold placeholder:text-slate-300`}
                                value={newJob.salary}
                                onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Danh mục công việc</label>
                            <select
                                required
                                className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white ${focusBorderAccent} ${focusShadowAccent} outline-none transition-all duration-300 font-bold appearance-none cursor-pointer`}
                                value={(newJob as any).category || 'STAFF'}
                                onChange={e => setNewJob({ ...newJob, category: e.target.value })}
                            >
                                <option value="STAFF">Nhân sự (STAFF)</option>
                                <option value="EVENT_MANAGER">Quản lý sự kiện (EVENT MANAGER)</option>
                                <option value="MANAGER">Quản lý chuyên môn (MANAGER)</option>
                            </select>
                        </div>
                        {concerts && concerts.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Dự án / Sự kiện</label>
                                <select
                                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white ${focusBorderAccent} ${focusShadowAccent} outline-none transition-all duration-300 font-bold appearance-none cursor-pointer`}
                                    value={newJob.concertId || ''}
                                    onChange={e => setNewJob({ ...newJob, concertId: e.target.value })}
                                >
                                    <option value="">-- Chọn sự kiện --</option>
                                    {concerts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Địa chỉ công ty</label>
                        <input
                            placeholder="VD: SVĐ Mỹ Đình, Hà Nội"
                            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:bg-white ${focusBorderAccent} ${focusShadowAccent} outline-none transition-all duration-300 font-bold placeholder:text-slate-300`}
                            value={newJob.location}
                            onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Mô tả công việc</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Mô tả ngắn gọn về nhiệm vụ..."
                            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:bg-white ${focusBorderAccent} ${focusShadowAccent} outline-none resize-none transition-all duration-300 font-bold placeholder:text-slate-300`}
                            value={newJob.description}
                            onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Yêu cầu năng lực</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Những kỹ năng cần thiết..."
                            className={`w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:bg-white ${focusBorderAccent} ${focusShadowAccent} outline-none resize-none transition-all duration-300 font-bold placeholder:text-slate-300`}
                            value={newJob.requirements}
                            onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isCreatingJob}
                        className={`w-full ${bgAccent} text-white py-6 rounded-3xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed`}
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
