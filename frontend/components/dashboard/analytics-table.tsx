"use client";

import { formatCount, formatMoney, formatPointDate, toDate } from "./chart-config";
import type { AnalyticsPoint, AnalyticsRange } from "./types";

interface AnalyticsTableProps {
  data: AnalyticsPoint[];
  range: AnalyticsRange;
}

/**
 * The raw points behind the chart — exact figures for every period in the
 * selected window, so a reader never has to read a value off an axis.
 */
export function AnalyticsTable({ data, range }: AnalyticsTableProps) {
  return (
    <section className="nh-panel" aria-label="Raw analytics points">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="nh-display-3">Raw points</h2>
        <p className="nh-meta">
          {data.length} {data.length === 1 ? "period" : "periods"}
        </p>
      </div>

      <div className="nh-table-wrap">
        <table className="nh-table">
          <caption className="sr-only">
            Bookings, revenue and travellers for every {range} in the selected window
          </caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col" className="text-right">
                Bookings
              </th>
              <th scope="col" className="text-right">
                Revenue
              </th>
              <th scope="col" className="text-right">
                Travellers
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const date = toDate(row.timestamp);
              return (
                <tr key={row.timestamp}>
                  <td>{date ? formatPointDate(date, range) : "Unknown period"}</td>
                  <td className="nh-num text-right">{formatCount(row.count)}</td>
                  <td className="nh-num text-right">{formatMoney(row.revenue)}</td>
                  <td className="nh-num text-right">{formatCount(row.totalPeople)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
