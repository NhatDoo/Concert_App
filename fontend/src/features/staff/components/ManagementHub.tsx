import React from 'react';
import {
    PlusCircle,
    XCircle,
    Briefcase,
    CheckCircle,
    User as UserIcon,
    Calendar,
    MapPin,
    Clock,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

import { JobPost, Application } from './types';

interface ManagementHubProps {
    managerJobPosts: JobPost[];
    selectedManagerJob: JobPost | null;
    jobApplications: Application[];
    onSelectJob: (id: string) => void;
    onReview: (id: string, status: string) => void;
    onCreateJob: () => void;
    onEditJob: (job: JobPost) => void;
    onDeleteJob: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: string) => void;
}

export const ManagementHub: React.FC<ManagementHubProps> = ({
    managerJobPosts,
    selectedManagerJob,
    jobApplications,
    onSelectJob,
    onReview,
    onCreateJob,
    onEditJob,
    onDeleteJob,
    onToggleStatus,
}) => {
    return (
        <div className="animate-in slide-in-from-right-10 duration-700 mx-auto flex flex-col md:flex-row gap-12 font-sans">
            {/* Manager's Jobs */}
            <div className="w-full md:w-1/3 space-y-8">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tin tuyển dụng</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Của bạn</p>
                    </div>
                    <button
                        onClick={onCreateJob}
                        className="p-3 bg-rose-600 text-white rounded-2xl hover:bg-slate-900 transition-all duration-300 shadow-xl shadow-rose-600/20 group"
                    >
                        <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="space-y-4">
                    {managerJobPosts.length === 0 ? (
                        <div className="bg-white/40 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
                            <Briefcase className="w-10 h-10 text-slate-200 mb-4" />
                            <p className="text-slate-400 uppercase tracking-widest text-[10px] font-black">Chưa có tin đăng</p>
                        </div>
                    ) : (
                        managerJobPosts.map(j => (
                            <div
                                key={j.id}
                                className={`rounded-[2rem] border-2 transition-all duration-500 overflow-hidden relative group ${selectedManagerJob?.id === j.id
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-[0_20px_40px_-10px_rgba(225,29,72,0.3)]'
                                    : 'bg-white text-slate-600 border-transparent hover:border-rose-100 hover:shadow-xl shadow-sm'
                                    }`}
                            >
                                {/* Clickable area */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => onSelectJob(j.id)}
                                >
                                    {selectedManagerJob?.id === j.id && (
                                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
                                    )}
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="uppercase text-sm font-black truncate tracking-tight flex-1">{j.title}</h3>
                                        {/* Status badge */}
                                        <span className={`shrink-0 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${(j as any).status === 'CLOSED'
                                                ? selectedManagerJob?.id === j.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                                                : selectedManagerJob?.id === j.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {(j as any).status === 'CLOSED' ? 'Đã đóng' : 'Đang tuyển'}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-[10px] uppercase font-black tracking-widest ${selectedManagerJob?.id === j.id ? 'text-rose-100' : 'text-slate-400'}`}>
                                        <MapPin className="w-3 h-3" />
                                        <span>{j.location || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className={`flex items-center gap-1 px-4 pb-4 ${selectedManagerJob?.id === j.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                                    {/* Edit */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onEditJob(j); }}
                                        title="Chỉnh sửa"
                                        className={`p-2 rounded-xl transition-all duration-200 ${selectedManagerJob?.id === j.id
                                            ? 'hover:bg-white/20 text-white'
                                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Toggle status */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onToggleStatus(j.id, (j as any).status || 'OPEN'); }}
                                        title={(j as any).status === 'CLOSED' ? 'Mở lại tin' : 'Đóng tin'}
                                        className={`p-2 rounded-xl transition-all duration-200 ${selectedManagerJob?.id === j.id
                                            ? 'hover:bg-white/20 text-white'
                                            : 'hover:bg-slate-100 text-slate-400 hover:text-amber-500'}`}
                                    >
                                        {(j as any).status === 'CLOSED'
                                            ? <ToggleLeft className="w-3.5 h-3.5" />
                                            : <ToggleRight className="w-3.5 h-3.5" />}
                                    </button>
                                    {/* Delete */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onDeleteJob(j.id); }}
                                        title="Xóa tin"
                                        className={`p-2 rounded-xl transition-all duration-200 ${selectedManagerJob?.id === j.id
                                            ? 'hover:bg-white/20 text-white'
                                            : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Applications Review Area */}
            <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-2 h-8 bg-rose-600 rounded-full"></div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {selectedManagerJob ? `Hồ sơ cho: ${selectedManagerJob.title}` : 'Trung tâm điều phối'}
                    </h2>
                </div>

                <div className="space-y-6">
                    {!selectedManagerJob ? (
                        <div className="bg-white/40 shadow-inner rounded-[3.5rem] p-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100">
                                <Briefcase className="w-10 h-10 text-slate-200" />
                            </div>
                            <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">Chọn một tin đăng để bắt đầu duyệt</p>
                        </div>
                    ) : jobApplications.length === 0 ? (
                        <div className="bg-white/40 shadow-inner rounded-[3.5rem] p-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100">
                                <UserIcon className="w-10 h-10 text-slate-200" />
                            </div>
                            <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">Chưa có ứng viên nào ứng tuyển</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {jobApplications.map(app => (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-rose-100 transition-all duration-500 group animate-in slide-in-from-bottom-8"
                                >
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors duration-500 shadow-inner">
                                            <UserIcon className="w-10 h-10" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                                    </div>

                                    <div className="flex-1 space-y-2 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                            <span className="bg-rose-50 text-rose-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Premium Staff</span>
                                            <span className="text-slate-300 text-[10px]">•</span>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{app.applicant.name}</h4>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${app.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {app.status === 'PENDING' ? <Clock className="w-3 h-3" /> : app.status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {app.status === 'PENDING' ? 'Chờ duyệt' : app.status === 'APPROVED' ? 'Chấp thuận' : 'Từ chối'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3 md:pl-8 md:border-l border-slate-100">
                                        {app.cvUrl && (
                                            <a
                                                href={app.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-widest text-center"
                                            >
                                                Xem CV (PDF)
                                            </a>
                                        )}
                                        {app.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => onReview(app.id, 'APPROVED')}
                                                    className="px-6 py-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-all duration-300 shadow-lg shadow-emerald-500/10 font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Duyệt hồ sơ
                                                </button>
                                                <button
                                                    onClick={() => onReview(app.id, 'REJECTED')}
                                                    className="px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Loại bỏ
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
