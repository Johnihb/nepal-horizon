"use client";

import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";

import PageHero from "@/components/site/page-hero";
import { EmptyState, ErrorNote, LoadingBlock } from "@/components/site/states";
import { useAdminBookings } from "@/hooks/get";
import { useUpdateBookingStatus } from "@/hooks/post";
import { useSession } from "@/hooks/session";
import { toApiError } from "@/lib/api";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminBooking, BookingStatus } from "@/types/package";

/** The kit already ships a badge per status — reuse it, do not invent colours. */
const BADGE: Record<BookingStatus, string> = {
  PENDING: "nh-badge nh-badge-pending",
  CONFIRMED: "nh-badge nh-badge-confirmed",
  CANCELLED: "nh-badge nh-badge-neutral",
};

/** `null` is the unfiltered view. */
const FILTERS: Array<{ label: string; value: BookingStatus | null }> = [
  { label: "All", value: null },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
];

/**
 * The filter lives in the URL (`?status=PENDING`), so a refresh or a shared
 * link opens the same view, and an unknown value simply falls back to All.
 */
function useStatusFilter(): BookingStatus | null {
  const status = useSearchParams().get("status");
  return FILTERS.find((filter) => filter.value === status)?.value ?? null;
}

function BookingsHero() {
  return (
    <PageHero
      eyebrow="Console"
      index="02"
      title={
        <>
          Every Booking, <em>Settled</em> Here
        </>
      }
      lede="The queue the field office works through: who asked for which departure, what it costs, and whether it is still waiting on you."
    />
  );
}

/**
 * The gate lives above the ledger, the same way the console gates journeys:
 * no session sends the traveller to sign in, a session without the ADMIN role
 * is told why the queue stays closed.
 */
export default function AdminBookings() {
  const { user, isAdmin, isPending } = useSession();

  if (isPending) {
    return (
      <>
        <BookingsHero />
        <div className="nh-page-main">
          <LoadingBlock rows={2} label="Checking your session…" />
        </div>
      </>
    );
  }

  if (!user) redirect("/login");

  if (!isAdmin) {
    return (
      <>
        <BookingsHero />
        <div className="nh-page-main">
          <EmptyState
            eyebrow="Field Office Only"
            title={
              <>
                The queue is <em>staff</em> work.
              </>
            }
            description={`You are signed in as ${user.email}, but this account does not carry the ADMIN role.`}
            action={
              <Link className="nh-btn nh-btn-ink nh-btn-sm" href="/packages">
                Browse Journeys
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <BookingsHero />
      <BookingsLedger />
    </>
  );
}

function BookingsLedger() {
  const status = useStatusFilter();
  const { data, error, isError, isLoading, isFetching, refetch } = useAdminBookings(
    status ?? undefined,
  );

  const bookings = data ?? [];
  const pending = bookings.filter((booking) => booking.status === "PENDING").length;
  const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED").length;
  const confirmedValue = bookings.reduce(
    (total, booking) => (booking.status === "CONFIRMED" ? total + booking.price : total),
    0,
  );

  return (
    <div className="nh-page-main">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="nh-eyebrow">Bookings</p>
          <h2 className="nh-display-2 mt-4">
            The <em>Queue</em>
          </h2>
        </div>

        <button
          type="button"
          className="nh-btn nh-btn-ghost nh-btn-sm"
          onClick={() => refetch()}
        >
          Refresh
        </button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="nh-stat">
          <span className="nh-stat-label">Awaiting a decision</span>
          <span className="nh-stat-value nh-num">{formatNumber(pending)}</span>
        </div>
        <div className="nh-stat">
          <span className="nh-stat-label">Confirmed</span>
          <span className="nh-stat-value nh-num">{formatNumber(confirmed)}</span>
        </div>
        <div className="nh-stat">
          <span className="nh-stat-label">Confirmed value</span>
          <span className="nh-stat-value">{formatMoney(confirmedValue)}</span>
        </div>
      </div>

      <div
        className="mt-10 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter bookings by status"
      >
        {FILTERS.map((filter) => {
          const active = filter.value === status;

          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/bookings?status=${filter.value}` : "/admin/bookings"}
              className={cn("nh-btn nh-btn-sm", active ? "nh-btn-ink" : "nh-btn-ghost")}
              aria-current={active ? "page" : undefined}
            >
              {filter.label}
            </Link>
          );
        })}

        {isFetching && !isLoading ? (
          <span className="nh-meta ml-2" role="status">
            Refreshing…
          </span>
        ) : null}
      </div>

      <div className="mt-12">
        {isError ? (
          <ErrorNote
            title="The queue did not open"
            message={toApiError(error).message}
            action={
              <button
                type="button"
                className="nh-btn nh-btn-ghost nh-btn-sm"
                onClick={() => refetch()}
              >
                Try Again
              </button>
            }
          />
        ) : isLoading ? (
          <LoadingBlock rows={3} label="Loading bookings…" />
        ) : bookings.length === 0 ? (
          <EmptyState
            eyebrow="No bookings"
            title={
              status ? (
                <>
                  Nothing is <em>{status.toLowerCase()}</em> right now.
                </>
              ) : (
                <>
                  Nobody has held a place <em>yet</em>.
                </>
              )
            }
            description={
              status
                ? "Switch the filter back to All to see the rest of the queue."
                : "When a traveller reserves a departure it appears here, waiting to be confirmed or called off."
            }
          />
        ) : (
          <div className="nh-table-wrap">
            <table className="nh-table">
              <thead>
                <tr>
                  <th scope="col">Traveller</th>
                  <th scope="col">Journey</th>
                  <th scope="col">Travel Date</th>
                  <th scope="col">Party</th>
                  <th scope="col">Value</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <span className="block">{booking.user.name}</span>
                      <span className="nh-meta block break-all">{booking.user.email}</span>
                    </td>
                    <td>
                      <span className="block">{booking.package.name}</span>
                      <span className="nh-meta block">{booking.package.location}</span>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="block">{formatDate(booking.travelDate)}</span>
                      <span className="nh-meta block">
                        Booked {formatDate(booking.createdAt)}
                      </span>
                    </td>
                    <td className="nh-num">{formatNumber(booking.totalPeople)}</td>
                    <td className="nh-num whitespace-nowrap">{formatMoney(booking.price)}</td>
                    <td>
                      <span className={BADGE[booking.status]}>{booking.status}</span>
                    </td>
                    <td>
                      <BookingActions booking={booking} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/** Confirming and calling off a booking. The list refetches from the server. */
function BookingActions({ booking }: { booking: AdminBooking }) {
  const update = useUpdateBookingStatus();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {booking.status !== "CONFIRMED" ? (
        <button
          type="button"
          className="nh-btn nh-btn-ghost nh-btn-sm"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: booking.id, status: "CONFIRMED" })}
        >
          {update.isPending ? "Saving…" : "Confirm"}
        </button>
      ) : null}

      {booking.status !== "CANCELLED" ? (
        <button
          type="button"
          className="nh-btn nh-btn-danger nh-btn-sm"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: booking.id, status: "CANCELLED" })}
        >
          Cancel
        </button>
      ) : null}

      {update.isError ? (
        <span className="nh-field-error" role="alert">
          {toApiError(update.error).message}
        </span>
      ) : null}
    </div>
  );
}
