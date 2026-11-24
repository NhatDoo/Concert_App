"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Radio } from "lucide-react";
import { useSelector } from "react-redux";
import { EventVoiceCall } from "../../../src/features/staff/components/EventVoiceCall";
import { RootState } from "../../../src/stores/store";

export default function EventCallPage() {
    const { concertId } = useParams<{ concertId: string }>();
    const { token, user } = useSelector((state: RootState) => state.auth);
    const workspaceHref = user?.role === "ORGANIZER"
        ? "/organizer"
        : user?.role === "VENDOR"
            ? "/vendor"
            : user?.staffRole === "MANAGER" || user?.staffRole === "EVENT_MANAGER"
                ? "/staff/manager"
                : "/staff";

    return (
        <div className="mx-auto min-h-[70vh] max-w-4xl px-6 py-16 sm:px-10">
            <Link href={workspaceHref} className="mb-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77756e] hover:text-[#d8553f]">
                <ArrowLeft className="h-4 w-4" /> Trở lại workspace
            </Link>
            <div className="mb-10 flex items-start gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#24231f] text-[#f5f2eb]">
                    <Radio className="h-5 w-5" />
                </span>
                <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8553f]">Kênh nội bộ · concert</p>
                    <h1 className="font-serif text-4xl tracking-tight text-[#24231f]">Phòng liên lạc sự kiện</h1>
                    <p className="mt-2 text-sm text-[#77756e]">Cuộc gọi nhóm thoại dành cho thành viên trong đội ngũ sự kiện.</p>
                </div>
            </div>
            {token ? (
                <EventVoiceCall concertId={concertId} token={token} userName={user?.name} />
            ) : (
                <div className="border border-[#d6d1c7] bg-[#fbf9f4] p-8">
                    <p className="text-sm text-[#77756e]">Đăng nhập bằng tài khoản thuộc đội ngũ sự kiện để tham gia cuộc gọi.</p>
                    <Link href="/login" className="mt-5 inline-flex bg-[#d8553f] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white">Đăng nhập</Link>
                </div>
            )}
        </div>
    );
}
