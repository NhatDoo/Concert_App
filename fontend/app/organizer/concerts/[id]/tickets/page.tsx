"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { RootState } from '../../../../../src/stores/store';
import { Ticket, PlusCircle, Trash2, Edit, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TicketGroup {
    ticketType: string;
    price: number;
    total: number;
    available: number;
    sold: number;
}

export default function ManageTicketsPage() {
    const { id: concertId } = useParams<{ id: string }>();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [tickets, setTickets] = useState<TicketGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Add ticket form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ ticketType: 'Regular', price: '', quantity: '' });

    // Edit inline state
    const [editRow, setEditRow] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState('');
    const [editQty, setEditQty] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'ORGANIZER') {
            router.push('/');
        }
    }, [user, router]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/concerts/${concertId}/tickets`);
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (concertId) fetchTickets(); }, [concertId]);

    const notify = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleAdd = async () => {
        if (!addForm.ticketType || !addForm.price || !addForm.quantity) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/concerts/${concertId}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketTypes: [{ type: addForm.ticketType, price: Number(addForm.price), quantity: Number(addForm.quantity) }]
                })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            notify('success', `Thêm loại vé "${addForm.ticketType.toUpperCase()}" thành công!`);
            setAddForm({ ticketType: '', price: '', quantity: '' });
            setShowAddForm(false);
            fetchTickets();
        } catch (e: any) {
            notify('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (ticketType: string) => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/concerts/${concertId}/tickets/${ticketType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: Number(editPrice), quantity: Number(editQty) })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            notify('success', `Cập nhật loại vé "${ticketType}" thành công!`);
            setEditRow(null);
            fetchTickets();
        } catch (e: any) {
            notify('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (ticketType: string) => {
        if (!confirm(`Bạn có chắc muốn xóa toàn bộ vé loại "${ticketType}" chưa bán?`)) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/concerts/${concertId}/tickets/${ticketType}`, { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json()).message);
            notify('success', `Đã xóa loại vé "${ticketType}"!`);
            fetchTickets();
        } catch (e: any) {
            notify('error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6 flex items-center gap-4">
                    <Link href="/organizer" className="text-gray-500 hover:text-gray-900 transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-7 h-7 text-red-600" />
                            Quản lý vé sự kiện
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">ID: {concertId}</p>
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white font-medium transition-all ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {notification.msg}
                </div>
            )}

            <div className="container mx-auto px-4 mt-8">
                {/* Add Ticket Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Các loại vé hiện có</h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Thêm loại vé
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="bg-white border-2 border-red-200 rounded-2xl p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Thêm loại vé mới</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Loại vé</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-black outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                    value={addForm.ticketType}
                                    onChange={e => setAddForm({ ...addForm, ticketType: e.target.value })}
                                >
                                    <option value="Regular">Regular (Thường)</option>
                                    <option value="VIP">VIP</option>
                                    <option value="VVIP">VVIP</option>
                                    <option value="Discounted">Discounted (Giảm giá)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Giá vé (VND)</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-black outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="VD: 500000"
                                    value={addForm.price}
                                    onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Số lượng vé</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-black outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="VD: 100"
                                    value={addForm.quantity}
                                    onChange={e => setAddForm({ ...addForm, quantity: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAdd}
                                disabled={submitting}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold transition disabled:opacity-60 flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                                Thêm vé
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="border border-gray-300 px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}

                {/* Ticket Table */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có loại vé nào</h3>
                        <p className="text-gray-500">Hãy bấm "Thêm loại vé" để bắt đầu phát hành vé cho sự kiện này.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Loại vé</th>
                                    <th className="px-6 py-4 font-semibold">Giá vé</th>
                                    <th className="px-6 py-4 font-semibold">Tổng SL</th>
                                    <th className="px-6 py-4 font-semibold">Còn lại</th>
                                    <th className="px-6 py-4 font-semibold">Đã bán</th>
                                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.map(t => (
                                    <tr key={t.ticketType} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <span className="inline-block font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg uppercase text-sm">
                                                {t.ticketType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-red-600 text-lg">
                                            {editRow === t.ticketType ? (
                                                <input
                                                    type="number"
                                                    className="w-32 border border-red-300 rounded-lg px-2 py-1 text-black outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                                    value={editPrice}
                                                    onChange={e => setEditPrice(e.target.value)}
                                                />
                                            ) : `${t.price.toLocaleString('vi-VN')} ₫`}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-semibold">
                                            {editRow === t.ticketType ? (
                                                <input
                                                    type="number"
                                                    className="w-24 border border-red-300 rounded-lg px-2 py-1 text-black outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                                    value={editQty}
                                                    onChange={e => setEditQty(e.target.value)}
                                                />
                                            ) : t.total}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                                                {t.available}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                                {t.sold}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editRow === t.ticketType ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdate(t.ticketType)}
                                                        disabled={submitting}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition disabled:opacity-60 flex items-center gap-1"
                                                    >
                                                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : '✓'} Lưu
                                                    </button>
                                                    <button onClick={() => setEditRow(null)} className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                                                        Hủy
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-3 text-gray-400">
                                                    <button
                                                        onClick={() => { setEditRow(t.ticketType); setEditPrice(String(t.price)); setEditQty(String(t.total)); }}
                                                        className="hover:text-amber-500 transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t.ticketType)}
                                                        className="hover:text-red-500 transition"
                                                        title="Xóa loại vé"
                                                        disabled={t.sold > 0}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
