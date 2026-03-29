"use client";

import React, { createContext, useContext, useState } from 'react';
import { LocationId } from '../types';

interface LocationContextProps {
    currentLocation: LocationId;
    setCurrentLocation: (loc: LocationId) => void;
}

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentLocation, setCurrentLocation] = useState<LocationId>('all');

    return (
        <LocationContext.Provider value={{ currentLocation, setCurrentLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
