import type { Metadata } from "next";
import NepalHorizon from "@/components/nepal-horizon";

export const metadata: Metadata = {
  title: "Nepal Horizon — Small Group Mountain Journeys",
  description: "Slow, considered journeys through the high mountains of Nepal.",
};

export default function Home() {
  return <NepalHorizon />;
}
