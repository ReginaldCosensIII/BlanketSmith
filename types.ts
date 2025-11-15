
export type PatternType = 'pixel' | 'c2c' | 'granny' | 'stripes';

export interface YarnColor {
  id: string;
  brand: string;
  name: string;
  hex: string;
  rgb: [number, number, number];
}

export interface PixelGridData {
  width: number;
  height: number;
  grid: (string | null)[]; // Array of yarnColor IDs or null for empty
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
  | { type: 'SET_PALETTE'; payload: YarnColor[] }
  | { type: 'UNDO' }
  | { type: 'REDO' };
