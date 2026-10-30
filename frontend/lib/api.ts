import { isAxiosError } from "axios";

import axios from "@/lib/axios";
import type {
  AdminBooking,
  AnalyticsPoint,
  AnalyticsRange,
  BookingPayload,
  BookingStatus,
  PackagePayload,
  PackagesPage,
  TravelPackage,
  UploadSignature,
  UploadedImage,
} from "@/types/package";

/* -------------------------------------------------------------------------- */
/* errors                                                                      */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  status?: number;
  /** Field-level validation messages keyed by field name. */
  fields?: Record<string, string>;

  constructor(message: string, status?: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

/**
 * The API answers errors in four different shapes:
 *   { statusCode, body: { message } }
 *   { success: false, message, errors: [{ field, message }] }
 *   { message }
 *   { error: "Unauthorized" }
 * Flatten them into one error the UI can render.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = (error.response?.data ?? {}) as Record<string, unknown>;
    const body = (data.body ?? {}) as Record<string, unknown>;

    const message =
      (typeof body.message === "string" && body.message) ||
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      (status === 401 && "Your session has expired. Sign in to continue.") ||
      (status === 404 && "We could not find that.") ||
      error.message ||
      "Something went wrong.";

    const fields: Record<string, string> = {};
    const errors = (data.errors ?? body.errors) as Array<{ field?: string; message?: string }> | undefined;
    if (Array.isArray(errors)) {
      for (const entry of errors) {
        if (entry?.field && entry.message) fields[entry.field] = entry.message;
      }
    }

    return new ApiError(message, status, Object.keys(fields).length ? fields : undefined);
  }

  return new ApiError(error instanceof Error ? error.message : "Something went wrong.");
}

/* -------------------------------------------------------------------------- */
/* reads                                                                        */
/* -------------------------------------------------------------------------- */

/** GET /user/packages?offset=<page index> — the backend pages 5 at a time. */
export async function fetchPackages(page = 0): Promise<PackagesPage> {
  const { data } = await axios.get<{ body?: PackagesPage }>("/user/packages", {
    params: { offset: page },
  });
  return data.body ?? { packages: [], nextPage: null };
}

/** GET /user/package/:id */
export async function fetchPackage(packageId: string): Promise<TravelPackage> {
  const { data } = await axios.get<{ body?: TravelPackage }>(`/user/package/${packageId}`);
  if (!data.body) throw new ApiError("We could not find that journey.", 404);
  return data.body;
}

/** GET /user/bookedPackages — packages the signed-in traveller has booked. */
export async function fetchBookedPackages(): Promise<TravelPackage[]> {
  try {
    const { data } = await axios.get<{ body?: TravelPackage[] }>("/user/bookedPackages");
    return data.body ?? [];
  } catch (error) {
    // The API answers 404 when the traveller has no bookings yet.
    if (toApiError(error).status === 404) return [];
    throw error;
  }
}

/** GET /bookingAnalytics/:range */
export async function fetchAnalytics(range: AnalyticsRange): Promise<AnalyticsPoint[]> {
  const { data } = await axios.get<{ body?: { data?: AnalyticsPoint[] } }>(
    `/bookingAnalytics/${range}`,
  );
  return data.body?.data ?? [];
}

/** GET /admin/bookings — every booking, the ones awaiting a decision first. */
export async function fetchBookings(status?: BookingStatus): Promise<AdminBooking[]> {
  const { data } = await axios.get<{ body?: AdminBooking[] }>("/admin/bookings", {
    params: { status },
  });
  return data.body ?? [];
}

/* -------------------------------------------------------------------------- */
/* writes                                                                       */
/* -------------------------------------------------------------------------- */

/** POST /user/package/booking/:id */
export async function createBooking(packageId: string, payload: BookingPayload): Promise<string> {
  const { data } = await axios.post<{ body?: { message?: string } }>(
    `/user/package/booking/${packageId}`,
    payload,
  );
  return data.body?.message ?? "Package booked successfully";
}

/** POST /admin/ */
export async function createPackage(payload: PackagePayload): Promise<TravelPackage> {
  const { data } = await axios.post<{ body?: TravelPackage }>("/admin/", payload);
  if (!data.body) throw new ApiError("The journey was not created.");
  return data.body;
}

/** PATCH /admin/:id */
export async function updatePackage(packageId: string, payload: PackagePayload): Promise<TravelPackage> {
  const { data } = await axios.patch<{ body?: TravelPackage }>(`/admin/${packageId}`, payload);
  if (!data.body) throw new ApiError("The journey was not updated.");
  return data.body;
}

/** DELETE /admin/:id */
export async function deletePackage(packageId: string): Promise<void> {
  await axios.delete(`/admin/${packageId}`);
}

/** DELETE /images/package/:packageId — clears every image of a journey. */
export async function deletePackageImages(packageId: string): Promise<void> {
  await axios.delete(`/images/package/${packageId}`);
}

/** PATCH /admin/booking/status — CONFIRMED or CANCELLED. */
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  await axios.patch("/admin/booking/status", { id, status });
}

/* -------------------------------------------------------------------------- */
/* image pipeline                                                               */
/* -------------------------------------------------------------------------- */

/** GET /images/ — the server signs the upload, the browser sends bytes to Cloudinary. */
export async function fetchUploadSignature(): Promise<UploadSignature> {
  const { data } = await axios.get<UploadSignature>("/images/");
  return data;
}

/**
 * POST the file straight to Cloudinary. The server never sees the bytes.
 * `asset_folder` must match the folder the signature was computed over.
 */
export async function uploadImage(file: File, signature: UploadSignature): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("asset_folder", signature.folder);
  form.append("timestamp", String(signature.timestamp));
  form.append("signature", signature.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ApiError(
      detail ? `Upload rejected: ${detail.slice(0, 180)}` : "Upload rejected. Check the file and try again.",
      response.status,
    );
  }

  const result = (await response.json()) as { secure_url?: string; public_id?: string };
  if (!result.secure_url || !result.public_id) {
    throw new ApiError("Upload finished without a usable image reference.");
  }

  return { url: result.secure_url, public_id: result.public_id };
}
