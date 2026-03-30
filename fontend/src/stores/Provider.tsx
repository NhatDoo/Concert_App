"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { LocationProvider } from "../contexts/LocationContext";
import { rehydrateUser } from "../features/auth/stores/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // @ts-ignore
        store.dispatch(rehydrateUser());
    }, []);

    return (
        <Provider store={store}>
            <LocationProvider>
                {children}
            </LocationProvider>
        </Provider>
    );
}
