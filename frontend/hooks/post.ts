"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createBooking,
  createPackage,
  deletePackage,
  fetchUploadSignature,
  toApiError,
  updateBookingStatus,
  updatePackage,
  uploadImage,
} from "@/lib/api";
import type { BookingPayload, BookingStatus, PackagePayload, UploadedImage } from "@/types/package";

/** Reserve a journey. */
export function usePostBooking(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["postBooking", packageId],
    mutationFn: (payload: BookingPayload) => createBooking(packageId, payload),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["bookedPackages"] });
      toast.success(message || "Journey booked.");
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });
}

/** Publish a new journey. */
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createPackage"],
    mutationFn: (payload: PackagePayload) => createPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packagePagination"] });
      toast.success("Journey published.");
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });
}

/** Replace the details and images of a journey. */
export function useUpdatePackage(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updatePackage", packageId],
    mutationFn: (payload: PackagePayload) => updatePackage(packageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packagePagination"] });
      queryClient.invalidateQueries({ queryKey: ["package", packageId] });
      toast.success("Journey updated.");
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });
}

/** Remove a journey and its images. */
export function useDeletePackage(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deletePackage", packageId],
    mutationFn: () => deletePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packagePagination"] });
      toast.success("Journey removed.");
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });
}

/** Settle a booking — confirm it or call it off. */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateBookingStatus"],
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["adminBookings"] });
      const previous = queryClient.getQueriesData({ queryKey: ["adminBookings"] });
      queryClient.setQueriesData({ queryKey: ["adminBookings"] }, (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((b) =>
          b && typeof b === "object" && "id" in b && b.id === id
            ? { ...b, status }
            : b,
        );
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (Array.isArray(context?.previous)) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error(toApiError(error).message);
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.status === "CONFIRMED" ? "Booking confirmed." : "Booking cancelled.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingAnalytics"] });
    },
  });
}

/**
 * Upload files to Cloudinary. The API only signs the request — the bytes go
 * straight from the browser to Cloudinary.
 */export function useUploadImages() {
  return useMutation({
    mutationKey: ["uploadImages"],
    mutationFn: async (files: File[]) => {
      const signature = await fetchUploadSignature();
      const settled = await Promise.allSettled(files.map((file) => uploadImage(file, signature)));

      const uploaded: UploadedImage[] = [];
      const failures: unknown[] = [];

      for (const result of settled) {
        if (result.status === "fulfilled") uploaded.push(result.value);
        else failures.push(result.reason);
      }

      if (!uploaded.length && failures.length) {
        const err = toApiError(failures[0]);
        toast.error(err.message);
        throw err;
      }
      if (failures.length) {
        toast.error(`${failures.length} image(s) failed to upload.`);
      } else {
        toast.success(`${uploaded.length} image(s) uploaded.`);
      }

      return { uploaded, failed: failures.length };
    },
    onError: (error) => {
      toast.error(toApiError(error).message);
    },
  });
}
