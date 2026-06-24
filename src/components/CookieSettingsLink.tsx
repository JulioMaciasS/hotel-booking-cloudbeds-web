"use client";

import { useTranslations } from "next-intl";
import { openCookieSettings } from "@/lib/consent";

/**
 * Footer control that reopens the cookie banner so a visitor can review or
 * withdraw their analytics consent at any time — the "easy to withdraw as to
 * give" requirement. A thin client wrapper so the footer stays a Server
 * Component; the actual state lives in `consent.ts`.
 */
export function CookieSettingsLink() {
  const t = useTranslations("common.footer");

  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="transition hover:text-white/60"
    >
      {t("cookieSettings")}
    </button>
  );
}
