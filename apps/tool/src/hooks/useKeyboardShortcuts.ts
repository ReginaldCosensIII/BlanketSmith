import { useEffect } from 'react';
import { SHORTCUTS, ShortcutAction } from '../config/shortcutConfig';

type ShortcutHandlers = {
    [K in ShortcutAction]?: (e: KeyboardEvent) => void;
};

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // IGNORE: Inputs, Textareas, ContentEditable
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const mod = isMac ? e.metaKey : e.ctrlKey;

            for (const [action, keys] of Object.entries(SHORTCUTS)) {
                const handler = handlers[action as ShortcutAction];
                if (!handler) continue;

                for (const keyCombo of keys) {
                    const parts = keyCombo.toLowerCase().split('+');
                    const mainKey = parts[parts.length - 1];
                    const wantsMod = parts.includes('mod');
                    const wantsShift = parts.includes('shift');
                    const wantsAlt = parts.includes('alt');

                    if (
                        (wantsMod === mod) &&
                        (wantsShift === e.shiftKey) &&
                        (wantsAlt === e.altKey) &&
                        (e.key.toLowerCase() === mainKey)
                    ) {
                        e.preventDefault();
                        handler(e);
                        return; // Execute only first match priority
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
};
