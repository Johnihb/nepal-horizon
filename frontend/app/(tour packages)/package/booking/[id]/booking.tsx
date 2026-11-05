"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import JourneyPlate from "@/components/site/journey-plate";
import { ErrorNote, LoadingBlock } from "@/components/site/states";
import { useFetchPackageById } from "@/hooks/get";
import { usePostBooking } from "@/hooks/post";
import { useSession } from "@/hooks/session";
import { toApiError } from "@/lib/api";
import { focusFirstError } from "@/lib/focus";
import { formatMoney } from "@/lib/format";

const MAX_GUESTS = 8;

export default function Booking({ packageId }: { packageId: string }) {
  const { user, isPending: sessionPending } = useSession();
  const { data: journey, error, isError, isLoading } = useFetchPackageById(packageId);
  const booking = usePostBooking(packageId);

  const [people, setPeople] = useState(1);
  const [date, setDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  // Client-only clock: the server has no idea what "today" is on the user's
  // machine, so the server snapshot stays empty and the real one arrives after
  // hydration.
  const today = useSyncExternalStore(
    () => () => {},
    () => new Date().toISOString().slice(0, 10),
    () => ""
  );

  // The confirmation replaces the form, so the keyboard needs to be taken there.
  useEffect(() => {
    if (booking.isSuccess) confirmationRef.current?.focus();
  }, [booking.isSuccess]);

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
        <LoadingBlock rows={1} label="Loading journey…" />
      </div>
    );
  }

  const price = journey.price;
  const total = people > 0 ? people * price : price;

  function validate() {
    const errors: Record<string, string> = {};

    if (!Number.isInteger(people) || people < 1) {
      errors.people = "Enter how many travellers are coming.";
    } else if (people > MAX_GUESTS) {
      errors.people = `Departures carry eight guests at most. Call the field office for a larger group.`;
    }

    if (!date) {
      errors.date = "Pick the date you plan to set off.";
    } else if (today && date < today) {
      errors.date = "Choose a date that has not passed.";
    }

    setFieldErrors(errors);
    const first = Object.keys(errors)[0];
    focusFirstError(formRef.current, first);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    try {
      await booking.mutateAsync({ people, date });
    } catch {
      // The error is rendered from the mutation state below.
    }
  }

  if (booking.isSuccess) {
    return (
      <div className="nh-page-main">
        <div
          className="nh-panel mx-auto max-w-2xl text-center"
          role="status"
          tabIndex={-1}
          ref={confirmationRef}
        >
          <p className="nh-eyebrow justify-center">Reserved</p>
          <h1 className="nh-display-2 mt-6">
            Your place on
            <br />
            <em>{journey.name}</em> is held.
          </h1>
          <p className="nh-muted mx-auto mt-5 max-w-lg leading-7">
            The field office reviews every request by hand and will write to you with the
            confirmed dates, permits and full itinerary.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link className="nh-btn nh-btn-ink nh-btn-sm" href="/bookings">
              View My Bookings
            </Link>
            <Link className="nh-btn nh-btn-ghost nh-btn-sm" href="/packages">
              Browse Other Journeys
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="nh-page-hero">
        <div className="nh-page-hero-inner">
          <p className="nh-eyebrow nh-eyebrow-row">
            <span>Booking</span>
            <span className="nh-num">01</span>
          </p>
          <h1 className="nh-display-1 mt-8 max-w-3xl">{journey.name}</h1>
          <p className="nh-page-lede mt-6">{journey.location}</p>
        </div>
      </section>

      <div className="nh-page-main">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <aside className="min-w-0">
            <JourneyPlate
              media={journey.media}
              label={journey.location}
              alt={`${journey.name}, ${journey.location}`}
              className="aspect-[4/3]"
            />

            <dl className="mt-8 space-y-5 border-t border-[color:var(--nh-page-line)] pt-8">
              <div className="flex items-baseline justify-between gap-6">
                <dt className="nh-meta">Per Person</dt>
                <dd className="nh-num">{formatMoney(price)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="nh-meta">Group Size</dt>
                <dd className="nh-num">
                  {people} {people === 1 ? "traveller" : "travellers"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-t border-[color:var(--nh-page-line)] pt-5">
                <dt className="nh-meta">Total</dt>
                <dd className="nh-display-3 nh-num">{formatMoney(total)}</dd>
              </div>
            </dl>

            <p className="nh-muted mt-8 text-[0.9rem] leading-7">
              Fill the form and the field office will review your request, confirm the dates
              and send the full itinerary. Nothing is charged online.
            </p>
          </aside>

          <div>
            {sessionPending ? null : user ? (
              <form className="nh-panel" onSubmit={handleSubmit} noValidate ref={formRef}>
                <p className="nh-eyebrow">Reserve Your Place</p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="nh-label" htmlFor="people">
                      Travellers
                    </label>
                    <input
                      className="nh-input nh-num"
                      id="people"
                      name="people"
                      type="number"
                      inputMode="numeric"
                      autoComplete="off"
                      min={1}
                      max={MAX_GUESTS}
                      step={1}
                      value={people}
                      onChange={(event) => setPeople(Number(event.target.value))}
                      aria-invalid={fieldErrors.people ? "true" : undefined}
                      aria-describedby={fieldErrors.people ? "people-error" : undefined}
                    />
                    {fieldErrors.people ? (
                      <span className="nh-field-error" id="people-error">
                        {fieldErrors.people}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <label className="nh-label" htmlFor="date">
                      Set Off Date
                    </label>
                    <input
                      className="nh-input"
                      id="date"
                      name="date"
                      type="date"
                      autoComplete="off"
                      min={today || undefined}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      aria-invalid={fieldErrors.date ? "true" : undefined}
                      aria-describedby={fieldErrors.date ? "date-error" : undefined}
                    />
                    {fieldErrors.date ? (
                      <span className="nh-field-error" id="date-error">
                        {fieldErrors.date}
                      </span>
                    ) : null}
                  </div>
                </div>

                {booking.isError ? (
                  <div className="mt-7">
                    <ErrorNote message={toApiError(booking.error).message} />
                  </div>
                ) : null}

                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <button
                    type="submit"
                    className="nh-btn nh-btn-ink"
                    disabled={booking.isPending}
                    aria-live="polite"
                  >
                    {booking.isPending ? "Sending…" : "Request This Journey"}
                  </button>
                  <span className="nh-meta">Total {formatMoney(total)}</span>
                </div>
              </form>
            ) : (
              <div className="nh-panel">
                <p className="nh-eyebrow">Sign In Required</p>
                <h2 className="nh-display-3 mt-6">
                  Sign in to hold your place on <em>{journey.name}</em>.
                </h2>
                <p className="nh-muted mt-4 leading-7">
                  We keep a booking against your name so the field office knows who is
                  walking each route.
                </p>
                <Link className="nh-btn nh-btn-ink mt-8" href="/login">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
