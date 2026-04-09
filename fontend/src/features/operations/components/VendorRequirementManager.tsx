import React, { useEffect } from 'react';
import { useOperations } from '../hooks/useOperations';
import {
    Clock,
    CheckCircle2,
    XCircle,
    DollarSign,
    Users,
    Search,
    Package,
    ArrowRight,
    AlertCircle
} from 'lucide-react';

interface Props {
    token: string | null;
}

export const VendorRequirementManager: React.FC<Props> = ({ token }) => {
    const {
        loading,
        requirements,
        fetchVendorRequirements,
        updateRequirementStatus
    } = useOperations(token);

    useEffect(() => {
        fetchVendorRequirements();
    }, [fetchVendorRequirements]);

    const handleAction = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
        const msg = status === 'ACCEPTED' ? 'Xác nhận tiếp nhận yêu cầu này?' : 'Từ chối yêu cầu này?';
        if (!confirm(msg)) return;

        const success = await updateRequirementStatus(id, status);
        if (success) {
            fetchVendorRequirements();
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header section with Stats */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Yêu cầu từ Ban Tổ Chức</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Phê duyệt các yêu cầu phục vụ concert từ Event Manager.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-4 bg-orange-50 rounded-2xl text-center">
                        <p className="text-[10px] text-orange-400 font-black uppercase">Chờ xử lý</p>
                        <p className="text-2xl font-black text-orange-600">
                            {requirements.filter(r => r.status === 'PENDING').length}
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-green-50 rounded-2xl text-center">
                        <p className="text-[10px] text-green-400 font-black uppercase">Đã duyệt</p>
                        <p className="text-2xl font-black text-green-600">
                            {requirements.filter(r => r.status === 'ACCEPTED').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* List of Requirements */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Danh sách lệnh điều phối
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Tìm yêu cầu..."
                            className="pl-11 pr-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-red-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 font-bold text-slate-400">Đang tải yêu cầu...</div>
                ) : requirements.length === 0 ? (
                    <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Hiện chưa có yêu cầu nào được gửi đến bạn.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {requirements.map((req) => (
                            <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${req.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                                                req.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {req.status === 'PENDING' ? 'Mới' : req.status}
                                        </span>
                                        <h4 className="text-xl font-black uppercase tracking-tight">{req.title}</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">{req.description}</p>

                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-300" />
                                            <span className="text-xs font-black">{req.staffNeeded} Nhân sự</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-slate-300" />
                                            <span className="text-xs font-black">{(req.budgetAllocated / 1000000).toFixed(1)}M VNĐ</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-4 border-l border-slate-100 italic">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Sự kiện: {req.concert?.name || 'Tên sự kiện'}</span>
                                        </div>
                                    </div>
                                </div>

                                {req.status === 'PENDING' ? (
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button
                                            onClick={() => handleAction(req.id, 'REJECTED')}
                                            className="flex-1 md:flex-none px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                        >
                                            Từ chối
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'ACCEPTED')}
                                            className="flex-1 md:flex-none px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
                                        >
                                            Chấp nhận
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 px-8 py-4 bg-slate-50 rounded-2xl">
                                        {req.status === 'ACCEPTED' ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã phản hồi</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã từ chối</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
