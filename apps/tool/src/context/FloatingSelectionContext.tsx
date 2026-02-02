import React, { createContext, useContext, useState, useCallback } from 'react';

interface FloatingSelectionContextType {
    hasFloatingSelection: boolean;
    setHasFloatingSelection: (has: boolean) => void;
    performUndo: () => void;
    performRedo: () => void;
    registerUndoHandler: (handler: () => void) => void;
    registerRedoHandler: (handler: () => void) => void;
    undoHandler: (() => void) | null;
    redoHandler: (() => void) | null;
}

const FloatingSelectionContext = createContext<FloatingSelectionContextType | undefined>(undefined);

export const FloatingSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasFloatingSelection, setHasFloatingSelection] = useState(false);
    const [undoHandler, setUndoHandler] = useState<(() => void) | null>(null);
    const [redoHandler, setRedoHandler] = useState<(() => void) | null>(null);

    const registerUndoHandler = useCallback((handler: () => void) => {
        setUndoHandler(() => handler);
    }, []);

    const registerRedoHandler = useCallback((handler: () => void) => {
        setRedoHandler(() => handler);
    }, []);

    const performUndo = useCallback(() => {
        if (undoHandler) {
            undoHandler();
        }
    }, [undoHandler]);

    const performRedo = useCallback(() => {
        if (redoHandler) {
            redoHandler();
        }
    }, [redoHandler]);

    return (
        <FloatingSelectionContext.Provider
            value={{
                hasFloatingSelection,
                setHasFloatingSelection,
                performUndo,
                performRedo,
                registerUndoHandler,
                registerRedoHandler,
                undoHandler,
                redoHandler,
            }}
        >
            {children}
        </FloatingSelectionContext.Provider>
    );
};

export const useFloatingSelection = () => {
    const context = useContext(FloatingSelectionContext);
    if (!context) {
        throw new Error('useFloatingSelection must be used within a FloatingSelectionProvider');
    }
    return context;
};
