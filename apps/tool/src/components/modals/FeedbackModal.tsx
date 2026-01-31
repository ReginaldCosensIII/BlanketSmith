import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui/SharedComponents';
import { useToast } from '../../context/ToastContext';
import { createClient } from '@supabase/supabase-js';

// --- Inline Icons ---
const BugIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m8 2 1.88 1.88" />
        <path d="M14.12 3.88 16 2" />
        <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
        <path d="M12 20v-9" />
        <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
        <path d="M6 13H2" />
        <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
        <path d="M22 13h-4" />
        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4 12 14.01l-3-3" />
    </svg>
);

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialError?: Error | null; // For Crash Reporting
}

type FeedbackType = 'bug' | 'feature' | 'general';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, initialError }) => {
    // --- Safe Toast Retrieval ---
    // We try to access context. If it throws or is undefined (Crash Mode), we fallback to local UI.
    let toastMethods = { showSuccess: (msg: string) => { }, showError: (msg: string) => { } };
    let hasToastContext = false;

    try {
        // We can't conditionally call hooks, but we can wrap the usage if the hook logic permits.
        // However, standard useContext hooks throw if context is missing usually if enforced like:
        // "useToast must be used within a ToastProvider"
        // So we might need to suppress that for this specific component?
        // Actually, let's just use try-catch around the hook call? No, that breaks React Rules of Hooks.
        // BEST PRACTICE: Modifying useToast to be optional is hard without editing it.
        // So we will assume useToast might throw, which crashes the modal too?
        // Wait, ErrorBoundary catches the component tree errors. 
        // If FeedbackModal is inside ErrorBoundary, and ToastContext is gone, calling useToast() will THROW.
        // And ErrorBoundary will catch THAT error, loop, and we are stuck.

        // SAFE APPROACH: We CANNOT use `useToast()` if we suspect we are outside the provider.
        // If `initialError` is present, assume we are in Crash Mode and DO NOT call useToast().
        if (!initialError) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const ctx = useToast();
            toastMethods = ctx;
            hasToastContext = true;
        }
    } catch (e) {
        // Ignore hook error if any (though Rules of Hooks make generic try/catch around hooks invalid usually)
        // If initialError prop is true, we just skip the hook entirely via the condition above.
    }

    const [type, setType] = useState<FeedbackType>('bug');
    const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false); // Local fallback for success message

    // Form Stats
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [steps, setSteps] = useState('');
    const [expected, setExpected] = useState('');

    // Reset/Init form
    useEffect(() => {
        if (isOpen) {
            setSubmitSuccess(false);
            if (initialError) {
                // CRASH MODE
                setType('bug');
                setSubject(`Crash Report: ${initialError.name}`);
                setSteps(`Crash encountered on: ${window.location.href}\n\nError: ${initialError.message}`);
                setExpected('Application should not crash.');
                setMessage('I was trying to...');
            } else {
                // NORMAL MODE
                setType('bug');
                setSubject('');
                setMessage('');
                setSteps('');
                setExpected('');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.warn("[Feedback] Supabase env vars missing.");
                // For demo/dev robustness, simulate success if no keys? 
                // No, user wants real submission. Throw.
                throw new Error('Supabase configuration missing');
            }

            const supabase = createClient(supabaseUrl, supabaseKey);

            let systemMetadata: any = {};
            if (includeSystemInfo) {
                systemMetadata = {
                    userAgent: navigator.userAgent,
                    screen: `${window.screen.width}x${window.screen.height}`,
                    window: `${window.innerWidth}x${window.innerHeight}`,
                    pwa: window.matchMedia('(display-mode: standalone)').matches
                };
            }

            // Add Crash Stack Trace
            if (initialError) {
                systemMetadata.stack_trace = initialError.stack;
                systemMetadata.crash_report = true;
            }

            const payload: any = {
                category: 'feedback',
                sub_type: type,
                full_name: name || (initialError ? 'Crash Reporter' : 'Anonymous Tool User'),
                email: email || undefined,
                metadata: {
                    ...systemMetadata,
                    title: subject,
                    steps: type === 'bug' ? steps : undefined,
                    expected: type === 'bug' ? expected : undefined,
                    details: message,
                }
            };

            const { error } = await supabase
                .from('contact_submissions')
                .insert(payload);

            if (error) throw error;

            if (hasToastContext) {
                toastMethods.showSuccess('Feedback sent! Thank you.');
                onClose();
            } else {
                // Safe Mode Fallback
                setSubmitSuccess(true);
            }

        } catch (err: any) {
            console.error('Feedback submission failed:', err);
            if (hasToastContext) {
                toastMethods.showError('Failed to submit feedback. Please try again.');
            } else {
                alert('Failed to submit feedback: ' + (err.message || 'Unknown error'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Safe Mode Success View ---
    if (submitSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Sent" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Report Sent</h3>
                    <p className="text-gray-500 mb-6">
                        Thank you for helping us fix this crash. We've received the error details and your notes.
                    </p>
                    <Button variant="primary" onClick={onClose} className="w-full justify-center">
                        Close
                    </Button>
                </div>
            </Modal>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialError ? "Report Crash" : "Send Feedback"}
            maxWidth="max-w-xl"
            footer={
                <div className="flex justify-between w-full items-center">
                    <div className="text-xs text-gray-400">
                        {initialError && <span className="text-red-400 flex items-center gap-1">● Crash mode active</span>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Feedback'}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                {/* Type Selection - Disable if Crash Mode */}
                <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => !initialError && setType('bug')} disabled={!!initialError} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${type === 'bug' ? 'bg-indigo-50 border-brand-midBlue text-brand-midBlue' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${initialError ? 'opacity-100' : ''}`}>
                        <BugIcon className={`w-6 h-6 ${type === 'bug' ? 'text-brand-midBlue' : 'text-gray-500'}`} />
                        <span className="text-xs font-semibold">Bug Report</span>
                    </button>
                    <button type="button" onClick={() => !initialError && setType('feature')} disabled={!!initialError} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${type === 'feature' ? 'bg-indigo-50 border-brand-midBlue text-brand-midBlue' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${initialError ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <LightbulbIcon className={`w-6 h-6 ${type === 'feature' ? 'text-brand-midBlue' : 'text-gray-500'}`} />
                        <span className="text-xs font-semibold">Feature Idea</span>
                    </button>
                    <button type="button" onClick={() => !initialError && setType('general')} disabled={!!initialError} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${type === 'general' ? 'bg-indigo-50 border-brand-midBlue text-brand-midBlue' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'} ${initialError ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <MessageIcon className={`w-6 h-6 ${type === 'general' ? 'text-brand-midBlue' : 'text-gray-500'}`} />
                        <span className="text-xs font-semibold">General</span>
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Name (Optional)</label>
                            <input className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-midBlue focus:outline-none" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Email (Optional)</label>
                            <input className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-midBlue focus:outline-none" placeholder="contact@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">{type === 'bug' ? 'Issue Title' : type === 'feature' ? 'Feature Title' : 'Subject'}</label>
                        <input className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-midBlue focus:outline-none" placeholder={type === 'bug' ? "e.g. Export fails on iPad" : "Short summary"} value={subject} onChange={(e) => setSubject(e.target.value)} required />
                    </div>

                    {type === 'bug' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Steps to Reproduce</label>
                                <textarea className="w-full border rounded px-3 py-2 text-sm h-20 focus:ring-2 focus:ring-brand-midBlue focus:outline-none resize-none" placeholder="1. Go to... 2. Click..." value={steps} onChange={(e) => setSteps(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Expected Behavior</label>
                                <textarea className="w-full border rounded px-3 py-2 text-sm h-16 focus:ring-2 focus:ring-brand-midBlue focus:outline-none resize-none" placeholder="It should have..." value={expected} onChange={(e) => setExpected(e.target.value)} />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">{initialError ? 'Additional context (what were you doing?)' : (type === 'bug' ? 'Additional Details' : 'Message')}</label>
                        <textarea className="w-full border rounded px-3 py-2 text-sm h-24 focus:ring-2 focus:ring-brand-midBlue focus:outline-none resize-none" placeholder="Tell us more..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id="sysInfo" checked={includeSystemInfo} onChange={(e) => setIncludeSystemInfo(e.target.checked)} className="rounded border-gray-300 text-brand-midBlue focus:ring-brand-midBlue" />
                        <label htmlFor="sysInfo" className="text-xs text-gray-600">Include system info (Browser, Screen size) to help debugging.</label>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
