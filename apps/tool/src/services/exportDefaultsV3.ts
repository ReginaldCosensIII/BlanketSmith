import { ExportOptions } from '../types';

/**
 * Returns the canonical default options for Chart-Only mode (V3).
 * Optimized for single-purpose, quick-reference outputs.
 */
export const getDefaultChartOnlyExportOptionsV3 = (): ExportOptions => {
    return {
        exportType: 'chart-only',
        chartOnlyMode: 'color',
        forceSinglePage: false, // Default to false, let engine decide or user override

        // Layout / Sections
        includeCoverPage: false,
        includeYarnRequirements: true, // "Materials & Stitch Key"
        overviewMode: 'auto',

        // Chart Modes (Chart-Only sets these based on chartOnlyMode at runtime usually, 
        // but defaults should reflect a "Color" baseline)
        includeColorChart: true,  // Logical baseline
        includeStitchChart: false,
        includeHybridChart: false,

        // Instructions
        instructionsMode: 'none',

        // Visuals
        chartVisual: {
            showCellSymbols: true,
            showCellBackgrounds: true,
            symbolMode: 'color-index'
        },
        branding: {
            // Empty defaults, to be populated from project or user profile
        }
    };
};

/**
 * Returns the canonical default options for Pattern Pack mode (V3).
 * Optimized for comprehensive, multi-section pattern documentation.
 */
export const getDefaultPatternPackExportOptionsV3 = (): ExportOptions => {
    return {
        exportType: 'pattern-pack',

        // Layout / Sections
        includeCoverPage: true,
        includeYarnRequirements: true, // "Materials & Stitch Key"
        overviewMode: 'auto',

        // Chart Modes
        includeColorChart: true,
        includeStitchChart: false,
        includeHybridChart: false,

        // Instructions
        instructionsMode: 'none',

        // Visuals
        chartVisual: {
            showCellSymbols: true,
            showCellBackgrounds: true,
            symbolMode: 'color-index'
        },
        branding: {
            // Empty defaults
        }
    };
};
