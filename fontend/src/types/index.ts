export interface Event {
    id: string;
    title: string;
    imageUrl: string;
    dateStr: string;
    location: string;
    priceStr: string;
    category: string;
    organizer?: string;
}

export type LocationId = 'all' | 'mn' | 'mb' | 'mt';

export interface Category {
    id: string;
    name: string;
    icon: string;
}
