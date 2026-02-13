import React, { useEffect, useRef } from 'react';
import { ContextMenuItem } from '../../types';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'toolbar' | 'menu' | number;

interface IconProps {
  name: string;
  size?: IconSize;
  title?: string;
  className?: string; // Legacy support, though inline styles are preferred for strict sizing
  style?: React.CSSProperties;
}

/**
 * Icon Definition for the new pure SVG system.
 */
interface IconDef {
  /** Array of path strings. Useful for multi-color or complex icons that need multiple <path> elements. */
  paths: string[];
  /** 
   * SVG viewBox attribute. Defaults to "0 0 24 24" if not specified. 
   * Important: Ensure your path data matches this coordinate system.
   */
  viewBox?: string;
  /** 
   * SVG transform attribute. Useful for rotating or shifting icons.
   * Example: "rotate(45 12 12)" to rotate 45 degrees around the center (12,12).
   */
  transform?: string;
  /** Default fill color. Defaults to "currentColor" (inherits from text color) */
  fill?: string;
  /**
   * Stroke color. Defaults to "none". 
   * Useful for linear icons like 'stripes' that rely on stroke rather than fill.
   */
  stroke?: string;
  /** Stroke width. Defaults to 1.5 if stroke is set. */
  strokeWidth?: number;
}

const ICON_SIZES: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  toolbar: 24,
  menu: 16
};

// --- PLACEHOLDER ---
// A simple generic icon (circle with a dot) to represent missing icons during migration.
const PLACEHOLDER_PATH = ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z", "M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"];

const ZAP_ICON_PATH = ["M16.41 10.41a.998.998 0 0 0 0-1.82l-4.15-1.84-1.84-4.15a.99.99 0 0 0-.91-.59c-.4-.03-.75.22-.92.58L6.74 6.6 2.56 8.61c-.35.17-.57.53-.57.92s.24.74.59.9l4.15 1.84 1.84 4.15a.998.998 0 0 0 1.82 0l1.84-4.15 4.15-1.84Zm-5.82.68L9.5 13.53l-1.09-2.44a.98.98 0 0 0-.51-.51L5.37 9.46l2.55-1.23c.21-.1.38-.27.47-.48l1.08-2.33 1.1 2.48c.1.23.28.41.51.51l2.44 1.09-2.44 1.09c-.23.1-.41.28-.51.51ZM21.6 16.39l-2.77-1.23-1.23-2.77a.68.68 0 0 0-.6-.4c-.27-.02-.5.15-.61.39l-1.23 2.67-2.78 1.34c-.23.11-.38.35-.38.61s.16.49.4.6l2.77 1.23 1.23 2.77a.663.663 0 0 0 1.22 0l1.23-2.77 2.77-1.23c.24-.11.4-.35.4-.61s-.16-.5-.4-.61ZM7.76 18.63l-1.66-.74-.74-1.66a.41.41 0 0 0-.36-.24c-.16-.01-.3.09-.37.23l-.74 1.6-1.67.8c-.14.07-.23.21-.23.37s.1.3.24.36l1.66.74.74 1.66a.404.404 0 0 0 .74 0l.74-1.66 1.66-.74a.404.404 0 0 0 0-.74Z"];

const STRIPE_ICON_PATH = ["M4 6h16M4 10h16M4 14h16M4 18h16"];

const C2C_ICON_PATH = ["M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"];

const GRANNY_ICON_PATH = ["M7 16H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1m-1 4H4v-2h2zm8-4h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1m-1 4h-2v-2h2zm8-4h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1m-1 4h-2v-2h2zM7 9H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1m-1 4H4v-2h2zm8-4h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1m-1 4h-2v-2h2zm8-4h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1m-1 4h-2v-2h2zM7 2H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1M6 6H4V4h2zm8-4h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1m-1 4h-2V4h2zm8-4h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1m-1 4h-2V4h2z"];

const BAN_ICON_PATH = ["m20.29 2.29-3.4 3.4A8 8 0 0 0 11.99 4c-4.41 0-8 3.59-8 8 0 1.85.63 3.54 1.69 4.9l-3.4 3.4 1.41 1.41 3.4-3.4a8 8 0 0 0 4.9 1.69c4.41 0 8-3.59 8-8 0-1.85-.63-3.54-1.69-4.9l3.4-3.4zM6 12c0-3.31 2.69-6 6-6 1.29 0 2.49.42 3.47 1.11l-8.36 8.36C6.41 14.49 6 13.29 6 12m12 0c0 3.31-2.69 6-6 6-1.29 0-2.49-.42-3.47-1.11l8.36-8.36c.7.98 1.11 2.18 1.11 3.47"];

const BRUSH_ICON_PATH = ["M7.061 22c1.523 0 2.84-.543 3.91-1.613 1.123-1.123 1.707-2.854 1.551-4.494l8.564-8.564a3.123 3.123 0 0 0-.002-4.414c-1.178-1.18-3.234-1.18-4.412 0l-8.884 8.884c-1.913.169-3.807 1.521-3.807 3.919 0 .303.021.588.042.86.08 1.031.109 1.418-1.471 2.208a1.001 1.001 0 0 0-.122 1.717C2.52 20.563 4.623 22 7.061 22c-.001 0-.001 0 0 0zM18.086 4.328a1.144 1.144 0 0 1 1.586.002 1.12 1.12 0 0 1 0 1.584L12 13.586 10.414 12l7.672-7.672zM6.018 16.423c-.018-.224-.037-.458-.037-.706 0-1.545 1.445-1.953 2.21-1.953.356 0 .699.073.964.206.945.475 1.26 1.293 1.357 1.896.177 1.09-.217 2.368-.956 3.107C8.865 19.664 8.049 20 7.061 20H7.06c-.75 0-1.479-.196-2.074-.427 1.082-.973 1.121-1.989 1.032-3.15z", "M21.084 2.914c-1.178-1.179-3.234-1.179-4.412 0l-8.379 8.379a.999.999 0 0 0 0 1.414l3 3a.997.997 0 0 0 1.414 0l8.379-8.379a3.123 3.123 0 0 0-.002-4.414zm-1.412 3L12 13.586 10.414 12l7.672-7.672a1.146 1.146 0 0 1 1.586.002 1.123 1.123 0 0 1 0 1.584zM8 15c-1.265-.634-3.5 0-3.5 2 0 1.197.5 2-1.5 3 0 0 3.25 2.25 5.5 0 1.274-1.274 1.494-4-.5-5z"]

