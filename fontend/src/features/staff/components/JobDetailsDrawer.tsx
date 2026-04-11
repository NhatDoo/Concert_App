import React from 'react';
import {
    XCircle,
    ChevronRight,
    Building2,
    MapPin,
    DollarSign,
    User as UserIcon,
    CheckCircle,
    Send
} from 'lucide-react';

import { JobPost } from './types';

interface JobDetailsDrawerProps {
    job: JobPost | null;
    onClose: () => void;
    onApply: (job: JobPost) => void;
    isAlreadyApplied: boolean;
}

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({ job, onClose, onApply, isAlreadyApplied }) => {
    if (!job) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-end p-0 md:p-6 transition-all duration-500 font-bold">
            <div className="bg-white w-full max-w-3xl h-full md:rounded-[3rem] overflow-y-auto shadow-2xl relative animate-in slide-in-from-right-full duration-500">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-8 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div onClick={onClose} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer">
                            <ChevronRight className="w-6 h-6 rotate-180 text-slate-900" />
                        </div>
                        <h2 className="text-xl font-black uppercase text-slate-800">Chi tiết công việc</h2>
                    </div>
                    <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-all outline-none">
                        <XCircle className="w-7 h-7" />
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    {/* Job Info Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-32 h-32 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center p-4 shadow-inner">
                            {job.companyLogo ? (
                                <img src={job.companyLogo} className="w-full h-full object-contain" />
                            ) : (
                                <Building2 className="w-12 h-12 text-slate-300" />
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <h1 className="text-3xl font-black text-slate-900 uppercase leading-none">{job.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    {job.companyName || 'Ban tổ chức sự kiện'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    {job.location || 'HCM'}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-green-600 flex items-center gap-2">
                                <DollarSign className="w-6 h-6" />
                                {job.salary || 'Thỏa thuận'}
                            </div>
                        </div>
                    </div>

                    {/* Job Content Body */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                    Mô tả công việc
                                </h3>
                                <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                    {job.description}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                                    Yêu cầu năng lực
                                </h3>
                                <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-green-50/20 p-8 rounded-[2rem] border border-green-50">
                                    {job.requirements}
                                </div>
                            </div>
                        </div>

                        {/* Recruiter Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl space-y-6">
                                <h3 className="text-lg font-black uppercase text-blue-400">Người phụ trách</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <UserIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white truncate max-w-[120px]">{job.author?.name || 'N/A'}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">{job.author?.role || 'ORGANIZER'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-white/10 overflow-hidden">
                                    <div className="text-xs flex items-center gap-3 truncate" title={job.author?.user?.email}>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0"></div>
                                        {job.author?.user?.email || 'N/A'}
                                    </div>
                                    <div className="text-xs flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0"></div>
                                        {job.author?.user?.phoneNumber || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => !isAlreadyApplied && onApply(job)}
                                className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all font-black text-lg shadow-xl ${isAlreadyApplied
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 text-white hover:bg-black hover:shadow-blue-200'
                                    }`}
                                disabled={isAlreadyApplied}
                            >
                                {isAlreadyApplied
                                    ? <><CheckCircle className="w-6 h-6" /> Đã ứng tuyển</>
                                    : <><Send className="w-6 h-6" /> Ứng tuyển ngay</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
