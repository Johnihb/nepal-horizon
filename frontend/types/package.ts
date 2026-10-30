/**
 * Wire contract for the Express API at http://localhost:5000/api/v1
 *
 * Every successful endpoint answers with the `apiResponse` envelope:
 *   { statusCode: number, body: <payload>, message?: string }
 * so the payload is read from `body`. Error responses are not uniform —
 * see `toApiError` in lib/api.ts.
 */

export type PackageMedia = {
  id: string;
  url: string;
  public_id: string;
  packageId: string;
};

export type TravelPackage = {
  id: string;
  name: string;
  location: string;
  description: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
  media?: PackageMedia[];
};

/** GET /user/packages?offset=<page index> */
export type PackagesPage = {
  packages: TravelPackage[];
  /** Next page index, or null when this is the last page. */
  nextPage: number | null;
};

/** POST /admin/ and PATCH /admin/:id */
export type PackagePayload = {
  name: string;
  location: string;
  description?: string;
  price: number;
  images: Array<{ public_id: string; url: string }>;
};

/** POST /user/package/booking/:id */
export type BookingPayload = {
  people: number;
  date: string;
};

/** GET /bookingAnalytics/days|weeks|months */
export type AnalyticsPoint = {
  /** ISO datetime at midnight UTC */
  timestamp: string;
  count: number;
  revenue: number;
  totalPeople: number;
};

export type AnalyticsRange = "days" | "weeks" | "months";

/** GET /images/ */
export type UploadSignature = {
  timestamp: number;
  apiKey: string;
  signature: string;
  cloudName: string;
  folder: string;
};

export type UploadedImage = {
  url: string;
  public_id: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: "USER" | "ADMIN";
};

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

/** GET /admin/bookings — every booking, the pending queue first. */
export type AdminBooking = {
  id: string;
  price: number;
  totalPeople: number;
  /** ISO datetime — the column is date-only, so it always lands at midnight UTC. */
  travelDate: string;
  status: BookingStatus;
  createdAt: string;
  package: { id: string; name: string; location: string };
  user: { name: string; email: string };
};
