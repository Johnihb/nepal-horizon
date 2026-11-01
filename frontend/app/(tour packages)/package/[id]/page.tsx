import { notFound } from "next/navigation";
import { z } from "zod";

import SiteShell from "@/components/site/site-shell";
import PackageDetail from "./package";

const validateParams = z.object({
  id: z.string().uuid(),
});

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const validId = validateParams.safeParse({ id });

  if (!validId.success) notFound();

  return (
    <SiteShell tone="paper">
      <PackageDetail id={validId.data.id} />
    </SiteShell>
  );
};

export default page;
