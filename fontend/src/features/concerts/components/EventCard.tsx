"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';
import type { Event } from '../../../types';

interface EventCardProps {
    event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
    return (
        <Link href={`/concerts/${event.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 duration-300 border border-gray-100 flex flex-col cursor-pointer group">
            <div className="relative aspect-[3/2] overflow-hidden">
                <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold uppercase text-red-600 shadow-sm">
                    {event.category}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-[15px] leading-snug mb-3 line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors title-font">
                    {event.title}
                </h3>

                <div className="mt-auto space-y-2">
                    {event.organizer && (
                        <div className="text-xs text-gray-500 font-medium">Bởi: {event.organizer}</div>
                    )}
                    <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                        <span className="truncate">{event.dateStr}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                    </div>
                </div>

            </div>
        </Link>
    );
};
