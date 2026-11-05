import Link from "next/link";

import JourneyPlate from "@/components/site/journey-plate";
import { formatMoney } from "@/lib/format";
import type { TravelPackage } from "@/types/package";

/**
 * One journey in the ledger. In compare mode a native checkbox is overlaid on
 * the plate so selection is a real form control (reliable, accessible).
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

  return (
    <Link className={`nh-row ${compared ? "nh-row--compared" : ""}`} href={`/package/${journey.id}`}>
      {compareMode ? (
        <input
          type="checkbox"
          className="nh-compare-check"
          checked={compared}
          aria-label={`Compare ${journey.name}`}
          onChange={() => onToggleCompare?.(journey.id)}
          onClick={(event) => event.stopPropagation()}
        />
      ) : null}

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
  );
}