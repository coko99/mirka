"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageView() {
  const pathname = usePathname();

  useEffect(() => {
    const path = window.location.pathname;
    fetch("/api/pregled", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
