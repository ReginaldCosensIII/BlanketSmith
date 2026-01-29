import { YarnBrand, YarnColor } from '../../types';
import { STYLECRAFT_COLORS } from './stylecraft';

export const LIBRARY_BRANDS: YarnBrand[] = [
    { id: 'brand_bs_essentials', name: 'BlanketSmith Essentials', isCustom: false },
    { id: 'stylecraft-special-dk', name: 'Stylecraft Special DK', website: 'https://www.stylecraft-yarns.co.uk' },
    { id: 'red-heart-super-saver', name: 'Red Heart Super Saver', website: 'https://www.yarnspirations.com/red-heart' },
    { id: 'lion-brand-vannas-choice', name: "Lion Brand Vanna's Choice", website: 'https://www.lionbrand.com' },
    { id: 'bernat-blanket', name: 'Bernat Blanket', website: 'https://www.yarnspirations.com/bernat' },
];

export const LIBRARY_COLORS: YarnColor[] = [
    // --- BlanketSmith Essentials (16 Standard Colors) ---
    { id: 'bs-white', brandId: 'brand_bs_essentials', code: 'BS-001', name: 'White', hex: '#FFFFFF', matchConfidence: 'exact' },
    { id: 'bs-black', brandId: 'brand_bs_essentials', code: 'BS-002', name: 'Black', hex: '#000000', matchConfidence: 'exact' },
    { id: 'bs-grey', brandId: 'brand_bs_essentials', code: 'BS-003', name: 'Grey', hex: '#808080', matchConfidence: 'exact' },
    { id: 'bs-light-grey', brandId: 'brand_bs_essentials', code: 'BS-004', name: 'Light Grey', hex: '#D3D3D3', matchConfidence: 'exact' },
    { id: 'bs-red', brandId: 'brand_bs_essentials', code: 'BS-005', name: 'Red', hex: '#FF0000', matchConfidence: 'exact' },
    { id: 'bs-blue', brandId: 'brand_bs_essentials', code: 'BS-006', name: 'Blue', hex: '#0000FF', matchConfidence: 'exact' },
    { id: 'bs-green', brandId: 'brand_bs_essentials', code: 'BS-007', name: 'Green', hex: '#008000', matchConfidence: 'exact' },
    { id: 'bs-yellow', brandId: 'brand_bs_essentials', code: 'BS-008', name: 'Yellow', hex: '#FFFF00', matchConfidence: 'exact' },
    { id: 'bs-orange', brandId: 'brand_bs_essentials', code: 'BS-009', name: 'Orange', hex: '#FFA500', matchConfidence: 'exact' },
    { id: 'bs-purple', brandId: 'brand_bs_essentials', code: 'BS-010', name: 'Purple', hex: '#800080', matchConfidence: 'exact' },
    { id: 'bs-pink', brandId: 'brand_bs_essentials', code: 'BS-011', name: 'Pink', hex: '#FFC0CB', matchConfidence: 'exact' },
    { id: 'bs-brown', brandId: 'brand_bs_essentials', code: 'BS-012', name: 'Brown', hex: '#A52A2A', matchConfidence: 'exact' },
    { id: 'bs-beige', brandId: 'brand_bs_essentials', code: 'BS-013', name: 'Beige', hex: '#F5F5DC', matchConfidence: 'exact' },
    { id: 'bs-teal', brandId: 'brand_bs_essentials', code: 'BS-014', name: 'Teal', hex: '#008080', matchConfidence: 'exact' },
    { id: 'bs-navy', brandId: 'brand_bs_essentials', code: 'BS-015', name: 'Navy', hex: '#000080', matchConfidence: 'exact' },
    { id: 'bs-maroon', brandId: 'brand_bs_essentials', code: 'BS-016', name: 'Maroon', hex: '#800000', matchConfidence: 'exact' },

    // --- Stylecraft Special DK ---
    ...STYLECRAFT_COLORS,

    // --- Red Heart Super Saver (10 Seed Colors) ---
    { id: 'rhss-cherry-red', brandId: 'red-heart-super-saver', code: '0319', name: 'Cherry Red', hex: '#D21020', matchConfidence: 'approx' },
    { id: 'rhss-white', brandId: 'red-heart-super-saver', code: '0311', name: 'White', hex: '#FDFDFD', matchConfidence: 'approx' },
    { id: 'rhss-black', brandId: 'red-heart-super-saver', code: '0312', name: 'Black', hex: '#1C1C1C', matchConfidence: 'approx' },
    { id: 'rhss-royal', brandId: 'red-heart-super-saver', code: '0385', name: 'Royal', hex: '#0047AB', matchConfidence: 'approx' },
    { id: 'rhss-paddy-green', brandId: 'red-heart-super-saver', code: '0368', name: 'Paddy Green', hex: '#00703C', matchConfidence: 'approx' },
    { id: 'rhss-bright-yellow', brandId: 'red-heart-super-saver', code: '0324', name: 'Bright Yellow', hex: '#FFD700', matchConfidence: 'approx' },
    { id: 'rhss-pumpkin', brandId: 'red-heart-super-saver', code: '0254', name: 'Pumpkin', hex: '#FF7518', matchConfidence: 'approx' },
    { id: 'rhss-medium-purple', brandId: 'red-heart-super-saver', code: '0356', name: 'Amethyst', hex: '#774797', matchConfidence: 'approx' },
    { id: 'rhss-perfect-pink', brandId: 'red-heart-super-saver', code: '0709', name: 'Perfect Pink', hex: '#E65C9C', matchConfidence: 'approx' },
    { id: 'rhss-cafe-latte', brandId: 'red-heart-super-saver', code: '0360', name: 'Cafe Latte', hex: '#C49F81', matchConfidence: 'approx' },

    // --- Lion Brand Vanna's Choice (10 Seed Colors) ---
    { id: 'lbvc-scarlet', brandId: 'lion-brand-vannas-choice', code: '113', name: 'Scarlet', hex: '#C21E2F', matchConfidence: 'approx' },
    { id: 'lbvc-white', brandId: 'lion-brand-vannas-choice', code: '100', name: 'White', hex: '#FFFFFA', matchConfidence: 'approx' },
    { id: 'lbvc-black', brandId: 'lion-brand-vannas-choice', code: '153', name: 'Black', hex: '#111111', matchConfidence: 'approx' },
    { id: 'lbvc-sapphire', brandId: 'lion-brand-vannas-choice', code: '109', name: 'Sapphire', hex: '#1E3F78', matchConfidence: 'approx' },
    { id: 'lbvc-kelly-green', brandId: 'lion-brand-vannas-choice', code: '172', name: 'Kelly Green', hex: '#007A3E', matchConfidence: 'approx' },
    { id: 'lbvc-mustard', brandId: 'lion-brand-vannas-choice', code: '158', name: 'Mustard', hex: '#EAA92E', matchConfidence: 'approx' },
    { id: 'lbvc-terracotta', brandId: 'lion-brand-vannas-choice', code: '134', name: 'Terracotta', hex: '#B55A37', matchConfidence: 'approx' },
    { id: 'lbvc-eggplant', brandId: 'lion-brand-vannas-choice', code: '146', name: 'Purple', hex: '#583268', matchConfidence: 'approx' },
    { id: 'lbvc-pink', brandId: 'lion-brand-vannas-choice', code: '101', name: 'Pink', hex: '#ED8CA2', matchConfidence: 'approx' },
    { id: 'lbvc-chocolate', brandId: 'lion-brand-vannas-choice', code: '126', name: 'Chocolate', hex: '#54362A', matchConfidence: 'approx' },

    // --- Bernat Blanket (10 Seed Colors) ---
    { id: 'bb-vintage-white', brandId: 'bernat-blanket', code: '10006', name: 'Vintage White', hex: '#F0EAD6', matchConfidence: 'approx' },
    { id: 'bb-coal', brandId: 'bernat-blanket', code: '10040', name: 'Coal', hex: '#2B2B2B', matchConfidence: 'approx' },
    { id: 'bb-crimson', brandId: 'bernat-blanket', code: '10802', name: 'Crimson', hex: '#A31F34', matchConfidence: 'approx' },
    { id: 'bb-navy', brandId: 'bernat-blanket', code: '10044', name: 'Navy', hex: '#18243C', matchConfidence: 'approx' },
    { id: 'bb-sonoma', brandId: 'bernat-blanket', code: '10015', name: 'Sonoma', hex: '#6D8267', matchConfidence: 'approx' }, // Sage green type
    { id: 'bb-sunsoaked', brandId: 'bernat-blanket', code: '10800', name: 'Sunsoaked', hex: '#F8D568', matchConfidence: 'approx' },
    { id: 'bb-pumpkin', brandId: 'bernat-blanket', code: '10630', name: 'Pumpkin', hex: '#D66828', matchConfidence: 'approx' },
    { id: 'bb-plum', brandId: 'bernat-blanket', code: '10046', name: 'Plum Chutney', hex: '#442C3E', matchConfidence: 'approx' },
    { id: 'bb-pow-pink', brandId: 'bernat-blanket', code: '10801', name: 'Pow Pink', hex: '#D67EA2', matchConfidence: 'approx' },
    { id: 'bb-taupe', brandId: 'bernat-blanket', code: '10029', name: 'Taupe', hex: '#877B73', matchConfidence: 'approx' },
];
