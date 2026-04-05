import React from 'react';
import {
    PlusCircle,
    XCircle,
    Briefcase,
    CheckCircle,
    User as UserIcon,
    Calendar,
    MapPin,
    Clock,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

import { JobPost, Application } from './types';

interface ManagementHubProps {
    managerJobPosts: JobPost[];
    selectedManagerJob: JobPost | null;
    jobApplications: Application[];
    onSelectJob: (id: string) => void;
    onReview: (id: string, status: string) => void;
    onCreateJob: () => void;
    onEditJob: (job: JobPost) => void;
    onDeleteJob: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: string) => void;
    accentColor?: string;
    filterApplicantRole?: string;
}

export const ManagementHub: React.FC<ManagementHubProps> = ({
    managerJobPosts,
    selectedManagerJob,
    jobApplications,
    onSelectJob,
    onReview,
    onCreateJob,
    onEditJob,
    onDeleteJob,
    onToggleStatus,
    accentColor = 'rose-600',
    filterApplicantRole
}) => {
    const bgAccent = `bg-${accentColor}`;
    const textAccent = `text-${accentColor}`;
    const borderAccent = `border-${accentColor}`;
    const shadowAccent = `shadow-${accentColor}/20`;
    const hoverBorderAccent = `hover:border-${accentColor.split('-')[0]}-100`;
    const hoverBgAccent = `hover:bg-${accentColor.split('-')[0]}-50`;
    const bgAccentLight = `bg-${accentColor.split('-')[0]}-50`;
    const textAccentLight = `text-${accentColor.split('-')[0]}-100`;

    const displayApplications = filterApplicantRole
        ? jobApplications.filter(app => app.applicant.role === filterApplicantRole)
        : jobApplications;

    return (
        <div className="animate-in slide-in-from-right-10 duration-700 mx-auto flex flex-col md:flex-row gap-12 font-sans text-gray-900">
            {/* ... */}
            {/* Manager's Jobs */}
            <div className="w-full md:w-1/3 space-y-8">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Tin tuyển dụng</h2>
                        <p className="text-xs text-gray-500">Của bạn</p>
                    </div>
                    <button
                        onClick={onCreateJob}
                        className={`p-3 ${bgAccent} text-white rounded-2xl hover:bg-slate-900 transition-all duration-300 shadow-xl ${shadowAccent} group`}
                    >
                        <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="space-y-4">
                    {managerJobPosts.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
                            <Briefcase className="w-10 h-10 text-gray-200 mb-4" />
                            <p className="text-gray-500 text-sm font-bold">Chưa có tin đăng</p>
                        </div>
                    ) : (
                        managerJobPosts.map(j => (
                            <div
                                key={j.id}
                                className={`rounded-2xl border transition-all duration-300 overflow-hidden relative group ${selectedManagerJob?.id === j.id
                                    ? `${bgAccent} text-white ${borderAccent} shadow-lg shadow-red-600/20`
                                    : `bg-white text-gray-600 border-gray-100 hover:shadow-md`
                                    }`}
                            >
                                {/* Clickable area */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => onSelectJob(j.id)}
                                >
                                    {selectedManagerJob?.id === j.id && (
                                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
                                    )}
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="text-sm font-bold truncate flex-1">{j.title}</h3>
                                        {/* Status badge */}
                                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${(j as any).status === 'CLOSED'
                                            ? selectedManagerJob?.id === j.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                                            : selectedManagerJob?.id === j.id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {(j as any).status === 'CLOSED' ? 'Đã đóng' : 'Đang tuyển'}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-medium ${selectedManagerJob?.id === j.id ? 'text-white/80' : 'text-gray-400'}`}>
                                        <MapPin className="w-3 h-3" />
                                        <span>{j.location || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className={`flex items-center gap-1 px-4 pb-4 ${selectedManagerJob?.id === j.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                                    {/* Edit */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onEditJob(j); }}
                                        title="Chỉnh sửa"
                                        className={`p-2 rounded-xl transition-all duration-200 ${selectedManagerJob?.id === j.id
                                            ? 'hover:bg-white/20 text-white'
                                            : `hover:bg-slate-100 text-slate-400 hover:${textAccent}`}`}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Toggle status */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onToggleStatus(j.id, (j as any).status || 'OPEN'); }}
                                        title={(j as any).status === 'CLOSED' ? 'Mở lại tin' : 'Đóng tin'}
                                        className={`p-2 rounded-xl transition-all duration-200 ${selectedManagerJob?.id === j.id
                                            ? 'hover:bg-white/20 text-white'
                                            : 'hover:bg-slate-100 text-slate-400 hover:text-amber-500'}`}
                                    >
                                        {(j as any).status === 'CLOSED'
                                            ? <ToggleLeft className="w-3.5 h-3.5" />
                                            : <ToggleRight className="w-3.5 h-3.5" />}
                                    </button>
                                    {/* Delete */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onDeleteJob(j.id); }}
                                        title="Xóa tin"
                                        className={`p-2 rounded-xl transition-all duration-200 ${selectedManagerJob?.id === j.id
                                            ? 'hover:bg-white/20 text-white'
                                            : `hover:bg-rose-50 text-slate-400 hover:${textAccent}`}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Applications Review Area */}
            <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <div className={`w-1.5 h-8 ${bgAccent} rounded-full`}></div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {selectedManagerJob ? `Hồ sơ cho: ${selectedManagerJob.title}` : 'Trung tâm điều phối'}
                    </h2>
                </div>

                <div className="space-y-6">
                    {!selectedManagerJob ? (
                        <div className="bg-white rounded-3xl p-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                                <Briefcase className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold">Chọn một tin đăng để bắt đầu duyệt</p>
                        </div>
                    ) : displayApplications.length === 0 ? (
                        <div className="bg-white rounded-3xl p-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                                <UserIcon className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold">Chưa có ứng viên nào ứng tuyển</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {displayApplications.map(app => (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                            <UserIcon className="w-8 h-8" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                            <span className={`${bgAccentLight} ${textAccent} text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase`}>Staff</span>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" /> {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900">{app.applicant.name}</h4>
                                        <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-4">
                                            <div className={`px-4 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${app.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    `${bgAccentLight} ${textAccent} ${borderAccent}`
                                                }`}>
                                                {app.status === 'PENDING' ? <Clock className="w-3 h-3" /> : app.status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {app.status === 'PENDING' ? 'Chờ duyệt' : app.status === 'APPROVED' ? 'Chấp thuận' : 'Từ chối'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3 md:pl-8 md:border-l border-gray-100">
                                        {app.cvUrl && (
                                            <a
                                                href={app.cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-4 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all duration-300 font-bold text-xs"
                                            >
                                                Xem CV (PDF)
                                            </a>
                                        )}
                                        {app.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => onReview(app.id, 'APPROVED')}
                                                    className="px-6 py-4 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all duration-300 shadow-md font-bold text-xs"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Duyệt hồ sơ
                                                </button>
                                                <button
                                                    onClick={() => onReview(app.id, 'REJECTED')}
                                                    className="px-6 py-4 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-xs"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Loại bỏ
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
