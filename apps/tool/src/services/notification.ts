import { ToastType } from '../context/ToastContext';

export const notify = {
    show: (message: string, type: ToastType = 'info', duration?: number) => {
        const event = new CustomEvent('blanketsmith:toast', {
            detail: { message, type, duration },
        });
        window.dispatchEvent(event);
    },
    error: (message: string, duration?: number) => notify.show(message, 'error', duration),
    success: (message: string, duration?: number) => notify.show(message, 'success', duration),
    info: (message: string, duration?: number) => notify.show(message, 'info', duration),
};
