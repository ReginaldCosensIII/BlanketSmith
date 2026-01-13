import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Icon } from '../components/ui/SharedComponents';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
    showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType, duration = 5000) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const toast = { id, message, type, duration };
        setToasts((prev) => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    // Listen for global events to decoupling services from UI
    React.useEffect(() => {
        const handleGlobalToast = (event: Event) => {
            const customEvent = event as CustomEvent<{ message: string; type: ToastType; duration?: number }>;
            const { message, type, duration } = customEvent.detail;
            showToast(message, type, duration);
        };

        window.addEventListener('blanketsmith:toast', handleGlobalToast);
        return () => window.removeEventListener('blanketsmith:toast', handleGlobalToast);
    }, [showToast]);

    const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border transform transition-all duration-300
              ${toast.type === 'error' ? 'bg-white border-red-100 text-red-800 shadow-red-100' : ''}
              ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800 shadow-green-100' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-100 text-brand-midBlue shadow-blue-100' : ''}
            `}
                        role="alert"
                    >
                        <div className="flex-shrink-0">
                            {toast.type === 'error' && <Icon name="ban" className="text-red-500" />}
                            {toast.type === 'success' && <Icon name="check" className="text-green-500" />}
                            {toast.type === 'info' && <Icon name="info" className="text-blue-500" />}
                        </div>
                        <p className="flex-1 text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <Icon name="close" size="xs" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
