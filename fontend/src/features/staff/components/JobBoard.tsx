import React from 'react';
import { Search, Briefcase, Info, DollarSign, MapPin, Loader2 } from 'lucide-react';
import { JobCard } from './JobCard';

import { JobPost } from './types';

interface JobBoardProps {
    jobs: JobPost[];
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onSelectJob: (job: JobPost) => void;
    loading: boolean;
}

export const JobBoard: React.FC<JobBoardProps> = ({
    jobs,
    searchTerm,
    onSearchChange,
    onSelectJob,
    loading
}) => {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 font-bold">
            {/* Search Hero */}
            <div className="relative group">
                <div className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative bg-white rounded-[3rem] p-4 md:p-8 shadow-2xl border border-slate-50 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            placeholder="Tìm kiếm vị trí âm thanh, ánh sáng, bảo an..."
                            className="w-full pl-16 pr-8 py-5 md:py-6 bg-slate-50 rounded-[2rem] border-2 border-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all text-lg shadow-inner ring-offset-2 focus:ring-4 focus:ring-blue-100"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="uppercase tracking-widest text-xs">Đang tìm kiếm cơ hội...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-white rounded-[4rem] p-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 font-black shadow-inner">
                    <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-10">
                        <Briefcase className="w-16 h-16" />
                    </div>
                    <h3 className="text-3xl text-slate-900 uppercase mb-4">Không tìm thấy kết quả</h3>
                    <p className="text-slate-400 uppercase tracking-widest text-xs">Hãy thử đổi từ khóa tìm kiếm khác nhé!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} onClick={onSelectJob} />
                    ))}
                </div>
            )}
        </div>
    );
};
