
export type PatternType = 'pixel' | 'c2c' | 'granny' | 'stripes';

export interface YarnColor {
  id: string;
  brand: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
  skeinLength?: number; // Length in yards
  yarnWeight?: string; // e.g. 'DK', 'Worsted'
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
  palette: string[]; // Array of yarnColor IDs used in the grid
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
  rounds: string[]; // Array of yarnColor IDs
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
  yarnPalette: YarnColor[];
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
  | { type: 'SET_PALETTE'; payload: YarnColor[] }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type ExportType = 'pattern-pack' | 'chart-only';

export interface BrandingOptions {
  designerName?: string;
  website?: string;
  copyrightLine?: string;
}

export type SymbolMode = 'color-index' | 'stitch-symbol';

export interface ChartVisualOptions {
  showCellSymbols?: boolean;      // default: true for charts
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
