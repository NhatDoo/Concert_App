import React from 'react';
import { XCircle, Loader2, PlusCircle, Edit, Tag } from 'lucide-react';

interface ConcertFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: {
        name: string;
        startDate: string;
        location: string;
        image: File | null;
        seatMap: File | null;
        seats: string;
        categoryIds: string[];
        hashtags: string;
    };
    setFormData: (data: any) => void;
    onSeatExcelSelected: (file: File | null) => void;
    onDownloadSeatTemplate: () => void;
    isSubmitting: boolean;
    mode: 'create' | 'edit';
    categories: any[];
    seatSummary?: string | null;
}

export const ConcertFormModal: React.FC<ConcertFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    onSeatExcelSelected,
    onDownloadSeatTemplate,
    isSubmitting,
    mode,
    categories,
    seatSummary
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {mode === 'create' ? (
                            <PlusCircle className="w-6 h-6 text-red-500" />
                        ) : (
                            <Edit className="w-6 h-6 text-amber-500" />
                        )}
                        {mode === 'create' ? 'Tạo sự kiện mới' : 'Chỉnh sửa sự kiện'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Tên sự kiện</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition text-black"
                            placeholder="VD: Sky Tour 2026"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Ngày diễn ra</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition text-black"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Địa điểm</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition text-black"
                                placeholder="VD: Sân vận động Mỹ Đình"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Ảnh bìa {mode === 'edit' && '(Tùy chọn)'}</label>
                        <input
                            type="file"
                            accept="image/*"
                            required={mode === 'create'}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Thể loại (Categories)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="col-span-full space-y-4 mb-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Seat Map {mode === 'edit' && '(Optional)'}</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={e => setFormData({ ...formData, seatMap: e.target.files?.[0] || null })}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">Seats Excel</label>
                                        <button
                                            type="button"
                                            onClick={onDownloadSeatTemplate}
                                            className="text-xs font-bold text-blue-700 hover:text-blue-900 underline underline-offset-4"
                                        >
                                            Táº£i file máº«u
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                        onChange={e => onSeatExcelSelected(e.target.files?.[0] || null)}
                                    />
                                    <p className="mt-2 text-xs text-gray-500">Excel cáº§n 3 cá»™t: `label`, `ticketType`, `price`.</p>
                                    {seatSummary && (
                                        <p className="mt-2 text-xs font-semibold text-emerald-700">{seatSummary}</p>
                                    )}
                                </div>
                            </div>
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = formData.categoryIds.includes(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            const newIds = isSelected
                                                ? formData.categoryIds.filter(id => id !== cat.id)
                                                : [...formData.categoryIds, cat.id];
                                            setFormData({ ...formData, categoryIds: newIds });
                                        }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2 ${isSelected
                                            ? 'border-red-500 bg-red-50 text-red-600 shadow-md ring-2 ring-red-100'
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">{cat.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Hashtags
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition text-black"
                            placeholder="VD: #edm #livemusic #festival"
                            value={formData.hashtags}
                            onChange={e => setFormData({ ...formData, hashtags: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition uppercase tracking-widest text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 ${mode === 'create' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'} disabled:opacity-50 text-white px-6 py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-sm`}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'create' ? 'Tạo sự kiện' : 'Lưu thay đổi')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
