import type { Metadata } from "next";

import Home from "./home";
import SiteShell from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Journeys",
  description:
    "Every route Nepal Horizon currently runs — small group departures through Nepal's high places.",
};

const Page = () => (
  <SiteShell tone="paper">
    <Home />
  </SiteShell>
);

export default Page;
