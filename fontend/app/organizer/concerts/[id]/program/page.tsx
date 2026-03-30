"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { RootState } from '../../../../../src/stores/store';
import { Music, PlusCircle, Trash2, Edit, Loader2, CheckCircle, XCircle, ArrowLeft, Mic, Clock, Save, Info } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Artist {
    id: string;
    name: string;
    bio: string;
    contactInfo: string;
}

interface Performance {
    id: string;
    concertId: string;
    artistId: string;
    name: string;
    durationMinutes: number;
    startTime: string;
}

export default function ManageProgramPage() {
    const { id: concertId } = useParams<{ id: string }>();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [performances, setPerformances] = useState<Performance[]>([]);
    const [allArtists, setAllArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Form states
    const [showAddPerformance, setShowAddPerformance] = useState(false);
    const [addPerfForm, setAddPerfForm] = useState({
        artistId: '',
        name: '',
        durationMinutes: 30,
        startTime: ''
    });

    const [showManageArtists, setShowManageArtists] = useState(false);
    const [artistForm, setArtistForm] = useState({ name: '', bio: '', contactInfo: '' });
    const [editingArtistId, setEditingArtistId] = useState<string | null>(null);

    // Edit performance inline
    const [editingPerfId, setEditingPerfId] = useState<string | null>(null);
    const [editPerfForm, setEditPerfForm] = useState({ startTime: '', durationMinutes: 30 });

    useEffect(() => {
        if (!user || user.role !== 'ORGANIZER') {
            router.push('/');
        }
    }, [user, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [perfRes, artistRes] = await Promise.all([
                fetch(`${API_URL}/concerts/${concertId}/performances`),
                fetch(`${API_URL}/concerts/artists`)
            ]);

            const perfs = await perfRes.json();
            const artists = await artistRes.json();

            setPerformances(Array.isArray(perfs) ? perfs : []);
            setAllArtists(Array.isArray(artists) ? artists : []);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (concertId) fetchData();
    }, [concertId]);

    const notify = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    // ================= Artist CRUD =================
    const handleSaveArtist = async () => {
        if (!artistForm.name) return;
        setSubmitting(true);
        try {
            const method = editingArtistId ? 'PUT' : 'POST';
            const url = editingArtistId
                ? `${API_URL}/concerts/artists/${editingArtistId}`
                : `${API_URL}/concerts/artists`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(artistForm)
            });

            if (!res.ok) throw new Error('Failed to save artist');

            notify('success', editingArtistId ? 'Cập nhật nghệ sĩ thành công!' : 'Thêm nghệ sĩ mới thành công!');
            setArtistForm({ name: '', bio: '', contactInfo: '' });
            setEditingArtistId(null);
            fetchData();
        } catch (e: any) {
            notify('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteArtist = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa nghệ sĩ "${name}"? Điều này có thể ảnh hưởng đến lịch diễn.`)) return;
        try {
            const res = await fetch(`${API_URL}/concerts/artists/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Không thể xóa nghệ sĩ vì đang có lịch diễn hoặc lỗi khác');
            notify('success', 'Đã xóa nghệ sĩ');
            fetchData();
        } catch (e: any) {
            notify('error', e.message);
        }
    };

    // ================= Performance CRUD =================
    const handleAddPerformance = async () => {
        if (!addPerfForm.artistId || !addPerfForm.name || !addPerfForm.startTime) {
            notify('error', 'Vui lòng điền đủ thông tin tiết mục');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/concerts/${concertId}/performances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addPerfForm)
            });

            if (!res.ok) throw new Error('Failed to add performance');

            notify('success', 'Đã thêm tiết mục vào lịch diễn!');
            setAddPerfForm({ artistId: '', name: '', durationMinutes: 30, startTime: '' });
            setShowAddPerformance(false);
            fetchData();
        } catch (e: any) {
            notify('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePerformance = async (perfId: string) => {
        if (!confirm('Bạn có chắc muốn xóa tiết mục này khỏi lịch diễn?')) return;
        try {
            const res = await fetch(`${API_URL}/concerts/${concertId}/performances/${perfId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Không thể xóa tiết mục');
            notify('success', 'Đã xóa tiết mục');
            fetchData();
        } catch (e: any) {
            notify('error', e.message);
        }
    };

    const handleUpdatePerformance = async (perfId: string) => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/concerts/${concertId}/performances/${perfId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editPerfForm)
            });
            if (!res.ok) throw new Error('Failed to update performance');
            notify('success', 'Đã cập nhật lịch diễn');
            setEditingPerfId(null);
            fetchData();
        } catch (e: any) {
            notify('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getArtistName = (id: string) => allArtists.find(a => a.id === id)?.name || 'Unknown Artist';

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8 flex items-center gap-4">
                    <Link href="/organizer" className="text-gray-500 hover:text-gray-900 transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Music className="w-8 h-8 text-purple-600" />
                            Lịch diễn & Nghệ sĩ
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Quản lý chương trình và danh sách Line-up của concert</p>
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all animate-in fade-in slide-in-from-right-10 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {notification.msg}
                </div>
            )}

            <div className="container mx-auto px-4 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LEFT: PERFORMANCE LIST */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-gray-400" />
                                Chương trình (Schedule)
                            </h2>
                            <button
                                onClick={() => setShowAddPerformance(!showAddPerformance)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg flex items-center gap-2"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Thêm tiết mục
                            </button>
                        </div>

                        {showAddPerformance && (
                            <div className="bg-white rounded-3xl p-8 border-2 border-purple-100 shadow-xl mb-8 animate-in zoom-in-95">
                                <h3 className="font-bold text-xl mb-6 text-black">Thêm tiết mục mới</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tên tiết mục</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition text-black"
                                            placeholder="VD: Opening Song / Remix Set..."
                                            value={addPerfForm.name}
                                            onChange={e => setAddPerfForm({ ...addPerfForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nghệ sĩ biểu diễn</label>
                                        <select
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition bg-white text-black"
                                            value={addPerfForm.artistId}
                                            onChange={e => setAddPerfForm({ ...addPerfForm, artistId: e.target.value })}
                                        >
                                            <option value="">-- Chọn nghệ sĩ --</option>
                                            {allArtists.map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block ">Bắt đầu lúc</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition text-black"
                                            value={addPerfForm.startTime}
                                            onChange={e => setAddPerfForm({ ...addPerfForm, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 block">Thời lượng (phút)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition text-black"
                                            value={addPerfForm.durationMinutes}
                                            onChange={e => setAddPerfForm({ ...addPerfForm, durationMinutes: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddPerformance}
                                        disabled={submitting}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Lưu tiết mục
                                    </button>
                                    <button onClick={() => setShowAddPerformance(false)} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>
                        ) : performances.length === 0 ? (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
                                <Mic className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Lịch diễn đang trống</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8">Bạn chưa thêm tiết mục nào vào chương trình cho concert này.</p>
                                <button
                                    onClick={() => setShowAddPerformance(true)}
                                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition"
                                >
                                    Thêm tiết mục đầu tiên
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {performances.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(p => (
                                    <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition group">
                                        <div className="flex items-start gap-5">
                                            <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition duration-300 shadow-sm">
                                                <Mic className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-lg font-black text-gray-900">{p.name}</h4>
                                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-black uppercase tracking-widest">{p.durationMinutes} PHÚT</span>
                                                </div>
                                                <p className="text-gray-500 font-bold mb-2">Bởi: <span className="text-purple-600">{getArtistName(p.artistId)}</span></p>

                                                {editingPerfId === p.id ? (
                                                    <div className="flex flex-wrap gap-4 mt-4 bg-gray-50 p-4 rounded-xl">
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-400 block mb-1">BẮT ĐẦU</label>
                                                            <input
                                                                type="datetime-local"
                                                                className="border border-gray-200 rounded-lg p-2 text-sm"
                                                                value={editPerfForm.startTime}
                                                                onChange={e => setEditPerfForm({ ...editPerfForm, startTime: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-gray-400 block mb-1">PHÚT</label>
                                                            <input
                                                                type="number"
                                                                className="border border-gray-200 rounded-lg p-2 text-sm w-20"
                                                                value={editPerfForm.durationMinutes}
                                                                onChange={e => setEditPerfForm({ ...editPerfForm, durationMinutes: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div className="flex items-end gap-2">
                                                            <button
                                                                onClick={() => handleUpdatePerformance(p.id)}
                                                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingPerfId(null)}
                                                                className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 transition"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(p.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                            <button
                                                onClick={() => {
                                                    setEditingPerfId(p.id);
                                                    setEditPerfForm({
                                                        startTime: p.startTime.substring(0, 16),
                                                        durationMinutes: p.durationMinutes
                                                    });
                                                }}
                                                className="hover:text-amber-500 p-2 rounded-lg hover:bg-amber-50 transition" title="Sửa lịch"
                                            >
                                                <Edit className="w-5 h-5 text-gray-300 hover:text-amber-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePerformance(p.id)}
                                                className="hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition" title="Gỡ khỏi lịch"
                                            >
                                                <Trash2 className="w-5 h-5 text-gray-300 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: ARTIST DIRECTORY */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                                Danh sách nghệ sĩ
                                <button
                                    onClick={() => {
                                        setShowManageArtists(!showManageArtists);
                                        setEditingArtistId(null);
                                        setArtistForm({ name: '', bio: '', contactInfo: '' });
                                    }}
                                    className="text-purple-600 hover:bg-purple-50 p-1 rounded-lg transition"
                                >
                                    <PlusCircle className="w-6 h-6" />
                                </button>
                            </h3>

                            {showManageArtists && (
                                <div className="mb-8 p-6 bg-purple-50 rounded-2xl animate-in slide-in-from-top-4">
                                    <h4 className="font-bold text-purple-900 mb-4">{editingArtistId ? 'Sửa thông tin' : 'Thêm nghệ sĩ mới'}</h4>
                                    <div className="space-y-4">
                                        <input
                                            placeholder="Tên nghệ sĩ "
                                            className="w-full p-3 rounded-xl border-none shadow-inner outline-none focus:ring-2 focus:ring-purple-400 text-black"
                                            value={artistForm.name}
                                            onChange={e => setArtistForm({ ...artistForm, name: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Bio"
                                            className="w-full p-3 rounded-xl border-none shadow-inner outline-none focus:ring-2 focus:ring-purple-400 resize-none h-24 text-sm text-black"
                                            value={artistForm.bio}
                                            onChange={e => setArtistForm({ ...artistForm, bio: e.target.value })}
                                        />
                                        <input
                                            placeholder="Liên hệ (SDT/Email)"
                                            className="w-full p-3 rounded-xl border-none shadow-inner outline-none focus:ring-2 focus:ring-purple-400 text-sm text-black"
                                            value={artistForm.contactInfo}
                                            onChange={e => setArtistForm({ ...artistForm, contactInfo: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveArtist}
                                                disabled={submitting || !artistForm.name}
                                                className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-purple-700 transition disabled:opacity-50"
                                            >
                                                {submitting ? '...' : (editingArtistId ? 'Lưu' : 'Thêm')}
                                            </button>
                                            <button
                                                onClick={() => { setShowManageArtists(false); setEditingArtistId(null); }}
                                                className="px-4 py-3 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {allArtists.length === 0 ? (
                                    <p className="text-center text-gray-400 italic py-10">Chưa có nghệ sĩ nào trong danh sách</p>
                                ) : (
                                    allArtists.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition border border-transparent hover:border-purple-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm">
                                                    <Mic className="w-5 h-5" />
                                                </div>
                                                <div className="max-w-[120px] md:max-w-none">
                                                    <p className="font-bold text-gray-900 truncate">{a.name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate tracking-tight">{a.contactInfo || 'Không có liên hệ'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingArtistId(a.id);
                                                        setArtistForm({ name: a.name, bio: a.bio, contactInfo: a.contactInfo });
                                                        setShowManageArtists(true);
                                                    }}
                                                    className="p-2 text-gray-300 hover:text-amber-500 transition"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteArtist(a.id, a.name)}
                                                    className="p-2 text-gray-300 hover:text-red-500 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        Nghệ sĩ là dữ liệu chung toàn hệ thống. Bạn có thể chọn từ danh sách này hoặc tạo mới để thêm vào lịch diễn concert.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
