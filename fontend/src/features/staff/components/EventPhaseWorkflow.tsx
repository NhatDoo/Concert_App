import React, { useState } from 'react';
import {
    ClipboardList,
    Users,
    Zap,
    Mic2,
    CheckCircle2,
    ChevronRight,
    Clock,
    AlertCircle,
    FileText,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

interface Phase {
    id: number;
    title: string;
    icon: React.ReactNode;
    description: string;
    tasks: { id: string; text: string; completed: boolean }[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export const EventPhaseWorkflow: React.FC = () => {
    const [phases, setPhases] = useState<Phase[]>([
        {
            id: 1,
            title: 'Giai đoạn 1: Lập kế hoạch',
            icon: <ClipboardList className="w-5 h-5" />,
            description: 'Xác định tầm nhìn, quy mô và lộ trình tổng thể cùng Organizer.',
            status: 'IN_PROGRESS',
            tasks: [
                { id: '1-1', text: 'Họp với Organizer để chốt Concept Event', completed: true },
                { id: '1-2', text: 'Xác định quy mô và mục tiêu (KPI)', completed: false },
                { id: '1-3', text: 'Lập bản Timeline tổng (Master Timeline)', completed: false },
                { id: '1-4', text: 'Dự toán ngân sách sơ bộ', completed: false },
            ]
        },
        {
            id: 2,
            title: 'Giai đoạn 2: Xây dựng Đội ngũ',
            icon: <Users className="w-5 h-5" />,
            description: 'Tuyển dụng các quản lý bộ phận chủ chốt (Production, Tech, Marketing).',
            status: 'PENDING',
            tasks: [
                { id: '2-1', text: 'Tìm kiếm qua Chợ Nhân Sự / Tuyển Production Manager', completed: false },
                { id: '2-2', text: 'Giao chỉ tiêu cho Technical Manager', completed: false },
                { id: '2-3', text: 'Khởi động team Marketing & Truyền thông', completed: false },
                { id: '2-4', text: 'Phân chia trách nhiệm & Dashboard công việc', completed: false },
            ]
        },
        {
            id: 3,
            title: 'Giai đoạn 3: Điều phối & Thực thi',
            icon: <Zap className="w-5 h-5" />,
            description: 'Đảm bảo tiến độ và xử lý xung đột giữa các bộ phận/Vendor.',
            status: 'PENDING',
            tasks: [
                { id: '3-1', text: 'Duyệt báo cáo hằng ngày từ các Managers', completed: false },
                { id: '3-2', text: 'Làm việc với các Vendor (Âm thanh, Ánh sáng, Sân khấu)', completed: false },
                { id: '3-3', text: 'Kiểm soát rủi ro & Conflict resolution', completed: false },
                { id: '3-4', text: 'Tracking Master Timeline', completed: false },
            ]
        },
        {
            id: 4,
            title: 'Giai đoạn 4: On-site (Ngày diễn ra)',
            icon: <Mic2 className="w-5 h-5" />,
            description: 'Tổng chỉ huy tại sân khấu. Quyết định nhanh các tình huống khẩn cấp.',
            status: 'PENDING',
            tasks: [
                { id: '4-1', text: 'Check âm thanh, ánh sáng & Rehearsal cuối', completed: false },
                { id: '4-2', text: 'Điều phối luồng khán giả và an ninh', completed: false },
                { id: '4-3', text: 'Xử lý sự cố kỹ thuật tại chỗ', completed: false },
                { id: '4-4', text: 'Duyệt kịch bản On-air', completed: false },
            ]
        },
        {
            id: 5,
            title: 'Giai đoạn 5: Kết thúc & Báo cáo',
            icon: <FileText className="w-5 h-5" />,
            description: 'Audit hiệu quả và báo cáo kết quả cuối cùng cho Organizer.',
            status: 'PENDING',
            tasks: [
                { id: '5-1', text: 'Tổng kết chi phí thực tế (Logistics cost audit)', completed: false },
                { id: '5-2', text: 'Báo cáo hiệu quả & KPI (Marketing stats)', completed: false },
                { id: '5-3', text: 'Debrief với toàn bộ team Managers', completed: false },
                { id: '5-4', text: 'Bàn giao báo cáo cuối cùng cho Organizer', completed: false },
            ]
        }
    ]);

    const [showReportModal, setShowReportModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportData, setReportData] = useState({
        budgetAudit: '',
        marketingReach: '',
        staffEvaluation: '',
        finalStatus: 'SUCCESS',
        notes: ''
    });

    const toggleTask = (phaseId: number, taskId: string) => {
        setPhases(prev => prev.map(p => {
            if (p.id !== phaseId) return p;
            const newTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
            const allCompleted = newTasks.every(t => t.completed);
            return {
                ...p,
                tasks: newTasks,
                status: allCompleted ? 'COMPLETED' : (newTasks.some(t => t.completed) ? 'IN_PROGRESS' : 'PENDING')
            };
        }));
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...reportData,
                    organizerId: '6339ac9c-c90a-406c-8292-698f1f7edaa1', // Mock or passed from props
                    authorId: 'e28153c3-3286-4f40-8430-b98a0d4c82b1'    // Mock or passed from props
                })
            });
            if (res.ok) {
                setShowReportModal(false);
                alert("Đã gởi báo cáo tổng kết cho Organizer thành công!");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Modal Báo cáo */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/40">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
                        <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Báo cáo Tổng kết Concert</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Giai đoạn 5: Kết thúc & Bàn giao</p>
                            </div>
                            <button onClick={() => setShowReportModal(false)} className="bg-white/10 p-3 rounded-2xl hover:bg-red-600 transition-colors">
                                <Zap className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="p-12 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Kiểm toán Ngân sách (VNĐ)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                        placeholder="0"
                                        value={reportData.budgetAudit}
                                        onChange={(e) => setReportData({ ...reportData, budgetAudit: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Marketing Reach (Lượt)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                        placeholder="0"
                                        value={reportData.marketingReach}
                                        onChange={(e) => setReportData({ ...reportData, marketingReach: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Đánh giá Nhân sự & Team</label>
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 outline-none focus:border-red-500 min-h-[100px] font-medium text-sm"
                                    placeholder="Điểm mạnh, yếu của team trong dự án..."
                                    value={reportData.staffEvaluation}
                                    onChange={(e) => setReportData({ ...reportData, staffEvaluation: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Đánh giá Thành công chung</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                    value={reportData.finalStatus}
                                    onChange={(e) => setReportData({ ...reportData, finalStatus: e.target.value })}
                                >
                                    <option value="SUCCESS">THÀNH CÔNG RỰC RỠ</option>
                                    <option value="PARTIAL">THÀNH CÔNG MỘT PHẦN</option>
                                    <option value="FAILURE">KHÔNG ĐẠT KỲ VỌNG</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Ghi chú bổ sung cho Organizer</label>
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 outline-none focus:border-red-500 min-h-[100px] font-medium text-sm"
                                    placeholder="Ý kiến cá nhân..."
                                    value={reportData.notes}
                                    onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100 disabled:bg-slate-300"
                            >
                                {isSubmitting ? "Đang gởi báo cáo..." : "Xác nhận nộp báo cáo tổng kết"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/20">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">Quy trình Tổng chỉ huy</h2>
                            <p className="text-slate-400 text-sm mt-2 font-medium max-w-lg">
                                Vai trò là <span className="text-red-500 font-black">EVENT MANAGER</span>, bạn điều hành toàn bộ mạch sống của Concert từ khi còn là ý tưởng đến khi hạ màn.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Tiến độ tổng</p>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600 transition-all duration-1000 shadow-lg shadow-red-500/50"
                                        style={{ width: `${(phases.filter(p => p.status === 'COMPLETED').length / phases.length) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xl font-black italic">
                                    {Math.round((phases.filter(p => p.status === 'COMPLETED').length / phases.length) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {phases.map((phase, idx) => (
                    <div key={phase.id} className="relative group">
                        {idx < phases.length - 1 && (
                            <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-slate-200 -z-10">
                                <div
                                    className="h-full bg-red-500 transition-all duration-1000"
                                    style={{ width: phase.status === 'COMPLETED' ? '100%' : '0%' }}
                                ></div>
                            </div>
                        )}
                        <div className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 h-full ${phase.status === 'COMPLETED' ? 'border-green-100 shadow-lg' : phase.status === 'IN_PROGRESS' ? 'border-red-100 shadow-xl shadow-red-500/5' : 'border-slate-50 opacity-60 hover:opacity-100'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${phase.status === 'COMPLETED' ? 'bg-green-600 text-white shadow-xl shadow-green-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-red-600 group-hover:text-white'}`}>
                                {phase.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> : phase.icon}
                            </div>
                            <h3 className="text-sm font-black uppercase mb-2 leading-tight">{phase.title}</h3>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-6">
                                {phase.description}
                            </p>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                {phase.tasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(phase.id, task.id)}
                                        className="flex items-start gap-3 cursor-pointer group/task"
                                    >
                                        <div className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-red-600 border-red-600' : 'border-slate-200 group-hover/task:border-red-400'}`}>
                                            {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`text-[10px] font-bold leading-tight transition-all ${task.completed ? 'text-slate-300 line-through' : 'text-slate-600 group-hover/task:text-red-500'}`}>
                                            {task.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black uppercase">Chế độ Phân tích Hiệu quả</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Giai đoạn 5: Kết thúc cho phép bạn nộp báo cáo lợi nhuận.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowReportModal(true)}
                    className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
                >
                    Báo cáo cho Organizer
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
