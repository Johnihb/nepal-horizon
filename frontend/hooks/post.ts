"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createBooking,
  createPackage,
  deletePackage,
  fetchUploadSignature,
  toApiError,
  updatePackage,
  uploadImage,
} from "@/lib/api";
import type { BookingPayload, PackagePayload, UploadedImage } from "@/types/package";

/** Reserve a journey. */
export function usePostBooking(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["postBooking", packageId],
    mutationFn: (payload: BookingPayload) => createBooking(packageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookedPackages"] });
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
    },
  });
}

/**
 * Upload files to Cloudinary. The API only signs the request — the bytes go
 * straight from the browser to Cloudinary.
 */
export function useUploadImages() {
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

      if (!uploaded.length && failures.length) throw toApiError(failures[0]);

      return { uploaded, failed: failures.length };
    },
  });
}
