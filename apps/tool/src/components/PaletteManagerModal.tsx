import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Icon } from './ui/SharedComponents';
import { useProject } from '../context/ProjectContext';
import { PatternColor } from '../types';
import { getLibraryBrands, getLibraryColorsByBrand } from '../data/yarnLibrary';

// --- Color Helpers ---
const hexToRgb = (hex: string): [number, number, number] => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

interface PaletteManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    yarnUsage: Map<string, number>;
    targetSlot: 'primary' | 'secondary' | null;
    mode?: 'select' | 'manage';
    onColorSelect?: (colorId: string) => void;
}

export const PaletteManagerModal: React.FC<PaletteManagerModalProps> = ({ isOpen, onClose, yarnUsage, targetSlot, mode = 'select', onColorSelect }) => {
    const { state, dispatch } = useProject();
    const project = state.project;
    const palette = project?.yarnPalette || [];

    // --- State ---
    const brands = useMemo(() => getLibraryBrands(), []);
    const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id || 'blanketsmith-essentials');
    const [librarySearch, setLibrarySearch] = useState('');
    const [isCustomOverlayOpen, setIsCustomOverlayOpen] = useState(false);

    // --- Derived Data ---
    const libraryColors = useMemo(() => {
        return getLibraryColorsByBrand(selectedBrandId);
    }, [selectedBrandId]);

    const filteredLibraryColors = useMemo(() => {
        if (!librarySearch) return libraryColors;
        const lowerSearch = librarySearch.toLowerCase();

        // Global Search: If searching, look through ALL brands
        const source = librarySearch ? brands.flatMap(b => getLibraryColorsByBrand(b.id)) : libraryColors;

        return source.filter(c =>
            c.name.toLowerCase().includes(lowerSearch) ||
            (c.productCode && c.productCode.toLowerCase().includes(lowerSearch))
        );
    }, [libraryColors, librarySearch, brands]);

    // --- Custom Color State ---
    const [pickerMode, setPickerMode] = useState<'HEX' | 'RGB' | 'HSL'>('HEX');
    const [tempCustomColor, setTempCustomColor] = useState('#FF0000');
    const [customName, setCustomName] = useState('My Custom Color');
    const [customBrand, setCustomBrand] = useState('Custom');
    const [hsl, setHsl] = useState<[number, number, number]>([0, 100, 50]);

    const updateColorFromHsl = (h: number, s: number, l: number) => {
        setHsl([h, s, l]);
        const rgb = hslToRgb(h, s, l);
        setTempCustomColor(rgbToHex(rgb[0], rgb[1], rgb[2]));
    };

    const updateColorFromHex = (val: string) => {
        setTempCustomColor(val);
        // Only update HSL if valid hex
        if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
            const rgb = hexToRgb(val);
            setHsl(rgbToHsl(rgb[0], rgb[1], rgb[2]));
        }
    };

    const updateColorFromRgb = (r: number, g: number, b: number) => {
        // Clamp
        const safeR = Math.max(0, Math.min(255, isNaN(r) ? 0 : r));
        const safeG = Math.max(0, Math.min(255, isNaN(g) ? 0 : g));
        const safeB = Math.max(0, Math.min(255, isNaN(b) ? 0 : b));

        const hex = rgbToHex(safeR, safeG, safeB);
        setTempCustomColor(hex);
        setHsl(rgbToHsl(safeR, safeG, safeB));
    };

    const getRgb = (): [number, number, number] => {
        if (/^#[0-9A-Fa-f]{6}$/i.test(tempCustomColor)) {
            return hexToRgb(tempCustomColor);
        }
        return [0, 0, 0];
    };

    // --- Actions ---
    const handleAddColor = (color: PatternColor) => {
        // 1. Add to palette if not exists
        if (!palette.some(p => p.hex === color.hex && p.name === color.name)) {
            dispatch({ type: 'ADD_COLOR_TO_PALETTE', payload: color });
        }

        // 2. If valid target, set it (unless creating custom, handled separately)
        // Also if we are in SELECT mode, we auto-close
        // If MANAGE mode, we just add it to tray
    };

    const handleToggleLibraryColor = (color: any) => {
        // Check if already in palette (visible or hidden)
        const existing = palette.find(p => p.libraryColorId === color.id || (p.hex === color.hex && p.name === color.name));

        if (existing && !existing.hidden) {
            // It is visible -> Remove it
            dispatch({ type: 'REMOVE_COLOR_FROM_PALETTE', payload: existing.id });
        } else {
            // Not found OR it is Hidden -> Add/Revive it
            // If it exists but is hidden, the reducer ADD action will revive it.
            const patternColor: PatternColor = {
                id: color.id,
                brand: brands.find(b => b.id === color.brandId)?.name || 'Unknown',
                name: color.name,
                hex: color.hex,
                rgb: hexToRgb(color.hex),
                skeinLength: 295,
                libraryColorId: color.id
            };
            dispatch({ type: 'ADD_COLOR_TO_PALETTE', payload: patternColor });
        }
    };

    const handleImportAllBrand = () => {
        if (!filteredLibraryColors.length) return;
        let count = 0;
        filteredLibraryColors.forEach(c => {
            const existing = palette.find(p => p.libraryColorId === c.id || (p.hex === c.hex && p.name === c.name));
            // If doesn't exist OR is hidden -> We want to add/revive
            if (!existing || existing.hidden) {
                const patternColor: PatternColor = {
                    id: c.id,
                    brand: brands.find(b => b.id === c.brandId)?.name || 'Unknown',
                    name: c.name,
                    hex: c.hex,
                    rgb: hexToRgb(c.hex),
                    skeinLength: 295,
                    libraryColorId: c.id
                };
                dispatch({ type: 'ADD_COLOR_TO_PALETTE', payload: patternColor });
                count++;
            }
        });
        // We could show a toast here, but for now silent is fine or console
        console.log(`Imported ${count} new colors.`);
    };

    const handleTrayClick = (colorId: string) => {
        if (targetSlot) {
            dispatch({ type: targetSlot === 'primary' ? 'SET_PRIMARY_COLOR' : 'SET_SECONDARY_COLOR', payload: colorId });
        }
        if (onColorSelect) onColorSelect(colorId);

        if (mode === 'select') {
            onClose();
        }
    };

    const handleCreateCustomAndAdd = () => {
        const hex = tempCustomColor;
        // VALIDATION: Ensure valid hex before saving
        if (!/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
            // Should not happen if button disabled, but defensive:
            return;
        }

        const newColor: PatternColor = {
            id: `custom-${Date.now()}`,
            brand: customBrand.trim() || 'Custom',
            name: customName.trim() || `Custom ${hex}`,
            hex: hex,
            rgb: hexToRgb(hex), // Guaranteed to be valid [r,g,b]
            skeinLength: 295
        };
        dispatch({ type: 'ADD_COLOR_TO_PALETTE', payload: newColor });
        setIsCustomOverlayOpen(false);
        // Reset name
        setCustomName('My Custom Color');
    };

    const handleDeleteColor = (e: React.MouseEvent, colorId: string) => {
        e.stopPropagation();
        const usage = yarnUsage.get(colorId) || 0;
        if (usage > 0) {
            if (!window.confirm(`This color is used in ${usage} pixels. It will be hidden from your palette list, but existing pixels will remain. Continue?`)) {
                return;
            }
        }
        dispatch({ type: 'REMOVE_COLOR_FROM_PALETTE', payload: colorId });
    };

    const handleRemoveAll = () => {
        if (window.confirm("Are you sure you want to remove ALL colors from your palette?")) {
            dispatch({ type: 'CLEAR_PALETTE' });
        }
    };

    // Mobile/Footer State
    const [activeTrayColorId, setActiveTrayColorId] = useState<string | null>(null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Yarn Browser" maxWidth="max-w-lg mx-auto">
            <div className="flex flex-col h-[600px] relative">

                {/* Header: Vertical Stack */}
                <div className="flex flex-col gap-3 border-b pb-4 px-1 bg-white z-10 shrink-0">
                    {/* Brand Selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Brand Library</label>
                        <select
                            value={selectedBrandId}
                            onChange={(e) => setSelectedBrandId(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        >
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    {/* Search Input */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Search Colors</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={librarySearch}
                                onChange={(e) => setLibrarySearch(e.target.value)}
                                className="w-full border rounded pl-9 pr-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <Icon name="search" size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex gap-2 pt-1">
                        <Button variant="secondary" onClick={handleImportAllBrand} className="flex-1 justify-center text-xs h-8" title="Add all visible colors from this brand">
                            <Icon name="plus" size={12} className="mr-1.5" /> Add All ({filteredLibraryColors.length})
                        </Button>
                        <Button variant="secondary" onClick={() => setIsCustomOverlayOpen(true)} className="flex-1 justify-center text-xs h-8">
                            <Icon name="color-palette" size={12} className="mr-1.5" /> Custom Color
                        </Button>
                    </div>
                </div>

                {/* Main Body: Library Grid */}
                <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {filteredLibraryColors.map(color => {
                            const isInPalette = palette.some(p => (p.libraryColorId === color.id || (p.hex === color.hex && p.name === color.name)) && !p.hidden);
                            return (
                                <button
                                    key={color.id}
                                    onClick={() => handleToggleLibraryColor(color)}
                                    className={`group flex flex-col items-center gap-1 p-2 border rounded transition-all text-left relative ${isInPalette ? 'bg-indigo-50 border-indigo-200' : 'hover:border-indigo-400 hover:shadow-md bg-white'}`}
                                    title={`${color.name} ${isInPalette ? '(Click to Remove)' : '(Click to Add)'}`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full border shadow-sm"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <span className="text-[10px] text-gray-600 truncate w-full text-center font-medium leading-tight">{color.name}</span>
                                    {librarySearch && (
                                        <span className="text-[9px] text-gray-400 truncate w-full text-center block" title={brands.find(b => b.id === color.brandId)?.name}>
                                            {brands.find(b => b.id === color.brandId)?.name}
                                        </span>
                                    )}
                                    <span className="text-[9px] text-gray-400">{color.productCode}</span>

                                    {isInPalette && (
                                        <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                            <Icon name="check" size={10} />
                                        </div>
                                    )}
                                    {!isInPalette && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity">
                                            <Icon name="plus" size={14} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        {filteredLibraryColors.length === 0 && (
                            <div className="col-span-full py-10 text-center text-gray-400 text-sm italic">
                                No colors found in this brand matching "{librarySearch}".
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Tray: My Palette */}
                <div className="border-t bg-white p-2 shadow-inner shrink-0 z-20">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex justify-between items-center">
                        <span>My Pattern Palette ({palette.filter(c => !c.hidden).length})</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-normal text-gray-400 hidden md:block">Click to Select • Hover to Delete</span>
                            <span className="text-[9px] font-normal text-gray-400 block md:hidden">Tap to Select • Tap Trash to Remove</span>
                            {palette.length > 0 && (
                                <button
                                    onClick={handleRemoveAll}
                                    className="text-[9px] text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors ml-2 border border-red-100"
                                    title="Remove All Colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {palette.filter(c => !c.hidden).map(color => {
                            const usage = yarnUsage.get(color.id) || 0;
                            // Highlight if it matches targetSlot active color?
                            // Needed? Maybe subtle border.
                            return (
                                <div key={color.id} className="relative group shrink-0">
                                    <button
                                        onClick={() => {
                                            setActiveTrayColorId(color.id);
                                            handleTrayClick(color.id);
                                        }}
                                        className={`flex flex-col items-center gap-1 w-16 p-1 rounded transition-colors ${activeTrayColorId === color.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-indigo-50'}`}
                                        title={`Select ${color.name} (${usage} pixels)`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full border shadow-sm ring-2 ring-transparent group-hover:ring-indigo-200 transition-all"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                        <span className="text-[9px] text-gray-600 truncate w-full text-center">{color.name}</span>
                                    </button>

                                    {/* Delete Button */}
                                    <div className={`absolute -top-1 -right-1 transition-opacity ${activeTrayColorId === color.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button
                                            onClick={(e) => handleDeleteColor(e, color.id)}
                                            className="bg-white text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-full p-1 shadow-sm transition-colors"
                                            title={usage > 0 ? `Remove (used in ${usage} pixels)` : "Remove"}
                                        >
                                            <Icon name="trash" size={10} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {palette.length === 0 && (
                            <div className="text-xs text-gray-400 italic py-2 px-4 border border-dashed rounded w-full text-center">
                                Palette is empty. Click swatches above to add.
                            </div>
                        )}
                    </div>
                </div>

                {/* Custom Overlay */}
                {isCustomOverlayOpen && (
                    <div className="absolute inset-x-0 bottom-0 top-12 bg-white/95 backdrop-blur-sm z-30 flex flex-col p-4 animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg text-gray-700">Create Custom Color</h3>
                            <button onClick={() => setIsCustomOverlayOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Icon name="close" size={20} />
                            </button>
                        </div>

                        <div className="flex gap-6">
                            {/* Visual Preview */}
                            <div className="flex flex-col gap-2 w-32 shrink-0">
                                <div
                                    className="w-32 h-32 rounded-lg border shadow-sm"
                                    style={{ backgroundColor: tempCustomColor }}
                                />
                                {/* Editable Hex Input */}
                                <input
                                    type="text"
                                    value={tempCustomColor}
                                    onChange={(e) => updateColorFromHex(e.target.value)}
                                    className="w-full text-center font-mono text-sm bg-gray-50 rounded py-1 border uppercase focus:ring-2 focus:ring-indigo-100 outline-none"
                                    maxLength={7}
                                />

                                {/* RGB Inputs */}
                                <div className="grid grid-cols-3 gap-1">
                                    {['R', 'G', 'B'].map((label, idx) => {
                                        const currentRgb = getRgb();
                                        return (
                                            <div key={label} className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="255"
                                                    value={currentRgb[idx]}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        const newRgb = [...currentRgb];
                                                        newRgb[idx] = val;
                                                        updateColorFromRgb(newRgb[0], newRgb[1], newRgb[2]);
                                                    }}
                                                    className="w-full text-center text-xs border rounded py-1 px-0 appearance-none bg-white"
                                                />
                                                <div className="text-[8px] text-gray-400 text-center mt-0.5 font-bold">{label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex-1 space-y-4 max-w-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color Name</label>
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            placeholder="e.g. Electric Blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Name</label>
                                        <input
                                            type="text"
                                            value={customBrand}
                                            onChange={(e) => setCustomBrand(e.target.value)}
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            placeholder="e.g. My Stash"
                                        />
                                    </div>
                                </div>

                                {/* Helper Sliders (HSL) */}
                                <div className="space-y-3 bg-gray-50 p-3 rounded border">
                                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                        <span>Fine Tune Logic (HSL)</span>
                                    </div>
                                    {[
                                        { label: 'Hue', val: hsl[0], max: 360, idx: 0, grad: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' },
                                        { label: 'Sat', val: hsl[1], max: 100, idx: 1, grad: 'linear-gradient(to right, #888, ' + tempCustomColor + ')' }, // Approx
                                        { label: 'Lit', val: hsl[2], max: 100, idx: 2, grad: 'linear-gradient(to right, #000, #888, #fff)' }
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-3">
                                            <span className="w-6 text-xs text-gray-500 font-mono">{item.label[0]}</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max={item.max}
                                                value={item.val}
                                                onChange={(e) => updateColorFromHsl(
                                                    item.idx === 0 ? Number(e.target.value) : hsl[0],
                                                    item.idx === 1 ? Number(e.target.value) : hsl[1],
                                                    item.idx === 2 ? Number(e.target.value) : hsl[2]
                                                )}
                                                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                                style={{ background: item.grad }}
                                            />
                                            <span className="w-8 text-right text-xs text-gray-600 tabular-nums">{item.val}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleCreateCustomAndAdd}
                                        className="w-full justify-center"
                                        disabled={!/^#[0-9A-Fa-f]{6}$/i.test(tempCustomColor)}
                                    >
                                        Add to Palette
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Modal>
    );
};
