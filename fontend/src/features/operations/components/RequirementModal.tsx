import React, { useState } from 'react';
import { X, ClipboardList, Users, DollarSign, Package, Send } from 'lucide-react';

interface Props {
    concertId: string;
    vendors: any[];
    authorId: string;
    onClose: () => void;
    onSubmit: (data: any) => Promise<boolean>;
}

export const RequirementModal: React.FC<Props> = ({ concertId, vendors, authorId, onClose, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        staffNeeded: 0,
        budgetAllocated: 0,
        vendorId: '' // Optional: linked to a specific vendor
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSubmit({
            ...formData,
            concertId,
            authorId,
        });
        if (success) {
            onClose();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/40">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
                <div className="p-10 bg-red-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Yêu cầu Vận hành Mới</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase mt-1">Giai đoạn 3: Điều phối & Thực thi</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-white/10 p-3 rounded-2xl hover:bg-black transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-8 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Tiêu đề yêu cầu</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                            placeholder="VD: Cung cấp thiết bị âm thanh khu vực A"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Mô tả chi tiết</label>
                        <textarea
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 outline-none focus:border-red-500 min-h-[120px] font-medium text-sm"
                            placeholder="Chi tiết các hạng mục cần cung cấp..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pl-2">
                                <Users className="w-3 h-3 text-red-500" />
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nhân sự cần thiết</label>
                            </div>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                value={formData.staffNeeded}
                                onChange={(e) => setFormData({ ...formData, staffNeeded: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pl-2">
                                <DollarSign className="w-3 h-3 text-green-500" />
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ngân sách dự kiến (VNĐ)</label>
                            </div>
                            <input
                                type="number"
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold"
                                placeholder="0"
                                value={formData.budgetAllocated}
                                onChange={(e) => setFormData({ ...formData, budgetAllocated: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Chọn đối tác (Vendor)</label>
                        <select
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-red-500 font-bold appearance-none cursor-pointer"
                            value={formData.vendorId}
                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                        >
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {vendors.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.name} ({v.user?.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Package className="w-5 h-5" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Yêu cầu này sẽ được gởi đến Vendor Manager để phê duyệt</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-slate-200 disabled:bg-slate-300 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            "Đang gởi yêu cầu..."
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Xác nhận và Gởi yêu cầu
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
