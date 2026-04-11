import React, { useState, useEffect } from 'react';
import { Users, User as UserIcon, Calendar, CheckCircle, Mail, MapPin, Trash, Clock, Briefcase, ChevronRight } from 'lucide-react';
import { Task } from './types';

interface EventStaffRecord {
    id: string;
    name: string;
    role: string;
    userId: string;
    managerId?: string;
    vendorId?: string;
    organizerId?: string;
    concertId?: string;
    tasks: Task[];
    concert?: { id: string; name: string; startDate: string };
    manager?: { id: string; name: string; role: string };
}

interface EventManagerTeamHubProps {
    concertId: string;
    organizerId?: string;
    token: string | null;
    onAssignTask?: (staffId: string, concertId: string, staffName: string) => void;
    isReadOnly?: boolean;
}

export const EventManagerTeamHub: React.FC<EventManagerTeamHubProps> = ({ concertId, organizerId, token, onAssignTask, isReadOnly }) => {
    const [team, setTeam] = useState<EventStaffRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<EventStaffRecord | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string, code: string } | null>(null);
    const [deleteInput, setDeleteInput] = useState('');

    useEffect(() => {
        const targetId = concertId || organizerId;
        console.log('[EventManagerTeamHub] Fetching with concertId:', concertId, 'organizerId:', organizerId, 'targetId:', targetId);
        if (!targetId) {
            setLoading(false);
            return;
        }

        const fetchTeam = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

                let res;
                if (concertId) {
                    console.log('[EventManagerTeamHub] Trying concert API:', `${apiUrl}/organize/concert/${concertId}/staffs`);
                    res = await fetch(`${apiUrl}/organize/concert/${concertId}/staffs`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                }

                if (!res || !res.ok) {
                    console.log('[EventManagerTeamHub] Trying organizer API:', `${apiUrl}/organize/staff/list/${targetId}`);
                    res = await fetch(`${apiUrl}/organize/staff/list/${targetId}`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                }

                if (res.ok) {
                    const data = await res.json();
                    console.log('[EventManagerTeamHub] Team data received:', data);
                    setTeam(Array.isArray(data) ? data : []);
                } else {
                    console.error('[EventManagerTeamHub] API error:', res.status, res.statusText);
                    setTeam([]);
                }
            } catch (error) {
                console.error('Failed to fetch team', error);
                setTeam([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [concertId, organizerId, token]);

    const handleRemoveStaff = (staffId: string, name: string) => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setDeleteConfirm({ id: staffId, name, code });
        setDeleteInput('');
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        if (deleteInput !== deleteConfirm.code) {
            alert('Mã xác nhận không đúng!');
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/staff/${deleteConfirm.id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setTeam(prev => prev.filter(member => member.id !== deleteConfirm.id));
                setDeleteConfirm(null);
                setSelectedMember(null);
                alert('Nhân sự đã được gỡ bỏ khỏi sự kiện.');
            } else {
                alert('Không thể xóa nhân sự. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Failed to remove staff', error);
        }
    };

    const completedCount = (tasks: Task[]) => (tasks || []).filter(t => t.status === 'COMPLETED').length;
    const progressPct = (tasks: Task[]) => tasks?.length ? Math.round((completedCount(tasks) / tasks.length) * 100) : 0;

    const getManager = (member: EventStaffRecord): EventStaffRecord | undefined => {
        if (!member.managerId) return undefined;
        return team.find(t => t.id === member.managerId);
    };

    const getSubordinates = (member: EventStaffRecord) => {
        return team.filter(t => {
            if (t.managerId === member.id) return true;

            const isManagerRole = ['MANAGER', 'EVENT_MANAGER', 'PRODUCTION_MANAGER', 'TECHNICAL_MANAGER', 'MARKETING_MANAGER', 'TALENT_MANAGER'].includes(member.role);
            const mConcertId = member.concertId || member.concert?.id;
            const tConcertId = t.concertId || t.concert?.id;

            if (isManagerRole && mConcertId && tConcertId === mConcertId) {
                if (t.id !== member.id && !['EVENT_MANAGER'].includes(t.role)) {
                    return true;
                }
            }

            return false;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24 bg-white/40 shadow-inner rounded-[3.5rem] border-2 border-dashed border-amber-100">
                <p className="text-amber-600 uppercase tracking-widest text-xs font-black animate-pulse">Đang tải đội ngũ sự kiện...</p>
            </div>
        );
    }

    if (team.length === 0) {
        return (
            <div className="bg-white/40 shadow-inner rounded-[3.5rem] p-12 flex flex-col items-center justify-center border-2 border-dashed border-amber-100">
                <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-6 border border-amber-100">
                    <Users className="w-8 h-8 text-amber-300" />
                </div>
                <p className="text-amber-500 uppercase tracking-[0.2em] text-[11px] font-black text-center">Chưa có nhân sự nào trong sự kiện này</p>
                <p className="text-slate-400 text-xs mt-2">Hãy chọn sự kiện khác hoặc thêm nhân sự vào đội ngũ</p>
            </div>
        );
    }

    const allSubordinateIds = new Set<string>();
    team.forEach(member => {
        getSubordinates(member).forEach(sub => allSubordinateIds.add(sub.id));
    });

    const topLevelRoles = ['EVENT_MANAGER', 'PRODUCTION_MANAGER', 'TECHNICAL_MANAGER', 'MARKETING_MANAGER', 'TALENT_MANAGER', 'MANAGER'];

    // Top levels are those who don't have a manager in this list, OR those who have a manager role
    // and are not subordinates of someone else in the current list.
    const topLevelMembers = team.filter(m => !allSubordinateIds.has(m.id));

    // Staff members are everyone else
    const staffMembers = team.filter(m => allSubordinateIds.has(m.id));

    const closeDetails = () => setSelectedMember(null);

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            'PRODUCTION_MANAGER': 'bg-purple-50 text-purple-600 border-purple-100',
            'TECHNICAL_MANAGER': 'bg-blue-50 text-blue-600 border-blue-100',
            'MARKETING_MANAGER': 'bg-pink-50 text-pink-600 border-pink-100',
            'TALENT_MANAGER': 'bg-orange-50 text-orange-600 border-orange-100',
            'MANAGER': 'bg-amber-50 text-amber-600 border-amber-100',
            'STAFF': 'bg-slate-50 text-slate-600 border-slate-100',
        };
        return colors[role] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    return (
        <div className="animate-in slide-in-from-bottom-10 duration-700 font-sans">
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                    </div>
                    Đội Ngũ Quản Lý
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topLevelMembers.map(member => {
                        const subordinates = getSubordinates(member);
                        const pct = progressPct(member.tasks || []);

                        return (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className="cursor-pointer bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-amber-200/40 hover:border-amber-100 transition-all duration-500 group relative overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:bg-amber-500 transition-colors duration-500"></div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-amber-100 rounded-[1.2rem] flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
                                        <UserIcon className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">{member.name}</h4>
                                        <div className={`inline-flex px-2.5 py-0.5 text-[10px] uppercase font-black tracking-widest rounded-full mt-1.5 border ${getRoleBadgeColor(member.role)}`}>
                                            {member.role.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="ml-auto shrink-0 text-right">
                                        <span className="text-2xl font-black text-slate-800">{pct}%</span>
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-black">{completedCount(member.tasks || [])}/{member.tasks?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100/50 mb-4 flex-grow relative z-10 transition-colors group-hover:border-amber-100">
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${pct}%`,
                                                background: pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#94a3b8'
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Tiến độ</span>
                                        <span>{subordinates.length} người QL</span>
                                    </div>
                                </div>

                                <div className="text-center text-[9px] uppercase tracking-widest text-amber-500 font-black mt-auto">
                                    Nhấn xem chi tiết <ChevronRight className="w-3 h-3 inline" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-600" />
                    </div>
                    Nhân Viên & Cộng Tác Viên
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {staffMembers.map(staff => {
                        const pct = progressPct(staff.tasks || []);
                        const manager = getManager(staff);

                        return (
                            <div
                                key={staff.id}
                                onClick={() => setSelectedMember(staff)}
                                className="cursor-pointer bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-amber-100/50 hover:border-amber-200 transition-all duration-300 group relative overflow-hidden flex flex-col gap-3"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full -z-10 group-hover:bg-amber-100 transition-colors duration-500" />

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-amber-100 transition-colors">
                                        <UserIcon className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors truncate">{staff.name}</h5>
                                        <div className={`inline-flex px-2 py-0.5 text-[9px] uppercase font-black tracking-widest rounded-full border ${getRoleBadgeColor(staff.role)}`}>
                                            {staff.role.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${pct}%`,
                                            background: pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#e2e8f0'
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    <span>{completedCount(staff.tasks || [])}/{staff.tasks?.length || 0} Task</span>
                                    <span>{pct}%</span>
                                </div>

                                {manager && (
                                    <div className="text-[9px] text-slate-500 font-medium bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
                                        <span className="text-slate-400">QL:</span> {manager.name}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer transition-opacity"
                        onClick={closeDetails}
                    ></div>
                    <div className="relative w-full max-w-2xl bg-[#f8fafc] rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-8 pb-6 border-b border-slate-200/80 bg-white z-10 flex shrink-0 items-center justify-between shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{selectedMember.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mt-2">{selectedMember.role.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeDetails}
                                className="w-10 h-10 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center rounded-xl transition-colors border border-slate-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                            {selectedMember.managerId && (
                                <section>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        Người Quản Lý
                                    </h4>
                                    {(() => {
                                        const manager = getManager(selectedMember);
                                        if (!manager) return null;
                                        return (
                                            <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                                    <UserIcon className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{manager.name}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-0.5">{manager.role.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </section>
                            )}

                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                        Tiến Độ Công Việc
                                    </h4>
                                    <div className="bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100/50">
                                        {progressPct(selectedMember.tasks || [])}%
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-slate-600">{completedCount(selectedMember.tasks || [])} / {selectedMember.tasks?.length || 0} task hoàn thành</span>
                                        <span className="text-2xl font-black text-slate-800">{progressPct(selectedMember.tasks || [])}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${progressPct(selectedMember.tasks || [])}%`,
                                                background: progressPct(selectedMember.tasks || []) === 100 ? '#10b981' : progressPct(selectedMember.tasks || []) >= 50 ? '#f59e0b' : '#94a3b8'
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>

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
                                        <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
                                            <Users className="w-3.5 h-3.5 text-amber-500" />
                                        </div>
                                        Nhân Sự Quản Lý
                                    </h4>
                                    <div className="bg-amber-50 px-3 py-1.5 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest border border-amber-100/50">
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
                                            <div key={sub.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 transition-all flex items-center gap-4 group">
                                                <div className="w-12 h-12 bg-slate-50 rounded-[1.2rem] flex items-center justify-center text-slate-400 border border-slate-100 shrink-0 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors">
                                                    <UserIcon className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-800 truncate group-hover:text-amber-700 transition-colors">{sub.name}</p>
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
                                onClick={() => handleRemoveStaff(selectedMember.id, selectedMember.name)}
                                className="px-6 py-3.5 bg-rose-50 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 mr-auto"
                            >
                                <Trash className="w-3.5 h-3.5" />
                                Loại khỏi sự kiện
                            </button>

                            <button
                                onClick={closeDetails}
                                className="px-8 py-3.5 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            >
                                Đóng
                            </button>

                            <button
                                onClick={() => { closeDetails(); onAssignTask?.(selectedMember.id, selectedMember.concertId || concertId, selectedMember.name); }}
                                className="px-8 py-3.5 bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-all shadow-xl shadow-amber-200 flex items-center gap-2"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                Giao Việc
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setDeleteConfirm(null)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full animate-in zoom-in-95 duration-300 border border-rose-100 font-bold">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Trash className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 text-center uppercase tracking-tight mb-2">Xác nhận gỡ bỏ</h3>
                        <p className="text-slate-500 text-xs text-center font-bold mb-8">
                            Bạn đang chuẩn bị loại <span className="text-rose-600 underline font-black">{deleteConfirm.name}</span> ra khỏi sự kiện.<br />
                            Vui lòng nhập mã bên dưới để xác nhận.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 text-center mb-8 border border-slate-100">
                            <span className="text-3xl font-black tracking-[0.5em] text-slate-900 select-none">{deleteConfirm.code}</span>
                        </div>

                        <input
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 transition-all text-center text-xl font-black mb-6"
                            placeholder="Nhập mã xác nhận..."
                            autoFocus
                        />

                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};