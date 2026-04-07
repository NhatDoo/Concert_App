"use client";

import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, CheckCircle2, ChevronRight, Search, Filter, Loader2, Calendar, ClipboardList } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/stores/store';

interface LogisticsItem {
    id: string;
    equipmentId: string;
    quantity: number;
    equipment: {
        name: string;
        category: string;
    }
}

interface LogisticsOrder {
    id: string;
    status: string;
    notes: string | null;
    orderDate: string;
    deliveryDate: string | null;
    items: LogisticsItem[];
}

export default function LogisticsManagement() {
    const [orders, setOrders] = useState<LogisticsOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    const { token } = useSelector((state: RootState) => state.auth);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/vendor/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch(`${API_URL}/vendor/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'PREPARING': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'PREPARING': return 'Đang chuẩn bị';
            case 'SHIPPED': return 'Đang vận chuyển';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hậu cần & Cung ứng</h1>
                <p className="text-slate-500 font-medium">Quản lý và cập nhật trạng thái các đơn hàng thiết bị.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                {['ALL', 'PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${filterStatus === status
                                ? 'bg-slate-900 text-white shadow-lg active:scale-95'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {status === 'ALL' ? 'Tất cả' : getStatusText(status)}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải đơn hàng...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                        <Truck size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có đơn hàng nào</h3>
                    <p className="text-slate-500 max-w-xs mx-auto font-medium">Khi các nhà tổ chức sự kiện yêu cầu thiết bị, đơn hàng sẽ xuất hiện tại đây.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders
                        .filter(o => filterStatus === 'ALL' || o.status === filterStatus)
                        .map((order) => (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                                    {/* Order Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${getStatusStyle(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </div>
                                            <span className="text-slate-300">|</span>
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                <Calendar size={16} />
                                                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            Mã đơn: <span className="text-amber-600">#{order.id.slice(0, 8).toUpperCase()}</span>
                                        </h3>
                                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                            {order.notes || 'Không có ghi chú thêm cho đơn hàng này.'}
                                        </p>
                                    </div>

                                    {/* Items Summary */}
                                    <div className="lg:w-72 p-6 bg-slate-50 rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Thiết bị yêu cầu</p>
                                        <div className="space-y-3">
                                            {order.items.slice(0, 2).map((item) => (
                                                <div key={item.id} className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-700 truncate pr-4">{item.equipment.name}</span>
                                                    <span className="text-xs font-black text-amber-600">x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-[10px] text-slate-400 font-bold italic pt-1">và {order.items.length - 2} thiết bị khác...</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:w-64 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Cập nhật trạng thái</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'PREPARING')}
                                                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                                >
                                                    Chuẩn bị hàng
                                                </button>
                                            )}
                                            {order.status === 'PREPARING' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'SHIPPED')}
                                                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                                                >
                                                    Bắt đầu giao
                                                </button>
                                            )}
                                            {order.status === 'SHIPPED' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'DELIVERED')}
                                                    className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                                                >
                                                    Xác nhận đã giao
                                                </button>
                                            )}
                                            <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                                                Chi tiết đơn hàng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
