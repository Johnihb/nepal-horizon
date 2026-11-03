import { Suspense } from "react";

import SiteShell from "@/components/site/site-shell";
import VerifyEmailPage from "./verify-email";

const Page = () => (
  <SiteShell tone="paper">
    <Suspense fallback={null}>
      <VerifyEmailPage />
    </Suspense>
  </SiteShell>
);

export default Page;
