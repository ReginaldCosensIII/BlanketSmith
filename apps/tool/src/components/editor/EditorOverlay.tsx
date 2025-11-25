import React from 'react';

interface EditorOverlayProps {
    width: number;
    height: number;
    showCenterGuides: boolean;
    selection: { x: number; y: number; w: number; h: number } | null;
    hoverPreviews: React.ReactNode[] | null;
}

export const EditorOverlay: React.FC<EditorOverlayProps> = ({
    width,
    height,
    showCenterGuides,
    selection,
    hoverPreviews,
}) => {
    return (
        <g pointerEvents="none">
            <style>{`
        @keyframes march {
            to { stroke-dashoffset: -2; }
        }
        .selection-marquee {
            stroke: #3b82f6; /* indigo-500 */
            stroke-width: 0.5px;
            stroke-dasharray: 1, 1;
            fill: rgba(59, 130, 246, 0.2);
            vector-effect: non-scaling-stroke;
            animation: march 1s linear infinite;
        }
      `}</style>

            {showCenterGuides && (
                <g>
                    <line
                        x1={width / 2}
                        y1={0}
                        x2={width / 2}
                        y2={height}
                        stroke="#ec4899"
                        strokeWidth={0.2}
                        strokeDasharray="0.5, 0.5"
                    />
                    <line
                        x1={0}
                        y1={height / 2}
                        x2={width}
                        y2={height / 2}
                        stroke="#ec4899"
                        strokeWidth={0.2}
                        strokeDasharray="0.5, 0.5"
                    />
                </g>
            )}

            {hoverPreviews}

            {selection && (
                <rect
                    x={selection.x}
                    y={selection.y}
                    width={selection.w}
                    height={selection.h}
                    className="selection-marquee"
                />
            )}
        </g>
    );
};
