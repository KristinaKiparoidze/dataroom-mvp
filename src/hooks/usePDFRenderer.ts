import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDF_PAGE_WIDTH_RATIO } from "../constants";

type UsePDFRendererState = {
  canvases: HTMLCanvasElement[];
  loading: boolean;
  error: string | null;
  pageRefs: React.MutableRefObject<HTMLDivElement[]>;
};

/**
 * Hook to render PDF pages to canvas elements and manage cleanup
 *
 * Handles:
 * - Rendering each PDF page to individual canvas elements
 * - Calculating appropriate scale to fit container width
 * - Managing page refs for scrolling to specific pages
 * - Memory cleanup by clearing canvas contexts and removing DOM nodes
 *
 * @param pdfLoaded - Boolean indicating if PDF is fully loaded
 * @param pdfDocRef - Mutable ref to PDF document from usePDFLoader
 * @param totalPages - Total number of pages to render
 * @param containerRef - Mutable ref to the container element (used for width calculation)
 * @returns Object containing:
 *   - canvases: Array of rendered canvas elements (one per page)
 *   - loading: Boolean indicating if pages are being rendered
 *   - error: Error message if rendering fails, null otherwise
 *   - pageRefs: Mutable ref array to page divs for scroll navigation
 *
 * @example
 * const { canvases, loading, error, pageRefs } = usePDFRenderer(
 *   pdfLoaded,
 *   pdfDocRef,
 *   totalPages,
 *   containerRef
 * );
 */
export function usePDFRenderer(
  pdfLoaded: boolean,
  pdfDocRef: React.MutableRefObject<pdfjsLib.PDFDocumentProxy | null>,
  totalPages: number,
  containerRef: React.MutableRefObject<HTMLDivElement | null>
): UsePDFRendererState {
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRefs = useRef<HTMLDivElement[]>([]);

  // Render all pages
  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current || !containerRef.current) return;

    const renderAllPages = async () => {
      try {
        setLoading(true);
        const newCanvases: HTMLCanvasElement[] = [];
        const containerWidth = containerRef.current!.clientWidth;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page = await pdfDocRef.current!.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });

          // Calculate scale to fit width with padding
          const baseScale =
            (containerWidth * PDF_PAGE_WIDTH_RATIO) / viewport.width;

          const scaledViewport = page.getViewport({ scale: baseScale });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;

          await page.render({
            canvasContext: ctx,
            viewport: scaledViewport,
          }).promise;

          newCanvases.push(canvas);
        }

        setCanvases(newCanvases);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message || "Failed to render pages");
        setLoading(false);
      }
    };

    renderAllPages();
  }, [pdfLoaded, totalPages]);

  // Cleanup canvases on unmount or change
  useEffect(() => {
    return () => {
      canvases.forEach((canvas) => {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        // Clear canvas memory
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        // Reset canvas dimensions
        canvas.width = 0;
        canvas.height = 0;
      });
    };
  }, [canvases]);

  return { canvases, loading, error, pageRefs };
}
