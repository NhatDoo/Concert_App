import React from 'react';
import {
    CalendarCheck,
    Clock,
    Star,
    MapPin,
    CheckCircle,
    MoreHorizontal,
    Loader2
} from 'lucide-react';

import { Task, StaffRecord } from './types';

interface MyTasksProps {
    staffRecords: StaffRecord[];
    loading: boolean;
}

export const MyTasks: React.FC<MyTasksProps> = ({ staffRecords, loading }) => {
    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
        </div>
    );

    const allTasks = staffRecords.flatMap(r => (r.tasks || []).map(t => ({ ...t, staffName: r.name, staffRole: r.role })));

    if (allTasks.length === 0) return (
        <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 font-bold max-w-4xl mx-auto">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-8">
                <CalendarCheck className="w-12 h-12" />
            </div>
            <h3 className="text-2xl text-slate-900 uppercase mb-2">Chưa có nhiệm vụ nào</h3>
            <p className="text-slate-400 uppercase tracking-widest text-[10px]">Quản lý sẽ phân công cho bạn sớm thôi!</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-bold max-w-7xl mx-auto">
            {allTasks.map(task => (
                <div key={task.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-100 transition-all group flex flex-col justify-between animate-in zoom-in-95 duration-500">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-105 transition-transform">
                                <Star className="w-6 h-6" />
                            </div>
                            <div className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-600' : 'bg-orange-600 animate-pulse'}`}></div>
                                {task.status}
                            </div>
                        </div>

                        <h3 className="text-2xl text-slate-800 uppercase mb-3 leading-tight truncate">{task.title}</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed bg-slate-50 p-4 rounded-2xl line-clamp-2">
                            {task.description}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs">
                                {task.staffName.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs text-slate-900 truncate max-w-[120px]">{task.staffName}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{task.staffRole}</p>
                            </div>
                        </div>

                        {task.concert && (
                            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-tighter bg-blue-50/30 p-3 rounded-xl border border-blue-50/50 overflow-hidden">
                                <div className="flex items-center gap-2 truncate max-w-[150px]">
                                    <MapPin className="w-3 h-3 text-blue-400" />
                                    {task.concert.name}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Clock className="w-3 h-3 text-blue-400" />
                                    {new Date(task.concert.date).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