const SELECT_ICON_PATH = ["M3 3h2v2H3zM3 7h2v2H3zM3 11h2v2H3zM3 15h2v2H3zM3 19h2v2H3zM7 3h2v2H7zM7 19h2v2H7zM11 3h2v2h-2zM11 19h2v2h-2zM15 3h2v2h-2zM15 19h2v2h-2zM19 3h2v2h-2zM19 7h2v2h-2zM19 11h2v2h-2zM19 15h2v2h-2zM19 19h2v2h-2z"];

const TEXT_ICON_PATH = ["M5 8h2V6h3.252L7.68 18H5v2h8v-2h-2.252L13.32 6H17v2h2V4H5z"];

const FILL_ICON_PATH = ["M20 14c-.092.064-2 2.083-2 3.5 0 1.494.949 2.448 2 2.5.906.044 2-.891 2-2.5 0-1.5-1.908-3.436-2-3.5zM9.586 20c.378.378.88.586 1.414.586s1.036-.208 1.414-.586l7-7-.707-.707L11 4.586 8.707 2.293 7.293 3.707 9.586 6 4 11.586c-.378.378-.586.88-.586 1.414s.208 1.036.586 1.414L9.586 20zM11 7.414 16.586 13H5.414L11 7.414z"];

const REPLACE_ICON_PATH = ["M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"];

const EYEDROPPER_ICON_PATH = ["m4 15.76-1 4A1 1 0 0 0 3.75 21a1 1 0 0 0 .49 0l4-1a1 1 0 0 0 .47-.26L17 11.41l1.29 1.3 1.42-1.42-1.3-1.29L21 7.41a2 2 0 0 0 0-2.82L19.41 3a2 2 0 0 0-2.82 0L14 5.59l-1.3-1.3-1.42 1.42L12.58 7l-8.29 8.29a1 1 0 0 0-.29.47zm1.87.75L14 8.42 15.58 10l-8.09 8.1-2.12.53z"];

const ROW_ICON_PATH = ["M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"];

const COLUMN_ICON_PATH = ["M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"];

const SETTING_ICON_PATH = ["M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 6c-1.08 0-2-.92-2-2s.92-2 2-2 2 .92 2 2-.92 2-2 2", "m20.42 13.4-.51-.29c.05-.37.08-.74.08-1.11s-.03-.74-.08-1.11l.51-.29c.96-.55 1.28-1.78.73-2.73l-1-1.73a2.006 2.006 0 0 0-2.73-.73l-.53.31c-.58-.46-1.22-.83-1.9-1.11v-.6c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v.6c-.67.28-1.31.66-1.9 1.11l-.53-.31c-.96-.55-2.18-.22-2.73.73l-1 1.73c-.55.96-.22 2.18.73 2.73l.51.29c-.05.37-.08.74-.08 1.11s.03.74.08 1.11l-.51.29c-.96.55-1.28 1.78-.73 2.73l1 1.73c.55.95 1.77 1.28 2.73.73l.53-.31c.58.46 1.22.83 1.9 1.11v.6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-.6a8.7 8.7 0 0 0 1.9-1.11l.53.31c.95.55 2.18.22 2.73-.73l1-1.73c.55-.96.22-2.18-.73-2.73m-2.59-2.78c.11.45.17.92.17 1.38s-.06.92-.17 1.38a1 1 0 0 0 .47 1.11l1.12.65-1 1.73-1.14-.66c-.38-.22-.87-.16-1.19.14-.68.65-1.51 1.13-2.38 1.4-.42.13-.71.52-.71.96v1.3h-2v-1.3c0-.44-.29-.83-.71-.96-.88-.27-1.7-.75-2.38-1.4a1.01 1.01 0 0 0-1.19-.15l-1.14.66-1-1.73 1.12-.65c.39-.22.58-.68.47-1.11-.11-.45-.17-.92-.17-1.38s.06-.93.17-1.38A1 1 0 0 0 5.7 9.5l-1.12-.65 1-1.73 1.14.66c.38.22.87.16 1.19-.14.68-.65 1.51-1.13 2.38-1.4.42-.13.71-.52.71-.96v-1.3h2v1.3c0 .44.29.83.71.96.88.27 1.7.75 2.38 1.4.32.31.81.36 1.19.14l1.14-.66 1 1.73-1.12.65c-.39.22-.58.68-.47 1.11Z"];

const PALETTE_ICON_PATH = ["M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 16v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5v-2h2v-2H5V9h2V7H5V5h2v2h2V5h2v2h2V5h2v2h2V5h2v14z", "M7 9h2v2H7zM9 7h2v2H9zM11 9h2v2h-2zM13 7h2v2h-2zM17 7h2v2h-2zM15 9h2v2h-2zM7 13h2v2H7zM9 11h2v2H9zM11 13h2v2h-2zM13 11h2v2h-2zM17 11h2v2h-2zM15 13h2v2h-2zM9 15h2v2H9zM13 15h2v2h-2zM17 15h2v2h-2z"];

const GRID_ICON_PATH = ["M2 16.5h5V21H2zM17 16.5h5V21h-5zM9.5 16.5h5V21h-5zM2 9.75h5v4.5H2zM17 9.75h5v4.5h-5zM9.5 9.75h5v4.5h-5zM2 3h5v4.5H2zM17 3h5v4.5h-5zM9.5 3h5v4.5h-5z"];

