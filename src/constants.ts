/**
 * Application-wide configuration constants
 */

/** Maximum allowed file size in bytes (5 MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Supported MIME type for PDF files */
export const SUPPORTED_FILE_TYPE = "application/pdf";

/** Number of items displayed per page in the list */
export const ITEMS_PER_PAGE = 20;

/** LocalStorage key for persisting application state */
export const STORAGE_KEY = "dataroom-state";

/** LocalStorage key prefix for PDF files */
export const PDF_FILE_KEY_PREFIX = "file-";

/** PDFjs worker source URL - uses node_modules bundled version */
export const PDFJS_WORKER_URL = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

/** Toast notification durations in milliseconds */
export const TOAST_DURATION_SUCCESS = 3800;
export const TOAST_DURATION_ERROR = 4000;

/** PDF Viewer constants */
export const PDF_PAGE_WIDTH_RATIO = 0.9; // Page width as percentage of container (90% for a closer fit like Drive)
export const PDF_MIN_ZOOM = 0.5; // Minimum zoom level (50%)
export const PDF_MAX_ZOOM = 3; // Maximum zoom level (300%)
export const PDF_ZOOM_STEP = 0.25; // Zoom increment per button click
