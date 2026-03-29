"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { LocationProvider } from "../contexts/LocationContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <LocationProvider>
                {children}
            </LocationProvider>
        </Provider>
    );
}
