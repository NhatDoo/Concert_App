"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Calendar, Loader2, Music, UserCheck, Ticket as TicketIcon } from 'lucide-react';

export default function ConcertDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [concert, setConcert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/concerts/${id}`);

                if (!response.ok) {
                    throw new Error('Không thể tải thông tin sự kiện');
                }

                const data = await response.json();
                setConcert(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetail();
        }
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-600" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center flex-col">
            <div className="text-red-500 text-xl font-medium bg-red-50 p-6 rounded-2xl">{error}</div>
            <button onClick={() => window.location.reload()} className="mt-4 text-gray-500 hover:text-black underline">Thử lại</button>
        </div>
    );

    if (!concert) return null;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Banner Image */}
            <div className="w-full relative h-[400px] md:h-[500px]">
                <img
                    src={concert.imageUrl || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a'}
                    alt={concert.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white container mx-auto">
                    <div className="inline-block bg-red-600 text-sm font-bold uppercase tracking-wider px-3 py-1 rounded mb-4">
                        Nhạc Sống
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{concert.name}</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-wrap gap-6 text-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-50 p-3 rounded-full text-red-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Thời gian</p>
                                <p className="font-semibold">{new Date(concert.startDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Địa điểm</p>
                                <p className="font-semibold">{concert.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-purple-50 p-3 rounded-full text-purple-600">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Ban tổ chức</p>
                                <p className="font-semibold">{concert.organizer}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Nghệ sĩ tham gia</h2>
                        {concert.performances?.length > 0 ? (
                            <div className="space-y-4">
                                {concert.performances.map((perf: any, idx: number) => (
                                    <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-4">
                                            <Music className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{perf.artistName}</h3>
                                            <p className="text-sm text-gray-600 font-medium">{perf.name} ({perf.durationMinutes} phút)</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Đang cập nhật danh sách nghệ sĩ...</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Booking Ticket Options */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 sticky top-24">
                        <div className="flex items-center gap-2 mb-6">
                            <TicketIcon className="w-7 h-7 text-red-600" />
                            <h2 className="text-xl font-bold text-gray-900">Loại vé & Giá</h2>
                        </div>

                        {concert.tickets?.length > 0 ? (
                            <div className="space-y-3">
                                {concert.tickets.map((ticket: any, idx: number) => {
                                    const isSoldOut = ticket.available === 0;
                                    const soldPct = ticket.total > 0 ? Math.round((ticket.sold / ticket.total) * 100) : 0;
                                    const isAlmostGone = !isSoldOut && ticket.available <= Math.ceil(ticket.total * 0.1);

                                    return (
                                        <div
                                            key={idx}
                                            className={`border-2 rounded-xl p-4 transition group ${isSoldOut ? 'opacity-60 border-gray-100 bg-gray-50 cursor-not-allowed' : 'border-gray-100 hover:border-red-500 cursor-pointer'}`}
                                        >
                                            {/* Header */}
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${ticket.ticketType === 'VVIP' ? 'bg-yellow-100 text-yellow-700' :
                                                            ticket.ticketType === 'VIP' ? 'bg-purple-100 text-purple-700' :
                                                                ticket.ticketType === 'Discounted' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {ticket.ticketType}
                                                    </span>
                                                    {isAlmostGone && !isSoldOut && (
                                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                                                            Sắp hết!
                                                        </span>
                                                    )}
                                                    {isSoldOut && (
                                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                            Hết vé
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    Còn {ticket.available}/{ticket.total}
                                                </span>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all ${soldPct > 80 ? 'bg-red-500' : soldPct > 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                                                    style={{ width: `${soldPct}%` }}
                                                />
                                            </div>

                                            {/* Price */}
                                            <div className={`text-xl font-extrabold mb-3 ${isSoldOut ? 'text-gray-400' : 'text-red-600 group-hover:text-red-700'}`}>
                                                {ticket.price.toLocaleString('vi-VN')} ₫
                                            </div>

                                            <button
                                                disabled={isSoldOut}
                                                className={`w-full font-bold py-2 rounded-lg transition text-sm ${isSoldOut
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'
                                                    }`}
                                            >
                                                {isSoldOut ? 'Đã hết vé' : 'Chọn loại vé này'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <TicketIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium text-sm">Hiện chưa mở bán vé cho sự kiện này.</p>
                            </div>
                        )}

                        {concert.tickets?.some((t: any) => t.available > 0) && (
                            <button className="w-full mt-5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-600 transition-all transform hover:-translate-y-0.5 active:scale-95">
                                🎟 TIẾN HÀNH ĐẶT VÉ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