const MANAGE_STITCHES_ICON_PATH = ["m4 8.09-1.29-1.3-1.42 1.42L4 10.91l4.71-4.7-1.42-1.42zm0 8-1.29-1.3-1.42 1.42L4 18.91l4.71-4.7-1.42-1.42zM10 15h12v2H10zm0-8h12v2H10z"];

const CLOSE_ICON_PATH = ["m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"];

const GENERATE_ICON_PATH = ["m5 17.41 3-3 1.29 1.29c.39.39 1.02.39 1.41 0l5.29-5.29 3 3V14h2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H5zM19 5v5.59L16.71 8.3a.996.996 0 0 0-1.41 0l-5.29 5.29-1.29-1.29a.996.996 0 0 0-1.41 0l-2.29 2.29V5h14Z", "M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3M21.72 18.07l-1.94-.86-.86-1.94a.46.46 0 0 0-.42-.28c-.19-.02-.35.1-.43.27l-.86 1.87-1.95.94c-.16.08-.27.25-.26.43 0 .18.11.35.28.42l1.94.86.86 1.94a.471.471 0 0 0 .86 0l.86-1.94 1.94-.86a.471.471 0 0 0 0-.86Z"];

const UPLOAD_ICON_PATH = ["M11 15h2V9h3l-4-5-4 5h3z", "M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"];

const EDIT_ICON_PATH = ["m17.71 7.29-3-3a.996.996 0 0 0-1.41 0l-11.01 11A1 1 0 0 0 2 16v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l11-11a.996.996 0 0 0 0-1.41ZM5.59 18H4v-1.59l7.5-7.5 1.59 1.59zm8.91-8.91L12.91 7.5 14 6.41 15.59 8zM11 18h11v2H11z"];

const CIRCLE_PLUS_ICON_PATH = ["M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z", "M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"];

const UNDO_ICON_PATH = ["M9 10h6c2.21 0 4 1.79 4 4s-1.79 4-4 4h-3v2h3c3.31 0 6-2.69 6-6s-2.69-6-6-6H9V4L3 9l6 5z"];

const REDO_ICON_PATH = ["M9 20h3v-2H9c-2.21 0-4-1.79-4-4s1.79-4 4-4h6v4l6-5-6-5v4H9c-3.31 0-6 2.69-6 6s2.69 6 6 6"];

const SELECT_ALL_ICON_PATH = ["M3 3h2v2H3zM3 7h2v2H3zM3 11h2v2H3zM3 15h2v2H3zM3 19h2v2H3zM7 3h2v2H7zM7 19h2v2H7zM11 3h2v2h-2zM11 19h2v2h-2zM15 3h2v2h-2zM15 19h2v2h-2zM19 3h2v2h-2zM19 7h2v2h-2zM19 11h2v2h-2zM19 15h2v2h-2zM19 19h2v2h-2zM7 7h10v10H7z"];

const COPY_ICON_PATH = ["M20 2H10c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 12H10V4h10z", "M14 20H4V10h2V8H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2h-2z"];

const CUT_ICON_PATH = ["M10 6.5C10 4.57 8.43 3 6.5 3S3 4.57 3 6.5 4.57 10 6.5 10c.6 0 1.16-.17 1.65-.43L10.58 12l-2.43 2.43C7.66 14.16 7.1 14 6.5 14 4.57 14 3 15.57 3 17.5S4.57 21 6.5 21s3.5-1.57 3.5-3.5c0-.6-.17-1.16-.43-1.65L12 13.42l6.59 6.59h2.83L9.57 8.16c.27-.49.43-1.05.43-1.65ZM6.5 19c-.83 0-1.5-.67-1.5-1.5S5.67 16 6.5 16s1.5.67 1.5 1.5S7.33 19 6.5 19M5 6.5C5 5.67 5.67 5 6.5 5S8 5.67 8 6.5 7.33 8 6.5 8 5 7.33 5 6.5m8.4 2.69 1.41 1.41 6.6-6.6h-2.82z"];

const PASTE_ICON_PATH = ["M20 10h-2V5c0-1.1-.9-2-2-2h-2c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2m-10 2v4H4V5h2v2h8V5h2v5h-4c-1.1 0-2 .9-2 2m10 8h-8v-8h8z"];

const FLIP_HORIZONTAL_ICON_PATH = ["m20.76 7.06-5.1 4.37a.75.75 0 0 0 0 1.14l5.1 4.37a.75.75 0 0 0 1.24-.57V7.63a.75.75 0 0 0-1.24-.57M3.24 16.94l5.1-4.37a.75.75 0 0 0 0-1.14l-5.1-4.37A.75.75 0 0 0 2 7.63v8.74c0 .64.75.99 1.24.57M11 2h2v20h-2z"];

const FLIP_VERTICAL_ICON_PATH = ["M12.57 15.66a.75.75 0 0 0-1.14 0l-4.37 5.1A.75.75 0 0 0 7.63 22h8.74c.64 0 .99-.75.57-1.24zM7.06 3.24l4.37 5.1c.3.35.84.35 1.14 0l4.37-5.1A.75.75 0 0 0 16.37 2H7.63a.75.75 0 0 0-.57 1.24M2 11h20v2H2z"];

