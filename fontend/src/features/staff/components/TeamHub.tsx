import React, { useState, useEffect } from 'react';
import { Users, User as UserIcon, Calendar, CheckCircle, Mail, MapPin, Trash } from 'lucide-react';
import { StaffRecord } from './types';

interface TeamHubProps {
    organizerId: string;
    token: string | null;
}

export const TeamHub: React.FC<TeamHubProps> = ({ organizerId, token }) => {
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

    return (
        <div className="animate-in slide-in-from-bottom-10 duration-700 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {team.map(member => (
                    <div key={member.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-200/40 hover:border-blue-100 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-600 transition-colors duration-500"></div>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem] flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
                                <UserIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                                <div className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase font-black tracking-widest rounded-full mt-2">
                                    {member.role.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100/50">
                            {/* In a real scenario, you can map real contact info if attached to the member */}
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

                            <div className="flex items-center gap-3 pt-2">
                                <button className="flex-1 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" /> Giao hạng mục
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveStaff(member.id); }}
                                    className="p-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                                    title="Loại bỏ nhân sự"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
