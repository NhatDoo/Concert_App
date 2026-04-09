import React, { useState, useEffect } from 'react';
import { useOperations } from '../hooks/useOperations';
import {
    Map,
    Layers,
    Plus,
    Users,
    Clock,
    Calendar,
    ChevronRight,
    Search,
    UserPlus,
    X
} from 'lucide-react';

interface Props {
    concertId: string;
    token: string | null;
}

export const ZoneManager: React.FC<Props> = ({ concertId, token }) => {
    const {
        createZone,
        createShift,
        assignStaffToShift
    } = useOperations(token);

    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState<string | null>(null); // zoneId
    const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // shiftId

    const [zoneName, setZoneName] = useState('');
    const [shiftTitle, setShiftTitle] = useState('');
    const [staffId, setStaffId] = useState(''); // In reality, this would be a search/dropdown

    const fetchZones = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/concerts/${concertId}/zones`, {
                headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
            });
            const data = await res.json();
            setZones(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (concertId) fetchZones();
    }, [concertId]);

    const handleCreateZone = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createZone({ concertId, name: zoneName, description: '', capacity: 100 });
        if (success) {
            setShowZoneModal(false);
            setZoneName('');
            fetchZones();
        }
    };

    const handleCreateShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showShiftModal) return;
        const success = await createShift({
            concertId,
            zoneId: showShiftModal,
            title: shiftTitle,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
            headcount: 5
        });
        if (success) {
            setShowShiftModal(null);
            setShiftTitle('');
            fetchZones();
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showAssignModal) return;
        const success = await assignStaffToShift(concertId, showAssignModal, staffId);
        if (success) {
            setShowAssignModal(null);
            setStaffId('');
            fetchZones();
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Khu vực & Phân ca</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        Thiết lập các vị trí On-site và gán nhân sự trực tiếp vào vị trí.
                    </p>
                </div>
                <button
                    onClick={() => setShowZoneModal(true)}
                    className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    Thêm Khu Vực Mới
                </button>
            </div>

            {/* Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {zones.map((zone) => (
                    <div key={zone.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col h-full group transition-all hover:shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Map className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">{zone.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Zone ID: {zone.id.substring(0, 8)}</p>
                            </div>
                        </div>

                        <div className="flex-grow space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Ca làm việc</p>
                                <button
                                    onClick={() => setShowShiftModal(zone.id)}
                                    className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-black hover:text-white transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {zone.shifts?.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Chưa có ca trực</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {zone.shifts?.map((shift: any) => (
                                        <div key={shift.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-blue-100 transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-xs font-black uppercase text-slate-900">{shift.title}</p>
                                                <button
                                                    onClick={() => setShowAssignModal(shift.id)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(shift.startTime).getHours()}:00 - {new Date(shift.endTime).getHours()}:00
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {shift.assignments?.length || 0}/{shift.headcount}
                                                </div>
                                            </div>
                                            {shift.assignments?.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-200/50 flex flex-wrap gap-2">
                                                    {shift.assignments.map((as: any) => (
                                                        <span key={as.id} className="px-3 py-1 bg-white text-[9px] font-black rounded-lg border border-slate-100">
                                                            {as.staff?.name || 'Staff'}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Zone Modal */}
            {showZoneModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/40">
                    <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 bg-black text-white flex justify-between items-center font-black uppercase italic tracking-tighter">
                            <h3>Thêm Phân Khu Mới</h3>
                            <button onClick={() => setShowZoneModal(false)}><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleCreateZone} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Tên khu vực (VD: FOH, VIP)</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                    value={zoneName}
                                    onChange={(e) => setZoneName(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100">Xác nhận tạo khu vực</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Shift Modal */}
            {showShiftModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/40">
                    <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 bg-blue-600 text-white flex justify-between items-center font-black uppercase tracking-tight">
                            <h3>Tạo Ca Làm Việc Mới</h3>
                            <button onClick={() => setShowShiftModal(null)}><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleCreateShift} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Tiêu đề ca trực</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                    value={shiftTitle}
                                    placeholder="Morning Shift, Night Shift..."
                                    onChange={(e) => setShiftTitle(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-slate-200">Bản lưu ca trực</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal (Simple) */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/40">
                    <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 bg-green-600 text-white flex justify-between items-center font-black uppercase tracking-tight">
                            <h3>Điều phối Nhân sự</h3>
                            <button onClick={() => setShowAssignModal(null)}><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleAssign} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Nhập Staff ID để điều phối</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                    value={staffId}
                                    placeholder="Copy ID nhân viên từ tab Nhân Sự"
                                    onChange={(e) => setStaffId(e.target.value)}
                                />
                                <p className="text-[9px] text-slate-400 font-medium px-2 italic mt-2">Ghi chú: Trong bản build sau sẽ có danh sách để chọn nhanh.</p>
                            </div>
                            <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Xác nhận điều phối</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
