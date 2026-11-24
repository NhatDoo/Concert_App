"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../src/stores/store";
import { useRouter } from "next/navigation";
import { fetchConcerts, EventCard, clearSearch } from "../src/features/concerts";
import { useLocation } from "../src/contexts/LocationContext";
import { ArrowDown, ArrowRight, CalendarDays, Music, X } from "lucide-react";

const CATEGORIES = [
  { id: "music", name: "Nhạc sống" },
  { id: "comedy", name: "Hài kịch" },
  { id: "nightlife", name: "Nightlife" },
  { id: "arts", name: "Sân khấu" },
  { id: "sports", name: "Thể thao" },
  { id: "more", name: "Khác" },
];

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { events, searchResults, searchQuery, loading, error } = useSelector((state: RootState) => state.concerts);
  const { currentLocation } = useLocation();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === "ORGANIZER") {
        router.push("/organizer");
      } else if (user.role === "MANAGER" || user.staffRole === "MANAGER") {
        router.push("/staff/manager");
      } else if (user.role === "EVENT_MANAGER" || user.staffRole === "EVENT_MANAGER") {
        router.push("/staff/manager");
      } else if (user.role === "VENDOR") {
        router.push("/vendor");
      } else {
        router.push("/");
      }
    }
  }, [user, router]);

  useEffect(() => {
    dispatch(fetchConcerts());
  }, [dispatch, user, router]);

  const allEvents = searchResults || events;
  let displayEvents = currentLocation === "all"
    ? allEvents
    : allEvents.filter((event) => event.city === currentLocation);

  if (selectedCategory && selectedCategory !== "more") {
    displayEvents = displayEvents.filter((event) =>
      event.categoryIds?.includes(selectedCategory)
    );
  }

  const sectionTitle = searchResults
    ? <>Kết quả cho <span className="font-serif font-normal italic">&ldquo;{searchQuery}&rdquo;</span></>
    : selectedCategory
      ? <>Chọn đúng <span className="font-serif font-normal italic">{CATEGORIES.find((category) => category.id === selectedCategory)?.name}</span></>
      : <>Lịch hẹn <span className="font-serif font-normal italic">đáng nhớ.</span></>;

  return (
    <div className="pb-20">
      <section className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-[#d6d1c7] lg:min-h-[590px] lg:grid-cols-[0.94fr_1.06fr]">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
          <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#77756e]">
            <span className="h-px w-9 bg-[#d8553f]" />
            Tuyển chọn sự kiện tại Việt Nam
          </div>
          <h1 className="max-w-[650px] font-serif text-[clamp(3.5rem,7vw,6.8rem)] leading-[0.88] tracking-[-0.065em] text-[#24231f]">
            Đêm nay,
            <br />
            <span className="italic text-[#d8553f]">ra ngoài</span>
            <br />
            nghe nhạc.
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-7 text-[#77756e] sm:text-base">
            Tìm một sân khấu mới, một ban nhạc yêu thích, hay một lý do để hẹn nhau. Đêm đáng nhớ bắt đầu từ đây.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#events"
              className="inline-flex items-center gap-3 bg-[#d8553f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#b94330]"
            >
              Khám phá sự kiện <ArrowRight className="h-4 w-4" />
            </a>
            <span className="flex items-center gap-2 text-xs text-[#77756e]">
              <CalendarDays className="h-4 w-4" />
              Chọn buổi diễn tiếp theo
            </span>
          </div>
          <div className="mt-14 flex items-center gap-3 border-t border-[#d6d1c7] pt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#77756e]">
            <span className="font-serif text-lg font-normal italic text-[#d8553f]">01</span>
            <span>Âm nhạc · Nghệ thuật · Gặp gỡ</span>
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden bg-[#28231f] sm:min-h-[460px] lg:min-h-full">
          <img
            src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=85"
            alt="Khán giả cùng hòa mình trong một đêm nhạc"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />
          <div className="absolute left-6 top-6 flex items-center gap-2 border border-white/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:left-9 sm:top-9">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e9785f]" />
            Thành phố đang lên đèn
          </div>
          <div className="absolute bottom-7 left-6 right-6 flex items-end justify-between text-white sm:bottom-10 sm:left-9 sm:right-9">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Âm thanh của thành phố</p>
              <p className="font-serif text-3xl italic sm:text-4xl">Gặp nhau ở hàng ghế đầu.</p>
            </div>
            <a
              href="#events"
              aria-label="Đi tới danh sách sự kiện"
              className="hidden h-12 w-12 shrink-0 items-center justify-center border border-white/60 transition-colors hover:bg-white hover:text-[#24231f] sm:flex"
            >
              <ArrowDown className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <nav aria-label="Danh mục sự kiện" className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-[#d6d1c7] py-5 sm:gap-x-10">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#99958c]">Danh mục</span>
          {CATEGORIES.map((category, index) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(active ? null : category.id)}
                aria-pressed={active}
                className={`group flex items-center gap-2 text-xs transition-colors ${active ? "text-[#d8553f]" : "text-[#57554f] hover:text-[#d8553f]"}`}
              >
                <span className={`font-serif text-[10px] italic ${active ? "text-[#d8553f]" : "text-[#aaa69d]"}`}>
                  0{index + 1}
                </span>
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
        </nav>

        <section id="events" className="scroll-mt-24 pt-16 sm:pt-20">
          <div className="mb-9 flex flex-col justify-between gap-5 border-b border-[#d6d1c7] pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8553f]">
                {searchResults ? "Bạn đang tìm" : "Ghi vào lịch"}
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.045em] text-[#24231f] sm:text-5xl">
                {sectionTitle}
              </h2>
              <p className="mt-3 text-sm text-[#77756e]">
                {searchResults
                  ? `${displayEvents.length} sự kiện phù hợp với bạn`
                  : selectedCategory
                    ? "Một vài gợi ý dành riêng cho gu của bạn."
                    : `Những buổi diễn sắp tới${currentLocation === "mn" ? " tại Hồ Chí Minh" : currentLocation === "mb" ? " tại Hà Nội" : currentLocation === "mt" ? " tại Đà Nẵng" : ""}.`}
              </p>
            </div>
            {(searchResults || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  dispatch(clearSearch());
                  setSelectedCategory(null);
                }}
                className="inline-flex w-fit items-center gap-2 border-b border-[#d8553f] pb-1 text-xs font-semibold text-[#d8553f] transition-colors hover:text-[#a83f2d]"
              >
                <X className="h-3.5 w-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-sm text-[#77756e]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d6d1c7] border-t-[#d8553f]" />
              <span>Đang tìm những buổi diễn hay...</span>
            </div>
          ) : error ? (
            <div role="alert" className="border border-[#e6b7aa] bg-[#fbefec] px-6 py-8 text-sm text-[#a83f2d]">
              Không thể tải sự kiện: {error}
            </div>
          ) : displayEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-[#d6d1c7] px-6 text-center">
              <Music className="mb-4 h-8 w-8 text-[#d8553f]" strokeWidth={1.4} />
              <h3 className="font-serif text-2xl text-[#24231f]">
                {searchResults ? "Chưa tìm thấy sự kiện phù hợp." : "Chưa có sự kiện ở khu vực này."}
              </h3>
              <p className="mt-2 text-sm text-[#77756e]">
                {searchResults ? "Thử một từ khóa khác để tiếp tục khám phá." : "Quay lại sau nhé, lịch diễn sẽ sớm được cập nhật."}
              </p>
              {searchResults && (
                <button
                  type="button"
                  onClick={() => dispatch(clearSearch())}
                  className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#d8553f] hover:text-[#a83f2d]"
                >
                  Xem tất cả sự kiện
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
