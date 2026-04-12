"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/stores/store';
import {
    Ticket as TicketIcon,
    Calendar,
    MapPin,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Trash2,
    AlertTriangle,
    QrCode,
    X,
    Download,
    Copy,
    Check,
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

interface Booking {
    id: string;
    concertId: string;
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
        seatLabel?: string | null;
        isCheckedIn?: boolean;
    }>;
    invoiceId?: string | null;
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
interface DeleteConfirmModalProps {
    booking: Booking;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}

function DeleteConfirmModal({ booking, onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={!isDeleting ? onCancel : undefined}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{ animation: 'fadeInScale 0.2s ease-out' }}>
                <div className="bg-red-50 px-8 py-6 border-b border-red-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Xác nhận hủy đặt vé</h2>
                        <p className="text-sm text-red-600 font-medium mt-0.5">Hành động này không thể hoàn tác</p>
                    </div>
                </div>
                <div className="px-8 py-6">
                    <p className="text-gray-600 mb-5">Bạn có chắc chắn muốn hủy đặt vé cho sự kiện sau không?</p>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                    src={booking.concertImage || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a'}
                                    className="w-full h-full object-cover"
                                    alt={booking.concertName}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-gray-900 text-sm leading-tight mb-1 truncate">{booking.concertName}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(booking.concertDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                    <MapPin className="w-3 h-3" />
                                    {booking.concertLocation}
                                </p>
                                <p className="text-sm font-black text-gray-900">
                                    {booking.totalAmount.toLocaleString('vi-VN')} <span className="text-xs font-bold">₫</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Sau khi hủy, vé sẽ không thể khôi phục. Vui lòng liên hệ hỗ trợ nếu cần hoàn tiền.
                    </p>
                </div>
                <div className="px-8 pb-8 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        Giữ lại vé
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 text-white font-bold py-3.5 rounded-2xl hover:bg-red-700 transition shadow-md shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Đang hủy...</>
                        ) : (
                            <><Trash2 className="w-4 h-4" />Xác nhận hủy</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── QR Code Modal ────────────────────────────────────────────────────────────
interface QRModalProps {
    booking: Booking;
    onClose: () => void;
    onCheckInSuccess?: () => void;
}

function QRModal({ booking, onClose, onCheckInSuccess }: QRModalProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [verificationData, setVerificationData] = useState<{ token: string, tId: string } | null>(null);
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    const invoiceId = booking.invoiceId!;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // ─── POLLING ĐỂ PHÁT HIỆN STAFF ĐÃ QUÉT BƯỚC 1 ──────────────────
    useEffect(() => {
        if (isCheckingIn) return;

        const pollStatus = async () => {
            const firstTicketId = booking.tickets[0]?.id;
            if (!firstTicketId) return;

            try {
                const res = await fetch(`${apiUrl}/concerts/${booking.concertId}/tickets/${firstTicketId}/status`);
                if (!res.ok) return;
                const data = await res.json();

                if (data.isCheckedIn) {
                    setIsCheckingIn(true);
                    if (onCheckInSuccess) onCheckInSuccess();
                    return;
                }

                if (data.pendingStatus === 'WAITING_CONFIRMATION' && data.verificationToken) {
                    setVerificationData({
                        token: data.verificationToken,
                        tId: firstTicketId
                    });
                } else if (data.pendingStatus === 'NONE' && verificationData) {
                    // Reset nếu hết hạn hoặc bị hủy
                    setVerificationData(null);
                }
            } catch (err) {
                console.error("Polling check-in error:", err);
            }
        };

        const timer = setInterval(pollStatus, 2500);
        return () => clearInterval(timer);
    }, [booking.id, verificationData, isCheckingIn]);

    // ─── GENERATE QR CODE ──────────────────────────────────────────
    useEffect(() => {
        let payload = "";

        if (verificationData) {
            // QR cho bước 2: Xác thực (Sử dụng key ngắn nhất có thể)
            payload = JSON.stringify({
                v: verificationData.token,
                t: verificationData.tId,
                c: booking.concertId,
                type: "V"
            });
        } else {
            // QR cho bước 1: Thông tin vé
            payload = JSON.stringify({
                cId: booking.concertId,
                cName: booking.concertName,
                tIds: booking.tickets.map(t => t.id),
                tTypes: booking.tickets.map(t => t.type),
            });
        }

        QRCode.toDataURL(payload, {
            width: 280,
            margin: 2,
            color: {
                dark: '#000000', // Sử dụng màu đen thuần để tăng độ tương phản tuyệt đối
                light: '#ffffff',
            },
            errorCorrectionLevel: 'M', // Giảm mức sửa lỗi xuống M để mã QR đỡ bị chi chít (dễ quét hơn)
        }).then(url => setQrDataUrl(url)).catch(console.error);
    }, [booking, verificationData]);

    const handleDownload = () => {
        if (!qrDataUrl) return;
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `ticket-${invoiceId.slice(0, 8)}.png`;
        a.click();
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(invoiceId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isCheckingIn) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Check-in thành công!</h2>
                    <p className="text-gray-500 text-sm mb-8">Cảm ơn bạn. Chúc bạn có một trải nghiệm sự kiện tuyệt vời.</p>
                    <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition">
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                style={{ animation: 'fadeInScale 0.25s ease-out' }}
            >
                {/* Header */}
                <div className={`relative px-6 pt-6 pb-8 text-white text-center transition-colors duration-500 ${verificationData ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        {verificationData ? <CheckCircle2 className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                    </div>
                    <h2 className="text-xl font-black mb-1">
                        {verificationData ? 'Xác nhận Check-in' : 'QR Vé điện tử'}
                    </h2>
                    <p className="text-white/60 text-xs font-medium">
                        {verificationData ? 'Vui lòng đưa máy cho Staff quét mã đỏ này' : 'Xuất trình mã này tại cổng vào sự kiện'}
                    </p>

                    {/* Ticket notch */}
                    <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-4">
                        <div className="w-8 h-8 bg-gray-50 rounded-full" />
                        <div className="flex-1 mx-2 border-t-2 border-dashed border-white/20 mt-4" />
                        <div className="w-8 h-8 bg-gray-50 rounded-full" />
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 pt-8 pb-4">
                    {/* Concert Info */}
                    <div className="text-center mb-5">
                        <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{booking.concertName}</h3>
                        <div className="flex items-center justify-center gap-3 text-gray-500 text-xs font-medium">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(booking.concertDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* QR Canvas */}
                    <div className="flex justify-center mb-5">
                        <div className={`p-3 bg-white rounded-2xl border-2 shadow-inner transition-colors duration-500 ${verificationData ? 'border-red-100' : 'border-gray-100'}`}>
                            {qrDataUrl ? (
                                <div className="relative">
                                    <img
                                        src={qrDataUrl}
                                        alt="QR Ticket"
                                        className="w-52 h-52 rounded-lg"
                                    />
                                    {verificationData && (
                                        <div className="absolute inset-0 border-4 border-red-500 rounded-lg pointer-events-none animate-pulse" />
                                    )}
                                </div>
                            ) : (
                                <div className="w-52 h-52 flex items-center justify-center bg-gray-50 rounded-lg">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                </div>
                            )}
                        </div>
                    </div>

                    {verificationData && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                            <p className="text-xs font-bold text-red-600 animate-bounce">
                                Đã sẵn sàng xác thực!
                            </p>
                        </div>
                    )}

                    {/* Ticket Types */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {booking.tickets.map((t, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                                {t.type}
                            </span>
                        ))}
                    </div>

                    {/* Invoice ID */}
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 mb-5">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Mã hóa đơn</p>
                            <p className="font-mono text-xs font-bold text-gray-700 truncate">{invoiceId}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-200 transition text-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingsPage() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [qrTarget, setQrTarget] = useState<Booking | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchBookings = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${apiUrl}/bookings/user/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải danh sách vé');
            const data = await response.json();
            setBookings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user, token, apiUrl]);

    const handleCancelBooking = async () => {
        if (!deleteTarget || !user) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`${apiUrl}/bookings/${deleteTarget.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Không thể hủy đặt vé');
            }
            setBookings(prev =>
                prev.map(b => b.id === deleteTarget.id ? { ...b, status: 'CANCELLED' } : b)
            );
            setSuccessMessage(`Đã hủy đặt vé "${deleteTarget.concertName}" thành công!`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
            let msg = err.message;
            if (msg.includes('CHECKED_IN')) {
                msg = "Không thể hủy vé vì bạn đã thực hiện soát vé (Check-in) cho sự kiện này.";
            } else if (msg.includes('CONFIRMED')) {
                msg = "Vé đã được xác nhận. Vui lòng liên hệ bộ phận hỗ trợ để được xử lý hoàn tiền.";
            }
            setError(msg);
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
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
                    invoiceId,
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
            case 'CONFIRMED': return 'bg-green-50 text-green-600 border-green-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4" />;
            case 'CANCELLED': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <>
            {deleteTarget && (
                <DeleteConfirmModal
                    booking={deleteTarget}
                    onConfirm={handleCancelBooking}
                    onCancel={() => setDeleteTarget(null)}
                    isDeleting={isDeleting}
                />
            )}

            {qrTarget && (
                <QRModal
                    booking={qrTarget}
                    onClose={() => setQrTarget(null)}
                    onCheckInSuccess={fetchBookings}
                />
            )}

            <div className="bg-slate-50 min-h-screen pb-20">
                <div className="container mx-auto px-4 py-12">
                    <header className="mb-10">
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Vé của tôi</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Quản lý lịch sử đặt vé và trạng thái thanh toán của bạn.</p>
                    </header>

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-100"
                            style={{ animation: 'fadeInScale 0.3s ease-out' }}>
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="font-bold text-sm">{successMessage}</p>
                        </div>
                    )}

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
                                <div
                                    key={booking.id}
                                    className={`bg-white rounded-3xl overflow-hidden shadow-sm border flex flex-col md:flex-row hover:shadow-md transition ${booking.status === 'CANCELLED' ? 'border-red-100 opacity-75' : 'border-gray-100'
                                        }`}
                                >
                                    {/* Image */}
                                    <div className="w-full md:w-64 h-48 md:h-auto bg-gray-200 relative overflow-hidden">
                                        <img
                                            src={booking.concertImage || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a'}
                                            className={`w-full h-full object-cover ${booking.status === 'CANCELLED' ? 'grayscale' : ''}`}
                                            alt={booking.concertName}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:hidden">
                                            <h3 className="text-white font-bold text-lg">{booking.concertName}</h3>
                                        </div>
                                    </div>

                                    {/* Content */}
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
                                                {booking.status === 'CONFIRMED' ? 'ĐÃ THANH TOÁN' :
                                                    booking.status === 'PENDING' ? 'CHỜ THANH TOÁN' : 'ĐÃ HỦY'}
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
                                                        <span key={i} className="bg-gray-100 px-2 py-1 rounded-md">
                                                            {t.type}{t.seatLabel ? ` - ${t.seatLabel}` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:text-right">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tổng cộng</p>
                                                <p className="text-xl font-black text-gray-900">
                                                    {(booking.totalAmount * 100).toLocaleString('vi-VN')} <span className="text-sm">₫</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-50 p-6 md:w-52 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100">
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

                                        {booking.status === 'CONFIRMED' && !booking.tickets.some(t => t.isCheckedIn) && (
                                            <button
                                                onClick={() => {
                                                    if (!booking.invoiceId) {
                                                        alert('Không tìm thấy mã hóa đơn cho vé này.');
                                                        return;
                                                    }
                                                    setQrTarget(booking);
                                                }}
                                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition shadow-md shadow-gray-300 text-sm flex items-center justify-center gap-2 group"
                                            >
                                                <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Xem QR vé
                                            </button>
                                        )}

                                        {booking.status !== 'CANCELLED' && !booking.tickets.some(t => t.isCheckedIn) && (
                                            <button
                                                onClick={() => setDeleteTarget(booking)}
                                                className="w-full bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition text-sm flex items-center justify-center gap-2 group"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Hủy đặt vé
                                            </button>
                                        )}

                                        {booking.status === 'CANCELLED' && (
                                            <div className="w-full text-center text-xs text-gray-400 font-bold py-2">
                                                Vé đã bị hủy
                                            </div>
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

            <style jsx global>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.93); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}
