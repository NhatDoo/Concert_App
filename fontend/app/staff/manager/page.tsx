"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { ManagerDashboard } from '../../../src/features/staff/components/ManagerDashboard';
import { EventManagerDashboard } from '../../../src/features/staff/components/EventManagerDashboard';
import { RootState } from '../../../src/stores/store';

export default function ManagerPage() {
    const { user } = useSelector((state: RootState) => state.auth);

    // staffRole is now embedded in the JWT and decoded into Redux on login
    if (user?.staffRole === 'EVENT_MANAGER') {
        return <EventManagerDashboard />;
    }

    return <ManagerDashboard />;
}
