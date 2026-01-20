export const SHORTCUTS = {
    // TOOLS
    'tool-brush': ['b'],
    'tool-fill': ['f'],
    'tool-replace': ['r'],
    'tool-eyedropper': ['i'],
    'tool-select': ['s'],
    'tool-text': ['t'],
    'tool-fill-row': ['h'],
    'tool-fill-column': ['v'],

    // CLIPBOARD (Standard)
    'clipboard-copy': ['mod+c'],
    'clipboard-cut': ['mod+x'],
    'clipboard-paste': ['mod+v'],

    // SYSTEM
    'system-save': ['mod+s'],
    'system-undo': ['mod+z'],
    'system-redo': ['mod+y', 'mod+shift+z'],
    'system-delete': ['delete', 'backspace'],
    'system-select-all': ['mod+a'],
    'system-deselect': ['escape'],

    // NAVIGATION
    'nav-zoom-in': ['=', '+'],
    'nav-zoom-out': ['-', '_'],
    'nav-reset-zoom': ['0'],

    // UI
    'ui-toggle-zoom-lock': ['mod+period'],
};

export type ShortcutAction = keyof typeof SHORTCUTS;
