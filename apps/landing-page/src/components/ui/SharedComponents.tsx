import React, { useEffect, useRef } from 'react';

// ========================================
// SHARED COMPONENTS (Landing Page Version)
// Mirrored from apps/tool/.../SharedComponents.tsx
// ========================================

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'toolbar' | 'menu' | number;

interface IconProps {
    name: string;
    size?: IconSize;
    title?: string;
    className?: string;
    style?: React.CSSProperties;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

interface IconDef {
    paths: string[];
    viewBox?: string;
    transform?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

const ICON_SIZES: Record<string, number> = {
    xs: 16,
    sm: 20,
    md: 25, // Adjusted to 25px (was 26, slightly reducing)
    lg: 28, // Adjusted to 28px (was 32, slightly reducing)
    xl: 38, // Adjusted to 38px (was 44, slightly reducing)
    toolbar: 24,
    menu: 16
};

// ... (Use existing paths, no change needed for paths variables themselves unless user asked, but I will keep the imports/definitions as is and just update the component logic below)
// Actually I need to be careful not to delete the paths. I am replacing the whole file content or just the relevant parts?
// I will use `replace_file_content` to target the `Icon` component definition and `ICON_SIZES` / interfaces.

// I'll stick to a smaller edit if possible, but the `Icon` component needs a rewrite.
// Let's replace from `export type IconSize` down to `export const Icon`.

// Wait, I can't easily replace the middle without touching the paths if I do a huge block.
// I will use multiple ReplaceFileContent calls or one big one if I carefully preserve paths. 
// The paths are in the middle.
// I will update Interfaces and Sizes first.
// Then update the Icon component.

// Step 1: Interfaces and Sizes
// Step 2: Icon Component


// --- PLACEHOLDER ---
const PLACEHOLDER_PATH = ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z", "M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"];

// --- BOXICON PATHS --- 

const GLOBE_ICON_PATH = ["M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m5.66 4.35c-.72.17-1.45.3-2.19.4-.18-.83-.42-1.59-.7-2.25a8.05 8.05 0 0 1 2.89 1.85M12 20c-.31 0-.97-1-1.45-2.94.96-.05 1.93-.05 2.9 0C12.97 19 12.31 20 12 20m-1.81-4.93c-.08-.63-.14-1.32-.17-2.07h3.96c-.03.75-.09 1.44-.17 2.07-1.2-.08-2.42-.08-3.62 0M12 4c.31 0 .97 1 1.45 2.94-.96.05-1.93.05-2.9 0C11.03 5 11.69 4 12 4m0 5c.61 0 1.21-.03 1.81-.06.08.63.14 1.32.17 2.06h-3.96c.03-.75.09-1.43.17-2.06.6.04 1.2.06 1.81.06m-3.98 2H4.07c.13-1.05.47-2.04.97-2.92 1.03.28 2.09.51 3.16.66-.09.74-.15 1.5-.18 2.27Zm0 2c.03.77.09 1.53.18 2.27-1.08.15-2.13.38-3.16.65-.5-.88-.84-1.87-.97-2.93h3.95Zm7.96 0h3.95a8 8 0 0 1-.97 2.93c-1.03-.28-2.09-.5-3.16-.65.09-.74.15-1.51.18-2.27Zm0-2c-.03-.76-.09-1.53-.18-2.27 1.08-.15 2.13-.38 3.16-.66.5.88.83 1.87.97 2.92h-3.95ZM9.24 4.5c-.28.66-.52 1.43-.7 2.25-.74-.1-1.47-.24-2.19-.4.81-.81 1.8-1.44 2.89-1.85M6.35 17.65c.72-.17 1.45-.3 2.19-.4.18.83.42 1.59.7 2.25a8.05 8.05 0 0 1-2.89-1.85m8.42 1.85c.28-.66.52-1.43.7-2.25.74.1 1.47.24 2.19.4-.81.81-1.8 1.44-2.89 1.85"];
const ZAP_ICON_PATH = ["M19 9h-5V3a1 1 0 0 0-.69-.95c-.41-.13-.86.01-1.12.36l-8 11a1 1 0 0 0-.08 1.04A1 1 0 0 0 5 15h5v6a1 1 0 0 0 1 1c.31 0 .62-.15.81-.41l8-11a1 1 0 0 0 .08-1.04A1 1 0 0 0 19 9m-7 8.92V14c0-.55-.45-1-1-1H6.96L12 6.08V10c0 .55.45 1 1 1h4.04z"];
const LAYOUT_ICON_PATH = ["M21 5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5zM5 19V5h7v14H5zm14 0h-5v-6h5v6zm0-8h-5V5h5v6z"];
const SETTINGS_ICON_PATH = ["M12 15c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm11.105-2.89l-2.028-.337A8.014 8.014 0 0 0 21 11.001l-.012-.772 2.039-.339c.394-.065.65-.436.574-.823l-.64-3.275c-.078-.4-.46-.641-.855-.575l-2.008.334a7.926 7.926 0 0 0-1.22-1.218l.334-2.009c.066-.394-.175-.777-.575-.855l-3.274-.64a.81.81 0 0 0-.823.574l-.339 2.039a8.04 8.04 0 0 0-.771-.012l-.772.012-.339-2.039a.81.81 0 0 0-.823-.574l-3.274.64c-.395.066-.65.437-.575.855l.334 2.009c-.435.367-.843.775-1.22 1.218l-2.008-.334a.812.812 0 0 0-.855.575l-.64 3.275c-.076.387.18.758.574.823l2.039.339A8.04 8.04 0 0 0 3 11.001l.012.772-2.039.339c-.394.065-.65.436-.574.823l.64 3.275c.078.4.46.641.855.575l2.008-.334c.367.435.775.843 1.218 1.218l-.334 2.009c-.066.394.175.777.575.855l3.274.64c.395-.066.65-.437.823-.574l.339-2.039c.254.008.511.012.771.012l.772-.012.339 2.039c.066.394.437.65.823.574l3.274-.64c.395-.066.65-.437.575-.855l-.334-2.009a7.926 7.926 0 0 0 1.22-1.218l2.008.334c.395.066.777-.175.855-.575l.64-3.275a.812.812 0 0 0-.574-.823z"];
const USERS_ICON_PATH = ["M12 11c1.71 0 3-1.29 3-3s-1.29-3-3-3-3 1.29-3 3 1.29 3 3 3m0-4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1m1 5h-2c-2.76 0-5 2.24-5 5v.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V17c0-2.76-2.24-5-5-5m-5 5c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3zm-1.5-6c.47 0 .9-.12 1.27-.33a5.03 5.03 0 0 1-.42-4.52C7.09 6.06 6.8 6 6.5 6 5.06 6 4 7.06 4 8.5S5.06 11 6.5 11m-.39 1H5.5C3.57 12 2 13.57 2 15.5v1c0 .28.22.5.5.5H4c0-1.96.81-3.73 2.11-5m11.39-1c1.44 0 2.5-1.06 2.5-2.5S18.94 6 17.5 6c-.31 0-.59.06-.85.15a5.03 5.03 0 0 1-.42 4.52c.37.21.79.33 1.27.33m1 1h-.61A6.97 6.97 0 0 1 20 17h1.5c.28 0 .5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5"];

const CHECK_ICON_PATH = ["M9 15.59 4.71 11.3 3.3 12.71l5 5c.2.2.45.29.71.29s.51-.1.71-.29l11-11-1.41-1.41L9.02 15.59Z"];
const DOWNLOAD_ICON_PATH = ["m12 16 4-5h-3V4h-2v7H8z", "M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"];
const PALETTE_ICON_PATH = ["M13.4 2.1c-3.16-.43-6.24.6-8.47 2.83S1.67 10.25 2.1 13.4c.53 3.89 3.46 7.21 7.29 8.25.86.23 1.74.35 2.62.35h.14c1.03-.02 1.97-.55 2.52-1.43.54-.88.6-1.95.15-2.88l-.2-.42c-.45-.94-.1-1.8.39-2.28s1.34-.84 2.28-.39l.41.2c.93.45 2 .39 2.88-.15a3 3 0 0 0 1.43-2.52c.01-.92-.1-1.85-.35-2.76-1.04-3.83-4.35-6.75-8.25-7.29Zm6.12 10.86c-.3.18-.65.2-.96.05l-.41-.2a3.96 3.96 0 0 0-4.56.78 3.96 3.96 0 0 0-.78 4.56l.2.42c.15.31.13.66-.05.96-.19.3-.49.47-.84.48-.74.02-1.48-.08-2.21-.28-3.06-.83-5.4-3.48-5.83-6.59-.34-2.53.48-5 2.27-6.79a7.96 7.96 0 0 1 5.66-2.34c.37 0 .75.03 1.13.08 3.11.42 5.75 2.76 6.59 5.83.2.73.29 1.47.28 2.21 0 .35-.18.66-.48.84Z", "M7.33 12.76a1 1 0 1 0 0 2 1 1 0 1 0 0-2m.07-3.83a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 1 0 0-2.24m2.81-2.87a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 1 0 0-2.5m4.06.11a1.38 1.38 0 1 0 0 2.76 1.38 1.38 0 1 0 0-2.76"];


const CHECK_CIRCLE_ICON_PATH = ["M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10m0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8", "M10 16c-.26 0-.51-.1-.71-.29l-3-3L7.7 11.3l2.29 2.29 5.29-5.29 1.41 1.41-6 6c-.2.2-.45.29-.71.29Z"];
const IMG_SPARKLES_ICON_PATH = ["m5 17.41 3-3 1.29 1.29c.39.39 1.02.39 1.41 0l5.29-5.29 3 3V14h2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H5zM19 5v5.59L16.71 8.3a.996.996 0 0 0-1.41 0l-5.29 5.29-1.29-1.29a.996.996 0 0 0-1.41 0l-2.29 2.29V5h14Z", "M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3m13.22 11.07-1.94-.86-.86-1.94a.46.46 0 0 0-.42-.28c-.19-.02-.35.1-.43.27l-.86 1.87-1.95.94c-.16.08-.27.25-.26.43 0 .18.11.35.28.42l1.94.86.86 1.94a.471.471 0 0 0 .86 0l.86-1.94 1.94-.86a.471.471 0 0 0 0-.86Z"];

const ARROW_RIGHT_ICON_PATH = ["m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"];
const PLAY_ICON_PATH = ["M7 6v12l10-6z"];
const MENU_ICON_PATH = ["M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"];
const X_ICON_PATH = ["m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414 4.242 4.242-4.242 4.242 1.414 1.414 4.242-4.242 4.242 4.242 1.414-1.414-4.242-4.242 4.242-4.242z"];

const FACEBOOK_ICON_PATH = ["M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22 22 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202z"];
const TWITTER_ICON_PATH = ["M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.04 4.04 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.03 4.03 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.02 4.02 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.46 11.46 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a8 8 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8 8 0 0 0 2.319-.624 8.7 8.7 0 0 1-2.019 2.083"];
const INSTAGRAM_ICON_PATH = [
    "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", // Lens
    "M17.5 6.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1", // Flash point (small circle)
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" // Container
];
const YOUTUBE_ICON_PATH = ["M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778c-.413 1.566-.417 4.814-.417 4.814s-.004 3.264.406 4.814c.23.857.905 1.534 1.763 1.765 1.582.43 7.83.437 7.83.437s6.265.007 7.831-.403a2.515 2.515 0 0 0 1.762-1.766c.413-1.566.417-4.814.417-4.814s.004-3.264-.406-4.814zM10.354 15.474V8.526L15.86 12l-5.506 3.474z"];
const TIKTOK_ICON_PATH = ["M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"];
const STORE_ICON_PATH = ["M19.148 2.971A2.008 2.008 0 0 0 17.434 2H6.566c-.698 0-1.355.372-1.714.971L2.143 7.485A.995 0 0 0 2 8a3.97 3.97 0 0 0 1 2.618V19c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-8.382A3.97 3.97 0 0 0 22 8a.995 0 0 0-.143-.515l-2.709-4.514zm.836 5.28A2.003 2.003 0 0 1 18 10c-1.103 0-2-.897-2-2 0-.068-.025-.128-.039-.192l.02-.004L15.22 4h2.214l2.55 4.251zM10.819 4h2.361l.813 4.065C13.958 9.137 13.08 10 12 10s-1.958-.863-1.993-1.935L10.819 4zM6.566 4H8.78l-.76 3.804.02.004C8.025 7.872 8 7.932 8 8c0 1.103-.897 2-2 2a2.003 2.003 0 0 1-1.984-1.749L6.566 4zM10 19v-3h4v3h-4zm6 0v-3c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H5v-7.142c.321.083.652.142 1 .142a3.99 3.99 0 0 0 3-1.357c.733.832 1.807 1.357 3 1.357s2.267-.525 3-1.357A3.99 3.99 0 0 0 18 12c.348 0 .679-.059 1-.142V19h-3z"];
const PANEL_LEFT_ICON_PATH = ["M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h6v12H4zm8 0V7h8V5l.002 14H12z M6 10h2v2H6zm0 4h2v2H6z"];
const GRIP_VERTICAL_ICON_PATH = ["M7 10h4v4H7zm0-6h4v4H7zm0 12h4v4H7zm6-6h4v4h-4zm0-6h4v4h-4zm0 12h4v4h-4z"];
const MORE_HORIZONTAL_ICON_PATH = ["M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"];
// --- RESTORED / MISSING PATHS ---
const CHEVRON_DOWN_ICON_PATH = ["M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"];
const CHEVRON_RIGHT_ICON_PATH = ["M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"];
const CHEVRON_LEFT_ICON_PATH = ["M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"];
const SEARCH_ICON_PATH = ["M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"];
const DOT_ICON_PATH = ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"];
const DOT_CIRCLE_ICON_PATH = ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"];


// --- PLACEHOLDERS FOR MANUAL ENTRY ---
const HOME_ICON_PATH = ["M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.15-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm9-8.59 6 6V20H6v-9.59z", "m8.59 14.65.06.06L12 18l3.35-3.29c.85-.82.87-2.16.06-3.01l-.06-.06c-.87-.86-2.26-.86-3.12 0l-.22.22-.22-.22c-.87-.86-2.26-.86-3.12 0-.85.82-.87 2.16-.06 3.01Z"];
const ARROW_LEFT_ICON_PATH = PLACEHOLDER_PATH; // TODO: Add 'arrow-left' path
const CHEVRON_UP_ICON_PATH = PLACEHOLDER_PATH; // TODO: Add 'chevron-up' path
const CIRCLE_ICON_PATH = PLACEHOLDER_PATH; // TODO: Add 'circle' path
const SHIELD_ICON_PATH = ["m20.42 6.11-7.97-4c-.28-.14-.62-.14-.9 0l-7.97 4c-.31.15-.51.45-.55.79-.01.11-.96 10.76 8.55 15.01a.98.98 0 0 0 .82 0C21.91 17.66 20.97 7 20.95 6.9a.98.98 0 0 0-.55-.79ZM12 19.9C5.26 16.63 4.94 9.64 5 7.64l7-3.51 7 3.51c.04 1.99-.33 9.02-7 12.26", "m11 12.59-1.29-1.3-1.42 1.42 2.71 2.7 4.71-4.7-1.42-1.42z"];
const LOADER_2_ICON_PATH = PLACEHOLDER_PATH; // TODO: Add 'loader-2' path

// Feedback
const BUG_ICON_PATH = ["m21.55 9.11-1.84.92c-.37-1.63-1.09-3.09-2.07-4.25l2.07-2.07L18.3 2.3l-2.12 2.12c-1.22-.89-2.64-1.41-4.17-1.41s-2.96.52-4.17 1.41L5.72 2.3 4.31 3.71l2.07 2.07c-.98 1.16-1.7 2.62-2.07 4.25l-1.84-.92-.89 1.79 2.46 1.23c0 .12-.02.25-.02.37 0 .51.04 1.01.11 1.5H2.02v2h2.57c.17.5.37.97.6 1.42L3.31 19.3l1.41 1.41 1.58-1.58C7.75 20.9 9.78 22 12.02 22s4.26-1.1 5.72-2.87l1.58 1.58 1.41-1.41-1.88-1.88c.23-.45.43-.92.6-1.42h2.57v-2h-2.11c.07-.49.11-.99.11-1.5 0-.13-.01-.25-.02-.37l2.46-1.23-.89-1.79ZM16.79 8H7.21c1.1-1.82 2.83-3 4.79-3s3.69 1.18 4.79 3M13 19.89V13h-2v6.89c-1.28-.27-2.43-1.05-3.3-2.17s-.06-.07-.06-.07c-1.02-1.34-1.65-3.15-1.65-5.15 0-.88.13-1.72.35-2.5h11.3c.22.78.35 1.62.35 2.5 0 1.99-.63 3.8-1.65 5.15l-.06.06c-.87 1.13-2.02 1.91-3.3 2.18Z"];
const LIGHTBULB_ICON_PATH = ["M9 20h6v2H9zm-.83-4.95c.41.62.62 1.36.72 1.95H8v2h8v-2h-.89c.11-.59.31-1.33.72-1.95.36-.54.76-1.01 1.14-1.46 1-1.18 2.03-2.39 2.03-4.6 0-3.86-3.14-7-7-7s-7 3.14-7 7c0 2.21 1.03 3.42 2.02 4.58.39.45.78.92 1.15 1.47ZM12 4c2.76 0 5 2.24 5 5 0 1.47-.62 2.2-1.55 3.3-.4.47-.85 1-1.28 1.64-.68 1.03-.97 2.23-1.09 3.06h-2.17c-.12-.83-.4-2.03-1.08-3.05-.43-.65-.89-1.19-1.29-1.66C7.61 11.2 7 10.48 7 9c0-2.76 2.24-5 5-5"];
const FEEDBACK_GENERAL_ICON_PATH = ["M4 19h3v2c0 .36.19.69.51.87a1 1 0 0 0 1-.01L13.27 19h6.72c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2M4 5h16v12h-7c-.18 0-.36.05-.51.14L9 19.23V18c0-.55-.45-1-1-1H4z"];

// Contact
const CONTACT_GENERAL_ICON_PATH = FEEDBACK_GENERAL_ICON_PATH;
const CONTACT_SUPPORT_ICON_PATH = ["M11 15h2v2h-2zM9.53 8.03c-.66.66-1.03 1.54-1.03 2.47h2c0-.4.16-.78.44-1.06.57-.57 1.55-.57 2.12 0A1.499 1.499 0 0 1 12 12c-.55 0-1 .45-1 1v1h2v-.14c.55-.16 1.06-.46 1.47-.88.66-.66 1.03-1.54 1.03-2.47s-.36-1.81-1.03-2.47c-1.32-1.32-3.63-1.32-4.95 0Z", "M12 2C6.49 2 2 6.49 2 12c0 2.12.68 4.19 1.93 5.9l-1.75 2.53c-.21.31-.24.7-.06 1.03.17.33.51.54.89.54h9c5.51 0 10-4.49 10-10S17.51 2 12 2m0 18H4.91L6 18.43c.26-.37.23-.88-.06-1.22A7.98 7.98 0 0 1 4.01 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8Z"];
const CONTACT_OTHER_ICON_PATH = ["M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-8.61 10.79c.18.14.4.21.61.21s.43-.07.61-.21l1.55-1.21L18.58 18H5.41l4.42-4.42 1.55 1.21ZM20 6v.51l-8 6.22-8-6.22V6zm0 3.04v7.54l-4.24-4.24zm-11.76 3.3L4 16.58V9.04zM20 18"];

// Partnerships
const PARTNER_CREATOR_ICON_PATH = ["M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2m5.54 3.54c2.02-2.02 2.02-5.06 0-7.07l-1.41 1.41c1.23 1.23 1.23 3.01 0 4.24l1.41 1.41Z", "M21.1 8c0-2.34-.97-4.6-2.74-6.36l-1.41 1.41C18.34 4.44 19.1 6.19 19.1 8s-.76 3.56-2.15 4.95l1.41 1.41C20.12 12.6 21.1 10.34 21.1 8M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3"];
const PARTNER_DESIGNER_ICON_PATH = ["M20 14h-4.34L21 8.66c.78-.78.78-2.05 0-2.83l-2.84-2.84c-.78-.78-2.05-.78-2.83 0L9.99 8.33V3.99c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v14c0 2.21 1.79 4 4 4h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2Zm-3.25-9.59 2.84 2.83-6.75 6.75H7.17l9.59-9.59ZM8 4v6.34L4.04 14.3s-.03.04-.04.06V4zm12 16H6c-1.1 0-2-.9-2-2s.9-2 2-2h14z", "M6 17a1 1 0 1 0 0 2 1 1 0 1 0 0-2"];
const PARTNER_BUSINESS_ICON_PATH = ["M19.1 2.8c-.38-.5-.97-.8-1.6-.8h-11c-.63 0-1.22.3-1.6.8L2.2 6.4c-.13.17-.2.38-.2.6v1c0 1.04.41 1.98 1.06 2.69-.03.1-.06.2-.06.31v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9c0-.11-.03-.21-.06-.31C21.59 9.98 22 9.04 22 8V7c0-.22-.07-.43-.2-.6zm.9 4.53V8c0 1.1-.9 2-2 2s-2-.9-2-2V7q0-.12-.03-.24L15.28 4h2.22zM10.78 4h2.44L14 7.12V8c0 1.1-.9 2-2 2s-2-.9-2-2v-.88zM4 7.33 6.5 4h2.22l-.69 2.76Q8 6.88 8 7v1c0 1.1-.9 2-2 2s-2-.9-2-2zM10 20v-4h4v4zm6 0v-4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4H5v-8.14c.32.08.65.14 1 .14 1.2 0 2.27-.54 3-1.38.73.84 1.8 1.38 3 1.38s2.27-.54 3-1.38c.73.84 1.8 1.38 3 1.38.35 0 .68-.06 1-.14V20z"];

// Beta Signup
const BETA_EXPECTATIONS_ICON_PATH = LIGHTBULB_ICON_PATH;


// About BlanketSmith
const ABOUT_COMMUNITY_ICON_PATH = ["M11.29 20.66c.2.2.45.29.71.29s.51-.1.71-.29l7.5-7.5c2.35-2.35 2.35-6.05 0-8.41-2.3-2.28-5.85-2.35-8.21-.2-2.36-2.15-5.91-2.09-8.21.2-2.35 2.36-2.35 6.06 0 8.41zM5.21 6.16C6 5.38 7 4.99 8.01 4.99s2.01.39 2.79 1.17l.5.5c.39.39 1.02.39 1.41 0l.5-.5c1.56-1.56 4.02-1.56 5.59 0 1.56 1.57 1.56 4.02 0 5.58l-6.79 6.79-6.79-6.79a3.91 3.91 0 0 1 0-5.58Z"];
const ABOUT_CREATIVITY_ICON_PATH = LIGHTBULB_ICON_PATH;
const ABOUT_INCLUSIVE_ICON_PATH = ["M10 13H8c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5m-5 5c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3zm7.73-11.49c-.08-.22-.19-.42-.3-.62v-.01c-.69-1.14-1.93-1.89-3.42-1.89-2.28 0-4 1.72-4 4s1.72 4 4 4c1.49 0 2.73-.74 3.42-1.89v-.01c.12-.2.22-.4.3-.62.02-.06.03-.12.05-.18.06-.17.11-.34.15-.52.05-.25.07-.51.07-.78s-.03-.53-.07-.78c-.03-.18-.09-.35-.15-.52-.02-.06-.03-.12-.05-.18M9 10c-1.18 0-2-.82-2-2s.82-2 2-2 2 .82 2 2-.82 2-2 2m6 0q-.165 0-.33-.03c-.22.66-.56 1.27-.98 1.81.41.13.84.22 1.31.22 2.28 0 4-1.72 4-4s-1.72-4-4-4c-.47 0-.9.09-1.31.22.43.53.76 1.14.98 1.81.11-.01.21-.03.33-.03 1.18 0 2 .82 2 2s-.82 2-2 2m1 3h-1.11c.6.58 1.08 1.27 1.44 2.03C17.83 15.2 19 16.46 19 18h-2v1c0 .35-.07.69-.18 1H20c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5"];

// --- ICON MAP ---
const ICON_MAP: Record<string, IconDef> = {
    'zap': { paths: ZAP_ICON_PATH },
    'globe': { paths: GLOBE_ICON_PATH },
    'layout': { paths: LAYOUT_ICON_PATH },
    'settings': { paths: SETTINGS_ICON_PATH },
    'users': { paths: USERS_ICON_PATH },
    'check': { paths: CHECK_ICON_PATH },
    'download': { paths: DOWNLOAD_ICON_PATH },
    'palette': { paths: PALETTE_ICON_PATH },
    'check-circle': { paths: CHECK_CIRCLE_ICON_PATH },
    'sparkles': { paths: IMG_SPARKLES_ICON_PATH },
    'arrow-right': { paths: ARROW_RIGHT_ICON_PATH },
    'arrow-left': { paths: ARROW_LEFT_ICON_PATH },
    'play': { paths: PLAY_ICON_PATH },
    'menu': { paths: MENU_ICON_PATH },
    'x': { paths: X_ICON_PATH },
    'facebook': { paths: FACEBOOK_ICON_PATH, fill: "none", stroke: "currentColor" },
    'twitter': { paths: TWITTER_ICON_PATH, fill: "none", stroke: "currentColor" },
    'instagram': { paths: INSTAGRAM_ICON_PATH, fill: "none", stroke: "currentColor" },
    'youtube': { paths: YOUTUBE_ICON_PATH, fill: "none", stroke: "currentColor" },
    'tiktok': { paths: TIKTOK_ICON_PATH, fill: "none", stroke: "currentColor" },
    'store': { paths: STORE_ICON_PATH },
    'panel-left': { paths: PANEL_LEFT_ICON_PATH },
    'grip-vertical': { paths: GRIP_VERTICAL_ICON_PATH },
    'more-horizontal': { paths: MORE_HORIZONTAL_ICON_PATH },
    'dot': { paths: DOT_ICON_PATH },
    'home': { paths: HOME_ICON_PATH },
    'chevron-up': { paths: CHEVRON_UP_ICON_PATH },
    'chevron-down': { paths: CHEVRON_DOWN_ICON_PATH },
    'chevron-left': { paths: CHEVRON_LEFT_ICON_PATH },
    'chevron-right': { paths: CHEVRON_RIGHT_ICON_PATH },
    'search': { paths: SEARCH_ICON_PATH },
    'circle': { paths: CIRCLE_ICON_PATH },
    'shield': { paths: SHIELD_ICON_PATH },
    'loader-2': { paths: LOADER_2_ICON_PATH },
    'bug': { paths: BUG_ICON_PATH },
    'lightbulb': { paths: LIGHTBULB_ICON_PATH },
    'feedback-general': { paths: FEEDBACK_GENERAL_ICON_PATH }, // Distinct from generic 'message-square'
    'message-square': { paths: FEEDBACK_GENERAL_ICON_PATH }, // Fallback alias
    'contact-general': { paths: CONTACT_GENERAL_ICON_PATH },
    'contact-support': { paths: CONTACT_SUPPORT_ICON_PATH },
    'contact-other': { paths: CONTACT_OTHER_ICON_PATH },
    'help-circle': { paths: CONTACT_SUPPORT_ICON_PATH }, // Fallback alias
    'mail': { paths: CONTACT_OTHER_ICON_PATH }, // Fallback alias
    'partner-creator': { paths: PARTNER_CREATOR_ICON_PATH },
    'partner-designer': { paths: PARTNER_DESIGNER_ICON_PATH },
    'partner-business': { paths: PARTNER_BUSINESS_ICON_PATH },
    'beta-expectations': { paths: BETA_EXPECTATIONS_ICON_PATH },
    'about-community': { paths: ABOUT_COMMUNITY_ICON_PATH },
    'about-creativity': { paths: ABOUT_CREATIVITY_ICON_PATH },
    'about-inclusive': { paths: ABOUT_INCLUSIVE_ICON_PATH },
};

export const Icon: React.FC<IconProps> = ({
    name,
    size = 'md', // Default size updated to 'md' (28px) per user instruction
    title,
    className = '',
    style = {},
    fill,
    stroke,
    strokeWidth
}) => {
    let iconDef = ICON_MAP[name];

    if (!iconDef) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`Icon "${name}" not found in ICON_MAP. Using placeholder.`);
        }
        iconDef = { paths: PLACEHOLDER_PATH };
    }

    let pxSize = '1em';
    if (size !== undefined) {
        if (typeof size === 'number') {
            pxSize = `${size}px`;
        } else if (typeof size === 'string' && ICON_SIZES[size]) {
            pxSize = `${ICON_SIZES[size]}px`;
        }
    }

    const a11yProps = title ? { 'aria-label': title, role: 'img' } : { 'aria-hidden': true };

    const mergedStyle: React.CSSProperties = {
        width: pxSize,
        height: pxSize,
        flexShrink: 0,
        ...style,
    };

    const viewBox = iconDef.viewBox || "0 0 24 24";
    const transform = iconDef.transform || undefined;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={mergedStyle}
            fill={fill || iconDef.fill || "currentColor"}
            viewBox={viewBox}
            stroke={stroke || iconDef.stroke || "none"}
            strokeWidth={strokeWidth || iconDef.strokeWidth || 1.5}
            {...a11yProps}
        >
            {title && <title>{title}</title>}
            <g transform={transform} transform-origin="center">
                {iconDef.paths.map((d, index) => (
                    <path key={index} d={d} />
                ))}
            </g>
        </svg>
    );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'link', size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon', asChild?: boolean }> = ({ children, className, variant = 'primary', size = 'md', asChild = false, ...props }) => {
    // This is a simplified version of the Button component for the landing page
    // In a real implementation, we might want to merge this with the Shadcn UI button or replace it
    // For now, mirroring the structure

    // NOTE: Landing page uses Shadcn UI Button component usually. 
    // This component is provided for compatibility if needed, but we should prefer the existing UI components
    // stored in components/ui/button.tsx for the landing page to ensure consistency.

    // However, since the task asks to MIRROR apps/tool/src/components/ui/SharedComponents.tsx,
    // we provide the implementation here. If the landing page already has a Button component, 
    // imports should be adjusting carefully.

    return (
        <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>
            {children}
        </button>
    );
};
