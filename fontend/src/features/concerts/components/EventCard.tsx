"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Calendar } from 'lucide-react';
import type { Event } from '../../../types';

interface EventCardProps {
    event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
    return (
        <Link href={`/concerts/${event.id}`} className="group flex h-full flex-col border-b border-[#d6d1c7] pb-5">
            <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-[#e5e0d7]">
                <img
                    src={event.imageUrl || "https://images.unsplash.com/photo-1470229722913-7c090be5c524?auto=format&fit=crop&w=900&q=80"}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute left-3 top-3 bg-[#f5f2eb] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#d8553f]">
                    {event.category}
                </div>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#88847b]">
                    <Calendar className="h-3.5 w-3.5 text-[#d8553f]" />
                    <span className="truncate">{event.dateStr}</span>
                </div>
                <h3 className="mb-4 line-clamp-2 font-serif text-[22px] leading-[1.12] tracking-[-0.025em] text-[#24231f] transition-colors group-hover:text-[#d8553f]">
                    {event.title}
                </h3>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#e5e0d7] pt-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-[#77756e]">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#d8553f]" />
                            <span className="truncate">{event.location}</span>
                        </div>
                        {event.organizer && (
                            <p className="mt-1 truncate text-[10px] text-[#99958c]">Tổ chức bởi {event.organizer}</p>
                        )}
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8553f]">
                        Khám phá <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
};
