import React from 'react';

interface RulersProps {
    width: number;
    height: number;
    zoom: number;
    rulerSize: number;
    svgTotalWidth: number;
    svgTotalHeight: number;
}

export const Rulers: React.FC<RulersProps> = ({
    width,
    height,
    zoom,
    rulerSize,
    svgTotalWidth,
    svgTotalHeight,
}) => {
    const getStep = (currentZoom: number) => {
        if (currentZoom >= 4) return 1;
        if (currentZoom >= 1.5) return 2;
        if (currentZoom >= 0.5) return 5;
        return 10;
    };

    const stepX = getStep(zoom);
    const stepY = getStep(zoom);
    const fontSize = rulerSize * 0.6;

    return (
        <g>
            {/* Backgrounds */}
            <rect x={0} y={0} width={svgTotalWidth} height={rulerSize} fill="#f8f9fa" />
            <rect x={0} y={0} width={rulerSize} height={svgTotalHeight} fill="#f8f9fa" />
            <rect x={rulerSize + width} y={0} width={rulerSize} height={svgTotalHeight} fill="#f8f9fa" />
            <rect x={0} y={height + rulerSize} width={svgTotalWidth} height={rulerSize} fill="#f8f9fa" />

            {/* Lines */}
            <line x1={rulerSize} y1={0} x2={rulerSize} y2={svgTotalHeight} stroke="#ccc" strokeWidth={0.02} />
            <line x1={rulerSize + width} y1={0} x2={rulerSize + width} y2={svgTotalHeight} stroke="#ccc" strokeWidth={0.02} />
            <line x1={0} y1={rulerSize} x2={svgTotalWidth} y2={rulerSize} stroke="#ccc" strokeWidth={0.02} />
            <line x1={0} y1={height + rulerSize} x2={svgTotalWidth} y2={height + rulerSize} stroke="#ccc" strokeWidth={0.02} />

            {/* Top Ruler */}
            {Array.from({ length: width }).map((_, i) => {
                const num = i + 1;
                if (stepX === 1 && num % 2 !== 0) return null;
                if (num % stepX !== 0) return null;
                return (
                    <text
                        key={`ruler-top-${i}`}
                        x={i + 0.5 + rulerSize}
                        y={rulerSize / 2}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}

            {/* Bottom Ruler */}
            {Array.from({ length: width }).map((_, i) => {
                const num = i + 1;
                if (stepX === 1 && num % 2 === 0) return null;
                if (num % stepX !== 0) return null;
                return (
                    <text
                        key={`ruler-bottom-${i}`}
                        x={i + 0.5 + rulerSize}
                        y={height + rulerSize + rulerSize / 2}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}

            {/* Left Ruler */}
            {Array.from({ length: height }).map((_, i) => {
                const num = i + 1;
                if (stepY === 1 && num % 2 === 0) return null;
                if (num % stepY !== 0) return null;
                return (
                    <text
                        key={`ruler-left-${i}`}
                        x={rulerSize / 2}
                        y={i + 0.5 + rulerSize}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}

            {/* Right Ruler */}
            {Array.from({ length: height }).map((_, i) => {
                const num = i + 1;
                if (stepY === 1 && num % 2 !== 0) return null;
                if (num % stepY !== 0) return null;
                return (
                    <text
                        key={`ruler-right-${i}`}
                        x={width + rulerSize + rulerSize / 2}
                        y={i + 0.5 + rulerSize}
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#555"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                        {String(num)}
                    </text>
                );
            })}
        </g>
    );
};
