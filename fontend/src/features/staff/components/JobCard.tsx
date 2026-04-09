import React from 'react';
import { Building2, Info, DollarSign, MapPin, ChevronRight } from 'lucide-react';

import { JobPost } from './types';

interface JobCardProps {
    job: JobPost;
    onClick: (job: JobPost) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
    return (
        <div
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex gap-6 font-bold cursor-pointer"
            onClick={() => onClick(job)}
        >
            <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 p-2 shrink-0 group-hover:scale-105 transition-transform">
                {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                ) : (
                    <Building2 className="w-10 h-10 text-slate-300" />
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div>
                    <h3 className="text-xl text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase truncate max-w-xs">
                        {job.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-3 flex items-center gap-2 uppercase tracking-tight truncate">
                        <Info className="w-3 h-3 text-blue-500" />
                        {job.companyName || 'Ban tổ chức sự kiện'}
                        {job.category === 'VENDOR' && (
                            <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded-md border border-indigo-100 ml-2">VENDOR</span>
                        )}
                        {job.category === 'MANAGER' && (
                            <span className="bg-rose-50 text-rose-600 text-[8px] font-black px-2 py-0.5 rounded-md border border-rose-100 ml-2">QUẢN LÝ</span>
                        )}
                        {job.category === 'STAFF' && (
                            <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-md border border-slate-200 ml-2">NHÂN VIÊN</span>
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-green-50 text-green-600 text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase">
                        <DollarSign className="w-3 h-3" />
                        {job.salary || 'Thỏa thuận'}
                    </div>
                    <div className="bg-blue-50 text-blue-600 text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase">
                        <MapPin className="w-3 h-3" />
                        {job.location || 'TP. Hồ Chí Minh'}
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="bg-slate-50 text-slate-600 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                </div>
                <p className="text-[9px] text-slate-300 uppercase italic">Vừa đăng</p>
            </div>
        </div>
    );
};
