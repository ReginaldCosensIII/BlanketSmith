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
    instruction: string; // Linguistic instruction, e.g. "single crochet"
    instructionPlural?: string; // Pluralized instruction, e.g. "single crochets"
    complexity: 'atomic' | 'complex'; // Complexity level
}

/**
 * Default stitch library with basic crochet stitches
 */
export const DEFAULT_STITCH_LIBRARY: StitchDefinition[] = [
    // Basic Stitches
    {
        id: "ch",
        name: "Chain",
        shortCode: "CH",
        symbol: "●",
        category: "Basic",
        description: "Foundation chain stitch",
        instruction: "chain",
        instructionPlural: "chains",
        complexity: "atomic"
    },
    {
        id: "slst",
        name: "Slip Stitch",
        shortCode: "SLST",
        symbol: "•",
        category: "Basic",
        description: "Slip stitch joining",
        instruction: "slip stitch",
        instructionPlural: "slip stitches",
        complexity: "atomic"
    },
    {
        id: "sc",
        name: "Single Crochet",
        shortCode: "SC",
        symbol: "×",
        category: "Basic",
        description: "Basic single crochet stitch",
        instruction: "single crochet",
        instructionPlural: "single crochets",
        complexity: "atomic"
    },
    {
        id: "hdc",
        name: "Half Double Crochet",
        shortCode: "HDC",
        symbol: "≋",
        category: "Basic",
        description: "Half double crochet stitch",
        instruction: "half double crochet",
        instructionPlural: "half double crochets",
        complexity: "atomic"
    },
    {
        id: "dc",
        name: "Double Crochet",
        shortCode: "DC",
        symbol: "∥",
        category: "Basic",
        description: "Double crochet stitch",
        instruction: "double crochet",
        instructionPlural: "double crochets",
        complexity: "atomic"
    },
    {
        id: "tr",
        name: "Treble Crochet",
        shortCode: "TR",
        symbol: "‡",
        category: "Basic",
        description: "Treble crochet stitch",
        instruction: "treble crochet",
        instructionPlural: "treble crochets",
        complexity: "atomic"
    },

    // Variants
    {
        id: "blo-sc",
        name: "Back Loop Single Crochet",
        shortCode: "BLO-SC",
        symbol: "×ᵇ",
        category: "Variant",
        description: "Single crochet in the back loop only",
        instruction: "back loop only single crochet",
        instructionPlural: "back loop only single crochets",
        complexity: "atomic"
    },
    {
        id: "flo-sc",
        name: "Front Loop Single Crochet",
        shortCode: "FLO-SC",
        symbol: "×ᶠ",
        category: "Variant",
        description: "Single crochet in the front loop only",
        instruction: "front loop only single crochet",
        instructionPlural: "front loop only single crochets",
        complexity: "atomic"
    },
    {
        id: "fpdc",
        name: "Front Post Double Crochet",
        shortCode: "FPDC",
        symbol: "∥ᶠ",
        category: "Variant",
        description: "Double crochet around the front post",
        instruction: "front post double crochet",
        instructionPlural: "front post double crochets",
        complexity: "atomic"
    },
    {
        id: "bpdc",
        name: "Back Post Double Crochet",
        shortCode: "BPDC",
        symbol: "∥ᵇ",
        category: "Variant",
        description: "Double crochet around the back post",
        instruction: "back post double crochet",
        instructionPlural: "back post double crochets",
        complexity: "atomic"
    },

    // Complex Stitches
    {
        id: "puff",
        name: "Puff Stitch",
        shortCode: "PUFF",
        symbol: "☁",
        category: "Complex",
        description: "Puff stitch",
        instruction: "puff stitch",
        instructionPlural: "puff stitches",
        complexity: "complex"
    },
    {
        id: "bobble",
        name: "Bobble Stitch",
        shortCode: "BOBL",
        symbol: "◍",
        category: "Complex",
        description: "Bobble stitch",
        instruction: "bobble stitch",
        instructionPlural: "bobble stitches",
        complexity: "complex"
    },
    {
        id: "shell",
        name: "Shell Stitch",
        shortCode: "SH",
        symbol: "㎿",
        category: "Complex",
        description: "Shell stitch",
        instruction: "shell stitch",
        instructionPlural: "shell stitches",
        complexity: "complex"
    }
];
