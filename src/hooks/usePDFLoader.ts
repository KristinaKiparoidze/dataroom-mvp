import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFJS_WORKER_URL, PDF_FILE_KEY_PREFIX } from "../constants";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

type UsePDFLoaderState = {
  totalPages: number;
  loading: boolean;
  error: string | null;
  pdfLoaded: boolean;
  pdfDocRef: React.MutableRefObject<pdfjsLib.PDFDocumentProxy | null>;
};

/**
 * Hook to load PDF documents from localStorage and manage PDF.js initialization
 *
 * Handles:
 * - Retrieving base64-encoded PDF from localStorage
 * - Initializing PDF.js worker for document parsing
 * - Extracting total page count
 * - Managing loading and error states
 * - Preventing memory leaks with AbortController for unmounted components
 *
 * @param fileId - The file ID to load from localStorage (e.g., "file-abc123")
 * @returns Object containing:
 *   - totalPages: Number of pages in the PDF (0 if not loaded)
 *   - loading: Boolean indicating if PDF is being loaded
 *   - error: Error message if load fails, null otherwise
 *   - pdfLoaded: Boolean indicating successful PDF load
 *   - pdfDocRef: Mutable ref to the PDF document for use in rendering
 *
 * @example
 * const { totalPages, loading, error, pdfLoaded, pdfDocRef } = usePDFLoader(fileId);
 */
export function usePDFLoader(fileId: string | null): UsePDFLoaderState {
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!fileId) return;

    // Create abort controller for this effect
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        // Don't reset pdfLoaded here - it will cause glitching

        const stored = localStorage.getItem(`${PDF_FILE_KEY_PREFIX}${fileId}`);
        if (!stored) {
          if (!abortController.signal.aborted) {
            setError("File not found");
            setPdfLoaded(false);
          }
          setLoading(false);
          return;
        }

        const arrayBuffer = Uint8Array.from(atob(stored), (c) =>
          c.charCodeAt(0)
        ).buffer;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        // Only update state if component is still mounted
        if (!abortController.signal.aborted) {
          pdfDocRef.current = pdf;
          setTotalPages(pdf.numPages);
          setPdfLoaded(true);
          setLoading(false);
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (!abortController.signal.aborted) {
          setError((err as Error).message || "Failed to load PDF");
          setPdfLoaded(false);
          setLoading(false);
        }
      }
    };

    loadPDF();

    // Cleanup: abort pending operations on unmount
    return () => {
      abortController.abort();
      abortControllerRef.current = null;
    };
  }, [fileId]);

  return { totalPages, loading, error, pdfLoaded, pdfDocRef };
}