const ROTATE_ICON_PATH = ["M21.21 8.11c-.25-.59-.56-1.16-.92-1.7-.36-.53-.77-1.03-1.22-1.48s-.95-.86-1.48-1.22c-.54-.36-1.11-.67-1.7-.92-.6-.26-1.24-.45-1.88-.58-1.32-.27-2.71-.27-4.03 0-.64.13-1.27.33-1.88.58-.59.25-1.16.56-1.7.92-.53.36-1.03.77-1.48 1.22-.17.17-.32.35-.48.52L1.99 3v6h6L5.86 6.87c.15-.18.31-.36.48-.52.36-.36.76-.69 1.18-.98.43-.29.89-.54 1.36-.74.48-.2.99-.36 1.5-.47a8 8 0 0 1 4.73.47c.47.2.93.45 1.36.74.42.29.82.62 1.18.98s.69.76.98 1.18c.29.43.54.89.74 1.36.2.48.36.99.47 1.5.11.53.16 1.07.16 1.61a7.85 7.85 0 0 1-.63 3.11c-.2.47-.45.93-.74 1.36-.29.42-.62.82-.98 1.18s-.76.69-1.18.98c-.43.29-.89.54-1.36.74-.48.2-.99.36-1.5.47a8 8 0 0 1-4.73-.47c-.47-.2-.93-.45-1.36-.74-.42-.29-.82-.62-1.18-.98s-.69-.76-.98-1.18c-.29-.43-.54-.89-.74-1.36-.2-.48-.36-.99-.47-1.5A8 8 0 0 1 3.99 12h-2c0 .68.07 1.36.2 2.01.13.64.33 1.27.58 1.88.25.59.56 1.16.92 1.7.36.53.77 1.03 1.22 1.48s.95.86 1.48 1.22c.54.36 1.11.67 1.7.92.6.26 1.24.45 1.88.58.66.13 1.34.2 2.01.2s1.35-.07 2.01-.2c.64-.13 1.27-.33 1.88-.58.59-.25 1.16-.56 1.7-.92.53-.36 1.03-.77 1.48-1.22s.86-.95 1.22-1.48c.36-.54.67-1.11.92-1.7.26-.6.45-1.24.58-1.88.13-.66.2-1.33.2-2.01s-.07-1.36-.2-2.01c-.13-.64-.33-1.27-.58-1.88Z"];

const TRASH_ICON_PATH = ["M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zM6 20V8h12v12z", "M9 10h2v8H9zm4 0h2v8h-2z"];

const SAVE_ICON_PATH = ["M5 21h14c1.1 0 2-.9 2-2V8c0-.27-.11-.52-.29-.71l-4-4A1 1 0 0 0 16 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2m10-2H9v-5h6zM11 5h2v2h-2zM5 5h2v4h8V5h.59L19 8.41V19h-2v-5c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v5H5z"];

const EXPORT_ICON_PATH = ["M11 16h2V7h3l-4-5-4 5h3z", "M5 22h14c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-4v2h4v9H5v-9h4V9H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2z"];

const DOWNLOAD_ICON_PATH = ["m12 16 4-5h-3V4h-2v7H8z", "M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z"];

const IMPORT_ICON_PATH = ["m12 18 4-5h-3V2h-2v11H8z", "M19 9h-4v2h4v9H5v-9h4V9H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2z"];

const CREATE_NEW_ICON_PATH = ["M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3z", "m19.94 7.68-.03-.09a.8.8 0 0 0-.2-.29l-5-5c-.09-.09-.19-.15-.29-.2l-.09-.03a.8.8 0 0 0-.26-.05c-.02 0-.04-.01-.06-.01H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-12s-.01-.04-.01-.06c0-.09-.02-.17-.05-.26ZM6 20V4h7v4c0 .55.45 1 1 1h4v11z"];

const DOWNLOAD_PDF_ICON_PATH = ["M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"];

const EYE_ICON_PATH = ["M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6", "M12 19c7.63 0 9.93-6.62 9.95-6.68.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68s-9.93 6.61-9.95 6.67c-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68Zm0-12c5.35 0 7.42 3.85 7.93 5-.5 1.16-2.58 5-7.93 5s-7.42-3.84-7.93-5c.5-1.16 2.58-5 7.93-5"];

const TRANSPARENCY_ICON_PATH = ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-2.02.75-3.87 1.98-5.31l11.33 11.33C15.87 19.25 14.02 20 12 20zm6.02-2.69L6.69 5.98C8.13 4.75 9.98 4 12 4c4.41 0 8 3.59 8 8 0 2.02-.75 3.87-1.98 5.31z"];

const HELP_ICON_PATH = ["M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8", "M11 16h2v2h-2zm2.27-9.75c-2.08-.75-4.47.35-5.21 2.41l1.88.68c.18-.5.56-.9 1.07-1.13s1.08-.26 1.58-.08a2.01 2.01 0 0 1 1.32 1.86c0 1.04-1.66 1.86-2.24 2.07-.4.14-.67.52-.67.94v1h2v-.34c1.04-.51 2.91-1.69 2.91-3.68a4.015 4.015 0 0 0-2.64-3.73"];

const INFO_ICON_PATH = ["M11 11h2v6h-2zm0-4h2v2h-2z", "M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8"];

const ZOOM_IN_ICON_PATH = ["M19 10.5C19 5.81 15.19 2 10.5 2S2 5.81 2 10.5 5.81 19 10.5 19c1.98 0 3.81-.69 5.25-1.83L20 21.42l1.41-1.41-4.25-4.25a8.47 8.47 0 0 0 1.83-5.25Zm-15 0C4 6.92 6.92 4 10.5 4S17 6.92 17 10.5 14.08 17 10.5 17 4 14.08 4 10.5", "M11.5 6h-2v3.5H6v2h3.5V15h2v-3.5H15v-2h-3.5z"];

const ZOOM_OUT_ICON_PATH = ["M19 10.5C19 5.81 15.19 2 10.5 2S2 5.81 2 10.5 5.81 19 10.5 19c1.98 0 3.81-.69 5.25-1.83L20 21.42l1.41-1.41-4.25-4.25a8.47 8.47 0 0 0 1.83-5.25Zm-15 0C4 6.92 6.92 4 10.5 4S17 6.92 17 10.5 14.08 17 10.5 17 4 14.08 4 10.5", "M6 9.5h9v2H6z"];

const PRINT_ICON_PATH = ["M19 7h-1V2H6v5H5c-1.65 0-3 1.35-3 3v7c0 1.1.9 2 2 2h2v3h12v-3h2c1.1 0 2-.9 2-2v-7c0-1.65-1.35-3-3-3M8 4h8v3H8zm8 16H8v-4h8zm4-3h-2v-3H6v3H4v-7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1z", "M14 11h4v1h-4z"];

