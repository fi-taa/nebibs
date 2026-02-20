"use client";

function CubeSvg({
  variant,
  className,
}: {
  variant: "primary" | "secondary";
  className?: string;
}) {
  const c = variant === "primary" ? "var(--primary)" : "var(--secondary)";
  const fillOp = variant === "primary" ? { top: 0.38, right: 0.28, left: 0.45 } : { top: 0.4, right: 0.3, left: 0.48 };
  return (
    <svg
      viewBox="-4 -18 56 80"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 0 28 L 24 -14 L 48 14 L 24 56 Z" fill={c} fillOpacity={fillOp.top} stroke={c} strokeWidth="2.5" strokeOpacity="0.85" />
      <path d="M 24 -14 L 48 14 L 48 56 L 24 28 Z" fill={c} fillOpacity={fillOp.right} stroke={c} strokeWidth="2.5" strokeOpacity="0.85" />
      <path d="M 0 28 L 24 28 L 48 56 L 24 56 Z" fill={c} fillOpacity={fillOp.left} stroke={c} strokeWidth="2.5" strokeOpacity="0.85" />
    </svg>
  );
}

export function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute -left-1/4 top-0 h-[80vh] w-[80vw] rounded-full bg-primary/15 blur-[100px] animate-bg-float dark:bg-primary/20" />
      <div
        className="absolute -right-1/4 top-1/4 h-[60vh] w-[60vw] rounded-full bg-secondary/12 blur-[80px] animate-bg-float-reverse dark:bg-secondary/15"
        style={{ animationDelay: "-2s" }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[50vh] w-[70vw] -translate-x-1/2 rounded-full bg-primary/10 blur-[90px] animate-bg-float dark:bg-primary/15"
        style={{ animationDelay: "-4s" }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="iso-floor"
            width="80"
            height="46"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(0,0) scale(1.4)"
          >
            <g stroke="var(--primary)" strokeWidth="1.2" strokeOpacity="0.5" fill="none">
              <path d="M 0 23 L 40 0 L 80 23 L 40 46 Z" />
              <path d="M 40 0 L 40 46 M 0 23 L 80 23 M 40 0 L 40 46" />
            </g>
          </pattern>
          <pattern
            id="iso-lines"
            width="120"
            height="69"
            patternUnits="userSpaceOnUse"
          >
            <g stroke="var(--secondary)" strokeWidth="0.9" strokeOpacity="0.4" fill="none">
              <line x1="0" y1="34.5" x2="120" y2="34.5" />
              <line x1="30" y1="0" x2="30" y2="69" />
              <line x1="60" y1="0" x2="60" y2="69" />
              <line x1="90" y1="0" x2="90" y2="69" />
              <path d="M 0 34.5 L 60 0 M 60 0 L 120 34.5 M 60 69 L 0 34.5 M 60 69 L 120 34.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#iso-floor)" className="animate-pattern-shift" style={{ opacity: 0.85 }} />
        <rect width="100%" height="100%" fill="url(#iso-lines)" className="animate-pattern-shift-reverse" style={{ opacity: 0.7 }} />
      </svg>

      <div className="absolute left-0 top-0 h-full w-full">
        <div className="cube-path-1 absolute left-0 top-0 h-28 w-24 min-h-[112px] min-w-[96px] sm:h-32 sm:w-28 sm:min-h-[128px] sm:min-w-[112px] will-change-transform">
          <CubeSvg variant="primary" className="h-full w-full" />
        </div>
        <div className="cube-path-2 absolute left-0 top-0 h-24 w-20 min-h-[96px] min-w-[80px] sm:h-28 sm:w-24 sm:min-h-[112px] sm:min-w-[96px] will-change-transform" style={{ animationDelay: "2s" }}>
          <CubeSvg variant="secondary" className="h-full w-full" />
        </div>
        <div className="cube-path-3 absolute left-0 top-0 h-20 w-16 min-h-[80px] min-w-[64px] sm:h-24 sm:w-20 sm:min-h-[96px] sm:min-w-[80px] will-change-transform" style={{ animationDelay: "5s" }}>
          <CubeSvg variant="primary" className="h-full w-full" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  );
}
