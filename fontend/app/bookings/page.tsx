"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/stores/store';
import {
    Ticket as TicketIcon,
    Calendar,
    MapPin,
    ChevronRight,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Booking {
    id: string;
    concertName: string;
    concertDate: string;
    concertLocation: string;
    concertImage: string;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: string;
    tickets: Array<{
        id: string;
        type: string;
        price: number;
    }>;
    invoiceId?: string | null;
}

export default function BookingsPage() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                const response = await fetch(`${apiUrl}/bookings/user/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải danh sách vé');
                }

                const data = await response.json();
                setBookings(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, token, apiUrl]);

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <TicketIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
                <p className="text-gray-500 mb-8">Bạn cần đăng nhập để xem lịch sử đặt vé của mình.</p>
                <Link href="/login" className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition">
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Đang tìm vé của bạn...</p>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: Booking['status']) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-50 text-green-600 border-green-100';
            case 'CANCELLED':
                return 'bg-red-50 text-red-600 border-red-100';
            default:
                return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4" />;
            case 'CANCELLED': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const handlePayment = async (invoiceId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/billing/payments/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    invoiceId: invoiceId,
                    method: 'VNPAY',
                    returnUrl: `${window.location.origin}/payments/callback`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi khởi tạo thanh toán');
            }

            const data = await response.json();
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error('Không nhận được URL thanh toán từ server');
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="container mx-auto px-4 py-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Vé của tôi</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Quản lý lịch sử đặt vé và trạng thái thanh toán của bạn.</p>
                </header>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <TicketIcon className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có vé nào</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Bạn chưa thực hiện bất kỳ giao dịch nào. Hãy khám phá các sự kiện âm nhạc hot nhất ngay nhé!</p>
                        <Link href="/" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-black transition transform hover:-translate-y-1 block sm:inline-block shadow-xl shadow-gray-200">
                            Khám phá sự kiện
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row hover:shadow-md transition">
                                {/* Image Section */}
                                <div className="w-full md:w-64 h-48 md:h-auto bg-gray-200 relative overflow-hidden">
                                    <img
                                        src={booking.concertImage || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a'}
                                        className="w-full h-full object-cover"
                                        alt={booking.concertName}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:hidden">
                                        <h3 className="text-white font-bold text-lg">{booking.concertName}</h3>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-grow p-6 md:p-8">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                        <div className="hidden md:block">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{booking.concertName}</h3>
                                            <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(booking.concertDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" />
                                                    {booking.concertLocation}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`px-4 py-2 rounded-xl border text-sm font-black flex items-center gap-2 ${getStatusStyle(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status === 'CONFIRMED' ? 'ĐÃ THANH TOÁN' :
                                                booking.status === 'PENDING' ? 'CHỜ THANH TOÁN' : 'ĐÃ HỦY'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mã đơn hàng</p>
                                            <p className="font-mono text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded inline-block">#{booking.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Chi tiết vé</p>
                                            <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-700">
                                                {booking.tickets.map((t, i) => (
                                                    <span key={i} className="bg-gray-100 px-2 py-1 rounded-md">{t.type}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="md:text-right">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tổng cộng</p>
                                            <p className="text-xl font-black text-gray-900">
                                                {booking.totalAmount.toLocaleString('vi-VN')} <span className="text-sm">₫</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Section */}
                                <div className="bg-gray-50 p-6 md:w-48 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100">
                                    <button className="w-full bg-white border border-gray-200 text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-sm text-sm">
                                        Chi tiết
                                    </button>
                                    {booking.status === 'PENDING' && (
                                        <button
                                            onClick={() => {
                                                if (!booking.invoiceId) {
                                                    alert('Hệ thống chưa tạo hóa đơn cho vé này (thường do đây là vé test cũ). Xin vui lòng đặt một vé mới!');
                                                    return;
                                                }
                                                handlePayment(booking.invoiceId!);
                                            }}
                                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-2"
                                        >
                                            Thanh toán VNPay
                                        </button>
                                    )}
                                    {booking.status === 'CONFIRMED' && (
                                        <button className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-md shadow-red-200 text-sm flex items-center justify-center gap-2">
                                            <TicketIcon className="w-4 h-4" />
                                            Xem QR vé
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-bold text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