const PLUS_ICON_PATH = ["M3 13h8v8h2v-8h8v-2h-8V3h-2v8H3z"];

const MINUS_ICON_PATH = ["M3 11h18v2H3z"];

const REFRESH_ICON_PATH = ["M19.07 4.93a9.9 9.9 0 0 0-3.18-2.14A9.95 9.95 0 0 0 12 2v2c1.08 0 2.13.21 3.11.63.95.4 1.81.98 2.54 1.71s1.31 1.59 1.72 2.54c.42.99.63 2.03.63 3.11s-.21 2.13-.63 3.11c-.4.95-.98 1.81-1.72 2.54-.17.17-.34.32-.52.48L15 15.99v6h6l-2.45-2.45c.18-.15.36-.31.52-.48.92-.92 1.64-1.99 2.14-3.18.52-1.23.79-2.54.79-3.89s-.26-2.66-.79-3.89a9.9 9.9 0 0 0-2.14-3.18ZM4.93 19.07c.92.92 1.99 1.64 3.18 2.14 1.23.52 2.54.79 3.89.79v-2a7.9 7.9 0 0 1-3.11-.63c-.95-.4-1.81-.98-2.54-1.71s-1.31-1.59-1.72-2.54c-.42-.99-.63-2.03-.63-3.11s.21-2.13.63-3.11c.4-.95.98-1.81 1.72-2.54.17-.17.34-.32.52-.48L9 8.01V2H3l2.45 2.45c-.18.15-.36.31-.52.48-.92.92-1.64 1.99-2.14 3.18C2.27 9.34 2 10.65 2 12s.26 2.66.79 3.89c.5 1.19 1.22 2.26 2.14 3.18"];

const CHECK_ICON_PATH = ["M9 15.59 4.71 11.3 3.3 12.71l5 5c.2.2.45.29.71.29s.51-.1.71-.29l11-11-1.41-1.41L9.02 15.59Z"];

const FOLDER_OPEN_ICON_PATH = ["M2.165 19.551c.186.28.499.449.835.449h15c.4 0 .762-.238.919-.606l3-7A.998.998 0 0 0 21 11h-1V7c0-1.103-.897-2-2-2h-6.1L9.616 3.213A.997.997 0 0 0 9 3H4c-1.103 0-2 .897-2 2v14h.007a1 1 0 0 0 .158.551zM17.341 18H4.517l2.143-5h12.824l-2.143 5zM18 7v4H6c-.4 0-.762.238-.919.606L4 14.129V7h14z"];

const MAXIMIZE_ICON_PATH = ["m15.71 14.29-1.42 1.42 3 3L15 21h6v-6l-2.29 2.29zM8.29 9.71l1.42-1.42-3-3L9 3H3v6l2.29-2.29zM17.29 5.29l-3 3 1.42 1.42 3-3L21 9V3h-6zM6.71 18.71l3-3-1.42-1.42-3 3L3 15v6h6z"];

const MINIMIZE_ICON_PATH = ["M4.71 3.29 3.29 4.71l3 3L4 10h6V4L7.71 6.29zm11.58 3L14 4v6h6l-2.29-2.29 3-3-1.42-1.42zM20 14h-6v6l2.29-2.29 3 3 1.42-1.42-3-3zM6.29 16.29l-3 3 1.42 1.42 3-3L10 20v-6H4z"];

const VERTICAL_SYMMETRY_ICON_PATH = ["m20.4 9.08-16-7a.98.98 0 0 0-.95.08A1 1 0 0 0 3 3v7c0 .55.45 1 1 1h16c.47 0 .88-.33.98-.79s-.14-.93-.58-1.12ZM5 9V4.53L15.22 9zM20 13H4c-.55 0-1 .45-1 1v7c0 .34.17.65.45.84.17.11.36.16.55.16.14 0 .27-.03.4-.08l16-7c.43-.19.67-.66.58-1.12-.1-.46-.51-.79-.98-.79ZM5 19.47V15h10.22z"];

const HORIZONTAL_SYMMETRY_ICON_PATH = ["M10 21c.55 0 1-.45 1-1V4a1.003 1.003 0 0 0-1.92-.4l-7 16c-.14.31-.11.67.08.95A1 1 0 0 0 3 21zM9 8.78V19H4.53zM14.92 3.6c-.19-.43-.66-.67-1.12-.58-.46.1-.8.51-.8.98v16c0 .55.45 1 1 1h7c.34 0 .65-.17.84-.45.18-.28.21-.64.08-.95zM15 19V8.78L19.47 19z"];

const ARROW_UP_ICON_PATH = ["M4 14h4v3c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-3h4a1.004 1.004 0 0 0 .78-1.63l-8-9.99c-.38-.47-1.18-.47-1.56 0l-8 10A1.004 1.004 0 0 0 4 14.01Zm8-9.4 5.92 7.4H15c-.55 0-1 .45-1 1v3h-4v-3c0-.55-.45-1-1-1H6.08zM8 20h8v2H8z"];

const ARROW_DOWN_ICON_PATH = ["M20 10h-4V7c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v3H4a1.004 1.004 0 0 0-.78 1.63l8 10c.19.24.48.38.78.38s.59-.14.78-.38l8-10A1.004 1.004 0 0 0 20 10m-8 9.4L6.08 12H9c.55 0 1-.45 1-1V8h4v3c0 .55.45 1 1 1h2.92zM8 2h8v2H8z"];

const ARROW_LEFT_ICON_PATH = ["M13 21c.15 0 .3-.03.43-.1.35-.17.57-.52.57-.9v-4h3c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1h-3V4a1.004 1.004 0 0 0-1.63-.78l-9.99 8c-.24.19-.38.48-.38.78s.14.59.38.78l10 8c.18.14.4.22.62.22m-1-6v2.92L4.6 12 12 6.08V9c0 .55.45 1 1 1h3v4h-3c-.55 0-1 .45-1 1M20 8h2v8h-2z"];

