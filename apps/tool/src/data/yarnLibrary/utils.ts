import { YarnBrand, LibraryColor } from '../../types';
import { LIBRARY_BRANDS, LIBRARY_COLORS } from './brands';

/**
 * Returns all available yarn brands in the library.
 */
export const getLibraryBrands = (): YarnBrand[] => {
    return LIBRARY_BRANDS;
};

/**
 * Returns all colors for a specific brand ID.
 */
export const getLibraryColorsByBrand = (brandId: string): LibraryColor[] => {
    return LIBRARY_COLORS.filter(c => c.brandId === brandId);
};

/**
 * Returns a specific color by its Library ID.
 */
export const getLibraryColorById = (colorId: string): LibraryColor | undefined => {
    return LIBRARY_COLORS.find(c => c.id === colorId);
};
