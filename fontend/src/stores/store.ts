import { configureStore } from '@reduxjs/toolkit';
import concertReducer from '../features/concerts/stores/concertSlice';
import authReducer from '../features/auth/stores/authSlice';

export const store = configureStore({
    reducer: {
        concerts: concertReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
