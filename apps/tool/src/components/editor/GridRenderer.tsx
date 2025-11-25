import React from 'react';
import { CellData } from '../../types';

interface GridRendererProps {
    width: number;
    height: number;
    grid: CellData[];
    yarnColorMap: Map<string, string>;
    showGridLines: boolean;
    zoom: number;
}

export const GridRenderer: React.FC<GridRendererProps> = ({
    width,
    height,
    grid,
    yarnColorMap,
    showGridLines,
    zoom,
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
                const color = cell.colorId ? yarnColorMap.get(cell.colorId) : 'transparent';

                if (color === 'transparent' || !color) return null;

                return (
                    <rect
                        key={i}
                        x={x}
                        y={y}
                        width="1"
                        height="1"
                        fill={color}
                    />
                );
            })}

            {showGridLines && zoom > 4 && (
                <rect x="0" y="0" width={width} height={height} fill="url(#grid-pattern)" pointerEvents="none" />
            )}
        </g>
    );
};
