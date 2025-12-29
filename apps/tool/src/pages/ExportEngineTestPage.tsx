import React, { useState } from 'react';
import { exportPixelGridToPDF } from '../services/exportService';
import { ExportOptions, PixelGridData, YarnColor } from '../types';

// Dev-only guard
const IS_DEV = import.meta.env.DEV || process.env.NODE_ENV === 'development';


// --- 1. CANONICAL DEFAULTS ---

function getDefaultPatternPackOptions(): ExportOptions {
    return {
        exportType: 'pattern-pack',
        includeCoverPage: true,
        overviewMode: 'auto', // V2 Default
        includeYarnRequirements: true,
        includeStitchLegend: true,

        // V2 Explicit Toggles
        includeColorChart: true,
        includeStitchChart: true,
        includeHybridChart: false,

        chartVisual: {
            showCellSymbols: true,
            showCellBackgrounds: true,
            symbolMode: 'color-index'
        },
        branding: {
            designerName: 'QA Tester',
            website: 'www.qa-harness.com',
            copyrightLine: '© 2025 QA Harness'
        }
    };
}

function getDefaultChartOnlyOptions(): ExportOptions {
    return {
        exportType: 'chart-only',
        chartOnlyMode: 'color', // V2 Explicit Mode
        chartMode: 'color', // Legacy compat if needed, but harness should prefer chartOnlyMode

        overviewMode: 'auto', // V2 Default
        includeCoverPage: false,
        includeYarnRequirements: false,
        includeStitchLegend: false,

        chartVisual: {
            showCellSymbols: true,
            showCellBackgrounds: true,
            symbolMode: 'color-index'
        },
        branding: {
            designerName: 'QA Tester',
            website: 'www.qa-harness.com',
            copyrightLine: '© 2025 QA Harness'
        }
    };
}


// --- 2. MOCK DATA HELPERS ---