const ARROW_RIGHT_ICON_PATH = ["M11.62 3.22A1.004 1.004 0 0 0 9.99 4v4h-3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h3v4a1.004 1.004 0 0 0 1 1c.22 0 .44-.07.62-.22l10-8c.24-.19.38-.48.38-.78s-.14-.59-.38-.78zm.38 14.7V15c0-.55-.45-1-1-1H8v-4h3c.55 0 1-.45 1-1V6.08L19.4 12zM2 8h2v8H2z"];

const ARROW_LEFT_RIGHT_ICON_PATH = ["M16 16H2v2h14v4l6-5-6-5zM8 1 2 6l6 5V7h14V5H8z"];

const ARROW_UP_DOWN_ICON_PATH = ["M6 22h2V8h4L7 2 2 8h4zM19 2h-2v14h-4l5 6 5-6h-4z"];

const LEFT_RIGHT_ICON_PATH = ["M15 11H8v2h7v4l6-5-6-5zM4 4h2v16H4z"];

const RIGHT_LEFT_ICON_PATH = ["M9 13h7v-2H9V7l-6 5 6 5zM18 4h2v16h-2z"];

const TOP_BOTTOM_ICON_PATH = ["M4 4h16v2H4zM11 8v7H7l5 6 5-6h-4V8z"];

const BOTTOM_TOP_ICON_PATH = ["M12 3 7 9h4v7h2V9h4zM4 18h16v2H4z"];

const HEADING_ICON_PATH = ["M7 5v14h2v-6h6v6h2V5h-2v6H9V5z"];

const PARAGRAPH_ICON_PATH = ["M4 10c0 3.31 2.69 6 6 6h2v4h2V6h2v14h2V6h3V4H10c-3.31 0-6 2.69-6 6m8 4h-2c-2.21 0-4-1.79-4-4s1.79-4 4-4h2z"];

const BULLET_LIST_ICON_PATH = ["M8 11h13v2H8zM8 6h13v2H8zM8 16h13v2H8zM3 5.5h3v3H3zM3 10.5h3v3H3zM3 15.5h3v3H3z"];

const NUMBER_LIST_ICON_PATH = ["M3 16h2v.5H3v1h2v.5H3v1h3v-4H3zM4 6h1v3h1V5H4zM3 11h2v.5H3V14h3v-1H4v-.5h2V10H3zM8 11h13v2H8zM8 6h13v2H8zM8 16h13v2H8z"];

const LOCKED_ICON_PATH = ["M6 22h12c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5S7 4.24 7 7v2H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2M9 7c0-1.65 1.35-3 3-3s3 1.35 3 3v2H9zm-3 4h12v9h-5v-2.28c.59-.35 1-.99 1-1.72 0-1.1-.9-2-2-2s-2 .9-2 2a2 2 0 0 0 1 1.72V20H6z"];

const UNLOCKED_ICON_PATH = ["M6 22h12c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2H9V7c0-1.65 1.35-3 3-3s3 1.35 3 3h2c0-2.76-2.24-5-5-5S7 4.24 7 7v2H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2m0-11h12v9h-5v-2.28c.59-.35 1-.99 1-1.72 0-1.1-.9-2-2-2s-2 .9-2 2a2 2 0 0 0 1 1.72V20H6z"];

const BOOK_ICON_PATH = ["M8 6h9v2H8z", "M20 2H6C4.35 2 3 3.35 3 5v14c0 1.65 1.35 3 3 3h15v-2H6c-.55 0-1-.45-1-1s.45-1 1-1h14c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1m-6 14H6c-.35 0-.69.07-1 .18V5c0-.55.45-1 1-1h13v12z"];

const DOTS_VERTICAL_ICON_PATH = ["M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4m0 6a2 2 0 1 0 0 4 2 2 0 1 0 0-4m0-12a2 2 0 1 0 0 4 2 2 0 1 0 0-4"];

const DOTS_HORIZONTAL_ICON_PATH = ["M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4m6 0a2 2 0 1 0 0 4 2 2 0 1 0 0-4M6 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4"];

const COLOR_PALETTE_ICON_PATH = ["M13.4 2.1c-3.16-.43-6.24.6-8.47 2.83S1.67 10.25 2.1 13.4c.53 3.89 3.46 7.21 7.29 8.25.86.23 1.74.35 2.62.35h.14c1.03-.02 1.97-.55 2.52-1.43.54-.88.6-1.95.15-2.88l-.2-.42c-.45-.94-.1-1.8.39-2.28s1.34-.84 2.28-.39l.41.2c.93.45 2 .39 2.88-.15a3 3 0 0 0 1.43-2.52c.01-.92-.1-1.85-.35-2.76-1.04-3.83-4.35-6.75-8.25-7.29Zm6.12 10.86c-.3.18-.65.2-.96.05l-.41-.2a3.96 3.96 0 0 0-4.56.78 3.96 3.96 0 0 0-.78 4.56l.2.42c.15.31.13.66-.05.96-.19.3-.49.47-.84.48-.74.02-1.48-.08-2.21-.28-3.06-.83-5.4-3.48-5.83-6.59-.34-2.53.48-5 2.27-6.79a7.96 7.96 0 0 1 5.66-2.34c.37 0 .75.03 1.13.08 3.11.42 5.75 2.76 6.59 5.83.2.73.29 1.47.28 2.21 0 .35-.18.66-.48.84Z", "M7.33 12.76a1 1 0 1 0 0 2 1 1 0 1 0 0-2m.07-3.83a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 1 0 0-2.24m2.81-2.87a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 1 0 0-2.5m4.06.11a1.38 1.38 0 1 0 0 2.76 1.38 1.38 0 1 0 0-2.76"];

const SWAP_ICON_PATH = ["M16 6H2v2h14v4l6-5-6-5zm-8 7-6 5 6 5v-4h14v-2H8z"];

