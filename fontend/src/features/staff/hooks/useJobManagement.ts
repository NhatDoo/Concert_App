import { useState, useCallback, useEffect } from 'react';
import { JobPost, Application } from '../components/types';

export const useJobManagement = (user: any, token: string | null) => {
    const [loading, setLoading] = useState(true);
    const [staffRecords, setStaffRecords] = useState<any[]>([]);
    const [managerJobs, setManagerJobs] = useState<JobPost[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
    const [jobApplications, setJobApplications] = useState<Application[]>([]);
    const [discoverJobs, setDiscoverJobs] = useState<JobPost[]>([]);
    const [myApplications, setMyApplications] = useState<Application[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const notify = useCallback((type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const fetchJobApplications = useCallback(async (jobId: string, currentJobs: JobPost[] | null = null) => {
        // Fallback to state if not provided
        const jobsToSearch = currentJobs || managerJobs;
        const job = jobsToSearch.find(j => j.id === jobId) || jobsToSearch[0];
        setSelectedJob(job || null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${jobId}/applications`);
            if (res.ok) {
                const data = await res.json();
                setJobApplications(Array.isArray(data) ? data : []);
            } else {
                setJobApplications([]);
            }
        } catch (e) {
            setJobApplications([]);
        }
    }, [managerJobs]);

    const fetchDiscoverJobs = useCallback(async (authorRole?: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            let url = `${apiUrl}/organize/jobs`;
            if (authorRole) url += `?authorRole=${authorRole}`;
            const res = await fetch(url);
            const data = await res.json();
            setDiscoverJobs(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchMyApplications = useCallback(async (staffId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/applications?applicantId=${staffId}`);
            if (res.ok) {
                const data = await res.json();
                setMyApplications(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!user?.id) {
            console.log('[JobManagement] No user.id, skipping fetch');
            return;
        }
        console.log('[JobManagement] fetchData called with user:', user);
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Fetch staff record — swallow errors gracefully
            let staff: any = null;
            try {
                const staffRes = await fetch(`${apiUrl}/organize/staff/me?userId=${user.id}`);
                if (staffRes.ok) {
                    const staffData = await staffRes.json();
                    console.log('[JobManagement] staffData raw:', staffData);
                    staff = Array.isArray(staffData) ? staffData[0] : staffData;
                    setStaffRecords(Array.isArray(staffData) ? staffData : (staffData ? [staffData] : []));
                    console.log('[JobManagement] staff record:', staff);
                    console.log('[JobManagement] staff.concertId:', staff?.concertId);
                    console.log('[JobManagement] staff.organizerId:', staff?.organizerId);
                }
            } catch (staffErr) {
                console.warn('[JobManagement] Could not fetch staff record:', staffErr);
            }

            const useOrganizerFilter = user.role === 'ORGANIZER' || staff?.vendorId;
            const queryParam = useOrganizerFilter
                ? `organizerId=${staff?.vendorId || user.id}`
                : `authorId=${staff?.id || user.id}`;

            // Search for jobs authored by this manager OR belonging to this organizer/vendor
            try {
                const jobsRes = await fetch(`${apiUrl}/organize/jobs?${queryParam}&includeClosed=true`);
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    const allJobs = Array.isArray(jobsData) ? jobsData : [];
                    setManagerJobs(allJobs);
                    if (allJobs.length > 0) {
                        fetchJobApplications(allJobs[0].id, allJobs);
                    }
                }
            } catch (jobsErr) {
                console.warn('[JobManagement] Could not fetch jobs:', jobsErr);
            }

            // Fetch concert data for EventManager
            if (staff?.concertId) {
                try {
                    const concertRes = await fetch(`${apiUrl}/concerts/${staff.concertId}`);
                    if (concertRes.ok) {
                        const concertData = await concertRes.json();
                        // Update staff record with concert info if needed
                    }
                } catch (concertErr) {
                    console.warn('[JobManagement] Could not fetch concert:', concertErr);
                }
            }

            fetchDiscoverJobs();
            if (staff?.id) {
                fetchMyApplications(staff.id);
            }
        } catch (e) {
            console.error('[JobManagement] fetchData failed:', e);
        } finally {
            setLoading(false);
        }
    }, [user, fetchJobApplications, fetchDiscoverJobs, fetchMyApplications]);

    const applyToJob = async (jobId: string, cvUrl: string, message: string, onSuccess?: () => void) => {
        if (!staffRecords[0]) return;
        setIsApplying(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    jobPostId: jobId,
                    applicantId: staffRecords[0].id,
                    cvUrl,
                    message
                })
            });

            if (res.ok) {
                notify('success', 'Đã nộp đơn ứng tuyển thành công!');
                fetchMyApplications(staffRecords[0].id);
                if (onSuccess) onSuccess();
            } else {
                const err = await res.json();
                notify('error', `Lỗi: ${err.message}`);
            }
        } catch (e) {
            notify('error', 'Lỗi kết nối máy chủ');
        } finally {
            setIsApplying(false);
        }
    };

    const createJob = async (jobData: any, onSuccess?: () => void) => {
        if (!user) return;

        // Check if user is allowed to post (must be Organizer or have a Staff record)
        if (!staffRecords[0] && user.role !== 'ORGANIZER') {
            notify('error', 'Hồ sơ tuyển dụng của bạn đang được chuẩn bị. Vui lòng thử lại sau giây lát.');
            return;
        }

        setIsCreating(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Adapt body to new schema field names
            const payload: any = { ...jobData };

            if (staffRecords[0]) {
                // If posting as a Staff member (e.g. Vendor Manager or Event Manager staff)
                payload.authorStaffId = staffRecords[0].id;
                // Default to staff's concert if not explicitly provided in jobData
                if (!payload.concertId && staffRecords[0].concertId) {
                    payload.concertId = staffRecords[0].concertId;
                }
            } else if (user.role === 'ORGANIZER') {
                // If posting directly as an Organizer (User)
                payload.authorUserId = user.id;
            }

            console.log('[JobManagement] Create Job Payload:', payload);

            const res = await fetch(`${apiUrl}/organize/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchData();
                notify('success', 'Đã đăng tin tuyển dụng thành công!');
                if (onSuccess) onSuccess();
            } else {
                const errorData = await res.json();
                alert(`Không thể tạo tin tuyển dụng: ${Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Lỗi không xác định'}`);
            }
        } catch (e) {
            console.error('[JobManagement] createJob failed:', e);
            notify('error', 'Lỗi kết nối máy chủ');
        } finally {
            setIsCreating(false);
        }
    };

    const updateJob = async (id: string, data: any, onSuccess?: () => void) => {
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                fetchData();
                notify('success', 'Đã cập nhật tin tuyển dụng.');
                if (onSuccess) onSuccess();
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.message}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteJob = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này? Tất cả hồ sơ ứng tuyển cũng sẽ bị xóa.')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/organize/jobs/${id}`, {
                method: 'DELETE',
                headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
            });
            if (res.ok) {
                fetchData();
                notify('success', 'Đã xóa tin tuyển dụng.');
            }
        } catch (e) { console.error(e); }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/organize/jobs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    const reviewApplication = async (applicationId: string, status: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/organize/applications/${applicationId}/review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ status })
            });
            if (selectedJob) fetchJobApplications(selectedJob.id);
            notify('success', status === 'APPROVED' ? 'Đã tiếp nhận nhân viên!' : 'Đã từ chối đơn.');
        } catch (e) { }
    };

    useEffect(() => {
        if (user) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return {
        loading,
        staffRecords,
        managerJobs,
        selectedJob,
        jobApplications,
        isCreating,
        isSaving,
        discoverJobs,
        myApplications,
        isApplying,
        notification,
        fetchData,
        fetchJobApplications,
        fetchDiscoverJobs,
        createJob,
        updateJob,
        deleteJob,
        toggleStatus,
        reviewApplication,
        applyToJob,
        notify
    };
};
