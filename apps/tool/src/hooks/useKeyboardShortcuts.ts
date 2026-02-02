import { useEffect, useRef } from 'react';
import { SHORTCUTS, ShortcutAction } from '../config/shortcutConfig';

export const useKeyboardShortcuts = (handlers: Partial<Record<ShortcutAction, (e: KeyboardEvent) => void>>) => {
    // We use a ref for handlers to avoid re-binding the event listener on every render
    // if the consumer passes a new object every time (which is common).
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Ignore if user is typing in an input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
                return;
            }

            const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
            const mod = isMac ? e.metaKey : e.ctrlKey;

            for (const [action, keys] of Object.entries(SHORTCUTS)) {
                const handler = handlersRef.current[action as ShortcutAction];
                if (!handler) continue;

                for (const keyCombo of keys) {
                    const parts = keyCombo.toLowerCase().split('+');
                    const mainKey = parts[parts.length - 1];
                    const wantsMod = parts.includes('mod');
                    const wantsShift = parts.includes('shift');
                    const wantsAlt = parts.includes('alt');
                    const wantsCtrl = parts.includes('ctrl'); // explicit ctrl support if needed

                    // Check modifiers
                    // "mod" replaces ctrl (win) or cmd (mac)
                    const modMatch = wantsMod ? mod : true;
                    // If mod is NOT requested, we generally typically fail if mod IS pressed? 
                    // No, existing logic was stricter: (wantsMod === mod).

                    if (
                        (wantsMod === mod) &&
                        (wantsShift === e.shiftKey) &&
                        (wantsAlt === e.altKey) &&
                        (e.key.toLowerCase() === mainKey)
                    ) {
                        e.preventDefault();
                        handler(e);
                        return;
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
};
