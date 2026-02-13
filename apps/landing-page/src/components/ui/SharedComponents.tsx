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
    xs: 14,
    sm: 16,
    md: 24, // Modified to 24px per user instruction
    lg: 24,
    xl: 32,
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
const ZAP_ICON_PATH = ["M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z M13 7l-5 6h3v4l5-6h-3V7z"];
const LAYOUT_ICON_PATH = ["M21 5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5zM5 19V5h7v14H5zm14 0h-5v-6h5v6zm0-8h-5V5h5v6z"];
const SETTINGS_ICON_PATH = ["M12 15c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm11.105-2.89l-2.028-.337A8.014 8.014 0 0 0 21 11.001l-.012-.772 2.039-.339c.394-.065.65-.436.574-.823l-.64-3.275c-.078-.4-.46-.641-.855-.575l-2.008.334a7.926 7.926 0 0 0-1.22-1.218l.334-2.009c.066-.394-.175-.777-.575-.855l-3.274-.64a.81.81 0 0 0-.823.574l-.339 2.039a8.04 8.04 0 0 0-.771-.012l-.772.012-.339-2.039a.81.81 0 0 0-.823-.574l-3.274.64c-.395.066-.65.437-.575.855l.334 2.009c-.435.367-.843.775-1.22 1.218l-2.008-.334a.812.812 0 0 0-.855.575l-.64 3.275c-.076.387.18.758.574.823l2.039.339A8.04 8.04 0 0 0 3 11.001l.012.772-2.039.339c-.394.065-.65.436-.574.823l.64 3.275c.078.4.46.641.855.575l2.008-.334c.367.435.775.843 1.218 1.218l-.334 2.009c-.066.394.175.777.575.855l3.274.64c.395-.066.65-.437.823-.574l.339-2.039c.254.008.511.012.771.012l.772-.012.339 2.039c.066.394.437.65.823.574l3.274-.64c.395-.066.65-.437.575-.855l-.334-2.009a7.926 7.926 0 0 0 1.22-1.218l2.008.334c.395.066.777-.175.855-.575l.64-3.275a.812.812 0 0 0-.574-.823z"];
const USERS_ICON_PATH = ["M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z M16.5 13h-9a.5.5 0 0 0-.5.5V14c0 1.654 1.346 3 3 3h3c1.654 0 3-1.346 3-3v-.5a.5.5 0 0 0-.5-.5z M12 12c1.378 0 2.5-1.122 2.5-2.5S13.378 7 12 7s-2.5 1.122-2.5 2.5S10.622 12 12 12z"];

const CHECK_ICON_PATH = ["M9 15.59 4.71 11.3 3.3 12.71l5 5c.2.2.45.29.71.29s.51-.1.71-.29l11-11-1.41-1.41L9.02 15.59Z"];
const DOWNLOAD_ICON_PATH = ["m12 16 4-5h-3V4h-2v7H8z", "M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"];
const PALETTE_ICON_PATH = ["M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 16v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5v-2h2v-2H5V9h2V7H5V5h2v2h2V5h2v2h2V5h2v2h2V5h2v14z", "M7 9h2v2H7zM9 7h2v2H9zM11 9h2v2h-2zM13 7h2v2h-2zM17 7h2v2h-2zM15 9h2v2h-2zM7 13h2v2H7zM9 11h2v2H9zM11 13h2v2h-2zM13 11h2v2h-2zM17 11h2v2h-2zM15 13h2v2h-2zM9 15h2v2H9zM13 15h2v2h-2zM17 15h2v2h-2z"];

const CHECK_CIRCLE_ICON_PATH = ["M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"];
const SPARKLES_ICON_PATH = ["m6.516 14.323-1.49 6.452a.998.998 0 0 0 1.529 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082a1 1 0 0 0-.59-1.74l-5.701-.454-2.467-5.461a.998.998 0 0 0-1.822 0L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.214 4.107zm2.224-3.332 5.05-.401.763-4.107 1.63 3.608 3.766.3.3.003-2.997 2.698 1.121 3.92-3.417-2.279h-.003l-3.57 2.381 1.124-3.922L6.87 11.29l1.87-.299z"];

const ARROW_RIGHT_ICON_PATH = ["m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"];
const PLAY_ICON_PATH = ["M7 6v12l10-6z"];
const MENU_ICON_PATH = ["M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"];
const X_ICON_PATH = ["m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414 4.242 4.242-4.242 4.242 1.414 1.414 4.242-4.242 4.242 4.242 1.414-1.414-4.242-4.242 4.242-4.242z"];

