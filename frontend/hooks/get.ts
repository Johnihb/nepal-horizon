"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchAnalytics, fetchBookedPackages, fetchBookings, fetchPackage, fetchPackages } from "@/lib/api";
import type { AnalyticsRange, BookingStatus } from "@/types/package";

/**
 * Paginated journey list. `offset` is a page index, not a row offset — the
 * API pages five at a time and answers with `nextPage`.
 */
export function usePackagePagination(offset = 0) {
  return useQuery({
    queryKey: ["packagePagination", offset],
    queryFn: () => fetchPackages(offset),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

/** A single journey, by id. */
export function useFetchPackageById(packageId: string) {
  return useQuery({
    queryKey: ["package", packageId],
    queryFn: () => fetchPackage(packageId),
    enabled: Boolean(packageId),
    staleTime: 1000 * 60 * 5,
  });
}

/** Journeys the signed-in traveller has booked. */
export function useBookedPackages() {
  return useQuery({
    queryKey: ["bookedPackages"],
    queryFn: fetchBookedPackages,
    staleTime: 1000 * 60,
  });
}

/** Booking volume and revenue over the given window. */
export function useBookingAnalytics(range: AnalyticsRange) {
  return useQuery({
    queryKey: ["bookingAnalytics", range],
    queryFn: () => fetchAnalytics(range),
    staleTime: 1000 * 60 * 5,
  });
}

/** Every booking, pending first — the console's status queue. */
export function useAdminBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: ["adminBookings", status ?? "all"],
    queryFn: () => fetchBookings(status),
    // Switching the filter keeps the previous rows on screen instead of blanking.
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}
