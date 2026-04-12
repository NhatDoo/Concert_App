"use client";

import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { useSelector } from "react-redux";
import { RootState } from "@/src/stores/store";
import {
    QrCode,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Ticket as TicketIcon,
    Camera,
    RefreshCcw,
    ChevronLeft,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";

export default function QRScannerPage() {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [scanResult, setScanResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Sử dụng Refs để tránh lỗi stale-closure trong callbacks của thư viện ngoài
    const stepRef = useRef(1);
    const isProcessingRef = useRef(false);
    const concertIdStateRef = useRef("");
    const html5QrCodeRef = useRef<any>(null);

    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isSecure, setIsSecure] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Đồng bộ step state với ref
    useEffect(() => {
        stepRef.current = step;
    }, [step]);

    // Kiểm tra HTTPS
    useEffect(() => {
        if (typeof window !== "undefined") {
            const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            setIsSecure(window.isSecureContext || isLocal);
        }
    }, []);

    const initScanner = async () => {
        if (typeof window !== "undefined" && "Html5Qrcode" in window) {
            const Html5Qrcode = (window as any).Html5Qrcode;

            if (html5QrCodeRef.current) {
                try { await html5QrCodeRef.current.stop(); } catch (e) { }
            }

            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            const config = { fps: 20, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 };

            try {
                await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure);
                setIsCameraReady(true);
                setError(null);
            } catch (err) {
                console.error("Camera start error:", err);
                setIsCameraReady(false);
                try {
                    await html5QrCode.start({ facingMode: "user" }, config, onScanSuccess);
                    setIsCameraReady(true);
                } catch (e) {
                    setError("Không thể truy cập Camera. Hãy kiểm tra quyền truy cập.");
                }
            }
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.pause(); // Tạm dừng thay vì dừng hẳn để resume nhanh
            } catch (e) { }
        }
    };

    const resumeScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.resume();
            } catch (e) { }
        }
    };

    const onScanSuccess = async (decodedText: string) => {
        // Sử dụng Ref để check trạng thái mới nhất
        if (isProcessingRef.current || stepRef.current === 3) return;
        isProcessingRef.current = true;

        try {
            const data = JSON.parse(decodedText);

            // Xử lý Bước 2 (Mã xác thực)
            if (data.type === "V") {
                if (stepRef.current !== 2) {
                    setError("Hãy quét vé gốc ở Bước 1 trước khi xác thực!");
                    setTimeout(() => { isProcessingRef.current = false; }, 2000);
                    return;
                }
                await stopScanner();
                await handleCheckIn(data.c || concertIdStateRef.current, [data.t], data.v);
            }
            // Xử lý Bước 1 (Vé gốc)
            else if (data.cId && data.tIds) {
                // Nếu đang chờ bước 2 mà quét lại vé khác -> tự động reset về bước 1
                if (stepRef.current === 2) {
                    setStep(1);
                    stepRef.current = 1;
                }

                await stopScanner();
                concertIdStateRef.current = data.cId;
                setScanResult({
                    concertId: data.cId,
                    ticketIds: data.tIds,
                    concert: data.cName || "Sự kiện",
                    tickets: data.tTypes || ["Vé điện tử"]
                });
                await handleCheckIn(data.cId, data.tIds);
            }
        } catch (err) {
            console.error("Scan error:", err);
        } finally {
            // Chỉ mở lại khóa nếu chưa sang bước 3 hoặc không dính error cứng
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 800);
        }
    };

    const onScanFailure = () => { };

    const handleCheckIn = async (concertId: string, ticketIds: string[], vToken?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const targetTicketId = ticketIds[0];
            const response = await fetch(`${apiUrl}/concerts/${concertId}/tickets/${targetTicketId}/check-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ verificationToken: vToken || null }),
            });

            const res = await response.json();

            if (response.ok) {
                if (Number(res.step) === 1) {
                    setStep(2);
                    await resumeScanner();
                } else {
                    setStep(3); // Thành công
                }
            } else {
                setError(res.message || "Lỗi xác thực.");
                await resumeScanner();
            }
        } catch (err) {
            setError("Lỗi kết nối. Hãy kiểm tra server/mạng.");
            await resumeScanner();
        } finally {
            setIsLoading(false);
        }
    };

    const resetScan = async () => {
        setScanResult(null);
        setError(null);
        setStep(1);
        stepRef.current = 1;
        concertIdStateRef.current = "";
        isProcessingRef.current = false;
        setIsLoading(false);
        if (html5QrCodeRef.current) {
            try { await html5QrCodeRef.current.resume(); } catch (e) { }
        }
    };

    if (!user) return <div className="h-screen bg-black flex items-center justify-center text-white">Yêu cầu Staff</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            <Script src="https://unpkg.com/html5-qrcode" strategy="afterInteractive" onLoad={initScanner} />

            <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
                <Link href="/staff" className="p-2 bg-white/5 rounded-xl"><ChevronLeft className="w-5 h-5" /></Link>
                <div className="text-center">
                    <p className="text-[10px] font-black tracking-[0.3em] text-red-500 uppercase">Scanner Pro</p>
                    <h1 className="text-sm font-bold">Check-in 2.0</h1>
                </div>
                <button onClick={() => window.location.reload()} className="p-2 bg-white/5 rounded-xl"><RefreshCcw className="w-5 h-5" /></button>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 blur-[100px] rounded-full" />

                <div className="w-full max-w-sm z-10">
                    {!isSecure && (
                        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3 text-orange-400 text-[10px] font-bold">
                            <ShieldAlert className="w-4 h-4" />
                            <p>Cần HTTPS để bật Camera trên điện thoại.</p>
                        </div>
                    )}

                    <div className={`relative transition-all duration-500 ${step === 3 || error ? 'h-0 opacity-0 scale-90 overflow-hidden' : 'h-[360px] opacity-100'}`}>
                        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-2 border-l-2 border-red-500 rounded-tl-[2.5rem] z-20" />
                        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-2 border-r-2 border-red-500 rounded-tr-[2.5rem] z-20" />
                        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-2 border-l-2 border-red-500 rounded-bl-[2.5rem] z-20" />
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-2 border-r-2 border-red-500 rounded-br-[2.5rem] z-20" />

                        <div className="w-full h-full bg-[#111] rounded-[2.5rem] overflow-hidden border border-white/5 relative">
                            <div id="qr-reader" className="w-full h-full" />
                            <div className="absolute inset-x-10 top-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-30 animate-scan" />

                            {!isCameraReady && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-40">
                                    <Camera className="w-12 h-12 text-white/5 mb-4" />
                                    <button onClick={initScanner} className="px-5 py-2.5 bg-red-600 rounded-full text-[10px] font-black uppercase shadow-lg">Bật Camera</button>
                                </div>
                            )}

                            {isLoading && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-3" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Đang xử lý...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {(step === 3 || error) && (
                        <div className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] text-center shadow-2xl animate-in zoom-in-95">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${step === 3 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {step === 3 ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                            </div>
                            <h3 className="text-2xl font-black mb-1 uppercase">{step === 3 ? "Xác thực OK" : "Lỗi xác thực"}</h3>
                            {step === 3 && (
                                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-4">
                                    Lúc: {new Intl.DateTimeFormat('vi-VN', {
                                        timeZone: 'Asia/Ho_Chi_Minh',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    }).format(new Date())}
                                </p>
                            )}
                            {error && <p className="text-sm text-red-400 bg-red-500/5 p-4 rounded-2xl border border-red-500/10 mt-4 leading-relaxed">{error}</p>}

                            {step === 3 && (
                                <div className="bg-white/5 p-6 rounded-3xl text-left border border-white/5 my-6">
                                    <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{scanResult?.concert}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {scanResult?.tickets?.map((t: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-black rounded-lg text-[10px] font-bold border border-white/10 text-gray-400">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button onClick={resetScan} className="w-full bg-red-600 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest mt-4">Quét tiếp</button>
                        </div>
                    )}

                    {step < 3 && !error && (
                        <div className="mt-8 text-center">
                            <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/5 mb-2">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                    {step === 1 ? "Bước 1: Quét vé" : "Bước 2: Quét mã xác nhận"}
                                </p>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                {step === 1 ? "Đưa mã QR trên vé vào khung hình" : "Quét mã ĐEN hiện trên máy khách"}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                @keyframes scan { 0% { top: 10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
                .animate-scan { animation: scan 2s ease-in-out infinite; }
                #qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; transform: scaleX(-1); }
            `}</style>
        </div>
    );
}
