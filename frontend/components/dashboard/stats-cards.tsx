"use client";

import { DEFAULT_CONFIG, formatCount, formatMoney } from "./chart-config";
import type { AnalyticsPoint } from "./types";

interface StatsCardsProps {
  data: AnalyticsPoint[];
}

interface StatTile {
  id: string;
  label: string;
  value: string;
  meta: string;
  /** The series this tile measures — the same colour the chart draws it in. */
  color: string;
}

/**
 * StatsCards — three summary tiles above the line chart.
 * Computes Total Revenue, Total Bookings and Total Travellers from the
 * points in the selected window.
 */
export function StatsCards({ data }: StatsCardsProps) {
  const totalRevenue = data.reduce(
    (sum, item) => sum + (Number.isFinite(item.revenue) ? item.revenue : 0),
    0,
  );
  const totalBookings = data.reduce(
    (sum, item) => sum + (Number.isFinite(item.count) ? item.count : 0),
    0,
  );
  const totalTravellers = data.reduce(
    (sum, item) => sum + (Number.isFinite(item.totalPeople) ? item.totalPeople : 0),
    0,
  );

  const tiles: StatTile[] = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: formatMoney(totalRevenue),
      meta: "Net of cancelled bookings",
      color: DEFAULT_CONFIG.secondaryColor,
    },
    {
      id: "bookings",
      label: "Total Bookings",
      value: formatCount(totalBookings),
      meta: "Reservations in this window",
      color: DEFAULT_CONFIG.primaryColor,
    },
    {
      id: "travellers",
      label: "Total Travellers",
      value: formatCount(totalTravellers),
      meta: "Guests on those bookings",
      color: DEFAULT_CONFIG.tertiaryColor,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.id} className="nh-stat">
          <span
            aria-hidden="true"
            className="block h-px w-8"
            style={{ backgroundColor: tile.color }}
          />
          <p className="nh-stat-label">{tile.label}</p>
          <p className="nh-stat-value">{tile.value}</p>
          <p className="nh-meta">{tile.meta}</p>
        </div>
      ))}
    </div>
  );
}
