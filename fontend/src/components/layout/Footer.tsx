import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="mt-20 bg-[#24231f] text-[#f5f2eb]">
            <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
                <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div className="max-w-sm">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center bg-[#d8553f] font-serif text-xl italic text-white">C</span>
                            <span className="flex flex-col leading-none">
                                <span className="text-sm font-bold uppercase tracking-[0.14em]">Concert</span>
                                <span className="mt-1 font-serif text-xs italic text-[#e9785f]">music journal</span>
                            </span>
                        </Link>
                        <p className="mt-6 text-sm leading-6 text-white/55">
                            Nơi những đêm nhạc hay gặp đúng người. Tìm buổi diễn tiếp theo của bạn.
                        </p>
                    </div>

                    <div>
                        <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Khám phá</h2>
                        <ul className="space-y-3 text-sm text-white/75">
                            <li><Link href="/#events" className="transition-colors hover:text-[#e9785f]">Sự kiện nổi bật</Link></li>
                            <li><Link href="/#events" className="transition-colors hover:text-[#e9785f]">Nhạc sống</Link></li>
                            <li><Link href="/#events" className="transition-colors hover:text-[#e9785f]">Sân khấu & nghệ thuật</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Thông tin</h2>
                        <ul className="space-y-3 text-sm text-white/75">
                            <li><a href="#" className="transition-colors hover:text-[#e9785f]">Điều khoản sử dụng</a></li>
                            <li><a href="#" className="transition-colors hover:text-[#e9785f]">Chính sách bảo mật</a></li>
                            <li><a href="#" className="transition-colors hover:text-[#e9785f]">Câu hỏi thường gặp</a></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Liên hệ</h2>
                        <ul className="space-y-3 text-sm text-white/75">
                            <li>Hotline: 1900 1234</li>
                            <li><a href="mailto:cskh@ticketbox.vn" className="transition-colors hover:text-[#e9785f]">cskh@ticketbox.vn</a></li>
                        </ul>
                        <Link href="/#events" className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e9785f]">
                            Đi nghe nhạc <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-3 pt-6 text-[10px] uppercase tracking-[0.12em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <span>&copy; {new Date().getFullYear()} ConcertMusic. All rights reserved.</span>
                    <span>Được làm cho những đêm đáng nhớ.</span>
                </div>
            </div>
        </footer>
    );
};
