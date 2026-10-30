import { Suspense } from "react";

import SiteShell from "@/components/site/site-shell";
import { LoadingBlock } from "@/components/site/states";
import Bookings from "./bookings";

/** The booking queue — the dark half of the material range, like the console. */
export default function AdminBookingsPage() {
  return (
    <SiteShell tone="ink">
      {/* The ledger reads ?status= from the URL, so it needs a Suspense boundary. */}
      <Suspense
        fallback={
          <div className="nh-page-main">
            <LoadingBlock rows={3} label="Loading bookings…" />
          </div>
        }
      >
        <Bookings />
      </Suspense>
    </SiteShell>
  );
}
