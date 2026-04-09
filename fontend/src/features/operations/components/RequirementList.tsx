import React from 'react';
import { EventRequirement } from '../types';
import { Clock, CheckCircle2, XCircle, DollarSign, Users, ArrowRight } from 'lucide-react';

interface Props {
    requirements: EventRequirement[];
    loading: boolean;
    onViewDetail?: (req: EventRequirement) => void;
}

export const RequirementList: React.FC<Props> = ({ requirements, loading, onViewDetail }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-slate-50 h-48 rounded-[2.5rem]"></div>
                ))}
            </div>
        );
    }

    if (requirements.length === 0) {
        return (
            <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Clock className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">Chưa có yêu cầu vận hành nào được tạo.</h3>
                <p className="text-slate-300 text-sm mt-2 font-medium">Bắt đầu tạo yêu cầu đầu tiên để triển khai công việc.</p>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return <CheckCircle2 className="w-4 h-4" />;
            case 'REJECTED': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {requirements.map((req) => (
                <div
                    key={req.id}
                    className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-red-50 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border ${getStatusStyle(req.status)}`}>
                                {getStatusIcon(req.status)}
                                {req.status === 'PENDING' ? 'Chờ phê duyệt' : req.status === 'ACCEPTED' ? 'Đã phê duyệt' : 'Đã từ chối'}
                            </span>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>

                        <h4 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-red-600 transition-colors">
                            {req.title}
                        </h4>
                        <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-6">
                            {req.description || 'Không có mô tả chi tiết.'}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nhân sự</p>
                                    <p className="text-sm font-black">{req.staffNeeded}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Ngân sách</p>
                                    <p className="text-sm font-black">
                                        {(req.budgetAllocated / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onViewDetail?.(req)}
                            className="w-full mt-8 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-black group-hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                            Xem chi tiết yêu cầu
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
