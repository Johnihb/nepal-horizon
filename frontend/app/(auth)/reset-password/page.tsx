import { Suspense } from "react";

import SiteShell from "@/components/site/site-shell";
import ResetPasswordPage from "./reset-password";

const Page = () => (
  <SiteShell tone="paper">
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  </SiteShell>
);

export default Page;
