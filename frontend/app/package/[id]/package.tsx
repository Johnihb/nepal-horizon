"use client";

import Link from "next/link";

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

export default function PackageDetail({ id }: { id: string }) {
  const { data: journey, error, isError, isLoading } = useFetchPackageById(id);

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
      <section className="relative">
        <div className="relative h-[62svh] min-h-[24rem]">
          <JourneyPlate
            media={journey.media}
            label={journey.location}
            alt={`${journey.name}, ${journey.location}`}
            className="h-full border-0"
            priority
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_46%,rgba(0,0,0,0.12)_100%)]"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 px-[clamp(1.25rem,9vw,10.5rem)] pb-[clamp(1.75rem,4vw,3.25rem)]">
            <p className="nh-eyebrow text-white/70">
              <span className="text-white">{journey.location}</span>
              <span aria-hidden="true">✦</span>
              <span>Nepal</span>
            </p>
            <h1 className="nh-display-1 mt-6 max-w-3xl text-white">{journey.name}</h1>
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
              <Link className="nh-link mt-5 inline-block" href="/packages">
                ← Back to all journeys
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
