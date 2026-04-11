import React from 'react';
import { DollarSign, Ticket, TrendingUp } from 'lucide-react';

interface RevenueViewProps {
    stats: {
        totalRevenue: number;
        totalTicketsSold: number;
    };
}

export const RevenueView: React.FC<RevenueViewProps> = ({ stats }) => {
    return (
        <div className="container mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-green-50/50 border border-green-100 flex items-center justify-between group hover:border-green-300 transition-all duration-300">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black text-green-600 uppercase tracking-widest">Tổng doanh thu</p>
                        </div>
                        <p className="text-5xl font-black text-gray-900 leading-none" suppressHydrationWarning>
                            {stats.totalRevenue.toLocaleString('vi-VN')}
                            <span className="text-xl text-gray-400 ml-2 font-bold uppercase">Vnd</span>
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+12.5% so với tháng trước</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-purple-50/50 border border-purple-100 flex items-center justify-between group hover:border-purple-300 transition-all duration-300">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Vé đã bán</p>
                        </div>
                        <p className="text-5xl font-black text-gray-900 leading-none" suppressHydrationWarning>
                            {stats.totalTicketsSold.toLocaleString('vi-VN')}
                            <span className="text-xl text-gray-400 ml-2 font-bold uppercase">Vé</span>
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-purple-500 font-bold text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+8.2% so với tháng trước</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for charts */}
            <div className="mt-10 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400 font-medium">
                Biểu đồ tăng trưởng đang được cập nhật...
            </div>
        </div>
    );
};
