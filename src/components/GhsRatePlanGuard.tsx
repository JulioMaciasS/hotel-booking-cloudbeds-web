"use client";

import { useLayoutEffect } from "react";
import { replaceTechnicalGhsRatePlan } from "@/lib/cloudbeds-rate-plan-guard";

/**
 * Runs before the Cloudbeds script loader's regular effect. This prevents an
 * inbound GHS-only rate from becoming the plan selected by the embedded
 * booking engine while retaining its original id in the URL for diagnostics.
 */
export function GhsRatePlanGuard() {
  useLayoutEffect(() => {
    const safeUrl = replaceTechnicalGhsRatePlan(new URL(window.location.href));

    if (!safeUrl) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${safeUrl.pathname}${safeUrl.search}${safeUrl.hash}`,
    );
    document.documentElement.dataset.hotelGhsTechnicalRatePlan = "true";
  }, []);

  return null;
}
