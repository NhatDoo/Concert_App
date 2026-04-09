import { useState, useCallback } from 'react';
import { EventRequirement, Zone, Shift } from '../types';

export const useOperations = (token: string | null) => {
    const [loading, setLoading] = useState(false);
    const [requirements, setRequirements] = useState<EventRequirement[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchVendors = useCallback(async (organizerId: string) => {
        if (!organizerId) return;
        try {
            const res = await fetch(`${apiUrl}/organize/${organizerId}/vendors`, {
                headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
            });
            const data = await res.json();
            setVendors(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    }, [token, apiUrl]);

    const fetchRequirements = useCallback(async (filters: { concertId?: string, vendorId?: string, status?: string }) => {
        setLoading(true);
        try {
            let query = new URLSearchParams();
            if (filters.concertId) query.append('concertId', filters.concertId);
            if (filters.vendorId) query.append('vendorId', filters.vendorId);
            if (filters.status) query.append('status', filters.status);

            const res = await fetch(`${apiUrl}/organize/requirements?${query.toString()}`, {
                headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
            });
            const data = await res.json();
            setRequirements(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token, apiUrl]);

    const fetchVendorRequirements = useCallback(async (status?: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/vendor/requirements${status ? `?status=${status}` : ''}`, {
                headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
            });
            const data = await res.json();
            setRequirements(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token, apiUrl]);

    const createRequirement = async (reqData: any) => {
        try {
            const res = await fetch(`${apiUrl}/organize/requirements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(reqData)
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    const updateRequirementStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            const res = await fetch(`${apiUrl}/vendor/requirements/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ status })
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    const createZone = async (zoneData: any) => {
        try {
            const res = await fetch(`${apiUrl}/organize/zones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(zoneData)
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    const createShift = async (shiftData: any) => {
        try {
            const res = await fetch(`${apiUrl}/organize/shifts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(shiftData)
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    const assignStaffToShift = async (concertId: string, shiftId: string, staffId: string) => {
        try {
            const res = await fetch(`${apiUrl}/organize/shifts/assign?concertId=${concertId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ shiftId, staffId })
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    return {
        loading,
        requirements,
        zones,
        vendors,
        fetchRequirements,
        fetchVendorRequirements,
        fetchVendors,
        createRequirement,
        updateRequirementStatus,
        createZone,
        createShift,
        assignStaffToShift
    };
};
