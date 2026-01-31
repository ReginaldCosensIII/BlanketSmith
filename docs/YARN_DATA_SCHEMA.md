# Yarn Data Schema & Contribution Guide

This document describes the data structure used for the Yarn Library in BlanketSmith (`apps/tool/src/data/yarnLibrary`).

## File Structure

*   **`brands.ts`**: The central registry for all yarn data. Contains both the `Brand` definitions and the `Colors` list.
*   **`index.ts`**: Helper functions to query the library (`getLibraryBrands`, `getLibraryColorsByBrand`, etc.).

## Data Models

### 1. Yarn Brand (`YarnBrand`)

Represents a specific yarn product line (e.g., "Stylecraft Special DK").

```typescript
interface YarnBrand {
  id: string;        // Unique slug (e.g., 'stylecraft-special-dk')
  name: string;      // Display name (e.g., 'Stylecraft Special DK')
  website?: string;  // Manufacturer URL (optional)
  isCustom?: boolean; // True for the special "Custom" placeholder brand
}
```

### 2. Library Color (`LibraryColor`)

Represents a specific colorway within a brand.

```typescript
interface LibraryColor {
  id: string;        // Unique ID (e.g., 'stylecraft-1001')
  brandId: string;   // Must match a YarnBrand.id
  code: string;      // Manufacturer's color code (e.g., '1001')
  name: string;      // Color Name (e.g., 'White')
  hex: string;       // Hex Code (e.g., '#FFFFFF') - Used for UI
  rgb?: [r, g, b];   // Optional pre-calculated RGB array (0-255).
                     // If omitted, the app calculates it from Hex at runtime.
                     // RECOMMENDED: Include this for performance and stability.
  productCode?: string; // UPC or SKU (optional)
  matchConfidence?: 'exact' | 'high' | 'approx'; // visual match quality
}

### 3. Pattern Color (Runtime State)

Represents a color currently added to the user's project palette.

```typescript
interface PatternColor {
  id: string;        // Unique instance ID (or yarn ID)
  // ... copies of LibraryColor fields (name, hex, brand, etc.)
  
  hidden?: boolean;  // [Soft Delete] If true, color is preserved for rendering used pixels 
                     // but is hidden from the Palette UI. 
                     // This ensures accidental deletions do not destroy canvas work.
}
```
```

## Adding a New Brand

1.  **Define the Brand**: Add a new entry to the `BRANDS` array in `brands.ts`.
2.  **Add Colors**:
    - Use a script or JSON payload to clear valid Hex codes.
    - calculate RGB values for best performance.
    - Append the colors to the `LIBRARY_COLORS` array in `brands.ts` (or the specific variable if split).
3.  **Use Unique IDs**: Ensure `id` is globally unique (prefix with brand slug).

## Example Entry

```typescript
// Brand
{ id: 'my-yarn-brand', name: 'My Yarn Brand' }

// Color
{ 
  id: 'my-yarn-001', 
  brandId: 'my-yarn-brand', 
  code: '001', 
  name: 'Ruby', 
  hex: '#E0115F',
  rgb: [224, 17, 95] 
}
```

## Maintenance Types
The TypeScript interfaces are defined in `apps/tool/src/types.ts`.
