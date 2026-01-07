import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { CloseIcon } from "./icons";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type FileViewerProps = {
  fileId: string | null;
  fileName: string | null;
  onClose: () => void;
};

function FileViewer({ fileId, fileName, onClose }: FileViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!fileId) return;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);
        setPdfLoaded(false);

        const stored = localStorage.getItem(`file-${fileId}`);
        if (!stored) {
          setError("File not found");
          setLoading(false);
          return;
        }

        const arrayBuffer = Uint8Array.from(atob(stored), (c) =>
          c.charCodeAt(0)
        ).buffer;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setPdfLoaded(true);
      } catch (err) {
        setError((err as Error).message || "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPDF();
  }, [fileId]);

  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdfDocRef.current!.getPage(currentPage);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx!,
          viewport,
        }).promise;

        setLoading(false);
      } catch (err) {
        setError((err as Error).message || "Failed to render page");
        setLoading(false);
      }
    };

    renderPage();
  }, [currentPage, pdfLoaded]);

  useEffect(() => {
    if (!fileId) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape, true);
    return () => document.removeEventListener("keydown", handleEscape, true);
  }, [fileId, onClose]);

  if (!fileId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-viewer-title"
    >
      <div
        className="bg-white rounded-lg shadow-lg w-11/12 h-5/6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2
            id="file-viewer-title"
            className="text-lg font-semibold text-gray-900 truncate"
          >
            {fileName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close viewer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100">
          {loading && <div className="text-gray-500">Loading PDF...</div>}
          {error && (
            <div className="text-red-600 text-center">
              <p>Error: {error}</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`bg-white shadow-md ${loading || error ? "hidden" : ""}`}
          />
        </div>

        {/* Footer */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileViewer;
