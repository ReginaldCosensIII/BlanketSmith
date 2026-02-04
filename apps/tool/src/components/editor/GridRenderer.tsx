import React from 'react';
import { CellData } from '../../types';
import { StitchDefinition } from '../../data/stitches';

interface GridRendererProps {
    width: number;
    height: number;
    grid: CellData[];
    yarnColorMap: Map<string, any>; // Relaxed type to avoid issues if YarnColor is complex
    stitchMap: Map<string, StitchDefinition>;
    showGridLines: boolean;
    zoom: number;
    floatingSelection?: { sourceBounds?: { x: number, y: number, w: number, h: number } } | null;
}

export const GridRenderer: React.FC<GridRendererProps> = ({
    width,
    height,
    grid,
    yarnColorMap,
    stitchMap,
    showGridLines,
    zoom,
    floatingSelection,
}) => {
    return (
        <g>
            <defs>
                <pattern id="grid-pattern" width="1" height="1" patternUnits="userSpaceOnUse">
                    <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={0.05} />
                </pattern>
            </defs>

            <rect x={0} y={0} width={width} height={height} fill="#fff" />

            {grid.map((cell, i) => {
                const x = i % width;
                const y = Math.floor(i / width);

                if (floatingSelection?.sourceBounds) {
                    const { x: sx, y: sy, w: sw, h: sh } = floatingSelection.sourceBounds;
                    if (x >= sx && x < sx + sw && y >= sy && y < sy + sh) {
                        return null;
                    }
                }

                const colorObj = cell.colorId ? yarnColorMap.get(cell.colorId) : null;
                const color = colorObj ? (typeof colorObj === 'string' ? colorObj : colorObj.hex) : 'transparent';
                const stitch = cell.stitchId ? stitchMap.get(cell.stitchId) : null;

                if ((color === 'transparent' || !color) && !stitch) return null;

                return (
                    <g key={i}>
                        {color && color !== 'transparent' && (
                            <rect
                                x={x}
                                y={y}
                                width="1"
                                height="1"
                                fill={color}
                            />
                        )}
                        {stitch && (
                            <text
                                x={x + 0.5}
                                y={y + 0.75}
                                fontSize="0.7"
                                textAnchor="middle"
                                fill="rgba(0,0,0,0.7)"
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >
                                {stitch.symbol}
                            </text>
                        )}
                    </g>
                );
            })}

            {showGridLines && zoom > 4 && (
                <rect x="0" y="0" width={width} height={height} fill="url(#grid-pattern)" pointerEvents="none" />
            )}
        </g>
    );
};
