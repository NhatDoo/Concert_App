export const Footer = () => {
    return (
        <footer className="bg-[#1a1c29] text-gray-300 py-12 mt-12 w-full">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-white font-bold mb-4">TICKETBOX</h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                        Hệ thống đặt vé sự kiện, hòa nhạc, thể thao hàng đầu Việt Nam.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4 text-sm uppercase">Khám phá</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition">Sự kiện nổi bật</a></li>
                        <li><a href="#" className="hover:text-white transition">Nhạc sống</a></li>
                        <li><a href="#" className="hover:text-white transition">Sân khấu - Nghệ thuật</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4 text-sm uppercase">Dành cho Khách hàng</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
                        <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
                        <li><a href="#" className="hover:text-white transition">Câu hỏi thường gặp</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-4 text-sm uppercase">Liên hệ</h4>
                    <ul className="space-y-2 text-sm">
                        <li>Hotline: 1900 1234</li>
                        <li>Email: cskh@ticketbox.vn</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} TICKETBOX. All rights reserved.
            </div>
        </footer>
    );
};
