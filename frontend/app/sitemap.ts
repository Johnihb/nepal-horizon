import type { MetadataRoute } from "next";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://nepal-horizon-api.onrender.com";

type PackagesPage = {
  packages: { id: string; updatedAt: string }[];
  nextPage: number | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://nepalhorizon.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/packages`, changeFrequency: "daily", priority: 0.9 },
  ];

  const packageRoutes: MetadataRoute.Sitemap = [];
  let page = 0;
  // Guard against runaway pagination.
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/user/packages?offset=${page}`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) break;
      const json = (await res.json()) as { body?: PackagesPage };
      const data = json.body ?? { packages: [], nextPage: null };
      for (const pkg of data.packages) {
        packageRoutes.push({
          url: `${base}/package/${pkg.id}`,
          lastModified: pkg.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      if (data.nextPage === null) break;
      page = data.nextPage;
    } catch {
      break;
    }
  }

  return [...staticRoutes, ...packageRoutes];
}