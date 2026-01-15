type PDFPagesProps = {
  canvases: HTMLCanvasElement[];
  zoom: number;
  pageRefs: React.MutableRefObject<HTMLDivElement[]>;
};

/**
 * Component to render PDF pages with zoom and scroll support
 */
export function PDFPages({ canvases, zoom, pageRefs }: PDFPagesProps) {
  return (
    <div
      style={{
        display: "inline-block",
        width: `${100 / zoom}%`,
        minWidth: "100%",
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          paddingTop: "2rem",
        }}
      >
        {canvases.map((canvas, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) pageRefs.current[index] = el;
            }}
            className="bg-white mb-4"
          >
            <div
              ref={(el) => {
                if (el && !el.hasChildNodes()) {
                  el.appendChild(canvas);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
