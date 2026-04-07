"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Package, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/stores/store';

interface Equipment {
    id: string;
    name: string;
    category: string;
    description: string | null;
    totalQty: number;
    availableQty: number;
    status: string;
    imageUrl: string | null;
}

export default function EquipmentManagement() {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Âm thanh',
        description: '',
        totalQty: 1,
        availableQty: 1,
    });

    const { token } = useSelector((state: RootState) => state.auth);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchEquipments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/vendor/equipments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setEquipments(data);
            }
        } catch (error) {
            console.error('Error fetching equipments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchEquipments();
    }, [token]);

    const handleAddEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/vendor/equipments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsAddModalOpen(false);
                setFormData({ name: '', category: 'Âm thanh', description: '', totalQty: 1, availableQty: 1 });
                fetchEquipments();
            }
        } catch (error) {
            console.error('Error adding equipment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEquipment) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/vendor/equipments/${selectedEquipment.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsEditModalOpen(false);
                fetchEquipments();
            }
        } catch (error) {
            console.error('Error updating equipment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (item: Equipment) => {
        setSelectedEquipment(item);
        setFormData({
            name: item.name,
            category: item.category,
            description: item.description || '',
            totalQty: item.totalQty,
            availableQty: item.availableQty,
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
        try {
            const response = await fetch(`${API_URL}/vendor/equipments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                fetchEquipments();
            }
        } catch (error) {
            console.error('Error deleting equipment:', error);
        }
    };

    const filteredEquipments = equipments.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý trang thiết bị</h1>
                    <p className="text-slate-500 font-medium">Theo dõi và cập nhật danh mục thiết bị của bạn.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus size={20} strokeWidth={3} />
                    Thêm thiết bị mới
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thiết bị..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter size={18} />
                        Bộ lọc
                    </button>
                </div>
            </div>

            {/* Equipment Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                </div>
            ) : filteredEquipments.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                        <Package size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có thiết bị nào</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Bắt đầu bằng cách thêm các thiết bị âm thanh, ánh sáng, sân khấu vào kho của bạn.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-amber-600 font-black uppercase tracking-widest text-xs hover:text-amber-700 transition-colors"
                    >
                        + Thêm ngay bây giờ
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEquipments.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
                            <div className="h-48 bg-slate-50 relative overflow-hidden">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Package size={48} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${item.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                        }`}>
                                        {item.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Bảo trì'}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 bg-white rounded-xl shadow-lg hover:text-amber-600 transition-colors">
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">{item.category}</p>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{item.name}</h3>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">{item.description || 'Không có mô tả chi tiết cho thiết bị này.'}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng kho</span>
                                        <span className="text-lg font-black text-slate-900">{item.totalQty}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khả dụng</span>
                                        <span className={`text-lg font-black ${item.availableQty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {item.availableQty}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Equipment Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thêm thiết bị mới</h3>
                                <p className="text-slate-500 font-medium text-sm">Nhập thông tin cơ bản về thiết bị của bạn.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAddEquipment} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Tên thiết bị</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold"
                                        placeholder="VD: Dàn loa Line-Array K2"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Danh mục</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Âm thanh</option>
                                        <option>Ánh sáng</option>
                                        <option>Sân khấu</option>
                                        <option>Màn hình LED</option>
                                        <option>Nội thất sự kiện</option>
                                        <option>Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Tổng số lượng</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold"
                                        value={formData.totalQty}
                                        onChange={(e) => setFormData({ ...formData, totalQty: parseInt(e.target.value), availableQty: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Mô tả chi tiết</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold h-32 resize-none"
                                    placeholder="Thông số kỹ thuật, tình trạng..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-3 py-4 bg-amber-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Thêm thiết bị'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Equipment Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cập nhật thiết bị</h3>
                                <p className="text-slate-500 font-medium text-sm">Chỉnh sửa thông tin thiết bị đang có.</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateEquipment} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Tên thiết bị</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold text-slate-800"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Danh mục</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold appearance-none text-slate-800"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Âm thanh</option>
                                        <option>Ánh sáng</option>
                                        <option>Sân khấu</option>
                                        <option>Màn hình LED</option>
                                        <option>Nội thất sự kiện</option>
                                        <option>Khác</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Tổng</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold text-slate-800"
                                            value={formData.totalQty}
                                            onChange={(e) => setFormData({ ...formData, totalQty: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Khả dụng</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold text-slate-800"
                                            value={formData.availableQty}
                                            onChange={(e) => setFormData({ ...formData, availableQty: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Mô tả chi tiết</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold h-32 resize-none text-slate-800"
                                    placeholder="Thông số kỹ thuật, tình trạng..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-3 py-4 bg-amber-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-amber-900/20 hover:bg-amber-700 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
