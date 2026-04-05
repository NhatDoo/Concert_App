import { useState, useCallback, useEffect } from 'react';

export const useStaffProfile = (user: any, token: string | null) => {
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        bio: '',
        cvUrl: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            // Fetch User info (usually already in Redux, but for full details:)
            // In this app, staff records are fetched by userId
            const res = await fetch(`${apiUrl}/organize/staff/me?userId=${user.id}`);
            const data = await res.json();
            const staff = Array.isArray(data) ? data[0] : data;

            if (staff) {
                setProfileData({
                    name: user.name || '',
                    phoneNumber: user.phoneNumber || '',
                    email: user.email || '',
                    bio: staff.bio || '',
                    cvUrl: staff.cvUrl || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateProfile = async (data: typeof profileData) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/staff/profile?userId=${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                return true;
            } else {
                const err = await res.json();
                throw new Error(err.message || 'Failed to update profile');
            }
        } catch (e: any) {
            alert(e.message);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const uploadCv = async (file: File) => {
        setUploading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${apiUrl}/organize/applications/upload-cv`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            });

            if (res.ok) {
                const { url } = await res.json();
                setProfileData(prev => ({ ...prev, cvUrl: url }));
                return url;
            } else {
                throw new Error('Upload failed');
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profileData,
        setProfileData,
        loading,
        isSaving,
        uploading,
        updateProfile,
        uploadCv
    };
};
