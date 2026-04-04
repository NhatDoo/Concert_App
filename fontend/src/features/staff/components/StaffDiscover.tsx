import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, User, Mail, Send, Award, ExternalLink, Loader2, ShieldCheck, Clock } from 'lucide-react';

interface PotentialStaff {
    id: string;
    name: string;
    role: string;
    bio: string;
    cvUrl: string;
    user: {
        name: string;
        email: string;
        phoneNumber: string;
    };
}

interface StaffDiscoverProps {
    organizerId: string;
    managerId?: string;
    filterRole?: string;
    onInviteSuccess: (type: 'success' | 'error', msg: string) => void;
}

export const StaffDiscover: React.FC<StaffDiscoverProps> = ({ organizerId, managerId, filterRole, onInviteSuccess }) => {
    const [staffList, setStaffList] = useState<PotentialStaff[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [invitingId, setInvitingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Build discover URL with role filtering
            let discoverUrl = `${apiUrl}/organize/staff/discover?role=${searchTerm}`;
            if (filterRole) {
                discoverUrl = `${apiUrl}/organize/staff/discover?filterRole=${filterRole}`;
            }

            const res = await fetch(discoverUrl);
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }

            // Also fetch invitations if managerId is provided
            if (managerId) {
                const inviteRes = await fetch(`${apiUrl}/organize/staff/invitations?managerId=${managerId}`);
                if (inviteRes.ok) {
                    const inviteData = await inviteRes.json();
                    setInvitations(inviteData);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, managerId, filterRole]);

    const handleInvite = async (staffId: string) => {
        setInvitingId(staffId);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/staff/${staffId}/invite-direct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizerId: organizerId,
                    managerId: managerId,
                    role: staffList.find(s => s.id === staffId)?.role || 'MANAGER'
                })
            });
            if (res.ok) {
                onInviteSuccess('success', "Đã gửi lời mời cộng tác thành công!");
                fetchData(); // Refresh list
            } else {
                onInviteSuccess('error', "Lỗi khi gửi lời mời");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setInvitingId(null);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="space-y-8">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm theo chức danh (VD: Manager, Production, Crew...)"
                        className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-16 pr-8 py-5 outline-none focus:border-red-500/20 focus:ring-4 focus:ring-red-500/5 transition-all font-bold text-slate-700 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 italic font-bold text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-red-600" />
                        <p>Đang quét thị trường nhân sự tự do...</p>
                    </div>
                ) : staffList.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
                        <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Không tìm thấy nhân sự phù hợp yêu cầu.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {staffList.map((staff) => (
                            <div key={staff.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-red-100 hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500 group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-red-50 group-hover:text-red-600 transition-all duration-500 overflow-hidden">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors uppercase">{staff.user.name}</h3>
                                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{staff.role}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            Tự do
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                            <Mail className="w-4 h-4 text-slate-300" />
                                            {staff.user.email}
                                        </div>
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 font-medium">
                                            {staff.bio || "Chưa có thông tin giới thiệu bản thân."}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <div className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black text-slate-600 uppercase flex items-center gap-2">
                                            <Award className="w-3 h-3" />
                                            Kinh nghiệm cao
                                        </div>
                                        <div className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black text-slate-600 uppercase flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            Sẵn sàng đi tour
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto">
                                    <a
                                        href={staff.cvUrl || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Xem CV Hồ sơ
                                    </a>
                                    <button
                                        onClick={() => handleInvite(staff.id)}
                                        disabled={invitingId === staff.id}
                                        className="flex-1 bg-red-600 hover:bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:bg-slate-300"
                                    >
                                        {invitingId === staff.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Mời cộng tác
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Invitations Section */}
            <div className="pt-12 border-t-2 border-dashed border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Send className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase">Lời mời của bạn</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Danh sách nhân sự bạn đang mời tham gia dự án.</p>
                    </div>
                </div>

                {invitations.length === 0 ? (
                    <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Bạn chưa gửi lời mời trực tiếp nào.</p>
                        <p className="text-slate-300 text-[10px] mt-2 italic font-medium">Sử dụng nút "Mời cộng tác" phía trên để chiêu mộ nhân tài.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {invitations.map((invite) => (
                            <div key={invite.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 -mr-6 -mt-6 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mb-1">{invite.role}</p>
                                        <h3 className="text-sm font-black text-slate-900 truncate max-w-[150px]">{invite.email}</h3>
                                    </div>
                                    <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6 relative z-10">
                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                        <span className="text-slate-400 uppercase">Trạng thái:</span>
                                        <span className="text-amber-600 uppercase">Chờ xử lý</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(invite.token);
                                        onInviteSuccess('success', 'Đã sao chép mã mời!');
                                    }}
                                    className="w-full bg-slate-50 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 relative z-10"
                                >
                                    Copy Token Invite
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
