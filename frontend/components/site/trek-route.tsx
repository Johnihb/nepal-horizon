"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { TrekRoute } from "@/types/package";

const STOP_COLOR: Record<string, string> = {
  start: "pm2gnm",
  pass: "pm2rdm",
  village: "pm2blm",
  end: "pm2gnm",
};

function buildMapUrl(route: TrekRoute): string {
  const [lat, lng] = route.center;
  const pathCoords = route.points.map(([la, lo]) => `${lo},${la}`).join(",");
  const markers = route.stops
    .map((s) => `${s.lng},${s.lat},${STOP_COLOR[s.type] ?? "pm2blm"}`)
    .join("~");
  return (
    `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=${route.zoom}` +
    `&size=650,400&l=map` +
    `&pl=c:1a1a1a,w:3,${pathCoords}` +
    (markers ? `&pt=${markers}` : "")
  );
}

export default function TrekRoute({ route }: { route: TrekRoute }) {
  const mapUrl = buildMapUrl(route);

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
        Route and key stops shown on a real map. Approximate; for orientation only.
      </p>

      <div className="mt-6 overflow-hidden border border-[color:var(--nh-page-line)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapUrl}
          alt="Trek route map"
          width={650}
          height={400}
          className="block w-full"
        />
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