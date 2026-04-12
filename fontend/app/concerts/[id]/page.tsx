"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Loader2, Music, UserCheck, Ticket as TicketIcon, Plus, Minus, CheckCircle, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/stores/store';

export default function ConcertDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [concert, setConcert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Booking state
    const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
    const [gaQuantities, setGaQuantities] = useState<{ [ticketType: string]: number }>({});
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);

    // Auth state from Redux
    const { user, token } = useSelector((state: RootState) => state.auth);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(`${apiUrl}/concerts/${id}`);

                if (!response.ok) {
                    throw new Error('Không thể tải thông tin sự kiện');
                }

                const data = await response.json();
                setConcert(data);

                // initial state for seats

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetail();
        }
    }, [id, apiUrl]);

    const toggleSeat = (seat: any) => {
        setBookingError(null);
        if (selectedSeats.find(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const adjustGAQuantity = (ticketType: string, delta: number, maxAvailable: number) => {
        setBookingError(null);
        setGaQuantities(prev => {
            const current = prev[ticketType] || 0;
            const next = Math.max(0, Math.min(maxAvailable, current + delta));
            return { ...prev, [ticketType]: next };
        });
    };

    const handleBooking = async () => {
        if (!user) {
            // Pre-save id for redirection
            router.push('/login?redirect=/concerts/' + id);
            return;
        }

        if (totalSelectedTickets === 0) {
            setBookingError('Vui lòng chọn ít nhất một vé');
            return;
        }

        setIsBooking(true);
        setBookingError(null);

        try {
            const seatIds = selectedSeats.map(s => s.id);
            const ticketGroups = Object.entries(gaQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([type, qty]) => ({ ticketType: type, quantity: qty }));

            const response = await fetch(`${apiUrl}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    userId: user.id,
                    concertId: id,
                    ...(seatIds.length > 0 && { seatIds }),
                    ...(ticketGroups.length > 0 && { ticketGroups })
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đặt vé không thành công');
            }

            setBookingSuccess(data.bookingId);
        } catch (err: any) {
            setBookingError(err.message);
        } finally {
            setIsBooking(false);
        }
    };

    const totalGACount = Object.values(gaQuantities).reduce((a, b) => a + b, 0);
    const totalSelectedTickets = selectedSeats.length + totalGACount;

    const gaPrice = concert ? Object.entries(gaQuantities).reduce((acc, [type, qty]) => {
        const ticketInfo = (concert.tickets || []).find((t: any) => t.ticketType === type);
        return acc + (ticketInfo ? ticketInfo.price * qty : 0);
    }, 0) : 0;
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0) + gaPrice;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Đang chuẩn bị sân khấu...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50">
            <div className="text-red-500 text-xl font-medium bg-red-50 p-8 rounded-2xl shadow-sm max-w-md text-center">
                <p className="mb-4 text-3xl">😕</p>
                {error}
            </div>
            <button onClick={() => window.location.reload()} className="mt-6 text-gray-500 hover:text-red-600 transition underline underline-offset-4">Thử lại</button>
        </div>
    );

    if (bookingSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center border border-green-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt vé thành công!</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Mã đơn hàng của bạn là: <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded">{bookingSuccess}</span>.
                        Chúng mình đã gửi thông tin chi tiết qua email.
                    </p>
                    <button
                        onClick={() => router.push('/bookings')}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all mb-3"
                    >
                        Quản lý vé của tôi
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full font-bold py-4 rounded-xl text-gray-500 hover:text-black transition"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

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
                    <div className="inline-block bg-red-600 text-sm font-bold uppercase tracking-wider px-3 py-1 rounded mb-4 shadow-lg shadow-red-900/40">
                        Nhạc Sống
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight drop-shadow-lg">{concert.name}</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-wrap gap-10 text-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-4 rounded-2xl text-red-600 shadow-sm">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Thời gian</p>
                                <p className="font-bold text-lg">{new Date(concert.startDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-sm">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Địa điểm</p>
                                <p className="font-bold text-lg">{concert.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 shadow-sm">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Ban tổ chức</p>
                                <p className="font-bold text-lg">{concert.organizer}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        {concert.seatMapUrl && (
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <TicketIcon className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">So do cho ngoi</h2>
                                </div>
                                <img
                                    src={concert.seatMapUrl}
                                    alt={`Seat map for ${concert.name}`}
                                    className="w-full rounded-2xl border border-gray-100 shadow-sm"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-8">
                            <Music className="w-6 h-6 text-red-600" />
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Nghệ sĩ tham gia</h2>
                        </div>
                        {concert.performances?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {concert.performances.map((perf: any, idx: number) => (
                                    <div key={idx} className="flex items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-200 transition-all hover:shadow-md group">
                                        <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 text-red-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-red-50 transition">
                                            <Music className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg leading-tight">{perf.artistName}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{perf.name} <span className="mx-1">•</span> {perf.durationMinutes} phút</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-400 italic font-medium">Đang cập nhật danh sách nghệ sĩ line-up...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Booking Ticket Options */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50 sticky top-24 overflow-hidden relative">
                        {/* Status bar top */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-rose-400"></div>

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <TicketIcon className="w-6 h-6 text-red-600" />
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Mua Vé</h2>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded bg-green-50 text-green-600 font-bold border border-green-100 flex items-center gap-1`}>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Chính thức
                            </span>
                        </div>

                        {concert.tickets?.length > 0 ? (
                            <div className="space-y-4">
                                {concert.tickets.map((ticket: any, idx: number) => {
                                    const availableSeatsForType = (concert?.seats || []).filter((s: any) => s.ticketType === ticket.ticketType);
                                    const qty = selectedSeats.filter(s => s.ticketType === ticket.ticketType).length;
                                    const isSoldOut = ticket.available === 0;
                                    const isAlmostGone = !isSoldOut && ticket.available <= Math.ceil(ticket.total * 0.1);

                                    return (
                                        <div
                                            key={idx}
                                            className={`rounded-2xl p-5 border-2 transition-all ${isSoldOut
                                                ? 'bg-gray-50 border-gray-100 opacity-60'
                                                : qty > 0
                                                    ? 'bg-red-50/50 border-red-500 shadow-md ring-4 ring-red-500/10'
                                                    : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] w-fit font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${ticket.ticketType === 'VVIP' ? 'bg-amber-100 text-amber-700' :
                                                        ticket.ticketType === 'VIP' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-gray-800 text-white'
                                                        }`}>
                                                        {ticket.ticketType}
                                                    </span>
                                                    <div className="text-xl font-black text-gray-900">
                                                        {(ticket.price * 100).toLocaleString('vi-VN')} <span className="text-sm font-medium">₫</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {isSoldOut ? (
                                                        <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-lg">HẾT VÉ</span>
                                                    ) : isAlmostGone ? (
                                                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg animate-bounce">SẮP HẾT!</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400">Còn {ticket.available}/{ticket.total}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {!isSoldOut && (
                                                <div className="mt-4 border-t border-gray-100 pt-4">
                                                    {availableSeatsForType.length > 0 ? (
                                                        <>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Chọn ghế ngồi ({qty} đang chọn)</p>
                                                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                                {availableSeatsForType.map((seat: any) => {
                                                                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                                                                    const isBooked = seat.status === 'BOOKED';
                                                                    return (
                                                                        <button
                                                                            key={seat.id}
                                                                            disabled={isBooked}
                                                                            onClick={() => toggleSeat(seat)}
                                                                            className={`w-9 h-9 rounded-xl text-xs font-black transition flex items-center justify-center shrink-0 shadow-sm ${isBooked
                                                                                ? 'bg-gray-100 text-gray-300 font-medium cursor-not-allowed border border-gray-100'
                                                                                : isSelected
                                                                                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] border-none'
                                                                                    : 'bg-white border text-gray-600 hover:border-red-400 hover:text-red-500 hover:bg-red-50'
                                                                                }`}
                                                                            title={isBooked ? 'Đã được đặt' : 'Bạn có thể chọn'}
                                                                        >
                                                                            {seat.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-between py-2">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vé tự do (GA)</p>
                                                                <p className="text-[10px] text-gray-500 italic">Chọn số lượng vé bạn muốn mua</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                                <button
                                                                    onClick={() => adjustGAQuantity(ticket.ticketType, -1, ticket.available)}
                                                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                                <span className="font-bold text-sm w-4 text-center">{gaQuantities[ticket.ticketType] || 0}</span>
                                                                <button
                                                                    onClick={() => adjustGAQuantity(ticket.ticketType, 1, ticket.available)}
                                                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <TicketIcon className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium text-sm">Chưa có thông tin vé</p>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100">
                            {bookingError && (
                                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100">
                                    <Info className="w-4 h-4 shrink-0" />
                                    {bookingError}
                                </div>
                            )}

                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Tạm tính ({totalSelectedTickets} vé)</p>
                                    <div className="text-3xl font-black text-gray-900 leading-none">
                                        {(totalPrice * 100).toLocaleString('vi-VN')} <span className="text-sm font-medium">₫</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={totalSelectedTickets === 0 || isBooking}
                                className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-wider transition-all transform flex items-center justify-center gap-3 shadow-xl ${totalSelectedTickets === 0 || isBooking
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed translate-y-0 shadow-none'
                                    : 'bg-gray-900 text-white hover:bg-black hover:-translate-y-1 active:scale-95 shadow-gray-200'
                                    }`}
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : !user ? (
                                    <>Đăng nhập để đặt vé</>
                                ) : (
                                    <>🔥 Tiến hành đặt vé</>
                                )}
                            </button>
                            <p className="mt-4 text-center text-[10px] text-gray-400 font-medium px-4 leading-relaxed">
                                Bằng cách click vào nút, bạn đồng ý với Điều khoản sử dụng & Chính sách bảo mật của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
