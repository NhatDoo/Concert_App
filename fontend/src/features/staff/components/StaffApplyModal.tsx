import React, { useState } from 'react';
import { CalendarCheck, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { JobPost } from './types';

interface StaffApplyModalProps {
    show: boolean;
    job: JobPost | null;
    onClose: () => void;
    onSubmit: (cvUrl: string, message: string) => Promise<void>;
    isApplying: boolean;
    accentColor?: string;
}

export const StaffApplyModal: React.FC<StaffApplyModalProps> = ({ show, job, onClose, onSubmit, isApplying, accentColor = 'blue-600' }) => {
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    if (!show || !job) return null;

    const handleApply = async () => {
        if (!cvFile) {
            alert('Vui lòng đính kèm CV (PDF) của bạn.');
            return;
        }

        setIsUploading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const formData = new FormData();
            formData.append('file', cvFile);

            const uploadRes = await fetch(`${apiUrl}/organize/applications/upload-cv`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Lỗi khi tải lên CV');

            const { url: cvUrl } = await uploadRes.json();
            await onSubmit(cvUrl, message);
            onClose();
            setMessage('');
            setCvFile(null);
        } catch (e: any) {
            alert(e.message || 'Lỗi khi nộp đơn');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300 font-bold">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <CalendarCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Gửi hồ sơ ứng tuyển</h2>
                    <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest leading-none line-clamp-1">{job.title}</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest pl-1">Tải lên hồ sơ (CV - PDF)*</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)}
                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-3 focus:bg-white focus:border-blue-600 outline-none transition-all text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest pl-1">Lời nhắn gửi Nhà tuyển dụng</label>
                        <textarea
                            rows={3}
                            placeholder="Chia sẻ ngắn gọn về kinh nghiệm hoặc lý do bạn muốn tham gia..."
                            className={`w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-${accentColor} outline-none transition-all resize-none text-slate-700`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <div className={`bg-${accentColor}/5 p-6 rounded-2xl border border-${accentColor}/10 flex items-center gap-4`}>
                        <div className={`p-3 bg-${accentColor} rounded-xl text-white`}>
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className={`text-[10px] text-${accentColor} uppercase leading-relaxed tracking-tighter font-black`}>
                            Hệ thống sẽ đính kèm thông tin liên hệ và lý lịch chuyên môn từ Profile của bạn.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-10">
                    <button onClick={onClose} className="py-4 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all uppercase text-xs font-black">Hủy bỏ</button>
                    <button
                        onClick={handleApply}
                        disabled={isApplying || isUploading}
                        className={`py-4 rounded-2xl bg-${accentColor} text-white hover:bg-black transition-all shadow-xl shadow-${accentColor}/20 flex items-center justify-center gap-2 uppercase text-xs font-black`}
                    >
                        {(isApplying || isUploading) ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Nộp đơn ngay</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
