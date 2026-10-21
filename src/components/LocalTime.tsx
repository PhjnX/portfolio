"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/site";

/** Current time in the owner's time zone, updated every second. Empty until mounted to avoid a hydration mismatch. */
export function LocalTime({ className }: { className?: string }) {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: profile.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {now || "--:--:--"} <span className="text-muted">GMT+7</span>
    </span>
  );
}
