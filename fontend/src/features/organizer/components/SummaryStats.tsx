import React from 'react';
import { Music, Calendar, DollarSign, Ticket, Users } from 'lucide-react';

interface SummaryStatsProps {
    stats: {
        totalTicketsSold: number;
        totalRevenue: number;
        totalConcerts: number;
        activeConcerts: number;
        staffStats: { totalStaff: number; totalTasks: number; completedTasks: number; pendingTasks: number; taskCompletionRate: number }
    };
    eventsCount: number;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ stats, eventsCount }) => {
    return (
        <div className="container mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng sự kiện</p>
                    <p className="text-3xl font-bold text-gray-900">{eventsCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                    <Music className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sắp diễn ra</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeConcerts}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 text-orange-600 flex items-center justify-center rounded-xl">
                    <Calendar className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng doanh thu</p>
                    <p className="text-3xl font-bold text-gray-900" suppressHydrationWarning>{(stats.totalRevenue * 100).toLocaleString('vi-VN')} <span className="text-sm text-gray-400">VND</span></p>
                </div>
                <div className="w-12 h-12 bg-green-50 text-green-600 flex items-center justify-center rounded-xl">
                    <DollarSign className="w-6 h-6" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Nhân sự</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.staffStats.totalStaff}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl">
                    <Users className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};
