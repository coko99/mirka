import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uskoro",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
