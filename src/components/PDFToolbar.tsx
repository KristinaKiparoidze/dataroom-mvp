import { PDF_ZOOM_STEP, PDF_MIN_ZOOM, PDF_MAX_ZOOM } from "../constants";

type PDFToolbarProps = {
  totalPages: number;
  zoom: number;
  pageInput: string;
  onZoomChange: (zoom: number) => void;
  onPageInputChange: (value: string) => void;
  onPageNavigate: (pageNum: number) => void;
};

/**
 * Toolbar component with page navigation and zoom controls
 */
export function PDFToolbar({
  totalPages,
  zoom,
  pageInput,
  onZoomChange,
  onPageInputChange,
  onPageNavigate,
}: PDFToolbarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center z-20">
      <div className="pointer-events-auto flex items-center gap-4 px-4 py-2 rounded-full bg-gray-900/95 text-white shadow-xl border border-gray-800">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Page</span>
          <input
            type="text"
            value={pageInput}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                onPageInputChange(value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const page = parseInt(pageInput);
                if (!isNaN(page) && page >= 1 && page <= totalPages) {
                  onPageNavigate(page);
                }
                e.currentTarget.blur();
              }
            }}
            onBlur={() => {
              const page = parseInt(pageInput);
              if (isNaN(page) || page < 1) {
                onPageInputChange("1");
                onPageNavigate(1);
              } else if (page > totalPages) {
                onPageInputChange(String(totalPages));
                onPageNavigate(totalPages);
              } else {
                onPageNavigate(page);
              }
            }}
            className="w-16 px-2 py-1.5 text-sm text-center bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Current page"
          />
          <span className="text-sm font-medium">/ {totalPages}</span>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onZoomChange(Math.max(zoom - PDF_ZOOM_STEP, PDF_MIN_ZOOM))
            }
            disabled={zoom <= PDF_MIN_ZOOM}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>

          <span className="text-sm font-medium min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() =>
              onZoomChange(Math.min(zoom + PDF_ZOOM_STEP, PDF_MAX_ZOOM))
            }
            disabled={zoom >= PDF_MAX_ZOOM}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
