"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import JourneyRow from "@/components/site/journey-row";
import JourneyPlate from "@/components/site/journey-plate";
import { EmptyState, ErrorNote, LoadingBlock } from "@/components/site/states";
import { usePackagePagination } from "@/hooks/get";
import { toApiError } from "@/lib/api";
import { formatMoney } from "@/lib/format";

/** The page before this one, or null when this is the first. */
function retreatHref(page: number): string | null {
  if (page <= 0) return null;
  return page === 1 ? "/packages" : `/packages?page=${page - 1}`;
}

/** The page after this one, or null when this is the last. */
function nextHref(nextPage: number | null): string | null {
  return nextPage === null ? null : `/packages?page=${nextPage}`;
}

function Ledger() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);

  const { data, error, isError, isLoading, isFetching } = usePackagePagination(page);
  const journeys = data?.packages ?? [];
  const nextPage = data?.nextPage ?? null;

  const [filter, setFilter] = useState<string | null>(null);

  if (isError) {
    return (
      <ErrorNote
        title="The ledger did not open"
        message={toApiError(error).message}
        action={
          <button type="button" className="nh-btn nh-btn-ghost nh-btn-sm" onClick={() => router.refresh()}>
            Try Again
          </button>
        }
      />
    );
  }

  if (isLoading) {
    return <LoadingBlock rows={3} label="Loading journeys…" />;
  }

  if (!journeys.length) {
    return (
      <EmptyState
        eyebrow="No journeys"
        title={
          <>
            Nothing is <em>open</em> right now.
          </>
        }
        description="We publish a small number of departures each season. Leave your details and the field office will tell you when the next one opens."
        action={
          retreatHref(page) ? (
            <Link className="nh-btn nh-btn-ink nh-btn-sm" href={retreatHref(page) as string}>
              ← Retreat
            </Link>
          ) : (
            <a className="nh-btn nh-btn-ink nh-btn-sm" href="mailto:keshwor12@gmail.com">
              Tell Us Where You’re Drawn
            </a>
          )
        }
      />
    );
  }

  const locations = Array.from(new Set(journeys.map((j) => j.location))).sort();
  const filtered = filter ? journeys.filter((j) => j.location === filter) : journeys;
  const featured = !filter && page === 0 ? journeys[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

  const back = retreatHref(page);
  const forward = nextHref(nextPage);

  return (
    <>
      {locations.length > 1 ? (
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter by region">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`nh-btn nh-btn-sm ${filter === null ? "nh-btn-ink" : "nh-btn-ghost"}`}
            aria-pressed={filter === null}
          >
            All
          </button>
          {locations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setFilter(loc)}
              className={`nh-btn nh-btn-sm ${filter === loc ? "nh-btn-ink" : "nh-btn-ghost"}`}
              aria-pressed={filter === loc}
            >
              {loc}
            </button>
          ))}
        </div>
      ) : null}

      {featured ? (
        <Link
          href={`/package/${featured.id}`}
          className="group mb-12 grid gap-6 border border-[color:var(--nh-page-line)] p-6 transition-colors hover:bg-[color:var(--nh-page-invert-bg)] hover:text-[color:var(--nh-page-invert-fg)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
        >
          <div className="min-w-0">
            <p className="nh-eyebrow nh-eyebrow-row">
              <span>This Season</span>
              <span className="nh-num">01</span>
            </p>
            <h2 className="nh-display-1 mt-6">{featured.name}</h2>
            <p className="nh-page-lede mt-4 max-w-md">{featured.location}</p>
            <p className="nh-meta mt-6">{formatMoney(featured.price)} per person</p>
          </div>
          <JourneyPlate
            media={featured.media}
            label={featured.location}
            alt={`${featured.name} — ${featured.location}`}
            className="aspect-[16/9] w-full"
          />
        </Link>
      ) : null}

      <div className="nh-ledger">
        {rest.map((journey) => (
          <JourneyRow key={journey.id} journey={journey} />
        ))}
      </div>

      <nav
        className="mt-12 flex items-center justify-between border-t border-[color:var(--nh-page-line)] pt-8"
        aria-label="Journey pagination"
      >
        {back ? (
          <Link className="nh-btn nh-btn-ghost nh-btn-sm" href={back}>
            ← Retreat
          </Link>
        ) : (
          <span className="nh-btn nh-btn-ghost nh-btn-sm opacity-40" aria-disabled="true">
            ← Retreat
          </span>
        )}

        <span className="nh-meta hidden sm:inline">
          Page {page + 1}
          {nextPage !== null ? ` of ${nextPage + 1}+` : ""}
        </span>

        {forward ? (
          <Link className="nh-btn nh-btn-ghost nh-btn-sm" href={forward}>
            Next journey →
          </Link>
        ) : (
          <span className="nh-btn nh-btn-ghost nh-btn-sm opacity-40" aria-disabled="true">
            Next journey →
          </span>
        )}
      </nav>

      {isFetching ? (
        <p className="nh-meta mt-4" role="status">
          Refreshing…
        </p>
      ) : null}
    </>
  );
}

export default function Home() {
  return (
    <>
      <section className="nh-page-hero">
        <div className="nh-page-hero-inner">
          <p className="nh-eyebrow nh-eyebrow-row">
            <span>Journeys</span>
            <span className="nh-num">01</span>
          </p>

          <h1 className="nh-display-1 mt-8 max-w-4xl">
            Every Route We
            <br />
            Currently <em>Run</em>
          </h1>

          <p className="nh-page-lede mt-6">
            A short list on purpose. Each departure is walked, timed and priced by the
            same people who guide it.
          </p>
        </div>
      </section>

      <div className="nh-page-main">
        <Suspense fallback={<LoadingBlock rows={3} label="Loading journeys…" />}>
          <Ledger />
        </Suspense>
      </div>
    </>
  );
}
