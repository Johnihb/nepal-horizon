import { Suspense } from "react";

import Compare from "./compare";
import SiteShell from "@/components/site/site-shell";
import { LoadingBlock } from "@/components/site/states";

const Page = () => (
  <SiteShell tone="paper">
    <Suspense fallback={<div className="nh-page-main"><LoadingBlock rows={2} label="Loading comparison…" /></div>}>
      <Compare />
    </Suspense>
  </SiteShell>
);

export default Page;