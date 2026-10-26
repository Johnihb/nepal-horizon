"use client";

import Link from "next/link";

import JourneyRow from "@/components/site/journey-row";
import { EmptyState, ErrorNote, LoadingBlock } from "@/components/site/states";
import { useBookedPackages } from "@/hooks/get";
import { useSession } from "@/hooks/session";
import { toApiError } from "@/lib/api";

export default function Bookings() {
  const { user, isPending: sessionPending } = useSession();
  const { data, error, isError, isLoading } = useBookedPackages();

  const journeys = data ?? [];

  return (
    <>
      <section className="nh-page-hero">
        <div className="nh-page-hero-inner">
          <p className="nh-eyebrow nh-eyebrow-row">
            <span>My Bookings</span>
            <span className="nh-num">01</span>
          </p>
          <h1 className="nh-display-1 mt-8 max-w-3xl">
            Journeys You Are
            <br />
            <em>Walking</em>
          </h1>
          <p className="nh-page-lede mt-6">
            Every departure you have asked us to hold a place on. The field office writes to
            you with the confirmed dates.
          </p>
        </div>
      </section>

      <div className="nh-page-main">
        {sessionPending ? (
          <LoadingBlock rows={2} label="Checking your bookings…" />
        ) : !user ? (
          <EmptyState
            eyebrow="Sign In Required"
            title={
              <>
                Your bookings live <em>behind</em> a sign in.
              </>
            }
            description="Sign in and every journey you have requested will be listed here, with the dates we have confirmed."
            action={
              <Link className="nh-btn nh-btn-ink nh-btn-sm" href="/login">
                Sign In
              </Link>
            }
          />
        ) : isError ? (
          <ErrorNote
            title="We could not open your bookings"
            message={toApiError(error).message}
          />
        ) : isLoading ? (
          <LoadingBlock rows={2} label="Loading your bookings…" />
        ) : !journeys.length ? (
          <EmptyState
            eyebrow="Nothing Yet"
            title={
              <>
                You have not held a place on <em>anything</em>.
              </>
            }
            description="Have a look at the routes we are running this season and request the one that pulls you."
            action={
              <Link className="nh-btn nh-btn-ink nh-btn-sm" href="/packages">
                Browse Journeys
              </Link>
            }
          />
        ) : (
          <div className="nh-ledger">
            {journeys.map((journey) => (
              <JourneyRow key={journey.id} journey={journey} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
