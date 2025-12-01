/**
 * Stitch System Data
 * 
 * Defines the stitch library and types for the stitch system.
 * Each stitch has a unique ID, display name, short code, and symbol for rendering.
 */

export interface StitchDefinition {
    id: string;         // Unique identifier, e.g. "sc"
    name: string;       // Full name, e.g. "Single Crochet"
    shortCode: string;  // Abbreviated code, e.g. "SC"
    symbol: string;     // Symbol to render in cell, e.g. "×"
    category?: string;  // Optional category, e.g. "Basic"
    description?: string; // Optional description
}

/**
 * Default stitch library with basic crochet stitches
 */
export const DEFAULT_STITCH_LIBRARY: StitchDefinition[] = [
    {
        id: "ch",
        name: "Chain",
        shortCode: "CH",
        symbol: "●",
        category: "Basic",
        description: "Foundation chain stitch"
    },
    {
        id: "sc",
        name: "Single Crochet",
        shortCode: "SC",
        symbol: "×",
        category: "Basic",
        description: "Basic single crochet stitch"
    },
    {
        id: "hdc",
        name: "Half Double Crochet",
        shortCode: "HDC",
        symbol: "≋",
        category: "Basic",
        description: "Half double crochet stitch"
    },
    {
        id: "dc",
        name: "Double Crochet",
        shortCode: "DC",
        symbol: "∥",
        category: "Basic",
        description: "Double crochet stitch"
    },
];
