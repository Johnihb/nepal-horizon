import Link from "next/link";

import JourneyPlate from "@/components/site/journey-plate";
import { formatMoney } from "@/lib/format";
import type { TravelPackage } from "@/types/package";

/**
 * One journey in the ledger. The row inverts on hover, the way the route list
 * on the landing route does.
 */
export default function JourneyRow({ journey }: { journey: TravelPackage }) {
  const price = formatMoney(journey.price);

  return (
    <Link className="nh-row" href={`/package/${journey.id}`}>
      <JourneyPlate
        media={journey.media}
        label={journey.location}
        alt={`${journey.name} — ${journey.location}`}
        className="nh-row-plate"
      />

      <div className="min-w-0">
        <h2 className="nh-row-name">{journey.name}</h2>
        <p className="nh-row-sub nh-meta">
          {journey.location} · From {price}
        </p>
      </div>

      <p className="nh-row-place nh-meta min-w-0 truncate">{journey.location}</p>

      <p className="nh-row-price nh-meta whitespace-nowrap">
        From {price}
        <span className="block opacity-60">per person</span>
      </p>

      <span className="nh-row-arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
