"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import JourneyPlate from "@/components/site/journey-plate";
import { ErrorNote, LoadingBlock } from "@/components/site/states";
import { useFetchPackageById } from "@/hooks/get";
import { formatDate, formatMoney } from "@/lib/format";
import { toApiError } from "@/lib/api";

const INCLUDED = [
  {
    num: "01",
    title: (
      <>
        Guides Who
        <br />
        Know When To <em>Wait.</em>
      </>
    ),
    body: "Local leaders with mountain instincts, not just a timetable.",
  },
  {
    num: "02",
    title: (
      <>
        Room For The
        <br />
        <em>Unexpected.</em>
      </>
    ),
    body: "Rest days and open plans for weather, conversations & side paths.",
  },
  {
    num: "03",
    title: (
      <>
        Small Groups.
        <br />
        Wide <em>Horizons.</em>
      </>
    ),
    body: "Eight people at most. Enough company, never a crowd.",
  },
];

/**
 * A small, deterministic altitude profile for the hero. There is no altitude
 * column on Package yet, so the line is derived from the journey id — varied
 * enough to read as a real route, stable across renders.
 * # ponytail: synthetic profile, replace with real altitude data when added.
 */
function altitudePoints(id: string): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const points: number[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const base = Math.sin(t * Math.PI) * 0.85 + 0.05;
    const wobble = (((seed >> (i % 8)) & 7) - 3) * 0.04;
    points.push(Math.max(0.05, Math.min(0.98, base + wobble)));
  }
  return points;
}

function AltitudeSparkline({ id, label }: { id: string; label: string }) {
  const points = altitudePoints(id);
  const width = 220;
  const height = 48;
  const pad = 4;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (width - pad * 2));
  const ys = points.map((p) => height - pad - p * (height - pad * 2));
  const d = points
    .map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");
  const peakIndex = points.indexOf(Math.max(...points));
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-56 text-white/80"
      role="img"
      aria-label={`Altitude profile for ${label}`}
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[peakIndex]} cy={ys[peakIndex]} r={2.5} fill="currentColor" />
    </svg>
  );
}

export default function PackageDetail({ id }: { id: string }) {
  const { data: journey, error, isError, isLoading } = useFetchPackageById(id);

  const heroRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isError) {
    return (
      <div className="nh-page-main">
        <ErrorNote
          title="We could not open that journey"
          message={toApiError(error).message}
          action={
            <Link className="nh-btn nh-btn-ghost nh-btn-sm" href="/packages">
              ← Back to all journeys
            </Link>
          }
        />
      </div>
    );
  }

  if (isLoading || !journey) {
    return (
      <div className="nh-page-main">
        <LoadingBlock rows={2} label="Loading journey…" />
      </div>
    );
  }

  const gallery = journey.media?.slice(1) ?? [];
  const price = formatMoney(journey.price);

  return (
    <>
      <section className="relative" ref={heroRef}>
        <div className="relative h-[62svh] min-h-[24rem]">
          <JourneyPlate
            media={journey.media}
            label={journey.location}
            alt={`${journey.name}, ${journey.location}`}
            className="h-full border-0 nh-ken-burns"
            priority
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_46%,rgba(0,0,0,0.12)_100%)]"
            aria-hidden="true"
          />
          {/* Vertical scrim: the heading sits in the lower third, where the
              sideways gradient is at its thinnest. */}
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,transparent_38%,rgba(0,0,0,0.72)_100%)]"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 px-[clamp(1.25rem,9vw,10.5rem)] pb-[clamp(1.75rem,4vw,3.25rem)]">
            <p className="nh-eyebrow text-white/70">
              <span className="text-white">{journey.location}</span>
              <span aria-hidden="true">✦</span>
              <span>{price} per person</span>
            </p>
            <h1 className="nh-display-1 mt-6 max-w-3xl text-white">{journey.name}</h1>
            <div className="mt-4">
              <AltitudeSparkline id={journey.id} label={journey.name} />
            </div>
          </div>
        </div>
      </section>

      <div className="nh-page-main">
        <dl className="grid gap-px border border-[color:var(--nh-page-line)] bg-[color:var(--nh-page-line)] sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Where", value: journey.location || "—" },
            { label: "Per Person", value: price },
            { label: "Published", value: formatDate(journey.createdAt) },
            { label: "Photographs", value: String(journey.media?.length ?? 0) },
          ].map((fact) => (
            <div key={fact.label} className="bg-[color:var(--nh-page-bg)] p-5">
              <dt className="nh-meta">{fact.label}</dt>
              <dd className="nh-display-3 mt-3">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.75fr)] lg:gap-16">
          <div className="min-w-0">
            <p className="nh-eyebrow">The Route</p>
            <p className="mt-6 max-w-2xl text-[1.05rem] leading-8">
              {journey.description ||
                "Details for this departure are still being written. The field office will fill them in before the route opens for booking."}
            </p>

            {gallery.length > 0 ? (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {gallery.map((image) => (
                  <JourneyPlate
                    key={image.public_id}
                    media={[image]}
                    alt={`${journey.name} — photograph`}
                    className="aspect-[4/3]"
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-16 border-t border-[color:var(--nh-page-line)] pt-12">
              <p className="nh-eyebrow nh-eyebrow-row">
                <span>Every Departure Includes</span>
                <span className="nh-num">01—03</span>
              </p>
              <div className="mt-10 grid gap-px bg-[color:var(--nh-page-line)] sm:grid-cols-3">
                {INCLUDED.map((item) => (
                  <div key={item.num} className="bg-[color:var(--nh-page-bg)] p-6">
                    <span className="nh-meta">{item.num}</span>
                    <h2 className="nh-display-3 mt-6">{item.title}</h2>
                    <p className="nh-muted mt-4 text-[0.92rem] leading-6">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="nh-panel">
              <p className="nh-meta">Departure Price</p>
              <p className="nh-display-2 mt-3">{price}</p>
              <p className="nh-meta mt-1">per person</p>

              <hr className="nh-rule my-7" />

              <dl className="space-y-5">
                <div>
                  <dt className="nh-meta">Where</dt>
                  <dd className="mt-1.5">{journey.location || "—"}</dd>
                </div>
                <div>
                  <dt className="nh-meta">Group Size</dt>
                  <dd className="mt-1.5">Eight guests maximum</dd>
                </div>
                <div>
                  <dt className="nh-meta">Published</dt>
                  <dd className="mt-1.5">{formatDate(journey.createdAt)}</dd>
                </div>
              </dl>

              <Link className="nh-btn nh-btn-ink mt-8 w-full" href={`/package/booking/${journey.id}`}>
                Book This Journey
              </Link>
              <p className="nh-muted mt-5 text-[0.8rem] leading-6">
                Confirmed by hand. No card charged. Permits arranged by the field office.
              </p>
              <Link className="nh-link mt-3 inline-block" href="/packages">
                ← Back to all journeys
              </Link>
            </div>
          </aside>
        </div>
      </div>
      {showSticky ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--nh-page-line)] bg-[color:var(--nh-page-bg)]/95 px-[clamp(1.25rem,9vw,10.5rem)] py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="nh-meta truncate">{journey.name}</p>
              <p className="nh-display-3">{price} <span className="nh-meta">per person</span></p>
            </div>
            <Link className="nh-btn nh-btn-ink nh-btn-sm" href={`/package/booking/${journey.id}`}>
              Book This Journey
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
