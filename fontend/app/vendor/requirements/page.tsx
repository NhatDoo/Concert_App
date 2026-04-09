"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/stores/store';
import { VendorRequirementManager } from '../../../src/features/operations/components/VendorRequirementManager';
import { Package } from 'lucide-react';

export default function VendorRequirementsPage() {
    const { token, user } = useSelector((state: RootState) => state.auth);

    if (!user || user.role !== 'VENDOR') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Vendor Access Only</h2>
                    <p className="text-slate-500 mt-2 font-medium">Bạn cần đăng nhập với vai trò Vendor để xem yêu cầu.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-6 border-l-4 border-orange-500">
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-600" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Vendor Operations Portal</span>
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">Điều phối & Cung ứng</h1>
                </div>
            </div>

            <div className="container mx-auto px-6 mt-12">
                <VendorRequirementManager token={token} />
            </div>
        </div>
    );
}
