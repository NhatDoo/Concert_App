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
        if (!user) return;
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const staffRes = await fetch(`${apiUrl}/organize/staff/me?userId=${user.id}`);
            const staffData = await staffRes.json();
            const staff = Array.isArray(staffData) ? staffData[0] : staffData;
            setStaffRecords(Array.isArray(staffData) ? staffData : [staffData]);

            const authorIdToFetch = staff?.id || user.id;
            const contextIdToFetch = staff?.organizerId || staff?.vendorId || user.id;

            console.log('[JobManagement] Fetching jobs:', { authorId: authorIdToFetch, contextId: contextIdToFetch });

            // Search for jobs authored by this manager OR belonging to this organizer/vendor
            const jobsRes = await fetch(`${apiUrl}/organize/jobs?authorId=${authorIdToFetch}&includeClosed=true`);
            const jobsData = await jobsRes.json();
            const allJobs = Array.isArray(jobsData) ? jobsData : [];
            setManagerJobs(allJobs);

            if (allJobs.length > 0) {
                fetchJobApplications(allJobs[0].id, allJobs);
            }

            // Also fetch discovery data
            fetchDiscoverJobs();
            if (staff?.id) {
                fetchMyApplications(staff.id);
            }
        } catch (e) {
            console.error(e);
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
        if (!staffRecords[0]) {
            notify('error', 'Hồ sơ tuyển dụng của bạn đang được chuẩn bị. Vui lòng thử lại sau giây lát.');
            return;
        }
        setIsCreating(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const body = JSON.stringify({
                ...jobData,
                organizerId: staffRecords[0]?.organizerId || staffRecords[0]?.vendorId || user?.id,
                authorId: staffRecords[0]?.id || user?.id
            });
            console.log('[JobManagement] Final POST Body:', body);
            const res = await fetch(`${apiUrl}/organize/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body
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
        } finally { setIsCreating(false); }
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
