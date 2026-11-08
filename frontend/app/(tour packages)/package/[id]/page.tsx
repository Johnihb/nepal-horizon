import { notFound } from "next/navigation";
import { z } from "zod";
import type { Metadata } from "next";

import SiteShell from "@/components/site/site-shell";
import PackageDetail from "./package";

const validateParams = z.object({
  id: z.string().uuid(),
});

const BACKEND_URL =
  process.env.BACKEND_URL || "https://nepal-horizon-api.onrender.com";

type PackageResponse = {
  body?: {
    id: string;
    name: string;
    location: string;
    description: string | null;
    price: number;
    durationDays?: number | null;
    maxAltitude?: number | null;
    difficulty?: string | null;
    bestSeason?: string | null;
    updatedAt: string;
    media?: { url: string }[];
  };
};

async function fetchPackage(id: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/user/package/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as PackageResponse;
    return json.body ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const valid = validateParams.safeParse({ id });
  if (!valid.success) return { title: "Journey not found" };

  const pkg = await fetchPackage(valid.data.id);
  if (!pkg) return { title: "Journey not found" };

  const title = `${pkg.name} — ${pkg.location}`;
  const description =
    pkg.description?.slice(0, 160) ||
    `${pkg.name}: a ${pkg.durationDays ?? ""}-day trek in ${pkg.location}, Nepal. From $${pkg.price}.`;

  return {
    title,
    description,
    alternates: { canonical: `/package/${pkg.id}` },
    openGraph: {
      title: `${title} | Nepal Horizon`,
      description,
      type: "article",
      images: pkg.media?.[0]?.url
        ? [{ url: pkg.media[0].url, alt: pkg.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Nepal Horizon`,
      description,
    },
  };
}

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const validId = validateParams.safeParse({ id });

  if (!validId.success) notFound();

  const pkg = await fetchPackage(validId.data.id);

  const jsonLd = pkg
    ? {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        name: pkg.name,
        description: pkg.description,
        touristType: "Adventure travelers",
        itinerary: {
          "@type": "Place",
          name: pkg.location,
          address: { "@type": "PostalAddress", addressCountry: "NP" },
        },
        offers: {
          "@type": "Offer",
          price: pkg.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        provider: {
          "@type": "TravelAgency",
          name: "Nepal Horizon",
          url: "https://nepalhorizon.vercel.app",
        },
      }
    : null;

  return (
    <SiteShell tone="paper">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <PackageDetail id={validId.data.id} />
    </SiteShell>
  );
};

export default page;