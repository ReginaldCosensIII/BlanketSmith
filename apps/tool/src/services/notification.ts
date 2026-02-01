import { ToastType } from '../context/ToastContext';

export const EVENT_OPEN_FEEDBACK = 'blanketsmith:open-feedback';

export const notify = {
    show: (message: string, type: ToastType = 'info', duration?: number, action?: { label: string; onClick: () => void }) => {
        const event = new CustomEvent('blanketsmith:toast', {
            detail: { message, type, duration, action },
        });
        window.dispatchEvent(event);
    },
    error: (message: string, duration?: number) => notify.show(message, 'error', duration, {
        label: 'Report',
        onClick: () => window.dispatchEvent(new CustomEvent(EVENT_OPEN_FEEDBACK))
    }),
    success: (message: string, duration?: number) => notify.show(message, 'success', duration),
    info: (message: string, duration?: number) => notify.show(message, 'info', duration),
};
