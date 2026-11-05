import Link from "next/link";

import JourneyPlate from "@/components/site/journey-plate";
import { formatMoney } from "@/lib/format";
import type { TravelPackage } from "@/types/package";

/**
 * One journey in the ledger. The row inverts on hover, the way the route list
 * on the landing route does.
 *
 * `compareMode` overlays a toggle on the plate so a traveller can add the
 * journey to a side-by-side comparison without leaving the ledger. In compare
 * mode the whole row toggles selection instead of navigating, so a click
 * always lands and the tick shows immediately.
 */
export default function JourneyRow({
  journey,
  compareMode = false,
  compared = false,
  onToggleCompare,
}: {
  journey: TravelPackage;
  compareMode?: boolean;
  compared?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  const price = formatMoney(journey.price);

  function handleRowClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!compareMode) return;
    // Let the explicit "View journey" link navigate normally.
    if ((event.target as HTMLElement).closest("a.nh-row-view")) return;
    event.preventDefault();
    onToggleCompare?.(journey.id);
  }

  return (
    <div
      className={`nh-row ${compared ? "nh-row--compared" : ""} ${compareMode ? "nh-row--compare" : ""}`}
      onClick={handleRowClick}
      role={compareMode ? "button" : undefined}
      aria-pressed={compareMode ? compared : undefined}
      tabIndex={compareMode ? 0 : undefined}
      onKeyDown={(event) => {
        if (!compareMode) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggleCompare?.(journey.id);
        }
      }}
    >
      {compareMode ? (
        <button
          type="button"
          className="absolute left-2 top-2 z-20 flex h-9 w-9 items-center justify-center border border-[color:var(--nh-page-line)] bg-[color:var(--nh-page-bg)] text-sm"
          aria-pressed={compared}
          aria-label={compared ? `Remove ${journey.name} from comparison` : `Add ${journey.name} to comparison`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleCompare?.(journey.id);
          }}
        >
          {compared ? "✓" : "+"}
        </button>
      ) : null}

      <Link
        className="contents"
        href={`/package/${journey.id}`}
        onClick={(event) => {
          if (compareMode) event.preventDefault();
        }}
        tabIndex={compareMode ? -1 : undefined}
      >
        <JourneyPlate
          media={journey.media}
          label={journey.location}
          alt={`${journey.name} — ${journey.location}`}
          className="nh-row-plate"
        />

        <div className="min-w-0">
          <h2 className="nh-row-name">{journey.name}</h2>
          <p className="nh-row-sub nh-meta">
            {journey.location} · <span className="whitespace-nowrap">From {price}</span>
          </p>
        </div>

        <p className="nh-row-place nh-meta min-w-0 truncate">{journey.location}</p>

        <p className="nh-row-price nh-meta whitespace-nowrap">
          From {price}
          <span className="block opacity-60">per person</span>
        </p>

        <span className="nh-row-arrow" aria-hidden="true">
          {compareMode ? (compared ? "✓" : "+") : "↗"}
        </span>
      </Link>

      {compareMode ? (
        <Link className="nh-row-view nh-btn nh-btn-ghost nh-btn-sm absolute right-2 top-2 z-20" href={`/package/${journey.id}`}>
          View →
        </Link>
      ) : null}
    </div>
  );
}