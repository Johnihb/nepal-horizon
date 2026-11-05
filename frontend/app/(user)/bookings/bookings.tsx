"use client";

import Link from "next/link";

import JourneyPlate from "@/components/site/journey-plate";
import NextTrek from "@/components/site/next-trek";
import { EmptyState, ErrorNote, LoadingBlock } from "@/components/site/states";
import { useBookedPackages } from "@/hooks/get";
import { useSession } from "@/hooks/session";
import { toApiError } from "@/lib/api";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import type { BookingStatus, TravelBooking } from "@/types/package";

/** The kit already ships a badge per status — reuse it, do not invent colours. */
const BADGE: Record<BookingStatus, string> = {
  PENDING: "nh-badge nh-badge-pending",
  CONFIRMED: "nh-badge nh-badge-confirmed",
  CANCELLED: "nh-badge nh-badge-cancelled",
};

/**
 * One reservation. The row opens in place — a traveller checking their
 * departure should not be bounced to the journey list to read the details.
 */
function BookingRow({ booking }: { booking: TravelBooking }) {
  const journey = booking.package;

  return (
    <details className="nh-booking">
      <summary className="nh-booking-row">
        <JourneyPlate
          media={journey.media}
          label={journey.location}
          alt={`${journey.name} — ${journey.location}`}
          className="nh-row-plate"
        />

        <div className="min-w-0">
          <h2 className="nh-row-name">{journey.name}</h2>
          <p className="nh-row-sub nh-meta">
            {journey.location} · {formatDate(booking.travelDate)}
          </p>
          <span className={`${BADGE[booking.status]} mt-3`}>{booking.status}</span>
        </div>

        <p className="nh-row-place nh-meta min-w-0 truncate">{journey.location}</p>

        <p className="nh-row-price nh-meta whitespace-nowrap">
          {formatDate(booking.travelDate)}
          <span className="block opacity-60">
            {formatNumber(booking.totalPeople)} travelling
          </span>
        </p>

        <span className="nh-row-arrow" aria-hidden="true">
          ⌄
        </span>
      </summary>

      <div className="nh-booking-body">
        <div>
          <p className="nh-stat-label">Status</p>
          <span className={`${BADGE[booking.status]} mt-2`}>{booking.status}</span>
        </div>
        <div>
          <p className="nh-stat-label">Travel date</p>
          <p className="mt-2">{formatDate(booking.travelDate)}</p>
        </div>
        <div>
          <p className="nh-stat-label">Party</p>
          <p className="nh-num mt-2">{formatNumber(booking.totalPeople)}</p>
        </div>
        <div>
          <p className="nh-stat-label">Total</p>
          <p className="mt-2">{formatMoney(booking.price)}</p>
        </div>
        <div>
          <p className="nh-stat-label">Requested</p>
          <p className="mt-2">{formatDate(booking.createdAt)}</p>
        </div>
        <div>
          <p className="nh-stat-label">Journey</p>
          <Link className="nh-btn nh-btn-ghost nh-btn-sm mt-2" href={`/package/${journey.id}`}>
            View the journey
          </Link>
        </div>
      </div>
    </details>
  );
}

export default function Bookings() {
  const { user, isPending: sessionPending } = useSession();
  const { data, error, isError, isLoading } = useBookedPackages();

  const bookings = data ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((booking) => booking.status === "CONFIRMED")
    .filter((booking) => booking.travelDate.slice(0, 10) >= today)
    .sort((a, b) => a.travelDate.localeCompare(b.travelDate));
  const nextBooking = upcoming[0];

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
            Every departure you have asked us to hold a place on. Open a booking to see its
            status, the dates and what it costs.
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
        ) : !bookings.length ? (
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
          <>
            {nextBooking ? <NextTrek booking={nextBooking} /> : null}
            <div className="nh-ledger mt-10">
              {bookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