const MOCK_PALETTE: YarnColor[] = [
    { id: 'y1', name: 'Royal Blue', hex: '#002366', rgb: [0, 35, 102], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
    { id: 'y2', name: 'Matador', hex: '#E31837', rgb: [227, 24, 55], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
    { id: 'y3', name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
    { id: 'y4', name: 'Black', hex: '#000000', rgb: [0, 0, 0], brand: 'Stylecraft', yarnWeight: 'DK', skeinLength: 295 },
];

interface MockGridConfig {
    width: number;
    height: number;
    patternType?: 'solid' | 'checker' | 'stripes';
    includeStitches?: boolean;
}

const createMockGrid = ({ width, height, patternType = 'checker', includeStitches = false }: MockGridConfig): PixelGridData => {
    const grid = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let colorId = 'y3';
            let stitchId: string | undefined = undefined;

            if (patternType === 'checker') {
                if ((x + y) % 2 === 0) colorId = 'y1';
            } else if (patternType === 'stripes') {
                if (y % 2 === 0) colorId = 'y2';
            } else {
                // solid
                colorId = 'y4';
            }

            if (includeStitches) {
                // Add some stitches for stitch mode tests
                if (x % 5 === 0) stitchId = 'sc';
                if (x % 5 === 1) stitchId = 'dc';
            }

            grid.push({ colorId, stitchId });
        }
    }
    return { width, height, grid, palette: MOCK_PALETTE.map(p => p.id) };
};

const createMockUsage = (gridData: PixelGridData): Map<string, number> => {
    const usage = new Map<string, number>();
    gridData.grid.forEach(cell => {
        if (cell.colorId) {
            usage.set(cell.colorId, (usage.get(cell.colorId) || 0) + 1);
        }
    });
    return usage;
};

// --- 3. SCENARIOS ---

interface Scenario {
    id: string;
    name: string;
    description: string;
    expected: string;
    gridConfig: MockGridConfig;
    // Overrides for defaults
    baseType: 'pattern-pack' | 'chart-only';
    overrides?: Partial<ExportOptions>;
}

// Helper to deep merge options
function buildOptions(baseType: 'pattern-pack' | 'chart-only', overrides: Partial<ExportOptions> = {}): ExportOptions {
    const defaults = baseType === 'pattern-pack' ? getDefaultPatternPackOptions() : getDefaultChartOnlyOptions();

    return {
        ...defaults,
        ...overrides,
        // Deep merge sub-objects if present in overrides
        chartVisual: {
            ...defaults.chartVisual,
            ...(overrides.chartVisual || {})
        },
        branding: {
            ...defaults.branding,
            ...(overrides.branding || {})
        }
    };
}

// --- SCENARIO ID CONVENTION ---
// v2_{mode}_{desc}_{overviewMode}_{flags}
// mode: 'pp' (pattern-pack) | 'co' (chart-only)
// overviewMode: 'ov_auto' | 'ov_always' | 'ov_never'
// flags: short descriptive tags (e.g. 'cover', 'yarn', 'hybrid', 'large')

const SCENARIOS: Scenario[] = [
    // --- V2 BASELINE: PATTERN PACK ---

    {
        id: 'v2_pp_small_ov_auto_default',
        name: '1. Pattern Pack: Default (Small)',
        description: 'Standard PP, 20x20, Overview Auto (Hidden for small).',
        expected: 'Overview: HIDDEN (Auto & single page).\nCharts: Color, Stitch.\nOrdering: Cover -> Yarn -> Color Chart -> Stitch Chart -> Stitch Legend.\nFresh Page Policy: All charts start on new page.',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: {}
    },
    {
        id: 'v2_pp_small_ov_auto_no_cover',
        name: '2. Pattern Pack: No Cover',
        description: 'Standard PP, No Cover Page.',
        expected: 'Overview: HIDDEN.\nHeader: Shares page 1 with Yarn/Charts if fits.\nCharts: Color, Stitch.',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: { includeCoverPage: false }
    },
    {
        id: 'v2_pp_small_ov_auto_hybrid_only',
        name: '3. Pattern Pack: Charts: Hybrid Only',
        description: 'Hybrid Chart enabled, others disabled.',
        expected: 'Overview: HIDDEN.\nCharts: Hybrid ONLY (Color+Symbols).\nFresh Page Policy: Verified.',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: {
            includeColorChart: false,
            includeStitchChart: false,
            includeHybridChart: true
        }
    },
    {
        id: 'v2_pp_all_three_charts',
        name: '4. Pattern Pack: Charts: Color+Stitch+Hybrid',
        description: 'All 3 chart types enabled.',
        expected: 'Overview: HIDDEN.\nCharts: Color -> Stitch -> Hybrid.\nFresh Page Policy: Verified (3 separate chart sections).',
        baseType: 'pattern-pack',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: { includeColorChart: true, includeStitchChart: true, includeHybridChart: true }
    },

    // --- V2 BASELINE: CHART ONLY ---

    {
        id: 'v2_co_color_ov_auto_default',
        name: '5. Chart-Only: Charts: Color',
        description: 'Color Mode, Defaults.',
        expected: 'Overview: HIDDEN.\nCharts: Color Chart only.\nSingle Page: Chart fits on one page.',
        baseType: 'chart-only',
        gridConfig: { width: 25, height: 25, patternType: 'stripes' },
        overrides: { chartOnlyMode: 'color' }
    },
    {
        id: 'v2_co_color_ov_auto_cover_yarn',
        name: '6. Chart-Only: Cover + Yarn',
        description: 'Color Mode with Extras.',
        expected: 'Cover: Present.\nYarn Req: Present.\nCharts: Color Chart (Starts on fresh page).',
        baseType: 'chart-only',
        gridConfig: { width: 25, height: 25 },
        overrides: { includeCoverPage: true, includeYarnRequirements: true, chartOnlyMode: 'color' }
    },
    {
        id: 'v2_co_stitch_ov_auto_default',
        name: '7. Chart-Only: Charts: Stitch',
        description: 'Stitch Mode.',
        expected: 'Overview: HIDDEN.\nCharts: Stitch Chart only (B&W Symbols).',
        baseType: 'chart-only',
        gridConfig: { width: 15, height: 15, patternType: 'solid', includeStitches: true },
        overrides: { chartOnlyMode: 'stitch' }
    },

    // --- OVERVIEW TRI-STATE TESTS ---

    {
        id: 'v2_co_large_ov_never_atlas',
        name: '8. Chart-Only: Overview: Never (Large Atlas)',
        description: 'Large chart (60x60). Overview set to NEVER.',
        expected: 'Overview: HIDDEN (Explicitly suppressed).\nCharts: Color Atlas (Multiple pages).\nOrdering: Part 1..N consistent.',
        baseType: 'chart-only',
        gridConfig: { width: 60, height: 60 },
        overrides: { overviewMode: 'never', chartOnlyMode: 'color' }
    },
    {
        id: 'v2_co_small_ov_always',
        name: '9. Chart-Only: Overview: Always (Small Chart)',
        description: 'Small chart (fits 1 page). Overview set to ALWAYS.',
        expected: 'Overview: PRESENT (Dimensions/Miniature/Map present).\nCharts: Color Chart (Starts on fresh page).',
        baseType: 'chart-only',
        gridConfig: { width: 10, height: 10 },
        overrides: { overviewMode: 'always', chartOnlyMode: 'color' }
    },
    {
        id: 'v2_pp_large_ov_auto_atlas',
        name: '10. Pattern Pack: Overview: Auto (Large Atlas)',
        description: 'Large chart (60x60). Overview set to AUTO.',
        expected: 'Overview: PRESENT (Triggered by multi-page atlas).\nCharts: Color Atlas.',
        baseType: 'pattern-pack',
        gridConfig: { width: 60, height: 60 },
        overrides: { overviewMode: 'auto', includeCoverPage: true, includeColorChart: true, includeStitchChart: false }
    },
    {
        id: 'v2_pp_large_ov_always_atlas',
        name: '11. Pattern Pack: Overview: Always (Large Atlas)',
        description: 'Large chart. Overview ALWAYS.',
        expected: 'Overview: PRESENT.\nCharts: Color Atlas.',
        baseType: 'pattern-pack',
        gridConfig: { width: 60, height: 60 },
        overrides: { overviewMode: 'always', includeCoverPage: true, includeColorChart: true, includeStitchChart: false }
    },

    // --- EDGE CASES & FIX REGRESSIONS ---

    {
        id: 'v2_pp_edge_no_stitches_legend_on',
        name: '12. Edge: PP No Stitches + Legend ON',
        description: 'No stitches in grid, but Legend requested.',
        expected: 'Stitch Legend: OMITTED (Graceful fallback, empty checks).',
        baseType: 'pattern-pack',
        gridConfig: { width: 15, height: 15, includeStitches: false },
        overrides: { includeStitchLegend: true }
    },
    {
        id: 'v2_co_edge_tall_yarn',
        name: '13. Edge: CO Tall + Yarn',
        description: 'Tall chart 20x60 + Yarn Req.',
        expected: 'Yarn: Page 1.\nCharts: Color Atlas (Starts on fresh page/Page 2).',
        baseType: 'chart-only',
        gridConfig: { width: 20, height: 60, patternType: 'stripes' },
        overrides: { includeYarnRequirements: true, chartOnlyMode: 'color' }
    },
    {
        id: 'v2_co_edge_hybrid_no_bg',
        name: '14. Edge: CO Hybrid No Checkers',
        description: 'Hybrid Mode, Backgrounds OFF.',
        expected: 'Charts: Hybrid.\nVisuals: Symbols visible, White backgrounds.',
        baseType: 'chart-only',
        gridConfig: { width: 20, height: 20, includeStitches: true },
        overrides: {
            chartOnlyMode: 'hybrid',
            chartVisual: { showCellSymbols: true, showCellBackgrounds: false, symbolMode: 'stitch-symbol' }
        }
    },
    {
        id: 'v2_pp_fix_sm_15_fit',
        name: '15. Fix: PP Small 15x15 Fit',
        description: 'Small grid should not trigger split.',
        expected: 'Charts: Single Page.\nNo Atlas behaviors.',
        baseType: 'pattern-pack',
        gridConfig: { width: 15, height: 15, includeStitches: true },
        overrides: {}
    },
    {
        id: 'v2_co_fix_giant_atlas',
        name: '16. Fix: CO Giant 100x200',
        description: 'Stress test large grid.',
        expected: 'Overview: PRESENT (Auto).\nCharts: Large Atlas (Many pages).\nPerformance check.',
        baseType: 'chart-only',
        gridConfig: { width: 100, height: 200, patternType: 'stripes' },
        overrides: {}
    }
];


// --- COMPONENT ---

export const ExportEngineTestPage: React.FC = () => {
    // State to store results
    const [results, setResults] = useState<Record<string, { status: 'pending' | 'success' | 'error', url?: string, error?: string }>>({});
    // State to toggle details
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    if (!IS_DEV) {
        return <div className="p-10 text-red-600">This page is for Development/QA only.</div>;
    }

    const resetHarness = () => {
        setResults({});
        setExpanded({});
    };

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const runScenario = async (scenario: Scenario) => {
        setResults(prev => ({ ...prev, [scenario.id]: { status: 'pending' } }));

        try {
            const gridData = createMockGrid(scenario.gridConfig);
            const usage = createMockUsage(gridData);
            const finalOptions = buildOptions(scenario.baseType, scenario.overrides);

            // Safe Capture of Blob URL
            const originalOpen = window.open;
            let capturedUrl = '';

            try {
                window.open = (url: string | URL | undefined, target?: string | undefined, features?: string | undefined) => {
                    if (url) capturedUrl = url.toString();
                    return null; // Block actual popup
                };

                await exportPixelGridToPDF(
                    `QA_${scenario.id}`,
                    gridData,
                    MOCK_PALETTE,
                    usage,
                    { ...finalOptions, preview: true }, // Force preview
                    { yarnPerStitch: 1 },
                    false
                );
            } finally {
                // ALWAYS restore window.open
                window.open = originalOpen;
            }

            if (capturedUrl) {
                setResults(prev => ({ ...prev, [scenario.id]: { status: 'success', url: capturedUrl } }));
            } else {
                setResults(prev => ({ ...prev, [scenario.id]: { status: 'error', error: 'Could not capture Blob URL' } }));
            }

        } catch (e: any) {
            console.error(e);
            setResults(prev => ({ ...prev, [scenario.id]: { status: 'error', error: e.message } }));
        }
    };

    const runAll = async () => {
        for (const s of SCENARIOS) {
            await runScenario(s);
        }
    };

    return (
        <div className="p-8 bg-gray-50 h-full overflow-auto pb-20">
            <h1 className="text-3xl font-bold mb-2">Export Engine QA Harness V2</h1>
            <p className="text-gray-600 mb-6">Internal tool for verification of PDF Export V2 Logic with Canonical Defaults.</p>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={runAll}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Run All Scenarios
                </button>
                <button
                    onClick={resetHarness}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 border border-gray-300"
                >
                    Reset Results
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {SCENARIOS.map(s => {
                            const res = results[s.id];
                            const isExpanded = expanded[s.id];
                            const finalOptions = buildOptions(s.baseType, s.overrides);

                            return (
                                <React.Fragment key={s.id}>
                                    <tr className={isExpanded ? "bg-blue-50" : ""}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleExpand(s.id)}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none font-bold"
                                            >
                                                {isExpanded ? '▼' : '▶'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{s.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{s.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => runScenario(s)}
                                                className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                            >
                                                Run
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {!res && <span className="text-gray-400">Idle</span>}
                                            {res?.status === 'pending' && <span className="text-yellow-500 font-medium">Running...</span>}
                                            {res?.status === 'success' && <span className="text-green-600 font-medium">Success</span>}
                                            {res?.status === 'error' && <span className="text-red-600 font-medium">Error</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {res?.status === 'success' && res.url && (
                                                <a
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200"
                                                >
                                                    View PDF
                                                </a>
                                            )}
                                            {res?.status === 'error' && (
                                                <span className="text-red-500 text-xs">{res.error}</span>
                                            )}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="text-sm text-gray-700 space-y-2">
                                                    <div>
                                                        <strong className="block mb-1">Expected Outcome:</strong>
                                                        <p className="bg-white p-2 rounded border border-gray-200">{s.expected}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <strong className="block mb-1">Grid Config:</strong>
                                                            <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs">
                                                                {JSON.stringify(s.gridConfig, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <strong className="block mb-1">Final Export Options:</strong>
                                                            <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
                                                                {JSON.stringify(finalOptions, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
