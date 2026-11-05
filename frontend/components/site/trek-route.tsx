"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { TrekRoute } from "@/types/package";

const VIEW_W = 1000;
const VIEW_H = 400;

// Simplified Nepal outline (viewBox 1000x400). Approximate, for orientation only.
const NEPAL_OUTLINE =
  "M 60,120 L 180,90 L 320,70 L 480,60 L 640,65 L 780,75 L 900,90 L 940,110 " +
  "L 950,180 L 940,260 L 920,320 L 880,360 L 700,370 L 520,375 L 340,370 " +
  "L 180,360 L 100,340 L 60,280 L 50,200 Z";

const STOP_COLOR: Record<string, string> = {
  start: "#256d3b",
  pass: "#b3261e",
  village: "#1c6360",
  end: "#256d3b",
};

export default function TrekRoute({ route }: { route: TrekRoute }) {
  const points = route.points.map(([x, y]) => [x * VIEW_W / 100, y * VIEW_H / 100] as [number, number]);
  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");

  const elevationData = route.elevation.map((m, i) => ({
    i,
    alt: m,
    label: `${i + 1}`,
  }));

  return (
    <section className="nh-panel mt-10" aria-labelledby="trek-route-heading">
      <p className="nh-eyebrow">The Route</p>
      <h2 id="trek-route-heading" className="nh-display-3 mt-4">
        Mapped on the <em>ground</em>
      </h2>
      <p className="nh-muted mt-3 text-sm">
        Approximate route and elevation profile. Waypoints are indicative.
      </p>

      <div className="mt-6 overflow-hidden border border-[color:var(--nh-page-line)]">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full bg-[color:var(--nh-page-bg)]"
          role="img"
          aria-label="Trek route map"
        >
          <path
            d={NEPAL_OUTLINE}
            fill="color-mix(in srgb, var(--nh-page-fg) 6%, var(--nh-page-bg))"
            stroke="var(--nh-page-line)"
            strokeWidth="1.5"
          />
          <polyline
            points={polyline}
            fill="none"
            stroke="var(--nh-page-fg)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {route.stops.map((stop, i) => {
            const cx = stop.x * VIEW_W / 100;
            const cy = stop.y * VIEW_H / 100;
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill={STOP_COLOR[stop.type] ?? "#3a3a38"}
                  stroke="var(--nh-page-bg)"
                  strokeWidth="1.5"
                />
                <text
                  x={cx + 8}
                  y={cy - 6}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fill="var(--nh-page-fg)"
                >
                  {stop.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {elevationData.length > 1 ? (
        <div className="mt-6">
          <p className="nh-meta mb-3">Elevation profile</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elevationData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" hide />
                <YAxis
                  width={48}
                  tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  tickFormatter={(v: number) => `${v}m`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v) => [`${v} m`, "Altitude"]}
                  labelFormatter={() => ""}
                />
                <Line
                  type="monotone"
                  dataKey="alt"
                  stroke="var(--nh-page-fg)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </section>
  );
}