"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueries } from "@tanstack/react-query";

import { EmptyState, ErrorNote, LoadingBlock } from "@/components/site/states";
import { fetchPackage } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Difficulty, TravelPackage } from "@/types/package";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  STRENUOUS: "Strenuous",
};

function valueOrDash(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function CompareLedger({ ids }: { ids: string[] }) {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["package", id],
      queryFn: () => fetchPackage(id),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const journeys = queries
    .map((query) => query.data)
    .filter((journey): journey is TravelPackage => Boolean(journey));

  if (isError) {
    return (
      <ErrorNote
        title="We could not open those journeys"
        message="One or more of the selected journeys is no longer available."
        action={
          <Link className="nh-btn nh-btn-ghost nh-btn-sm" href="/packages">
            ← Back to all journeys
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return <LoadingBlock rows={3} label="Loading journeys…" />;
  }

  if (journeys.length < 2) {
    return (
      <EmptyState
        eyebrow="Nothing to compare"
        title={
          <>
            Pick at least <em>two</em> journeys.
          </>
        }
        description="Return to the journeys ledger and choose two or three departures to set side by side."
        action={
          <Link className="nh-btn nh-btn-ink nh-btn-sm" href="/packages">
            ← Back to all journeys
          </Link>
        }
      />
    );
  }

  const rows: Array<{ label: string; render: (journey: TravelPackage) => string }> = [
    { label: "Where", render: (journey) => journey.location || "—" },
    { label: "Per person", render: (journey) => formatMoney(journey.price) },
    {
      label: "Duration",
      render: (journey) =>
        journey.durationDays ? `${journey.durationDays} days` : "—",
    },
    {
      label: "Max altitude",
      render: (journey) =>
        journey.maxAltitude ? `${journey.maxAltitude.toLocaleString("en-US")} m` : "—",
    },
    {
      label: "Difficulty",
      render: (journey) =>
        journey.difficulty ? DIFFICULTY_LABEL[journey.difficulty] : "—",
    },
    {
      label: "Best season",
      render: (journey) => valueOrDash(journey.bestSeason),
    },
    {
      label: "Group size",
      render: (journey) =>
        journey.groupSize ? `Up to ${journey.groupSize}` : "Eight guests maximum",
    },
    { label: "Photographs", render: (journey) => String(journey.media?.length ?? 0) },
  ];

  return (
    <>
      <div className="nh-table-wrap">
        <table className="nh-table">
          <thead>
            <tr>
              <th scope="col">Field</th>
              {journeys.map((journey) => (
                <th key={journey.id} scope="col">
                  {journey.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="whitespace-nowrap">
                  {row.label}
                </th>
                {journeys.map((journey) => (
                  <td key={journey.id}>{row.render(journey)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {journeys.map((journey) => (
          <Link
            key={journey.id}
            className="nh-btn nh-btn-ink nh-btn-sm"
            href={`/package/booking/${journey.id}`}
          >
            Book {journey.name} →
          </Link>
        ))}
        <Link className="nh-btn nh-btn-ghost nh-btn-sm" href="/packages">
          ← Back to all journeys
        </Link>
      </div>
    </>
  );
}

export default function Compare() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      <section className="nh-page-hero">
        <div className="nh-page-hero-inner">
          <p className="nh-eyebrow nh-eyebrow-row">
            <span>Compare</span>
            <span className="nh-num">02</span>
          </p>
          <h1 className="nh-display-1 mt-8 max-w-4xl">
            Side by <em>Side</em>
          </h1>
          <p className="nh-page-lede mt-6">
            {ids.length
              ? `${ids.length} journey${ids.length === 1 ? "" : "ies"} set against each other.`
              : "Pick two or three journeys from the ledger to compare them."}
          </p>
        </div>
      </section>

      <div className="nh-page-main">
        {ids.length ? (
          <CompareLedger ids={ids} />
        ) : (
          <EmptyState
            eyebrow="Nothing selected"
            title={
              <>
                No journeys <em>chosen</em> yet.
              </>
            }
            description="Return to the journeys ledger, switch on compare mode and tick two or three departures."
            action={
              <Link className="nh-btn nh-btn-ink nh-btn-sm" href="/packages">
                ← Back to all journeys
              </Link>
            }
          />
        )}
      </div>
    </>
  );
}