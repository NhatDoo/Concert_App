import React, { Suspense } from 'react';
import { RegisterForm } from '../../src/features/auth';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={
                <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 mt-10 mb-10 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Đang tải trang đăng ký...</p>
                </div>
            }>
                <RegisterForm />
            </Suspense>
        </div>
    );
}

