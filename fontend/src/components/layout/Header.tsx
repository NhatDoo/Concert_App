"use client";

import React from 'react';
import { Search, MapPin, User, Globe } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { LocationId } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { logout } from '../../features/auth';
import Link from 'next/link';

export const Header = () => {
    const { currentLocation, setCurrentLocation } = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentLocation(e.target.value as LocationId);
    };

    return (
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo and Search */}
                <div className="flex items-center gap-8 w-full md:w-auto">
                    <Link href="/" className="text-2xl font-bold text-red-600 tracking-tighter cursor-pointer">
                        CONCERTMUSIC
                    </Link>

                    <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72">
                        <Search className="w-5 h-5 text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sự kiện, ban tổ chức..."
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-800"
                        />
                    </div>
                </div>

                {/* Right Nav */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <select
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                            value={currentLocation}
                            onChange={handleLocationChange}
                        >
                            <option value="all">Tất cả địa điểm</option>
                            <option value="mn">Hồ Chí Minh</option>
                            <option value="mb">Hà Nội</option>
                            <option value="mt">Đà Nẵng</option>
                        </select>
                    </div>

                    {user?.role === 'ORGANIZER' && (
                        <Link href="/organizer" className="hidden sm:flex text-red-600 hover:text-red-700 transition items-center gap-1 font-bold text-sm bg-red-50 px-4 py-2 rounded-full">
                            Quản lý sự kiện
                        </Link>
                    )}

                    <div className="flex items-center gap-4">
                        <button className="text-gray-600 hover:text-black transition">
                            <Globe className="w-5 h-5" />
                        </button>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-semibold text-gray-800 hidden sm:block">
                                    Chào, {user.name}
                                </div>
                                <button
                                    onClick={() => dispatch(logout())}
                                    className="border border-red-500 text-red-500 px-4 py-2 rounded-full hover:bg-red-50 text-sm font-medium transition cursor-pointer"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 border border-full px-4 py-2 rounded-full hover:bg-red-50 hover:border-red-500 hover:text-red-500 text-sm font-medium transition cursor-pointer">
                                <User className="w-4 h-4" />
                                <span>Đăng nhập</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
