import React, { useState, useRef, useEffect } from 'react';
import { Button, Icon, ContextMenu } from '../ui/SharedComponents';
import { ContextMenuItem } from '../../types';

interface SelectToolbarProps {
    onSelectAll: () => void;
    onCopy: () => void;
    onCut: () => void;
    onPaste: () => void;
    onFlip: (direction: 'horizontal' | 'vertical') => void;
    onRotate: () => void;
    onClear: () => void;
    hasSelection: boolean;
    hasClipboard: boolean;
}

type LayoutMode = 'horizontal' | 'vertical' | 'compact';

export const SelectToolbar: React.FC<SelectToolbarProps> = ({
    onSelectAll,
    onCopy,
    onCut,
    onPaste,
    onFlip,
    onRotate,
    onClear,
    hasSelection,
    hasClipboard
}) => {
    // --- STATE ---
    const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
        return (localStorage.getItem('selectToolbar_layout') as LayoutMode) || 'horizontal';
    });

    // Persist layout
    useEffect(() => {
        localStorage.setItem('selectToolbar_layout', layoutMode);
    }, [layoutMode]);

    // Position State
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);

    // --- DRAG LOGIC ---
    const handlePointerDown = (e: React.PointerEvent) => {
        // Prevent drag if clicking buttons or menu
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.context-menu')) return;

        e.preventDefault();
        e.stopPropagation();

        const toolbar = toolbarRef.current;
        if (!toolbar) return;

        const rect = toolbar.getBoundingClientRect();

        dragStartRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        if (!position) {
            setPosition({ x: rect.left, y: rect.top });
        }

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragStartRef.current || !toolbarRef.current) return;
        e.preventDefault();

        const rawX = e.clientX - dragStartRef.current.x;
        const rawY = e.clientY - dragStartRef.current.y;

        // Bounds Clamping
        const rect = toolbarRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        // Allow a small buffer or snap to exact edge? 
        // Using strict edge clamping ensures it's never off-screen.
        const clampedX = Math.max(0, Math.min(maxX, rawX));
        const clampedY = Math.max(0, Math.min(maxY, rawY));

        setPosition({ x: clampedX, y: clampedY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        dragStartRef.current = null;
        if (e.target instanceof Element) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }
    };

    // --- MENUS ---
    const getMenuOptions = (): ContextMenuItem[] => [
        {
            label: 'Horizontal',
            action: () => setLayoutMode('horizontal'),
            disabled: layoutMode === 'horizontal',
            // icon: 'arrow-left-right' // Icon support in Menu would be nice, but label is sufficient
        },
        {
            label: 'Vertical',
            action: () => setLayoutMode('vertical'),
            disabled: layoutMode === 'vertical',
        },
        {
            label: 'Compact Grid',
            action: () => setLayoutMode('compact'),
            disabled: layoutMode === 'compact',
        }
    ];

    // --- RENDER HELPERS ---
    const renderButtons = () => {
        // Shared Button Props - Enforce square shape and centering
        const btnProps = (onClick: () => void, disabled: boolean, title: string, icon: string) => (
            <Button
                variant="secondary"
                onClick={onClick}
                disabled={disabled}
                title={title}
                className="p-2 w-9 h-9 flex justify-center items-center" // Fixed size for alignment
            >
                <Icon name={icon} size={18} />
            </Button>
        );

        const group1 = (
            <>
                {btnProps(onSelectAll, false, "Select All (Ctrl+A)", "select-all")}
            </>
        );

        const group2 = (
            <>
                {btnProps(onCopy, !hasSelection, "Copy (Ctrl+C)", "copy")}
                {btnProps(onCut, !hasSelection, "Cut (Ctrl+X)", "cut")}
                {btnProps(onPaste, !hasClipboard, "Paste (Ctrl+V)", "paste")}
            </>
        );

        const group3 = (
            <>
                {btnProps(() => onFlip('horizontal'), !hasSelection, "Flip Horizontal", "selection-flip-horizontal")}
                {btnProps(() => onFlip('vertical'), !hasSelection, "Flip Vertical", "selection-flip-vertical")}
                {btnProps(onRotate, !hasSelection, "Rotate 90°", "rotate-right")}
            </>
        );

        const group4 = (
            <>
                {btnProps(onClear, !hasSelection, "Clear (Del)", "clear-selection")}
            </>
        );

        const separator = (vertical = false) => (
            <div className={`${vertical ? 'w-full h-px my-0.5' : 'w-px h-6 mx-0.5'} bg-gray-300 flex-shrink-0`} />
        );

        if (layoutMode === 'vertical') {
            return (
                <div className="flex flex-col gap-1 items-center w-full">
                    <div className="flex flex-col gap-1 items-center">{group1}</div>
                    {separator(true)}
                    <div className="flex flex-col gap-1 items-center">{group2}</div>
                    {separator(true)}
                    <div className="flex flex-col gap-1 items-center">{group3}</div>
                    {separator(true)}
                    <div className="flex flex-col gap-1 items-center">{group4}</div>
                </div>
            );
        }

        if (layoutMode === 'compact') {
            return (
                <div className="grid grid-cols-4 gap-1">
                    {/* Row 1 */}
                    {btnProps(onSelectAll, false, "Select All", "select-all")}
                    {btnProps(onCopy, !hasSelection, "Copy", "copy")}
                    {btnProps(onCut, !hasSelection, "Cut", "cut")}
                    {btnProps(onPaste, !hasClipboard, "Paste", "paste")}

                    {/* Row 2 */}
                    {btnProps(() => onFlip('horizontal'), !hasSelection, "Flip H", "selection-flip-horizontal")}
                    {btnProps(() => onFlip('vertical'), !hasSelection, "Flip V", "selection-flip-vertical")}
                    {btnProps(onRotate, !hasSelection, "Rotate", "rotate-right")}
                    {btnProps(onClear, !hasSelection, "Clear", "clear-selection")}
                </div>
            );
        }

        // Horizontal (Default) - Single row, no wrap
        return (
            <div className="flex gap-1 items-center overflow-x-auto max-w-[85vw] scrollbar-hide py-1">
                <div className="flex gap-1">{group1}</div>
                {separator()}
                <div className="flex gap-1">{group2}</div>
                {separator()}
                <div className="flex gap-1">{group3}</div>
                {separator()}
                <div className="flex gap-1">{group4}</div>
            </div>
        );
    };

    // --- STYLES ---
    const style: React.CSSProperties = position
        ? {
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'none',
            zIndex: 30,
            touchAction: 'none'
        }
        : {};

    // Base container always column
    let containerClass = "bg-white rounded-lg shadow-xl border border-gray-200 z-30 flex flex-col";

    if (!position) {
        if (layoutMode === 'vertical') {
            // Default Vertical: Top-Left (under fullscreen button)
            containerClass += " absolute top-20 left-4 transition-none";
        } else {
            // Default Horizontal/Compact: Bottom Center
            containerClass += " absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-none";
        }
    }

    // Specific styling per mode
    if (layoutMode === 'vertical') {
        containerClass += " p-1 w-12 items-center"; // Explicit width and centering
    } else {
        containerClass += " p-2 min-w-[200px]"; // Default padding for Horizontal/Compact
    }

    return (
        <div
            ref={toolbarRef}
            style={style}
            className={containerClass}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            data-testid="select-toolbar"
            data-role="ui-interaction"
        >
            {/*
                HEADER SECTION
                - Vertical: [Settings] then [Handle]
                - Others: [Settings (left)] [Handle (centered)] [Spacer]
            */}

            {layoutMode === 'vertical' ? (
                // VERTICAL HEADER: Settings Top, Handle Bottom
                <div className="flex flex-col items-center w-full mb-1 gap-1 pb-1 border-b border-gray-100">
                    <button
                        ref={settingsButtonRef}
                        onClick={() => setIsMenuOpen(true)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 flex-shrink-0"
                        title="Toolbar Settings"
                    >
                        <Icon name="select-toolbar-settings" size={14} />
                    </button>
                    <div className="cursor-grab active:cursor-grabbing w-full flex justify-center py-1">
                        <div className="w-6 h-1 bg-gray-300 rounded-full" />
                    </div>
                </div>
            ) : (
                // HORIZONTAL/COMPACT HEADER: Settings Left, Handle Center
                <div className="flex w-full justify-between items-center mb-1 border-b border-gray-100 pb-1">
                    {/* Settings Button (Left) */}
                    <button
                        ref={settingsButtonRef}
                        onClick={() => setIsMenuOpen(true)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 flex-shrink-0"
                        title="Toolbar Settings"
                    >
                        <Icon name="select-toolbar-settings" size={14} />
                    </button>

                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing flex-1 flex justify-center items-center h-full">
                        <div className="w-12 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Spacer to balance the layout so handle is centered */}
                    <div className="w-6" /> {/* Match settings button width */}
                </div>
            )}

            {renderButtons()}

            {isMenuOpen && settingsButtonRef.current && (
                <ContextMenu
                    x={settingsButtonRef.current.getBoundingClientRect().right}
                    y={settingsButtonRef.current.getBoundingClientRect().top}
                    options={getMenuOptions()}
                    onClose={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
};
