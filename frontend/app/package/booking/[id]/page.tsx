import { notFound } from "next/navigation";
import { z } from "zod";

import SiteShell from "@/components/site/site-shell";
import Booking from "./booking";

const validateParams = z.object({
  id: z.string().uuid(),
});

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const validParams = validateParams.safeParse({ id });

  if (!validParams.success) notFound();

  return (
    <SiteShell tone="paper">
      <Booking packageId={validParams.data.id} />
    </SiteShell>
  );
};

export default page;
