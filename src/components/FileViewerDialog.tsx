import { useEffect, useRef, useState } from "react";
import { usePDFLoader } from "../hooks/usePDFLoader";
import { usePDFRenderer } from "../hooks/usePDFRenderer";
import { PDF_MIN_ZOOM, PDF_MAX_ZOOM, PDF_ZOOM_STEP } from "../constants";
import { PDFToolbar } from "./PDFToolbar";
import { PDFPages } from "./PDFPages";

type FileViewerDialogProps = {
  fileId: string | null;
  fileName: string | null;
  onClose: () => void;
};

function FileViewerDialog({
  fileId,
  fileName,
  onClose,
}: FileViewerDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset zoom and page input when file changes
  useEffect(() => {
    setZoom(1);
    setPageInput("1");
  }, [fileId]);

  // Load PDF
  const {
    totalPages,
    loading: pdfLoading,
    error: pdfError,
    pdfLoaded,
    pdfDocRef,
  } = usePDFLoader(fileId);

  // Render PDF pages
  const {
    canvases,
    loading: renderLoading,
    error: renderError,
    pageRefs,
  } = usePDFRenderer(pdfLoaded, pdfDocRef, totalPages, containerRef);

  const error = pdfError || renderError;

  // Maintain continuous loading state to prevent animation glitching
  useEffect(() => {
    if (pdfLoading || renderLoading) {
      setIsLoading(true);
    } else if (canvases.length > 0 || error) {
      // Only stop loading when we have content or an error
      setIsLoading(false);
    }
  }, [pdfLoading, renderLoading, canvases.length, error]);

  // Keyboard shortcuts for PDF viewer
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Zoom with Ctrl/Cmd + Plus/Minus
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoom((z) => Math.min(z + PDF_ZOOM_STEP, PDF_MAX_ZOOM));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(z - PDF_ZOOM_STEP, PDF_MIN_ZOOM));
      }

      // Page navigation with arrow keys
      const currentPage = parseInt(pageInput) || 1;
      if (e.key === "ArrowDown" && currentPage < totalPages) {
        e.preventDefault();
        const nextPage = currentPage + 1;
        setPageInput(String(nextPage));
        scrollToPage(nextPage);
      }
      if (e.key === "ArrowUp" && currentPage > 1) {
        e.preventDefault();
        const prevPage = currentPage - 1;
        setPageInput(String(prevPage));
        scrollToPage(prevPage);
      }
    };

    if (totalPages > 0) {
      window.addEventListener("keydown", handleKeydown);
      return () => window.removeEventListener("keydown", handleKeydown);
    }
  }, [pageInput, totalPages]);

  const scrollToPage = (pageNum: number) => {
    if (
      pageNum >= 1 &&
      pageNum <= totalPages &&
      pageRefs.current[pageNum - 1]
    ) {
      pageRefs.current[pageNum - 1].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleRetry = () => {
    // Force reload by clearing state and reloading the PDF
    window.location.reload();
  };

  if (!fileId) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 cursor-pointer"
        onClick={() => onClose()}
      />

      {/* Modal container - large centered popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="relative w-11/12 h-5/6 flex flex-col bg-white pointer-events-auto overflow-hidden rounded-lg shadow-2xl">
          {/* Header - full width, static */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {fileName}
            </h1>
            <button
              type="button"
              onClick={() => onClose()}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded cursor-pointer"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* PDF Viewer - scrollable */}
          <div
            ref={containerRef}
            className="relative flex-1 bg-white"
            style={{ overflow: "auto" }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/95 backdrop-blur-sm transition-opacity duration-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-base text-gray-700 font-medium animate-pulse">
                    Loading PDF...
                  </div>
                </div>
              </div>
            )}
            {!isLoading && error && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center px-6 py-8 bg-white rounded-lg shadow-lg border border-red-200 max-w-md">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-600 font-semibold mb-1">
                    Failed to load PDF
                  </p>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            {/* Render all pages vertically */}
            {!isLoading && !error && canvases.length > 0 && (
              <PDFPages canvases={canvases} zoom={zoom} pageRefs={pageRefs} />
            )}
          </div>

          {/* Toolbar - Bottom floating */}
          {totalPages > 0 && !isLoading && (
            <PDFToolbar
              totalPages={totalPages}
              zoom={zoom}
              pageInput={pageInput}
              onZoomChange={setZoom}
              onPageInputChange={setPageInput}
              onPageNavigate={scrollToPage}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default FileViewerDialog;
