import { cn } from "@/lib/utils";
import type { PackageMedia } from "@/types/package";

/**
 * The contour drawing from the landing route. When a journey has no
 * photograph yet, this stands in for it rather than a stock image from the
 * wrong continent.
 */
function Contour({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      <path
        d="M20 260 C80 240 120 200 160 180 C200 160 240 100 280 80 C310 65 340 40 380 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        opacity="0.45"
      />
      <path
        d="M20 260 L60 220 L100 235 L140 190 L180 200 L220 150 L260 160 L300 110 L340 100 L380 30"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.28"
      />
      <path
        d="M20 260 C60 250 100 230 140 210 C180 190 200 140 240 120 C280 100 320 60 380 30 L380 260 Z"
        fill="currentColor"
        opacity="0.05"
      />
      <circle cx="20" cy="260" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="280" cy="80" r="4" fill="currentColor" opacity="0.45" />
      <circle cx="380" cy="30" r="6" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

/**
 * A journey's photograph, or the drawn contour when none has been uploaded
 * yet. Never a placeholder photo of somewhere else.
 */
export default function JourneyPlate({
  media,
  label,
  alt,
  className,
  priority = false,
}: {
  media?: PackageMedia[];
  /** Printed over the contour — the destination. */
  label?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const image = media?.find((item) => item?.url);

  if (image) {
    return (
      <div className={cn("nh-frame", className)}>
        <img
          src={image.url}
          alt={alt ?? "Journey photograph"}
          // The frame's own aspect ratio governs the box; these two only give
          // the browser an intrinsic size before the stylesheet lands.
          width={1200}
          height={900}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("nh-frame nh-band-ink relative grid place-items-center overflow-hidden", className)}
    >
      <Contour className="text-white" />
      {label ? (
        <span aria-hidden="true" className="nh-meta relative z-10 px-3 text-center text-white/75">
          {label}
        </span>
      ) : null}
    </div>
  );
}
