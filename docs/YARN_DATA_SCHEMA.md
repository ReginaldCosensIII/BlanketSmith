# Yarn Data Schema

This document outlines the structure for the Yarn Library data in BlanketSmith.

## File Structure
*   **Path**: `apps/tool/src/data/yarnLibrary/brands.ts`
*   **Exports**: `LIBRARY_BRANDS`, `LIBRARY_COLORS`

## 1. Yarn Brand (`YarnBrand`)
Defines the metadata for a yarn line or collection.

```typescript
interface YarnBrand {
  id: string;       // Unique kebab-case ID (e.g., 'red-heart-super-saver')
  name: string;     // Display Name
  website?: string; // Optional URL string (e.g., 'yarnspirations.com')
  isCustom?: boolean; // True only for 'BlanketSmith Essentials'
}
```

## 2. Library Color (`LibraryColor`)
Defines a specific colorway within a brand. This is a read-only definition.

```typescript
interface LibraryColor {
  id: string; // Formatting Convention: "{brandId}-{code}" (e.g., 'rhss-0319')
  brandId: string; // Must match a defined YarnBrand ID
  code: string; // Manufacturer color code (e.g., '0319')
  name: string; // Color name (e.g., 'Cherry Red')
  hex: string; // Hex code (e.g., '#C51D34')
  productCode?: string; // Optional UPC/SKU
  matchConfidence?: 'exact' | 'high' | 'approx'; // Optional metadata for color matching
}
```

## How to Add a New Brand
1.  Open `apps/tool/src/data/yarnLibrary/brands.ts`.
2.  Add a new entry to the `LIBRARY_BRANDS` array.
3.  Add the corresponding colors to the `LIBRARY_COLORS` array:
    *   Ensure `brandId` matches the new brand ID.
    *   Ensure `id` is unique (prefix with brand shorthand).
    *   Ensure `code` matches the manufacturer's code.

## JSON Data Source
The current dataset includes top brands (Red Heart, Stylecraft, Lion Brand, Paintbox, etc.). When importing new data, convert it to the TypeScript format above.
