
export type PatternType = 'pixel' | 'c2c' | 'granny' | 'stripes';

// [GEN-002] Refactored: PatternColor (formerly YarnColor) represents a specific color entry IN A PATTERN.
export interface PatternColor {
  id: string;
  brand: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
  skeinLength?: number; // Length in yards
  yarnWeight?: string; // e.g. 'DK', 'Worsted'
  // [GEN-002] Future-proofing: Link back to library ID if applicable
  libraryColorId?: string;
}

// [GEN-002] Library Data Interfaces
export interface YarnBrand {
  id: string;
  name: string;
  website?: string;
  isCustom?: boolean;
}

export interface YarnColor {
  id: string; // The unique Library ID
  brandId: string;
  code: string; // Manufacturer code
  name: string;
  hex: string;
  productCode?: string; // UPC or SKU for shopping list
  matchConfidence?: 'exact' | 'high' | 'approx';
}

export interface CellData {
  colorId: string | null;
  stitchId?: string | null; // Stitch type identifier
}

export interface Symmetry {
  vertical: boolean;
  horizontal: boolean;
}

export interface PixelGridData {
  width: number;
  height: number;
  grid: CellData[];
  palette: string[]; // Array of PatternColor IDs used in the grid
}

export interface C2CData {
  // TODO: Implement C2C data structure
  sourceGridId?: string;
}

export interface StripesData {
  // TODO: Implement Stripes data structure
  rows: { colorId: string, numRows: number }[];
}

export interface GrannySquare {
  id: string;
  x: number;
  y: number;
  rounds: string[]; // Array of PatternColor IDs
}
export interface GrannySquareData {
  // TODO: Implement Granny Square data structure
  width: number;
  height: number;
  squares: GrannySquare[];
}

export interface Project<T> {
  id: string;
  name: string;
  type: PatternType;
  createdAt: string;
  updatedAt: string;
  settings: {
    // e.g., blanket dimensions, hook size, gauge
    stitchesEnabled?: string[]; // Optional list of stitch IDs used in this project
    export?: ExportSettings;
    [key: string]: any;
  };
  data: T;
  yarnPalette: PatternColor[];
  instructionDoc?: InstructionDoc;

  // [GEN-002] Persistent UI State
  activePrimaryColorId?: string;
  activeSecondaryColorId?: string;
}

export type AnyProject = Project<PixelGridData | C2CData | StripesData | GrannySquareData>;

export type ProjectState = {
  project: AnyProject | null;
  history: AnyProject[];
  historyIndex: number;
};

export type ProjectAction =
  | { type: 'LOAD_PROJECT'; payload: AnyProject }
  | { type: 'NEW_PROJECT'; payload: AnyProject }
  | { type: 'UPDATE_PROJECT_DATA'; payload: Partial<PixelGridData | C2CData | StripesData | GrannySquareData> }
  | { type: 'UPDATE_PROJECT_NAME'; payload: string }
  | { type: 'UPDATE_PROJECT_SETTINGS'; payload: Record<string, any> }
  | { type: 'SET_PALETTE'; payload: PatternColor[] }
  | { type: 'UPDATE_INSTRUCTION_DOC'; payload: InstructionDoc }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type ExportType = 'pattern-pack' | 'chart-only';

export interface BrandingOptions {
  designerName?: string;
  website?: string;
  copyrightLine?: string;
}

export type SymbolMode = 'color-index' | 'stitch-symbol' | 'hybrid';

export interface ChartVisualOptions {
  showCellSymbols?: boolean;      // default: true for charts
  showCellBackgrounds?: boolean;  // default: true
  symbolMode?: SymbolMode;        // default: 'color-index'
  grayscaleFriendly?: boolean;    // future; can be ignored in implementation for now
}

export interface ExportSettings {
  defaultExportType?: ExportType;
  branding?: BrandingOptions;
  includeColorChart?: boolean;
  includeStitchChart?: boolean;
  showCellSymbols?: boolean;
  // future: includeRowInstructions?: boolean;
  // future: includeNotesPage?: boolean;
}

export interface ContextMenuItem {
  label: string;
  action: () => void;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
}

export interface InstructionBlock {
  type: 'heading' | 'paragraph' | 'list-ul' | 'list-ol';
  content: string[];
}

export interface InstructionDoc {
  title?: string;
  blocks: InstructionBlock[];
}

export interface ExportOptions {
  exportType?: ExportType;

  // -- Chart-Only Options --
  chartOnlyMode?: 'color' | 'stitch' | 'hybrid'; // Explicit mode for chart-only
  chartMode?: 'color' | 'stitch' | 'hybrid'; // Legacy/Rendering field (passed to renderer)
  forceSinglePage?: boolean;

  // -- Atlas Control (Exp-003) --
  atlasMode?: 'auto' | 'fixed';
  atlasPages?: number; // Target N pages (if fixed)


  // -- Pattern Pack Options --
  includeColorChart?: boolean;
  includeStitchChart?: boolean;
  includeHybridChart?: boolean; // New explicit toggle

  // -- Shared / Legacy --
  includeYarnRequirements?: boolean;
  /** @deprecated Obsolete. Stitch key is now automatically included in the Materials & Stitch Key section by the engine. */
  includeStitchLegend?: boolean;

  // -- Overview Logic --
  /** @deprecated Use overviewMode instead */
  includeOverviewPage?: boolean;
  overviewMode?: 'auto' | 'always' | 'never';

  // -- Instructions (Pattern Pack) --
  includeInstructions?: boolean;
  instructionDoc?: InstructionDoc | null;

  // -- Instructions Placeholders (Legacy/Reserved) --
  instructionsMode?: 'none' | 'engine';
  instructionsText?: string;

  includeCoverPage?: boolean;
  includeRowInstructions?: boolean;
  includeNotesPage?: boolean;
  branding?: BrandingOptions;
  chartVisual?: ChartVisualOptions;
  preview?: boolean;
}
