"use client";

import { FormEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Map as HallMapIcon, MapPin, Plus, Users } from "lucide-react";
import { EventVoiceCall } from "./EventVoiceCall";

interface HallAssignment {
    id: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    workingNow: boolean;
    staff: { id: string; name: string; role: string };
}

interface HallShift {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    assignments: HallAssignment[];
}

interface HallZone {
    id: string;
    name: string;
    description: string | null;
    capacity: number | null;
    mapX: number;
    mapY: number;
    shifts: HallShift[];
}

interface HallData {
    id: string;
    name: string;
    startDate: string;
    location: string;
    zones: HallZone[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function responseError(response: Response) {
    try {
        const body = await response.json();
        return typeof body.message === "string" ? body.message : "Không thể hoàn tất yêu cầu.";
    } catch {
        return "Không thể hoàn tất yêu cầu.";
    }
}

export function EventHallMap({
    concertId,
    token,
    userName,
}: {
    concertId: string;
    token: string | null;
    userName?: string;
}) {
    const [hall, setHall] = useState<HallData | null>(null);
    const [loading, setLoading] = useState(false);
    const [zoneName, setZoneName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [savingZone, setSavingZone] = useState(false);
    const [copiedCallLink, setCopiedCallLink] = useState(false);
    const [error, setError] = useState("");
    const mapRef = useRef<HTMLDivElement>(null);
    const draggedZoneRef = useRef<{ id: string; mapX: number; mapY: number } | null>(null);

    const fetchHall = useCallback(async () => {
        if (!concertId || !token) {
            setHall(null);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API_URL}/organize/${concertId}/hall`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(await responseError(response));
            setHall(await response.json());
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Không thể tải sơ đồ hội trường.");
        } finally {
            setLoading(false);
        }
    }, [concertId, token]);

    useEffect(() => {
        void fetchHall();
        const refreshTimer = window.setInterval(() => void fetchHall(), 60_000);
        return () => window.clearInterval(refreshTimer);
    }, [fetchHall]);

    const createZone = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!zoneName.trim() || !token) return;
        setSavingZone(true);
        setError("");
        try {
            const index = hall?.zones.length ?? 0;
            const response = await fetch(`${API_URL}/organize/${concertId}/hall/zones`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: zoneName.trim(),
                    capacity: capacity ? Number(capacity) : undefined,
                    mapX: 24 + ((index * 19) % 54),
                    mapY: 32 + ((index * 17) % 48),
                }),
            });
            if (!response.ok) throw new Error(await responseError(response));
            setZoneName("");
            setCapacity("");
            await fetchHall();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Không thể tạo khu vực.");
        } finally {
            setSavingZone(false);
        }
    };

    const updateZonePosition = (event: PointerEvent<HTMLButtonElement>, zone: HallZone) => {
        const rectangle = mapRef.current?.getBoundingClientRect();
        if (!rectangle) return;
        const mapX = Math.max(8, Math.min(92, ((event.clientX - rectangle.left) / rectangle.width) * 100));
        const mapY = Math.max(16, Math.min(90, ((event.clientY - rectangle.top) / rectangle.height) * 100));
        draggedZoneRef.current = { id: zone.id, mapX, mapY };
        setHall(current => current ? {
            ...current,
            zones: current.zones.map(item =>
                item.id === zone.id ? { ...item, mapX, mapY } : item
            ),
        } : current);
    };

    const saveZonePosition = async () => {
        const position = draggedZoneRef.current;
        draggedZoneRef.current = null;
        if (!position || !token) return;
        try {
            const response = await fetch(`${API_URL}/organize/${concertId}/hall/zones/${position.id}/position`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ mapX: position.mapX, mapY: position.mapY }),
            });
            if (!response.ok) throw new Error(await responseError(response));
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Không thể lưu vị trí khu vực.");
            await fetchHall();
        }
    };

    const copyCallLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/call/${concertId}`);
            setCopiedCallLink(true);
            window.setTimeout(() => setCopiedCallLink(false), 2000);
        } catch {
            setError("Không thể sao chép liên kết. Hãy mở phòng call để lấy địa chỉ.");
        }
    };

    const handleDragStart = (event: PointerEvent<HTMLButtonElement>, zone: HallZone) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        draggedZoneRef.current = { id: zone.id, mapX: zone.mapX, mapY: zone.mapY };
    };

    if (!concertId) {
        return (
            <div className="border border-[#d6d1c7] bg-[#fbf9f4] p-8 text-sm text-[#77756e]">
                Chọn một sự kiện để mở sơ đồ hội trường.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="border border-[#d6d1c7] bg-[#fbf9f4]">
                <header className="flex flex-col gap-5 border-b border-[#d6d1c7] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8553f]">Bản đồ vận hành</p>
                        <h2 className="font-serif text-3xl tracking-tight text-[#24231f]">Sơ đồ hội trường</h2>
                        <p className="mt-2 text-sm text-[#77756e]">{hall?.name || "Đang tải sự kiện..."}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={copyCallLink}
                            className="inline-flex w-fit items-center gap-2 border border-[#d6d1c7] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#24231f] transition-colors hover:border-[#d8553f] hover:text-[#d8553f]"
                        >
                            <Copy className="h-4 w-4" /> {copiedCallLink ? "Đã sao chép" : "Sao chép link call"}
                        </button>
                        <Link
                            href={`/call/${concertId}`}
                            className="inline-flex w-fit items-center gap-2 bg-[#24231f] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#d8553f]"
                        >
                            <Users className="h-4 w-4" /> Mở phòng call
                        </Link>
                    </div>
                </header>

                <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div>
                        <div
                            ref={mapRef}
                            className="relative min-h-[440px] overflow-hidden border border-[#c9c4ba] bg-[#eee9df] touch-none"
                            aria-label="Sơ đồ khu vực hội trường; kéo khu vực để đổi vị trí"
                        >
                            <div className="absolute left-1/2 top-5 flex h-12 w-[42%] -translate-x-1/2 items-center justify-center border border-[#b94330] bg-[#d8553f] text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                                Sân khấu
                            </div>
                            <div className="absolute left-[8%] right-[8%] top-[20%] border-t border-dashed border-[#c9c4ba]" />
                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#99958c]">
                                <MapPin className="h-3.5 w-3.5" /> Lối vào chính
                            </div>
                            {hall?.zones.map(zone => {
                                const working = zone.shifts
                                    .flatMap(shift => shift.assignments)
                                    .filter(assignment => assignment.workingNow);
                                const uniqueWorking = Array.from(
                                    new Map(working.map(assignment => [assignment.staff.id, assignment])).values()
                                );
                                return (
                                    <button
                                        key={zone.id}
                                        type="button"
                                        onPointerDown={event => handleDragStart(event, zone)}
                                        onPointerMove={event => {
                                            if (draggedZoneRef.current?.id === zone.id) updateZonePosition(event, zone);
                                        }}
                                        onPointerUp={() => void saveZonePosition()}
                                        onPointerCancel={() => void saveZonePosition()}
                                        title={`${zone.name} · kéo để bố trí`}
                                        className="absolute z-10 flex min-w-[120px] max-w-[190px] -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col border border-[#d6d1c7] bg-[#fbf9f4] px-3 py-3 text-left active:cursor-grabbing"
                                        style={{ left: `${zone.mapX}%`, top: `${zone.mapY}%` }}
                                    >
                                        <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#24231f]">{zone.name}</span>
                                        <span className="mt-1 text-[10px] text-[#77756e]">
                                            {uniqueWorking.length ? `${uniqueWorking.length} người trong ca` : "Chưa có ca đang diễn ra"}
                                        </span>
                                        {uniqueWorking.length > 0 && (
                                            <span className="mt-2 flex -space-x-1.5">
                                                {uniqueWorking.slice(0, 4).map(assignment => (
                                                    <span
                                                        key={assignment.id}
                                                        title={`${assignment.staff.name} · ${assignment.staff.role}`}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#fbf9f4] bg-[#24231f] text-[9px] font-semibold text-white"
                                                    >
                                                        {assignment.staff.name.trim().charAt(0).toUpperCase()}
                                                    </span>
                                                ))}
                                                {uniqueWorking.length > 4 && (
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#fbf9f4] bg-[#d8553f] text-[9px] font-semibold text-white">
                                                        +{uniqueWorking.length - 4}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            {!hall?.zones.length && !loading && (
                                <div className="absolute inset-x-4 bottom-16 text-center text-xs text-[#99958c]">
                                    Tạo khu vực đầu tiên để bắt đầu bố trí sơ đồ.
                                </div>
                            )}
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#f5f2eb]/70 text-xs text-[#77756e]">
                                    Đang tải sơ đồ...
                                </div>
                            )}
                        </div>
                        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-[#99958c]">
                            Kéo thẻ để bố trí · vị trí được đồng bộ · nhân sự hiển thị theo ca đang diễn ra
                        </p>
                    </div>

                    <aside className="border-t border-[#d6d1c7] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#77756e]">
                            <HallMapIcon className="mr-2 inline h-4 w-4 text-[#d8553f]" />
                            Khu vực · {hall?.zones.length ?? 0}
                        </p>
                        <form onSubmit={createZone} className="space-y-3">
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#77756e]" htmlFor="hall-zone-name">
                                Thêm khu vực
                            </label>
                            <input
                                id="hall-zone-name"
                                value={zoneName}
                                onChange={event => setZoneName(event.target.value)}
                                placeholder="VD: Khu FOH"
                                required
                                className="w-full border border-[#d6d1c7] bg-transparent px-3 py-3 text-sm text-[#24231f] outline-none placeholder:text-[#aaa69d] focus:border-[#d8553f]"
                            />
                            <input
                                type="number"
                                min="1"
                                value={capacity}
                                onChange={event => setCapacity(event.target.value)}
                                placeholder="Sức chứa (không bắt buộc)"
                                aria-label="Sức chứa khu vực"
                                className="w-full border border-[#d6d1c7] bg-transparent px-3 py-3 text-sm text-[#24231f] outline-none placeholder:text-[#aaa69d] focus:border-[#d8553f]"
                            />
                            <button
                                type="submit"
                                disabled={savingZone || !zoneName.trim()}
                                className="inline-flex w-full items-center justify-center gap-2 bg-[#24231f] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#d8553f] disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> {savingZone ? "Đang tạo..." : "Tạo khu vực"}
                            </button>
                        </form>

                        <div className="mt-8 border-t border-[#d6d1c7] pt-5">
                            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#77756e]">Ca đang diễn ra</p>
                            {hall?.zones.flatMap(zone =>
                                zone.shifts.flatMap(shift =>
                                    shift.assignments
                                        .filter(assignment => assignment.workingNow)
                                        .map(assignment => ({ ...assignment, zoneName: zone.name, shiftTitle: shift.title }))
                                )
                            ).length ? (
                                <ul className="space-y-3">
                                    {hall.zones.flatMap(zone =>
                                        zone.shifts.flatMap(shift =>
                                            shift.assignments
                                                .filter(assignment => assignment.workingNow)
                                                .map(assignment => ({ ...assignment, zoneName: zone.name, shiftTitle: shift.title }))
                                        )
                                    ).map(assignment => (
                                        <li key={assignment.id} className="border-b border-[#d6d1c7] pb-3 last:border-0">
                                            <p className="text-xs font-semibold text-[#24231f]">{assignment.staff.name}</p>
                                            <p className="mt-1 text-[10px] text-[#77756e]">{assignment.zoneName} · {assignment.shiftTitle}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs leading-5 text-[#99958c]">Chưa có nhân sự được phân ca hiện tại.</p>
                            )}
                        </div>
                    </aside>
                </div>
                {error && <p className="border-t border-[#d6d1c7] px-6 py-4 text-sm text-[#b94330]" role="alert">{error}</p>}
            </section>

            {token && <EventVoiceCall concertId={concertId} token={token} userName={userName} />}
        </div>
    );
}
