"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState<string>('Đang xử lý kết quả thanh toán...');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const verifyPayment = async () => {
            // Get all query params
            const params = new URLSearchParams(searchParams.toString());

            // If no params, redirect to home
            if (params.toString() === '') {
                router.push('/');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/billing/payments/callback?${params.toString()}`);

                if (!response.ok) {
                    throw new Error('Không thể xác thực thanh toán từ máy chủ');
                }

                const data = await response.json();

                if (data.isSuccess) {
                    setStatus('success');
                    setMessage('Thanh toán thành công! Vé của bạn đã được xác nhận.');
                } else {
                    setStatus('failed');
                    setMessage(data.message || 'Thanh toán thất bại hoặc đã bị gián đoạn.');
                }
            } catch (error: any) {
                setStatus('failed');
                setMessage(error.message);
            }
        };

        verifyPayment();
    }, [searchParams, apiUrl, router]);

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center">
                {status === 'loading' && (
                    <div className="animate-pulse">
                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Đang xử lý...</h2>
                        <p className="text-gray-500 font-medium">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Đặt vé thành công!</h2>
                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                            {message} Bạn có thể kiểm tra lại thông tin mã vé trong trang quản lý cá nhân.
                        </p>

                        <div className="space-y-3">
                            <Link href="/bookings" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg flex justify-center items-center gap-2">
                                Xem vé của tôi
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link href="/" className="w-full bg-white text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 block">
                                Trở lại trang chủ
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div>
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Thanh toán thất bại</h2>
                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                            {message} Mọi thắc mắc xin vui lòng liên hệ bộ phận hỗ trợ Ticketbox.
                        </p>

                        <div className="space-y-3">
                            <Link href="/bookings" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg block">
                                Thử lại từ trang Vé
                            </Link>
                            <button onClick={() => window.close()} className="w-full bg-white text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 block">
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
