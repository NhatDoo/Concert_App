import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Loader2, Send, ArrowRight } from 'lucide-react';

interface Invitation {
    id: string;
    email: string;
    role: string;
    token: string;
    organizerId: string;
    status: string;
    createdAt: string;
}

interface Props {
    user: {
        id: string;
        name: string;
        email: string;
    };
    token: string | null;
    onActionSuccess?: () => void;
}

export const CollaborationInvitations: React.FC<Props> = ({ user, token, onActionSuccess }) => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchInvitations = async () => {
        if (!user.email) return;
        try {
            const res = await fetch(`${API_URL}/organize/staff/my-invitations?email=${user.email}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInvitations(data.filter((i: any) => i.status === 'PENDING'));
            }
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, [user.email]);

    const handleAction = async (invitation: Invitation, action: 'ACCEPT' | 'REJECT') => {
        setProcessingId(invitation.id);
        try {
            if (action === 'ACCEPT') {
                const res = await fetch(`${API_URL}/organize/staff/join`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        invitationId: invitation.id,
                        userId: user.id,
                        name: user.name
                    })
                });

                if (res.ok) {
                    fetchInvitations();
                    // Reload page to update layout/sidebar
                    window.location.reload();
                    if (onActionSuccess) onActionSuccess();
                }
            } else {
                setInvitations(prev => prev.filter(i => i.id !== invitation.id));
            }
        } catch (error) {
            console.error('Error handling invitation:', error);
        } finally {
            setProcessingId(null);
        }
    };

    if (invitations.length === 0) return null;

    return (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-700 mb-10">
            <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Lời mời cộng tác mới</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Bạn đã nhận được lời mời tham gia dự án từ phía Organizer</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map(invite => (
                    <div key={invite.id} className="bg-white border-2 border-indigo-100 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/5 relative overflow-hidden group hover:border-indigo-500 transition-all duration-500 text-left">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                    <Mail size={24} />
                                </div>
                                <div className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">
                                    Mới
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mời bạn vị trí</p>
                            <h3 className="text-2xl font-black text-gray-900 uppercase mb-4 tracking-tighter">{invite.role}</h3>

                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-8 pb-8 border-b border-gray-50 uppercase">
                                <ArrowRight size={14} className="text-indigo-400" />
                                <span>Gửi từ: Đối tác Organizer</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(invite, 'ACCEPT')}
                                    disabled={!!processingId}
                                    className="flex-1 bg-indigo-600 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    {processingId === invite.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            Đồng ý
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleAction(invite, 'REJECT')}
                                    disabled={!!processingId}
                                    className="px-6 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 py-4 rounded-2xl transition-all"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