const ALERT_WARNING_ICON_PATH = ["M11 9h2v6h-2zm0 8h2v2h-2z", "M12.87 2.51c-.35-.63-1.4-.63-1.75 0l-9.99 18c-.17.31-.17.69.01.99.18.31.51.49.86.49h20c.35 0 .68-.19.86-.49a1 1 0 0 0 .01-.99zM3.7 20 12 5.06 20.3 20z"];

const ALERT_ERROR_ICON_PATH = ["M11 9h2v6h-2zm0 8h2v2h-2z", "M12.87 2.51c-.35-.63-1.4-.63-1.75 0l-9.99 18c-.17.31-.17.69.01.99.18.31.51.49.86.49h20c.35 0 .68-.19.86-.49a1 1 0 0 0 .01-.99zM3.7 20 12 5.06 20.3 20z"];

const ALERT_INFO_ICON_PATH = ["M11 9h2v6h-2zm0 8h2v2h-2z", "M12.87 2.51c-.35-.63-1.4-.63-1.75 0l-9.99 18c-.17.31-.17.69.01.99.18.31.51.49.86.49h20c.35 0 .68-.19.86-.49a1 1 0 0 0 .01-.99zM3.7 20 12 5.06 20.3 20z"];

const SEARCH_ICON_PATH = ["m17.06 14.94-2.8-1.34A6.96 6.96 0 0 0 16 9c0-3.86-3.14-7-7-7S2 5.14 2 9s3.14 7 7 7c1.76 0 3.37-.66 4.6-1.74l1.34 2.8 5 5 2.12-2.12zM9 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5"];

/**
 * CENTRAL ICON REGISTRY
 * =====================
 * Instructions for adding new icons:
 * 1. Find the key you want to update (all are currently placeholders).
 * 2. Get the SVG path data for your desired icon (e.g., from an icon library or Figma).
 *    - Ensure the path is for a 24x24 viewBox.
 * 3. Replace the `paths` array with your path string(s).
 *    - If singular: paths: ["M..."]
 *    - If multiple parts: paths: ["part1...", "part2..."]
 * 4. (Optional) Adjust `viewBox` if not 24x24.
 * 5. (Optional) Add `transform` if rotation is needed (e.g. for arrows).
 */
const ICON_MAP: Record<string, IconDef> = {
  // --- Editor Tools ---
  'brush': { paths: BRUSH_ICON_PATH },
  'fill': { paths: FILL_ICON_PATH },
  'replace': { paths: REPLACE_ICON_PATH },
  'eyedropper': { paths: EYEDROPPER_ICON_PATH },
  'select': { paths: SELECT_ICON_PATH },
  'text': { paths: TEXT_ICON_PATH },
  'row': { paths: ROW_ICON_PATH },
  'column': { paths: COLUMN_ICON_PATH, transform: "rotate(90)" },

  'grid': { paths: GRID_ICON_PATH, },
  'pixel-mode': { paths: GRID_ICON_PATH }, // Sidebar Pixel Icon
  'select-all': { paths: SELECT_ALL_ICON_PATH },
  'manage-stitches': { paths: MANAGE_STITCHES_ICON_PATH },
  'generate-pattern': { paths: GENERATE_ICON_PATH },
  'edit-instructions': { paths: EDIT_ICON_PATH },
  'delete-block': { paths: TRASH_ICON_PATH },
  'add-heading': { paths: HEADING_ICON_PATH },
  'add-paragraph': { paths: PARAGRAPH_ICON_PATH },
  'add-bullet-list': { paths: BULLET_LIST_ICON_PATH },
  'add-number-list': { paths: NUMBER_LIST_ICON_PATH },

  // --- Selection Tools ---
  'copy': { paths: COPY_ICON_PATH },
  'cut': { paths: CUT_ICON_PATH },
  'paste': { paths: PASTE_ICON_PATH },
  'selection-flip-horizontal': { paths: FLIP_HORIZONTAL_ICON_PATH },
  'selection-flip-vertical': { paths: FLIP_VERTICAL_ICON_PATH },
  'rotate-right': { paths: ROTATE_ICON_PATH },
  'clear-selection': { paths: TRASH_ICON_PATH },
  'transparency-color': { paths: TRANSPARENCY_ICON_PATH },
  'swap': { paths: SWAP_ICON_PATH },
  'color-palette': { paths: COLOR_PALETTE_ICON_PATH },
  'alert-warning': { paths: ALERT_WARNING_ICON_PATH, fill: "#F59E0B" }, // Amber-500
  'alert-error': { paths: ALERT_ERROR_ICON_PATH, fill: "#EF4444" },   // Red-500
  'alert-info': { paths: ALERT_INFO_ICON_PATH, fill: "#3B82F6" },     // Blue-500

  // --- Actions & Operations ---
  'undo': { paths: UNDO_ICON_PATH, stroke: "currentColor" },
  'redo': { paths: REDO_ICON_PATH, stroke: "currentColor" },
  'zoom-in': { paths: ZOOM_IN_ICON_PATH },
  'zoom-out': { paths: ZOOM_OUT_ICON_PATH },
  'save': { paths: SAVE_ICON_PATH },
  'open': { paths: PLACEHOLDER_PATH },
  'import': { paths: IMPORT_ICON_PATH },
  'export': { paths: SAVE_ICON_PATH },
  'upload': { paths: UPLOAD_ICON_PATH },
  'download': { paths: DOWNLOAD_ICON_PATH },
  'export-json': { paths: DOWNLOAD_ICON_PATH },
  'export-project': { paths: EXPORT_ICON_PATH },
  'download-pdf': { paths: DOWNLOAD_PDF_ICON_PATH },
  'create-project': { paths: CREATE_NEW_ICON_PATH },
  'print': { paths: PRINT_ICON_PATH },
  'trash': { paths: TRASH_ICON_PATH },
  'edit': { paths: EDIT_ICON_PATH },
  'close': { paths: CLOSE_ICON_PATH },
  'plus': { paths: PLUS_ICON_PATH },
  'plus-circle': { paths: CIRCLE_PLUS_ICON_PATH },
  'minus': { paths: MINUS_ICON_PATH },
  'refresh': { paths: REFRESH_ICON_PATH },
  'settings': { paths: SETTING_ICON_PATH },
  'select-toolbar-settings': { paths: SETTING_ICON_PATH },
  'info': { paths: INFO_ICON_PATH },
  'help': { paths: HELP_ICON_PATH },
  'eye': { paths: EYE_ICON_PATH },
  'check': { paths: CHECK_ICON_PATH },
  'ban': { paths: BAN_ICON_PATH }, // Blocked/Disabled/Cancel
  'folder-open': { paths: FOLDER_OPEN_ICON_PATH },
  'maximize': { paths: MAXIMIZE_ICON_PATH },
  'minimize': { paths: MINIMIZE_ICON_PATH },
  'zap': { paths: ZAP_ICON_PATH }, // Generate/Flash
  'lock': { paths: LOCKED_ICON_PATH },
  'unlock': { paths: UNLOCKED_ICON_PATH },
  'pattern-book': { paths: BOOK_ICON_PATH },
  'search': { paths: SEARCH_ICON_PATH },

  // --- Symmetry / Arrows ---
  'symmetry-vertical': { paths: VERTICAL_SYMMETRY_ICON_PATH },
  'symmetry-horizontal': { paths: HORIZONTAL_SYMMETRY_ICON_PATH },
  'mirror-left-right': { paths: LEFT_RIGHT_ICON_PATH },
  'mirror-right-left': { paths: RIGHT_LEFT_ICON_PATH },
  'mirror-top-bottom': { paths: TOP_BOTTOM_ICON_PATH },
  'mirror-bottom-top': { paths: BOTTOM_TOP_ICON_PATH },
  'arrow-up': { paths: ARROW_UP_ICON_PATH },
  'arrow-down': { paths: ARROW_DOWN_ICON_PATH },
  'arrow-left': { paths: ARROW_LEFT_ICON_PATH },
  'arrow-right': { paths: ARROW_RIGHT_ICON_PATH },
  'arrow-left-right': { paths: ARROW_LEFT_RIGHT_ICON_PATH },
  'arrow-up-down': { paths: ARROW_UP_DOWN_ICON_PATH },

  // --- Pattern Types (Pre-existing SVGs can be migrated or kept as placeholders for now) ---
  'c2c': { paths: C2C_ICON_PATH, stroke: "currentColor", strokeWidth: 1.75, fill: "none" },
  'stripes': { paths: STRIPE_ICON_PATH, stroke: "currentColor", strokeWidth: 1.75, fill: "none" },
  'granny': { paths: GRANNY_ICON_PATH, stroke: "currentColor", strokeWidth: 1.45, fill: "none" },
  'palette': { paths: PALETTE_ICON_PATH, stroke: "currentColor", fill: "none" },
};

