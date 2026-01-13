/**
 * Application-wide configuration constants
 */

/** Maximum allowed file size in bytes (5 MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Supported MIME type for PDF files */
export const SUPPORTED_FILE_TYPE = "application/pdf";

/** Number of items displayed per page in the list */
export const ITEMS_PER_PAGE = 20;

/** Duration in milliseconds for toast notifications */
export const TOAST_DURATION = 5000;

/** LocalStorage key for persisting application state */
export const STORAGE_KEY = "dataroom-state";

/** PDFjs worker source URL - uses node_modules bundled version */
export const PDFJS_WORKER_URL = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

/** Toast notification durations in milliseconds */
export const TOAST_DURATION_SUCCESS = 3800;
export const TOAST_DURATION_ERROR = 4000;

/** UI spacing constants */
export const ROW_HEIGHT_CLASS = "h-16";
export const HORIZONTAL_PADDING = "px-6 sm:px-8";

/** Modal dialog sizing */
export const DIALOG_WIDTH = "w-11/12";
export const DIALOG_HEIGHT = "h-5/6";
