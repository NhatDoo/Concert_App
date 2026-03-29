"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RootState } from '../../src/stores/store';
import { PlusCircle, Music, Ticket, Calendar, DollarSign, Settings, Trash2, Edit } from 'lucide-react';

export default function OrganizerDashboard() {
    const { user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Bảo vệ route: Nếu chưa đăng nhập hoặc không phải ORGANIZE thì đá về trang chủ
        if (!user || user.role !== 'ORGANIZER') {
            router.push('/');
            return;
        }

        const fetchMyConcerts = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/concerts`);
                if (response.ok) {
                    const data = await response.json();

                    const myConcerts = data.filter((item: any) => item.organizerId === user.id);
                    setEvents(myConcerts);
                }
            } catch (error) {
                console.error('Failed to fetch concerts', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyConcerts();
    }, [user, router]);

    if (!user || user.role !== 'ORGANIZER') return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Dashboard */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Ban Tổ Chức</h1>
                            <p className="text-gray-500 mt-2">Chào mừng {user.name}, quản lý sự kiện của bạn hiệu quả hơn.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg w-full md:w-auto justify-center">
                            <PlusCircle className="w-5 h-5" />
                            Tạo sự kiện mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Tổng sự kiện</p>
                        <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                        <Music className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Vé đã bán</p>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl">
                        <Ticket className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Sắp diễn ra</p>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 flex items-center justify-center rounded-xl">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Doanh thu</p>
                        <p className="text-3xl font-bold text-gray-900">0 ₫</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-xl">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* List Events */}
            <div className="container mx-auto px-4 mt-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Danh sách sự kiện của bạn</h2>
                    <div className="flex gap-2">
                        <button className="text-sm font-medium text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                            Tất cả
                        </button>
                        <button className="text-sm font-medium text-white bg-gray-900 border border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                            Đang mở bán
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Music className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có sự kiện nào</h3>
                        <p className="text-gray-500 mb-6">Bạn chưa tạo bất kỳ sự kiện nào. Hãy bắt đầu ngay để thu hút khán giả.</p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow">
                            Tạo sự kiện ngay
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Tên sự kiện</th>
                                        <th className="px-6 py-4 font-semibold">Ngày diễn ra</th>
                                        <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                        <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {events.map((event, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={event.imageUrl || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a'} alt="C" className="w-16 h-12 rounded object-cover" />
                                                    <span className="font-bold text-gray-900">{event.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {new Date(event.startDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                                                    Đang mở bán
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3 text-gray-400">
                                                    <button className="hover:text-amber-500 transition" title="Chỉnh sửa"><Edit className="w-5 h-5" /></button>
                                                    <Link href={`/organizer/concerts/${event.id}/tickets`} className="hover:text-blue-500 transition" title="Quản lý vé">
                                                        <Settings className="w-5 h-5" />
                                                    </Link>
                                                    <button className="hover:text-red-500 transition" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
