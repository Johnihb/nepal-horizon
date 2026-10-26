import { redirect } from "next/navigation";

/**
 * The console is the only surface that writes journeys now — this route just
 * points there so the old link keeps working.
 */
export default function UploadPage() {
  redirect("/admin");
}