const FACEBOOK_ICON_PATH = ["M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"];
const TWITTER_ICON_PATH = ["M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.534.299 1.15.475 1.802.495a4.029 4.029 0 0 1-1.795-5.374 11.5 11.5 0 0 0 8.29 4.202 4.023 4.023 0 0 1-1.077-2.793 4.024 4.024 0 0 1 6.368-2.618 7.923 7.923 0 0 0 2.56-1.026 4.02 4.02 0 0 1-1.785 2.274 7.935 7.935 0 0 0 2.372-.65 8.072 8.072 0 0 1-1.996 2.083z"];
const INSTAGRAM_ICON_PATH = ["M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z", "M16.87 5.856a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5z", "M20.942 12.8c0-4.509.006-4.992-.124-6.012-.132-1.018-.432-1.716-.913-2.196-.481-.481-1.18-.781-2.197-.912-1.022-.132-1.503-.125-6.012-.125-4.507 0-4.991-.007-6.009.124-.969.122-1.637.408-2.106.878-.469.469-.756 1.137-.878 2.106-.131 1.018-.124 1.502-.124 6.012 0 4.51-.007 4.991.124 6.009.122.969.409 1.637.878 2.106.469.469 1.137.756 2.106.878 1.018.131 1.502.124 6.012.124 4.508 0 4.992.007 6.012-.124 1.017-.132 1.716-.432 2.196-.913.481-.481.781-1.18.913-2.196.13-1.02.124-1.504.124-6.012zm-3.155 4.88c-.147 1.131-.624 1.701-1.298 2.378-.674.674-1.246 1.15-2.378 1.298-1.545.2-4.145.2-4.145.2s-2.6 0-4.145-.2c-1.132-.147-1.702-.624-2.378-1.298-.675-.674-1.15-1.246-1.298-2.378-.2-1.545-.2-4.145-.2-4.145s0-2.6.2-4.145c.147-1.132.624-1.702 1.298-2.378.674-.675 1.246-1.15 2.378-1.298 1.545-.2 4.145-.2 4.145-.2s2.6 0 4.145.2c1.131.147 1.701.624 2.378 1.298.675.674 1.15 1.246 1.298 2.378.2 1.545.2 4.145.2 4.145s0 2.6-.2 4.145z"];
const YOUTUBE_ICON_PATH = ["M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778c-.413 1.566-.417 4.814-.417 4.814s-.004 3.264.406 4.814c.23.857.905 1.534 1.763 1.765 1.582.43 7.83.437 7.83.437s6.265.007 7.831-.403a2.515 2.515 0 0 0 1.762-1.766c.413-1.566.417-4.814.417-4.814s.004-3.264-.406-4.814zM10.354 15.474V8.526L15.86 12l-5.506 3.474z"];
const TIKTOK_ICON_PATH = ["M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"];
const STORE_ICON_PATH = ["M19.148 2.971A2.008 2.008 0 0 0 17.434 2H6.566c-.698 0-1.355.372-1.714.971L2.143 7.485A.995.995 0 0 0 2 8a3.97 3.97 0 0 0 1 2.618V19c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-8.382A3.97 3.97 0 0 0 22 8a.995.995 0 0 0-.143-.515l-2.709-4.514zm.836 5.28A2.003 2.003 0 0 1 18 10c-1.103 0-2-.897-2-2 0-.068-.025-.128-.039-.192l.02-.004L15.22 4h2.214l2.55 4.251zM10.819 4h2.361l.813 4.065C13.958 9.137 13.08 10 12 10s-1.958-.863-1.993-1.935L10.819 4zM6.566 4H8.78l-.76 3.804.02.004C8.025 7.872 8 7.932 8 8c0 1.103-.897 2-2 2a2.003 2.003 0 0 1-1.984-1.749L6.566 4zM10 19v-3h4v3h-4zm6 0v-3c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v3H5v-7.142c.321.083.652.142 1 .142a3.99 3.99 0 0 0 3-1.357c.733.832 1.807 1.357 3 1.357s2.267-.525 3-1.357A3.99 3.99 0 0 0 18 12c.348 0 .679-.059 1-.142V19h-3z"];
const PANEL_LEFT_ICON_PATH = ["M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h6v12H4zm8 0V7h8V5l.002 14H12z M6 10h2v2H6zm0 4h2v2H6z"];
const GRIP_VERTICAL_ICON_PATH = ["M7 10h4v4H7zm0-6h4v4H7zm0 12h4v4H7zm6-6h4v4h-4zm0-6h4v4h-4zm0 12h4v4h-4z"];
const MORE_HORIZONTAL_ICON_PATH = ["M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"];
const DOT_ICON_PATH = ["M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2z"];

// --- ICON MAP ---
const ICON_MAP: Record<string, IconDef> = {
    'zap': { paths: ZAP_ICON_PATH },
    'layout': { paths: LAYOUT_ICON_PATH },
    'settings': { paths: SETTINGS_ICON_PATH },
    'users': { paths: USERS_ICON_PATH },
    'check': { paths: CHECK_ICON_PATH },
    'download': { paths: DOWNLOAD_ICON_PATH },
    'palette': { paths: PALETTE_ICON_PATH },
    'check-circle': { paths: CHECK_CIRCLE_ICON_PATH },
    'sparkles': { paths: SPARKLES_ICON_PATH },
    'arrow-right': { paths: ARROW_RIGHT_ICON_PATH },
    'play': { paths: PLAY_ICON_PATH },
    'menu': { paths: MENU_ICON_PATH },
    'x': { paths: X_ICON_PATH },
    'facebook': { paths: FACEBOOK_ICON_PATH },
    'twitter': { paths: TWITTER_ICON_PATH },
    'instagram': { paths: INSTAGRAM_ICON_PATH },
    'youtube': { paths: YOUTUBE_ICON_PATH },
    'tiktok': { paths: TIKTOK_ICON_PATH },
    'store': { paths: STORE_ICON_PATH },
    'panel-left': { paths: PANEL_LEFT_ICON_PATH },
    'grip-vertical': { paths: GRIP_VERTICAL_ICON_PATH },
    'more-horizontal': { paths: MORE_HORIZONTAL_ICON_PATH },
    'dot': { paths: DOT_ICON_PATH },
};

export const Icon: React.FC<IconProps> = ({
    name,
    size,
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
