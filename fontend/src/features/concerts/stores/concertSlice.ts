import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { Event } from '../../../types';

interface ConcertState {
    events: Event[];
    featuredEvents: Event[];
    searchResults: Event[] | null;
    searchQuery: string;
    loading: boolean;
    error: string | null;
}

const initialState: ConcertState = {
    events: [],
    featuredEvents: [],
    searchResults: null,
    searchQuery: '',
    loading: false,
    error: null,
};

// Khai báo Async Thunk để gọi API backend
export const fetchConcerts = createAsyncThunk(
    'concerts/fetchConcerts',
    async (_, { rejectWithValue }) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/concerts`);

            if (!response.ok) {
                throw new Error('Failed to fetch concerts');
            }

            const data = await response.json();

            // Map data từ Backend format sang Frontend format (Type Event)
            return data.map((item: any) => ({
                id: item.id?.toString() || Math.random().toString(),
                title: item.name || item.title || 'Untitled Concert',
                imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1470229722913-7c090be5c524?auto=format&fit=crop&w=800&q=80",
                dateStr: item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'Sắp diễn ra',
                location: item.location || 'Đang cập nhật',
                city: item.city || 'all',
                priceStr: item.price ? `Từ ${item.price}đ` : 'Từ 0đ',
                category: item.category || 'Nhạc Sống',
                organizer: item.organizer || 'Chưa cập nhật'
            })) as Event[];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Lỗi khi gọi API');
        }
    }
);

export const searchConcerts = createAsyncThunk(
    'concerts/searchConcerts',
    async (query: string, { rejectWithValue }) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/concerts/search?query=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();

            return data.map((item: any) => ({
                id: item.id?.toString(),
                title: item.name || 'Untitled Concert',
                imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1470229722913-7c090be5c524?auto=format&fit=crop&w=800&q=80",
                dateStr: item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'Sắp diễn ra',
                location: item.location || 'Đang cập nhật',
                city: item.city || 'all',
                priceStr: item.minPrice > 0 ? `Từ ${item.minPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí / Đang cập nhật',
                category: item.category || 'Nhạc Sống',
                organizer: item.organizerName || 'Chưa cập nhật'
            })) as Event[];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Lỗi khi gọi API');
        }
    }
);

export const concertSlice = createSlice({
    name: 'concerts',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setEvents: (state, action: PayloadAction<Event[]>) => {
            state.events = action.payload;
        },
        setFeaturedEvents: (state, action: PayloadAction<Event[]>) => {
            state.featuredEvents = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        setSearchResults: (state, action: PayloadAction<Event[] | null>) => {
            state.searchResults = action.payload;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        clearSearch: (state) => {
            state.searchResults = null;
            state.searchQuery = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConcerts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConcerts.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchConcerts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Search handlers
            .addCase(searchConcerts.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.searchQuery = action.meta.arg;
            })
            .addCase(searchConcerts.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchConcerts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.searchResults = [];
            });
    },
});

export const {
    setLoading,
    setEvents,
    setFeaturedEvents,
    setError,
    setSearchResults,
    setSearchQuery,
    clearSearch
} = concertSlice.actions;

export default concertSlice.reducer;
