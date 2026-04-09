"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../src/stores/store';
import { OperationManager } from '../../../../../src/features/operations/components/OperationManager';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function OperationsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { token, user } = useSelector((state: RootState) => state.auth);

    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'MANAGER')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Truy cập bị từ chối</h2>
                    <p className="text-slate-500 mt-2 font-medium">Bạn không có quyền truy cập vào khu vực này.</p>
                    <button
                        onClick={() => router.push('/organizer')}
                        className="mt-6 bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                    >
                        Quay lại Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/organizer')}
                            className="bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-red-600" />
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Concert Operations Hub</span>
                            </div>
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">Quản lý Vận hành Chi tiết</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 mt-12">
                <OperationManager concertId={id} token={token} />
            </div>
        </div>
    );
}
