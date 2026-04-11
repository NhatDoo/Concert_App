"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../src/stores/store";
import { useRouter } from "next/navigation";
import { fetchConcerts, EventCard, clearSearch } from "../src/features/concerts";
import { useLocation } from "../src/contexts/LocationContext";
import { Music, Map, Ticket, Star, Mic2, Tv, Search, X } from "lucide-react";

const BANNERS = [
  "https://img.freepik.com/psd-mien-phi/mau-banner-le-hoi-am-nhac_23-2148911142.jpg"
];

const CATEGORIES = [
  { id: "music", name: "Nhạc Sống", icon: Music, color: "bg-blue-50 text-blue-600" },
  { id: "comedy", name: "Hài Kịch", icon: Mic2, color: "bg-purple-50 text-purple-600" },
  { id: "nightlife", name: "Nightlife", icon: Star, color: "bg-indigo-50 text-indigo-600" },
  { id: "arts", name: "Sân Khấu", icon: Tv, color: "bg-pink-50 text-pink-600" },
  { id: "sports", name: "Thể Thao", icon: Map, color: "bg-green-50 text-green-600" },
  { id: "more", name: "Khác", icon: Ticket, color: "bg-gray-50 text-gray-600" },
];

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { events, searchResults, searchQuery, loading, error } = useSelector((state: RootState) => state.concerts);
  const { currentLocation } = useLocation();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  useEffect(() => {
    // Nếu đã đăng nhập, tự động chuyển hướng về dashboard tương ứng
    if (user) {
      if (user.role === 'ORGANIZER') {
        router.push('/organizer');
      } else if (user.role === 'MANAGER' || user.staffRole === 'MANAGER') {
        router.push('/staff/manager');
      } else if (user.role === 'EVENT_MANAGER' || user.staffRole === 'EVENT_MANAGER') {
        router.push('/staff/manager');
      } else if (user.role === 'VENDOR') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  useEffect(() => {

    // Dispatch action gọi API từ Backend
    dispatch(fetchConcerts() as any);
  }, [dispatch, user, router]);

  // Lọc event dựa theo Location Context "Tất cả địa điểm", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng"
  const allEvents = searchResults || events;
  let displayEvents = currentLocation === 'all'
    ? allEvents
    : allEvents.filter(e => (e as any).city === currentLocation);

  if (selectedCategory && selectedCategory !== 'more') {
    displayEvents = displayEvents.filter(e =>
      (e as any).categoryIds?.includes(selectedCategory)
    );
  }

  return (
    <div className="pb-16">
      {/* Banner / Hero Carousel (Mockup static for now) */}
      <div className="w-full relative bg-gray-900 group">
        <img
          src={BANNERS[0]}
          alt="Banner"
          className="w-full h-[300px] md:h-[450px] object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-10 left-10 md:left-24 text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 w-2/3">Đêm Nhạc Bùng Nổ Cảm Xúc</h1>
        </div>
      </div>

      <br></br>

      <div className="container mx-auto px-4 mt-[-40px] relative z-20">
        {/* Categories Shortcut */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-wrap justify-center md:justify-between gap-4">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`flex flex-col items-center gap-3 cursor-pointer group transition-all ${selectedCategory === cat.id ? 'scale-110' : ''}`}
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${selectedCategory === cat.id ? 'bg-amber-600 text-white shadow-xl shadow-amber-200' : cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className={`text-xs md:text-sm font-semibold transition-colors ${selectedCategory === cat.id ? 'text-amber-600 font-bold' : 'text-gray-700'}`}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Section: Featured / Events List */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-red-600">
                {searchResults ? (
                  <>Kết quả cho: <span className="text-black italic">"{searchQuery}"</span></>
                ) : selectedCategory ? (
                  <>Sự kiện: <span className="text-black italic">{CATEGORIES.find(c => c.id === selectedCategory)?.name}</span></>
                ) : (
                  <>
                    Sự Kiện Nổi Bật
                    {currentLocation === 'mn' && ' Tại Hồ Chí Minh'}
                    {currentLocation === 'mb' && ' Tại Hà Nội'}
                    {currentLocation === 'mt' && ' Tại Đà Nẵng'}
                  </>
                )}
              </h2>
              <p className="text-gray-500 mt-2">
                {searchResults ? `Tìm thấy ${searchResults.length} sự kiện` : selectedCategory ? `Đang hiển thị các sự kiện thuộc danh mục này` : 'Khám phá các sự kiện hot nhất đang diễn ra'}
              </p>
            </div>
            {(searchResults || selectedCategory) ? (
              <button
                onClick={() => {
                  dispatch(clearSearch());
                  setSelectedCategory(null);
                }}
                className="text-red-600 font-semibold hover:underline flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Quay lại tất cả
              </button>
            ) : (
              <a href="#" className="hidden md:inline-block text-red-600 font-semibold hover:underline">
                Xem tất cả
              </a>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium tracking-wide flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải sự kiện từ hệ thống...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 font-medium bg-red-50 rounded-xl">
              Không thể tải sự kiện: {error}
            </div>
          ) : displayEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-500 font-medium">
                {searchResults ? "Không tìm thấy sự kiện nào khớp với từ khóa của bạn." : "Hiện tại không có sự kiện nào tại khu vực này."}
              </h3>
              {searchResults && (
                <button
                  onClick={() => dispatch(clearSearch())}
                  className="mt-4 text-red-600 font-bold hover:underline"
                >
                  Thử tìm từ khóa khác
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
