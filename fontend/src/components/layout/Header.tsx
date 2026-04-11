"use client";

import React from 'react';
import { Search, MapPin, User, Globe } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { LocationId } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import { logout } from '../../features/auth';
import { fetchConcerts, searchConcerts } from '../../features/concerts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Header = () => {
    const { currentLocation, setCurrentLocation } = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<any>();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [suggestions, setSuggestions] = React.useState<any[]>([]);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);
    const [isFocused, setIsFocused] = React.useState(false);

    // Debounce tìm kiếm khi gõ
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 2) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                try {
                    const response = await fetch(`${apiUrl}/concerts/search?query=${encodeURIComponent(searchTerm)}`);
                    const data = await response.json();
                    setSuggestions(data.map((item: any) => ({
                        id: item.id?.toString(),
                        title: item.name,
                        location: item.location,
                        imageUrl: item.imageUrl,
                        minPrice: item.minPrice,
                        artists: item.artists
                    })));
                } catch (error) {
                    console.error("Gợi ý tìm kiếm thất bại:", error);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentLocation(e.target.value as LocationId);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (searchTerm.trim()) {
                dispatch(searchConcerts(searchTerm));
                router.push('/'); // Chuyển về trang chủ để xem kết quả
            } else {
                dispatch(fetchConcerts());
            }
        }
    };

    return (
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo and Search */}
                <div className="flex items-center gap-8 w-full md:w-auto">
                    <Link href="/" className="text-2xl font-bold text-red-600 tracking-tighter cursor-pointer">
                        CONCERTMUSIC
                    </Link>

                    <div className="hidden md:block relative group">
                        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-red-500 transition-all shadow-sm">
                            <Search className="w-5 h-5 text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên buổi nhạc, địa điểm..."
                                className="bg-transparent border-none outline-none text-sm w-full text-gray-800 placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow clicks
                            />
                        </div>

                        {/* Dropdown gợi ý thông minh */}
                        {isFocused && (suggestions.length > 0 || searchTerm.length > 2) && (
                            <div className="absolute top-12 left-0 w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                                {suggestions.length > 0 ? (
                                    <>
                                        <div className="p-3">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Kết quả tìm kiếm</p>
                                            {suggestions.slice(0, 5).map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/concerts/${item.id}`}
                                                    className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-xl transition-colors group/item"
                                                >
                                                    <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                                                        <img
                                                            src={item.imageUrl || "https://images.unsplash.com/photo-1470229722913-7c090be5c524?auto=format&fit=crop&w=200&q=80"}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 truncate group-hover/item:text-red-600 transition-colors">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {item.location}
                                                        </p>
                                                        {item.artists?.length > 0 && (
                                                            <p className="text-[10px] text-red-500 font-medium truncate mt-0.5">
                                                                Nghệ sĩ: {item.artists.join(", ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-[11px] font-bold text-gray-800">
                                                            {item.minPrice > 0 ? `Từ ${item.minPrice.toLocaleString('vi-VN')}đ` : 'Free'}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <div
                                            className="bg-gray-50 p-3 text-center border-t border-gray-100 hover:bg-red-50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                dispatch(searchConcerts(searchTerm));
                                                router.push('/');
                                                setIsFocused(false);
                                            }}
                                        >
                                            <p className="text-xs font-bold text-red-600">Xem tất cả kết quả</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-gray-400 text-sm">Đang tìm kiếm "{searchTerm}"...</p>
                                    </div>
                                )}
                            </div>
                        )}
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

                    {user && (
                        <Link href="/bookings" className="hidden sm:flex text-gray-700 hover:text-black transition items-center gap-1 font-bold text-sm bg-gray-100 px-4 py-2 rounded-full">
                            Vé của tôi
                        </Link>
                    )}

                    {mounted && user?.role === 'ORGANIZER' && (
                        <div className="hidden sm:flex gap-2">
                            <Link href="/organizer" className={`transition items-center gap-1 font-bold text-sm px-4 py-2 rounded-full ${router.hasOwnProperty('asPath') ? '' : 'bg-red-50 text-red-600'}`}>
                                Sự kiện
                            </Link>
                            <Link href="/organizer?tab=staff" className="text-blue-600 hover:text-blue-700 transition items-center gap-1 font-bold text-sm bg-blue-50 px-4 py-2 rounded-full">
                                Nhân sự
                            </Link>
                            <Link href="/organizer?tab=revenue" className="text-green-600 hover:text-green-700 transition items-center gap-1 font-bold text-sm bg-green-50 px-4 py-2 rounded-full">
                                Doanh thu
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button className="text-gray-600 hover:text-black transition">
                            <Globe className="w-5 h-5" />
                        </button>
                        {mounted && user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-red-600 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="hidden sm:block truncate max-w-[150px]">
                                        {user.email}
                                    </span>
                                </Link>
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
