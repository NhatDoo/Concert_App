import React, { useState, useEffect } from 'react';
import { Users, User as UserIcon, Calendar, CheckCircle, Mail, MapPin, Trash, Clock } from 'lucide-react';
import { StaffRecord } from './types';

interface TeamHubProps {
    organizerId: string;
    token: string | null;
    onAssignTask?: (staffId: string, concertId: string, staffName: string) => void;
}

export const TeamHub: React.FC<TeamHubProps> = ({ organizerId, token, onAssignTask }) => {
    const [team, setTeam] = useState<StaffRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organizerId) return;
        const fetchTeam = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/organize/staff/list/${organizerId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('[TeamHub] API response sample:', data.slice(0, 3).map((s: any) => ({ id: s.id, name: s.name, role: s.role, managerId: s.managerId, organizerId: s.organizerId, vendorId: s.vendorId })));
                    setTeam(data);
                }
            } catch (error) {
                console.error('Failed to fetch team', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [organizerId, token]);

    const handleRemoveStaff = async (staffId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa nhân sự này khỏi team? Toàn bộ task và đơn xin việc liên quan của họ cũng sẽ bị hủy!')) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/staff/${staffId}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setTeam(prev => prev.filter(member => member.id !== staffId));
                alert('Nhân sự đã được gỡ bỏ khỏi Team.');
            } else {
                alert('Không thể xóa nhân sự. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Failed to remove staff', error);
        }
    };

    const [selectedMember, setSelectedMember] = useState<StaffRecord | null>(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24 bg-white/40 shadow-inner rounded-[3.5rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 uppercase tracking-widest text-xs font-black animate-pulse">Đang tải danh sách nhân sự...</p>
            </div>
        );
    }

    if (team.length === 0) {
        return (
            <div className="bg-white/40 shadow-inner rounded-[3.5rem] p-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100">
                    <Users className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black">Chưa có nhân sự nào trong team</p>
            </div>
        );
    }

    const closeDetails = () => setSelectedMember(null);

    const getSubordinates = (member: StaffRecord) => {
        return team.filter(t => {
            // Priority 1: Explicit database managerId link
            if (t.managerId === member.id) return true;

            // Priority 2: VENDOR hierarchy
            const isVendorAdmin = ['VENDOR_ADMIN', 'VENDOR'].includes(member.role);
            const isManager = member.role === 'MANAGER';

            if (isVendorAdmin && member.vendorId) {
                // Vendor Admin sees EVERYONE in their vendor (including MANAGERs)
                if (t.vendorId === member.vendorId && t.id !== member.id && !['VENDOR_ADMIN', 'VENDOR', 'ORGANIZER', 'EVENT_MANAGER'].includes(t.role)) {
                    return true;
                }
            } else if (isManager && member.vendorId) {
                // Manager sees lower-level staff in their vendor
                if (t.vendorId === member.vendorId && t.id !== member.id && !['VENDOR_ADMIN', 'VENDOR', 'MANAGER', 'ORGANIZER', 'EVENT_MANAGER'].includes(t.role)) {
                    return true;
                }
            }

            // Fallback if they share the same manager (Vendor Admin) and member is a MANAGER
            if (isManager && member.managerId && t.managerId === member.managerId && t.id !== member.id && !['VENDOR_ADMIN', 'VENDOR', 'MANAGER'].includes(t.role)) {
                return true;
            }

            // Priority 3: ORGANIZER hierarchy - ORGANIZER and EVENT_MANAGER see all direct staff
            const isOrganizerLeader = ['ORGANIZER', 'EVENT_MANAGER'].includes(member.role);
            if (isOrganizerLeader && member.organizerId) {
                if (t.organizerId === member.organizerId && t.id !== member.id && !['ORGANIZER', 'EVENT_MANAGER', 'VENDOR_ADMIN', 'VENDOR', 'MANAGER'].includes(t.role)) {
                    return true;
                }
            }

            return false;
        });
    };

    // Build set of staff IDs that ARE subordinates of someone — these won't show as top-level cards
    const allSubordinateIds = new Set<string>();
    team.forEach(member => {
        getSubordinates(member).forEach(sub => allSubordinateIds.add(sub.id));
    });

    // Top-level = explicitly managers, and anyone who isn't a subordinate
    const topLevelRoles = ['ORGANIZER', 'EVENT_MANAGER', 'VENDOR_ADMIN', 'VENDOR', 'MANAGER'];
    const topLevelMembers = team.filter(m =>
        (topLevelRoles.includes(m.role) || getSubordinates(m).length > 0) && !allSubordinateIds.has(m.id)
    );

    return (
        <div className="animate-in slide-in-from-bottom-10 duration-700 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topLevelMembers.map(member => {
                    const subordinates = getSubordinates(member);

                    return (
                        <div
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className="cursor-pointer bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-200/40 hover:border-blue-100 transition-all duration-500 group relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-600 transition-colors duration-500"></div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem] flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
                                    <UserIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{member.name}</h3>
                                    <div className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase font-black tracking-widest rounded-full mt-2">
                                        {(member.role || 'Staff').replace('_', ' ')}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100/50 mb-4 flex-grow relative z-10 transition-colors group-hover:border-blue-100">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                    <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="uppercase tracking-widest text-[10px]">Đã xác thực tham gia</span>
                                </div>

                                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 opacity-75">
                                    <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                    </div>
                                    <span className="uppercase tracking-widest text-[9px]">Sẵn sàng nhận nhiệm vụ</span>
                                </div>

                                <div className="pt-2 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest mt-2">
                                    {subordinates.length > 0 && (
                                        <span className="bg-white border border-slate-100 text-blue-500 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                            <Users className="w-3 h-3" />
                                            QL {subordinates.length} người
                                        </span>
                                    )}
                                    {(member.tasks?.length || 0) > 0 && (
                                        <span className="bg-white border border-slate-100 text-indigo-500 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {member.tasks?.length} Task
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2 mt-auto relative z-10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAssignTask?.(member.id, member.concertId || "", member.name); }}
                                    className="flex-1 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 border border-slate-200"
                                >
                                    <Calendar className="w-4 h-4" /> Giao hạng mục
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveStaff(member.id); }}
                                    className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center border border-rose-100"
                                    title="Loại bỏ nhân sự"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer transition-opacity"
                        onClick={closeDetails}
                    ></div>
                    <div className="relative w-full max-w-2xl bg-[#f8fafc] rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        {/* Header */}
                        <div className="p-8 pb-6 border-b border-slate-200/80 bg-white z-10 flex shrink-0 items-center justify-between shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{selectedMember.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-2">{selectedMember.role.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeDetails}
                                className="w-10 h-10 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center rounded-xl transition-colors border border-slate-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        </div>
                                        Công Việc Được Giao
                                    </h4>
                                    <div className="bg-indigo-50 px-3 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100/50">
                                        {selectedMember.tasks?.length || 0} Task
                                    </div>
                                </div>

                                {(!selectedMember.tasks || selectedMember.tasks.length === 0) ? (
                                    <div className="bg-white rounded-3xl p-8 border border-slate-200 border-dashed text-center shadow-sm">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Calendar className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Chưa có nhiệm vụ nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedMember.tasks.map(task => (
                                            <div key={task.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors group">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h5 className="font-black text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{task.taskName || 'Nhiệm vụ chưa phân loại'}</h5>
                                                        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{task.description}</p>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 border ${task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        task.status === 'WORKING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-slate-50 text-slate-500 border-slate-200'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                                {task.dueDate && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100/80 flex items-center justify-between text-[10px] font-bold text-slate-400">
                                                        <div className="flex items-center gap-2 uppercase tracking-widest">
                                                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                            Deadline: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        Nhân Sự Quản Lý
                                    </h4>
                                    <div className="bg-blue-50 px-3 py-1.5 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100/50">
                                        {getSubordinates(selectedMember).length} người
                                    </div>
                                </div>

                                {getSubordinates(selectedMember).length === 0 ? (
                                    <div className="bg-white rounded-3xl p-8 border border-slate-200 border-dashed text-center shadow-sm">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Không trực tiếp quản lý ai</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {getSubordinates(selectedMember).map(sub => (
                                            <div key={sub.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all flex items-center gap-4 group">
                                                <div className="w-12 h-12 bg-slate-50 rounded-[1.2rem] flex items-center justify-center text-slate-400 border border-slate-100 shrink-0 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                                                    <UserIcon className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">{sub.name}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{sub.role.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-200/80 shrink-0 flex gap-4 text-right justify-end shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                            <button
                                onClick={closeDetails}
                                className="px-8 py-3.5 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => { closeDetails(); onAssignTask?.(selectedMember.id, selectedMember.concertId || "", selectedMember.name); }}
                                className="px-8 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                Giao Việc
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