export const Icon: React.FC<IconProps> = ({
  name,
  size,
  title,
  className = '',
  style = {}
}) => {
  // Resolve Definition
  let iconDef = ICON_MAP[name];

  if (!iconDef) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in ICON_MAP. Using placeholder.`);
    }
    iconDef = { paths: PLACEHOLDER_PATH };
  }

  // Resolve Size
  let pxSize = '1em'; // Default to font size inheritance if no size specified
  if (size !== undefined) {
    if (typeof size === 'number') {
      pxSize = `${size}px`;
    } else if (typeof size === 'string' && ICON_SIZES[size]) {
      pxSize = `${ICON_SIZES[size]}px`;
    }
  }

  // Common accessibility props
  const a11yProps = title ? { 'aria-label': title, role: 'img' } : { 'aria-hidden': true };

  // Common merged styles
  const mergedStyle: React.CSSProperties = {
    width: pxSize,
    height: pxSize,
    // Ensure display block or inline-block to accept dimensions, though SVG defaults to inline.
    // Setting flex-shrink: 0 prevents squishing in flex containers
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
      fill={iconDef.fill || "currentColor"}
      viewBox={viewBox}
      stroke={iconDef.stroke || "none"}
      strokeWidth={iconDef.strokeWidth || 1.5}
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

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'active' }> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';
  const variantClasses = {
    primary: 'bg-brand-gradient text-white font-heading font-semibold hover:contrast-125 focus:ring-2 focus:ring-brand-purple focus:ring-offset-2',
    secondary: 'bg-[#E5E7EB] text-gray-800 font-sans font-medium hover:bg-gray-300 hover:text-gray-900 focus:ring-2 focus:ring-brand-purple focus:ring-offset-2',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    active: 'bg-brand-midBlue text-white font-heading font-semibold hover:contrast-125 focus:ring-2 focus:ring-brand-purple focus:ring-offset-2',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; maxWidth?: string }> = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex-shrink-0 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
        <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0">
          {footer ? footer : <Button variant="secondary" onClick={onClose}>Close</Button>}
        </div>
      </div>
    </div>
  );
};



export const ContextMenu: React.FC<{
  x: number;
  y: number;
  options: ContextMenuItem[];
  onClose: () => void;
}> = ({ x, y, options, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Delay attaching to avoid immediate close from trigger click
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}></div>
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
        style={{ top: y, left: x }}
      >
        {options.map((option, index) => (
          option.separator ? (
            <div key={index} className="border-t border-gray-200 my-1"></div>
          ) : (
            <button
              key={index}
              className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => {
                if (!option.disabled) {
                  option.action();
                  onClose();
                }
              }}
              disabled={option.disabled}
            >
              <span>{option.label}</span>
              {option.shortcut && <span className={`text-xs ml-4 ${option.disabled ? 'text-gray-300' : 'text-gray-400'}`}>{option.shortcut}</span>}
            </button>
          )
        ))}
      </div>
    </>
  );
};

