import React from 'react';
import { Edit, Ticket, ClipboardList, Music, Users, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ConcertTableProps {
    events: any[];
    loading: boolean;
    onEdit: (event: any) => void;
    onDelete?: (id: string) => void;
    onCreateClick: () => void;
}

export const ConcertTable: React.FC<ConcertTableProps> = ({ events, loading, onEdit, onDelete, onCreateClick }) => {
    if (loading) {
        return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (events.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có sự kiện nào</h3>
                <p className="text-gray-500 mb-6">Bạn chưa tạo bất kỳ sự kiện nào. Hãy bắt đầu ngay để thu hút khán giả.</p>
                <button
                    onClick={onCreateClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow"
                >
                    Tạo sự kiện ngay
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-12">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Tên sự kiện</th>
                            <th className="px-6 py-4 font-semibold">Ngày diễn ra</th>
                            <th className="px-6 py-4 font-semibold">Trạng thái</th>
                            <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {events.map((event, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <img src={event.imageUrl || 'https://images.unsplash.com/photo-1540039155732-6761b54f222a'} alt="C" className="w-16 h-12 rounded object-cover" />
                                        <span className="font-bold text-gray-900">{event.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium" suppressHydrationWarning>
                                    {new Date(event.startDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                        Đang mở bán
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3 text-gray-400">
                                        <button
                                            onClick={() => onEdit(event)}
                                            className="hover:text-amber-500 transition"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <Link href={`/organizer/concerts/${event.id}/tickets`} className="hover:text-blue-500 transition" title="Quản lý vé">
                                            <Ticket className="w-5 h-5" />
                                        </Link>
                                        <Link href={`/organizer/concerts/${event.id}/operations`} className="hover:text-red-500 transition" title="Quản lý vận hành (Operations)">
                                            <ClipboardList className="w-5 h-5" />
                                        </Link>
                                        <Link href={`/organizer/concerts/${event.id}/program`} className="hover:text-purple-500 transition" title="Lịch diễn (Line-up)">
                                            <Music className="w-5 h-5" />
                                        </Link>
                                        <Link href={`/organizer/concerts/${event.id}/staff`} className="hover:text-cyan-500 transition" title="Quản lý nhân sự">
                                            <Users className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => onDelete && onDelete(event.id)}
                                            className="hover:text-red-500 transition"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
