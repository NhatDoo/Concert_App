"use client";

import React from "react";
import { Search, MapPin, User, Globe, ArrowUpRight } from "lucide-react";
import { useLocation } from "../../contexts/LocationContext";
import { LocationId } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../stores/store";
import { logout } from "../../features/auth";
import { fetchConcerts, searchConcerts } from "../../features/concerts";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ConcertSuggestionApi {
    id: string | number;
    name: string;
    location: string;
    imageUrl?: string;
    minPrice?: number;
    artists?: string[];
}

interface ConcertSuggestion {
    id: string;
    title: string;
    location: string;
    imageUrl?: string;
    minPrice?: number;
    artists?: string[];
}

export const Header = () => {
    const { currentLocation, setCurrentLocation } = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<ConcertSuggestion[]>([]);
    const [mounted, setMounted] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 2) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                try {
                    const response = await fetch(`${apiUrl}/concerts/search?query=${encodeURIComponent(searchTerm)}`);
                    const data: ConcertSuggestionApi[] = await response.json();
                    setSuggestions(data.map((item) => ({
                        id: item.id.toString(),
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

    const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentLocation(event.target.value as LocationId);
    };

    const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (searchTerm.trim()) {
                dispatch(searchConcerts(searchTerm));
                router.push("/");
            } else {
                dispatch(fetchConcerts());
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-[#d6d1c7] bg-[#f5f2eb]/95 backdrop-blur-md">
            <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
                <div className="flex shrink-0 items-center gap-8">
                    <Link href="/" className="group flex items-center gap-2.5" aria-label="ConcertMusic - Trang chủ">
                        <span className="flex h-9 w-9 items-center justify-center bg-[#d8553f] font-serif text-lg italic text-white transition-colors group-hover:bg-[#b94330]">
                            C
                        </span>
                        <span className="flex flex-col leading-none">
                            <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#24231f]">Concert</span>
                            <span className="mt-1 font-serif text-[12px] italic text-[#d8553f]">music journal</span>
                        </span>
                    </Link>

                    <div className="relative hidden xl:block">
                        <div className="flex w-[300px] items-center border-b border-[#c9c4ba] py-2 transition-colors focus-within:border-[#d8553f]">
                            <Search className="mr-3 h-4 w-4 shrink-0 text-[#77756e]" />
                            <input
                                type="text"
                                placeholder="Tìm buổi diễn, nghệ sĩ..."
                                aria-label="Tìm kiếm sự kiện"
                                className="w-full bg-transparent text-xs text-[#24231f] outline-none placeholder:text-[#99958c]"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                onKeyDown={handleSearch}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            />
                        </div>

                        {isFocused && (suggestions.length > 0 || searchTerm.length > 2) && (
                            <div className="absolute left-0 top-[calc(100%+12px)] z-[100] w-full border border-[#d6d1c7] bg-[#f5f2eb] shadow-xl">
                                {suggestions.length > 0 ? (
                                    <>
                                        <div className="p-3">
                                            <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#99958c]">Kết quả tìm kiếm</p>
                                            {suggestions.slice(0, 5).map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/concerts/${item.id}`}
                                                    className="group/item flex items-center gap-3 p-2 transition-colors hover:bg-[#ece7de]"
                                                >
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden bg-[#e5e0d7]">
                                                        <img
                                                            src={item.imageUrl || "https://images.unsplash.com/photo-1470229722913-7c090be5c524?auto=format&fit=crop&w=200&q=80"}
                                                            alt={item.title}
                                                            className="h-full w-full object-cover transition-transform group-hover/item:scale-105"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-semibold text-[#24231f] transition-colors group-hover/item:text-[#d8553f]">
                                                            {item.title}
                                                        </p>
                                                        <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-[#77756e]">
                                                            <MapPin className="h-3 w-3" /> {item.location}
                                                        </p>
                                                        {item.artists && item.artists.length > 0 && (
                                                            <p className="mt-0.5 truncate text-[10px] text-[#d8553f]">
                                                                Nghệ sĩ: {item.artists.join(", ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="shrink-0 text-[10px] font-semibold text-[#24231f]">
                                                        {typeof item.minPrice === "number" && item.minPrice > 0 ? `Từ ${item.minPrice.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-center gap-2 border-t border-[#d6d1c7] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d8553f] transition-colors hover:bg-[#ece7de]"
                                            onClick={() => {
                                                dispatch(searchConcerts(searchTerm));
                                                router.push("/");
                                                setIsFocused(false);
                                            }}
                                        >
                                            Xem tất cả kết quả <ArrowUpRight className="h-3.5 w-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="px-5 py-7 text-center text-xs text-[#77756e]">
                                        Đang tìm kiếm &ldquo;{searchTerm}&rdquo;...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex min-w-0 items-center justify-end gap-3 sm:gap-5">
                    <div className="hidden items-center gap-2 border-r border-[#d6d1c7] pr-5 lg:flex">
                        <MapPin className="h-4 w-4 text-[#d8553f]" />
                        <select
                            aria-label="Chọn địa điểm"
                            className="max-w-[150px] cursor-pointer bg-transparent text-xs text-[#57554f] outline-none"
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
                        <Link href="/bookings" className="hidden text-xs font-medium text-[#57554f] transition-colors hover:text-[#d8553f] sm:block">
                            Vé của tôi
                        </Link>
                    )}

                    {mounted && user?.role === "ORGANIZER" && (
                        <div className="hidden items-center gap-4 xl:flex">
                            <Link href="/organizer" className="text-xs font-medium text-[#57554f] transition-colors hover:text-[#d8553f]">
                                Sự kiện
                            </Link>
                            <Link href="/organizer?tab=staff" className="text-xs font-medium text-[#57554f] transition-colors hover:text-[#d8553f]">
                                Nhân sự
                            </Link>
                            <Link href="/organizer?tab=revenue" className="text-xs font-medium text-[#57554f] transition-colors hover:text-[#d8553f]">
                                Doanh thu
                            </Link>
                        </div>
                    )}

                    <button type="button" aria-label="Ngôn ngữ" className="hidden text-[#77756e] transition-colors hover:text-[#d8553f] sm:block">
                        <Globe className="h-4 w-4" />
                    </button>
                    {mounted && user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/profile" className="flex items-center gap-2 text-xs font-medium text-[#57554f] transition-colors hover:text-[#d8553f]">
                                <span className="flex h-8 w-8 items-center justify-center border border-[#d6d1c7] text-[#d8553f]">
                                    <User className="h-4 w-4" />
                                </span>
                                <span className="hidden max-w-[130px] truncate lg:block">{user.email}</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => dispatch(logout())}
                                className="hidden border-b border-[#d8553f] pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8553f] transition-colors hover:text-[#a83f2d] sm:block"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 bg-[#24231f] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#f5f2eb] transition-colors hover:bg-[#d8553f] sm:px-4">
                            <User className="h-3.5 w-3.5" />
                            <span>Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};
