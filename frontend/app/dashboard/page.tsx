"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AnalyticsTable } from "@/components/dashboard/analytics-table";
import { LineChart } from "@/components/dashboard/line-chart";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { formatShortDate, toDate } from "@/components/dashboard/chart-config";
import {
  DEFAULT_RANGE,
  isAnalyticsRange,
  type AnalyticsRange,
} from "@/components/dashboard/types";
import PageHero from "@/components/site/page-hero";
import SiteShell from "@/components/site/site-shell";
import { EmptyState, ErrorNote, LoadingBlock } from "@/components/site/states";
import { useBookingAnalytics } from "@/hooks/get";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

/** The windows the console can read. The value is the URL contract. */
const RANGE_OPTIONS: Array<{ id: AnalyticsRange; label: string }> = [
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
];

/** Read the window out of the query string, falling back to days. */
function readRange(value: string | null): AnalyticsRange {
  return isAnalyticsRange(value) ? value : DEFAULT_RANGE;
}

export default function Page() {
  return (
    <SiteShell tone="ink">
      <PageHero
        eyebrow="Field Office"
        index="01"
        title={
          <>
            Booking <em>Ledger</em>
          </>
        }
        lede="Every reservation, traveller and dollar recorded against the calendar. Read the window by day, by week or by month."
      />

      <div className="nh-page-main">
        <Suspense fallback={<LoadingBlock rows={1} label="Loading the booking ledger…" />}>
          <AnalyticsConsole />
        </Suspense>
      </div>
    </SiteShell>
  );
}

/**
 * The console itself — everything below the fold that reads the query string.
 * It lives under a Suspense boundary because `useSearchParams` opts the tree
 * out of prerendering.
 */
function AnalyticsConsole() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const range = readRange(searchParams.get("range"));
  const { data, isPending, isError, error } = useBookingAnalytics(range);

  const points = data ?? [];
  const failure = isError ? toApiError(error) : null;
  // The API answers 404 when a window holds no bookings — that is an empty
  // ledger, not a broken one.
  const noRecords = failure?.status === 404 || (!isPending && !isError && points.length === 0);
  const unavailable = Boolean(failure) && failure?.status !== 404;

  function selectRange(next: AnalyticsRange) {
    if (next === range) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const windowLabel = describeWindow(points.map((point) => point.timestamp), range, {
    isPending,
    isError: unavailable,
  });

  return (
    <div className="space-y-12">
      <div className="nh-border flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <p className="nh-meta" role="status">
          {windowLabel}
        </p>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Reporting window">
          {RANGE_OPTIONS.map((option) => {
            const active = option.id === range;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectRange(option.id)}
                className={cn(
                  "nh-btn nh-btn-ghost nh-btn-sm",
                  active && "aria-pressed:bg-white aria-pressed:text-black",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {isPending ? <LoadingBlock rows={1} label="Loading the booking ledger…" /> : null}

      {isError && failure && failure.status !== 404 ? (
        <ErrorNote
          title="The ledger did not load"
          message={
            failure.status === 401
              ? "Your session has expired. Sign in to the Field Office to read the ledger."
              : failure.message
          }
          action={
            failure.status === 401 ? (
              <Link className="nh-link" href="/login">
                Sign in to the Field Office
              </Link>
            ) : null
          }
        />
      ) : null}

      {noRecords ? (
        <EmptyState
          eyebrow="Nothing recorded"
          title="No bookings in this window yet."
          description="The ledger fills itself as travellers book. Read a wider window, or come back once the first reservation lands."
          action={
            <div className="flex flex-wrap gap-2">
              {RANGE_OPTIONS.filter((option) => option.id !== range).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectRange(option.id)}
                  className="nh-btn nh-btn-ghost nh-btn-sm"
                >
                  Read by {option.label.toLowerCase()}
                </button>
              ))}
            </div>
          }
        />
      ) : null}

      {!isPending && !isError && points.length > 0 ? (
        <>
          <StatsCards data={points} />

          <section aria-labelledby="trend-heading">
            <h2 id="trend-heading" className="nh-eyebrow nh-eyebrow-row">
              <span>Trend</span>
              <span className="nh-num" aria-hidden="true">
                02
              </span>
            </h2>

            <div className="mt-6">
              <LineChart
                config={{ range }}
                data={points}
                title="Bookings, revenue and travellers"
                subtitle="Every period in the selected window"
              />
            </div>
          </section>

          <section aria-labelledby="points-heading">
            <h2 id="points-heading" className="nh-eyebrow nh-eyebrow-row">
              <span>Points</span>
              <span className="nh-num" aria-hidden="true">
                03
              </span>
            </h2>

            <div className="mt-6">
              <AnalyticsTable data={points} range={range} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

/** "12 records · 12 Jul 2026 — 18 Jul 2026" */
function describeWindow(
  timestamps: string[],
  range: AnalyticsRange,
  state: { isPending: boolean; isError: boolean },
): string {
  if (state.isPending) return "Reading the ledger";
  if (state.isError) return "Ledger unavailable";
  if (!timestamps.length) return "No records in this window";

  const first = toDate(timestamps[0]);
  const last = toDate(timestamps[timestamps.length - 1]);
  const count = `${timestamps.length} ${timestamps.length === 1 ? "record" : "records"}`;

  if (!first || !last) return `${count} in this window`;

  return `${count} · ${formatShortDate(first, range)} — ${formatShortDate(last, range)}`;
}
