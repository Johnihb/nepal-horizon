"use client";

import { useSyncExternalStore, useState, useEffect, useCallback } from "react";

import type { TravelBooking } from "@/types/package";

const CHECKLIST = [
  { id: "permits", label: "Permits & TIMS card" },
  { id: "insurance", label: "Travel insurance with altitude cover" },
  { id: "visa", label: "Visa / entry documents" },
  { id: "gear", label: "Gear packed and tested" },
  { id: "fitness", label: "Fitness baseline reached" },
];

function useToday() {
  return useSyncExternalStore(
    (callback) => {
      const id = window.setInterval(callback, 60_000);
      return () => window.clearInterval(id);
    },
    () => new Date().toISOString().slice(0, 10),
    () => "",
  );
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export default function NextTrek({ booking }: { booking: TravelBooking }) {
  const today = useToday();
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(`nh:prep:${booking.id}`);
      if (raw) {
        setChecked(JSON.parse(raw) as Record<string, boolean>);
      }
    } catch {
      // ignore malformed storage
    }
  }, [booking.id]);

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      setChecked(next);
      try {
        window.localStorage.setItem(`nh:prep:${booking.id}`, JSON.stringify(next));
      } catch {
        // storage may be unavailable; state still updates in memory
      }
    },
    [booking.id],
  );

  const toggle = (id: string) => {
    persist({ ...checked, [id]: !checked[id] });
  };

  const travelDate = booking.travelDate.slice(0, 10);
  const days = today ? daysBetween(today, travelDate) : null;
  const countdown =
    days === null
      ? "—"
      : days < 0
        ? "Departed"
        : days === 0
          ? "Today"
          : `${days} day${days === 1 ? "" : "s"}`;

  const done = CHECKLIST.filter((item) => checked[item.id]).length;

  return (
    <section className="nh-panel mt-10" aria-labelledby="next-trek-heading">
      <p className="nh-eyebrow">Your next trek</p>
      <h2 id="next-trek-heading" className="nh-display-3 mt-4">
        {booking.package.name} <em>awaits</em>
      </h2>
      <p className="nh-muted mt-3">
        Departure {travelDate} · {booking.totalPeople} travelling
      </p>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="nh-display-2">{countdown}</span>
        <span className="nh-meta">until you walk out</span>
      </div>

      <div className="mt-8">
        <p className="nh-meta">
          Preparation — {done}/{CHECKLIST.length} complete
        </p>
        <ul className="mt-4 space-y-3">
          {CHECKLIST.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <input
                id={`prep-${item.id}`}
                type="checkbox"
                checked={Boolean(checked[item.id])}
                onChange={() => toggle(item.id)}
                disabled={!mounted}
                className="h-4 w-4"
              />
              <label htmlFor={`prep-${item.id}`} className="text-sm">
                {item.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}