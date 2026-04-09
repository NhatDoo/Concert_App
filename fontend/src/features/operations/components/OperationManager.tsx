import React, { useState, useEffect } from 'react';
import { useOperations } from '../hooks/useOperations';
import { RequirementList } from './RequirementList';
import { RequirementModal } from './RequirementModal';
import {
    Plus,
    ShieldCheck,
    TrendingUp,
    LayoutGrid,
    FileText,
    Users,
    Box,
    ChevronRight,
    Search,
    Layers,
    Clock,
    CheckCircle2
} from 'lucide-react';

import { ZoneManager } from './ZoneManager';

import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';

interface Props {
    concertId: string;
    token: string | null;
}

export const OperationManager: React.FC<Props> = ({ concertId, token }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const {
        loading,
        requirements,
        vendors,
        fetchRequirements,
        fetchVendors,
        createRequirement
    } = useOperations(token);

    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'ZONES'>('ALL');

    useEffect(() => {
        if (user?.id) {
            fetchVendors(user.id);
        }
    }, [user?.id, fetchVendors]);

    useEffect(() => {
        if (concertId && activeTab !== 'ZONES') {
            fetchRequirements({
                concertId,
                status: activeTab === 'ALL' ? undefined : (activeTab as any)
            });
        }
    }, [concertId, fetchRequirements, activeTab]);

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Header / Stats Section */}
            <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full -mr-[250px] -mt-[250px] blur-3xl transition-all duration-1000 group-hover:scale-110"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-500/40 border-4 border-white/10 group-hover:rotate-6 transition-transform">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter">Event Operations</h2>
                                <p className="text-slate-400 text-sm mt-2 font-medium max-w-lg leading-relaxed">
                                    Quản lý tập trung các <span className="text-red-500 font-black">Yêu cầu Vận hành</span>.
                                    Điều phối nguồn lực từ Vendor và giám sát tiến độ phê duyệt.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 text-center min-w-[160px]">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Tổng yêu cầu</p>
                                <p className="text-4xl font-black italic">{requirements.length}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="h-full bg-white text-black p-10 rounded-[2.5rem] hover:bg-red-600 hover:text-white transition-all group/btn shadow-2xl flex flex-col items-center justify-center gap-2"
                            >
                                <Plus className="w-8 h-8 group-hover/btn:rotate-90 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Tạo Yêu Cầu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-2">
                        <p className="px-6 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">Bộ lọc Trạng thái</p>
                        <button
                            onClick={() => setActiveTab('ALL')}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                            <span className="text-xs font-black uppercase">Tất cả Yêu cầu</span>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setActiveTab('PENDING')}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeTab === 'PENDING' ? 'bg-orange-500 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                            <span className="text-xs font-black uppercase">Chờ Vendor Duyệt</span>
                            <Clock className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setActiveTab('ACCEPTED')}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeTab === 'ACCEPTED' ? 'bg-green-600 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                            <span className="text-xs font-black uppercase">Đã chấp nhận</span>
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <hr className="my-4 border-slate-100" />
                        <button
                            onClick={() => setActiveTab('ZONES')}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeTab === 'ZONES' ? 'bg-red-600 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                            <span className="text-xs font-black uppercase">Phân khu & Ca trực</span>
                            <Layers className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hiệu năng</p>
                        </div>
                        <h4 className="text-sm font-black uppercase mb-2 italic">Tỷ lệ Phê duyệt</h4>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-1000"
                                style={{ width: `${(requirements.filter(r => r.status === 'ACCEPTED').length / (requirements.length || 1)) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 font-bold">
                            Vendor đã phản hồi {requirements.filter(r => r.status !== 'PENDING').length}/{requirements.length} yêu cầu.
                        </p>
                    </div>
                </div>

                {/* Content List */}
                <div className="flex-grow space-y-8">
                    {activeTab === 'ZONES' ? (
                        <ZoneManager concertId={concertId} token={token} />
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Danh sách Yêu cầu</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Kết quả khớp với bộ lọc hiện tại</p>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="text"
                                        className="bg-white border-2 border-slate-100 rounded-2xl pl-14 pr-8 py-3 outline-none focus:border-red-500 font-bold text-xs w-64 shadow-sm"
                                        placeholder="Tìm kiếm yêu cầu..."
                                    />
                                </div>
                            </div>

                            <RequirementList
                                requirements={requirements}
                                loading={loading}
                            />
                        </>
                    )}
                </div>
            </div>

            {showModal && (
                <RequirementModal
                    concertId={concertId}
                    vendors={vendors}
                    authorId={user?.id || ''}
                    onClose={() => setShowModal(false)}
                    onSubmit={async (data) => {
                        const success = await createRequirement(data);
                        if (success) fetchRequirements({ concertId });
                        return success;
                    }}
                />
            )}
        </div>
    );
};
