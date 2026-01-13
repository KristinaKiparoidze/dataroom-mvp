import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as pdfjsLib from "pdfjs-dist";
import { CloseIcon } from "./Icons";
import { PDFJS_WORKER_URL } from "../constants";

pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
          console.error("[FileViewer] File not found in localStorage:", fileId);
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
        console.error("[FileViewer] Failed to load PDF:", err, { fileId });
      }
    };

    loadPDF();
  }, [fileId]);

  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current || !canvasRef.current) return;

    // Create abort controller for cleanup
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const renderPage = async () => {
      try {
        const page = await pdfDocRef.current!.getPage(currentPage);

        // Check if component unmounted before proceeding
        if (abortController.signal.aborted) return;

        setLoading(true);

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

        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError((err as Error).message || "Failed to render page");
          setLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      abortController.abort();
    };
  }, [currentPage, pdfLoaded]);

  if (!fileId) return null;

  return (
    <Dialog.Root open={!!fileId} onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg w-11/12 h-5/6 flex flex-col"
          aria-describedby="pdf-viewer-description"
        >
          <Dialog.Description id="pdf-viewer-description" className="sr-only">
            PDF file viewer showing {fileName}. Use arrow keys or buttons to
            navigate pages.
          </Dialog.Description>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900 truncate">
              {fileName}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close viewer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
            {loading && (
              <div className="text-gray-500" role="status" aria-live="polite">
                Loading PDF...
              </div>
            )}
            {error && (
              <div className="text-red-600 text-center" role="alert">
                <p>Error: {error}</p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`bg-white shadow-md max-w-full max-h-full object-contain ${
                loading || error ? "hidden" : ""
              }`}
              aria-label={`Page ${currentPage} of ${totalPages}`}
            />
          </div>

          {/* Footer */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Go to previous page"
              >
                Previous
              </button>
              <span
                className="text-sm text-gray-600"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Go to next page"
              >
                Next
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default FileViewerDialog;
