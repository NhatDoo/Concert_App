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
    onUpdateStatus?: (concertId: string, staffId: string, taskId: string, currentStatus: string) => void;
}

export const MyTasks: React.FC<MyTasksProps> = ({ staffRecords, loading, onUpdateStatus }) => {
    if (loading) return (
        // ... (existing loading UI)
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
        </div>
    );

    const allTasks = staffRecords.flatMap(r => (r.tasks || []).map(t => {
        let title = t.taskName || (t as any).title || "Nhiệm vụ";
        let description = t.description;
        let location = "";
        let time = t.dueDate ? new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

        // Fallback: Try to parse packed metadata from description if it's JSON
        try {
            if (t.description && t.description.trim().startsWith('{')) {
                const parsed = JSON.parse(t.description);
                title = t.taskName || parsed.title || title;
                description = parsed.desc || t.description;
                location = parsed.location || "";
                time = parsed.time || time;
            }
        } catch (e) {
            // Keep original if parsing fails
        }

        return {
            ...t,
            displayTitle: title,
            displayDescription: description,
            displayLocation: location,
            displayTime: time,
            staffName: r.name,
            staffRole: r.role,
            staffId: r.id,
            managerName: (t as any).taskManager?.name,
            concertId: r.concertId || (r as any).concert?.id,
            concertData: (r as any).concert
        };
    }));

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
            {allTasks.map(task => {
                const isPending = task.status === 'PENDING';
                const isWorking = task.status === 'WORKING';
                const isFinish = task.status === 'COMPLETED' || task.status === 'FINISH';

                const statusColor = isFinish ? 'text-emerald-600' : isWorking ? 'text-blue-600' : 'text-amber-600';
                const statusBg = isFinish ? 'bg-emerald-50' : isWorking ? 'bg-blue-50' : 'bg-amber-50';
                const dotColor = isFinish ? 'bg-emerald-600' : isWorking ? 'bg-blue-600 animate-pulse' : 'bg-amber-600 animate-bounce';
                const statusText = isFinish ? 'Hoàn thành' : isWorking ? 'Đang xử lý' : 'Chờ thực hiện';

                return (
                    <div key={task.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-100 transition-all group flex flex-col justify-between animate-in zoom-in-95 duration-500">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 ${statusBg} rounded-2xl flex items-center justify-center ${statusColor} shadow-inner group-hover:scale-105 transition-transform`}>
                                    <Star className="w-6 h-6" />
                                </div>
                                <div className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 ${statusBg} ${statusColor}`}>
                                    <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                                    {statusText}
                                </div>
                            </div>

                            <h3 className="text-xl text-slate-800 uppercase mb-3 leading-tight truncate">{task.displayTitle}</h3>

                            {(task.displayLocation || task.displayTime) && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {task.displayLocation && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-[9px] text-gray-400 uppercase">
                                            <MapPin className="w-3 h-3" /> {task.displayLocation}
                                        </div>
                                    )}
                                    {task.displayTime && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-[9px] text-gray-400 uppercase">
                                            <Clock className="w-3 h-3" /> {task.displayTime}
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-slate-500 text-xs mb-6 leading-relaxed bg-slate-50 p-5 rounded-2xl line-clamp-3">
                                {task.displayDescription}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px]">
                                    {task.staffName.charAt(0)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] text-slate-900 truncate uppercase tracking-widest">{task.staffName}</p>
                                    <p className="text-[8px] text-slate-400 uppercase tracking-widest">{task.staffRole}</p>
                                </div>
                                {onUpdateStatus && !isFinish && (
                                    <button
                                        onClick={() => onUpdateStatus(task.concertId, task.staffId, task.id, task.status)}
                                        className={`px-5 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg ${isWorking
                                                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
                                                : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
                                            }`}
                                    >
                                        {isWorking ? (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5" /> HOÀN THÀNH
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-3.5 h-3.5" /> BẮT ĐẦU LÀM
                                            </>
                                        )}
                                    </button>
                                )}
                                {isFinish && (
                                    <div className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 border border-emerald-100 italic">
                                        <CheckCircle className="w-3.5 h-3.5" /> ĐÃ KẾT THÚC
                                    </div>
                                )}
                            </div>

                            {task.concertData && (
                                <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-widest bg-blue-50/20 p-3 rounded-xl border border-blue-50/30">
                                    <div className="flex items-center gap-2 truncate max-w-[120px]">
                                        <MapPin className="w-2.5 h-2.5 text-blue-300" />
                                        {task.concertData.name}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <CalendarCheck className="w-2.5 h-2.5 text-blue-300" />
                                        {task.concertData.startDate ? new Date(task.concertData.startDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            )}
                            {task.managerName && (
                                <p className="text-[8px] text-amber-500 font-bold uppercase tracking-widest mt-2 px-2 text-right">
                                    Giao bởi : {task.managerName}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
