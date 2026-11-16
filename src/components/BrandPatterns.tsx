export default function BrandPatterns() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Sparse dot grid: widely spaced, low contrast, so it reads as texture rather than a pattern. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(43, 94, 169, 0.16) 1.4px, transparent 1.6px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, black 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, black 85%)",
        }}
      />

    </div>
  );
}
