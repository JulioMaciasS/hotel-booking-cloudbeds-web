"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { analyticsEnabled } from "@/lib/analytics";
import {
  readConsent,
  subscribeConsent,
  subscribeCookieSettings,
  writeConsent,
} from "@/lib/consent";

/**
 * Cookie-consent banner. Appears on the first visit (no stored choice) and again
 * whenever a visitor reopens it from the footer "Configurar cookies" link.
 *
 * Accept and Reject are weighted equally and a single click each — analytics
 * never load until the visitor explicitly accepts, as required by Ley 25.326
 * (and GDPR/ePrivacy for international guests). It's a non-blocking bottom sheet:
 * it doesn't trap focus or gate the page, so the site stays usable while the
 * visitor is undecided (strictly-necessary cookies only until then).
 */
export function CookieConsentBanner() {
  // Nothing non-essential to consent to unless a tracker is configured, so the
  // banner only exists when analytics are actually wired up. `analyticsEnabled`
  // is a build-time constant, so this early return never changes between
  // renders and keeps the hooks below unconditional.
  if (!analyticsEnabled) return null;
  return <CookieConsentBannerInner />;
}

function CookieConsentBannerInner() {
  const t = useTranslations("common.cookies");
  // Whether the visitor has already chosen. The server snapshot is `true`, so
  // nothing renders during SSR (no flash, no hydration mismatch); after
  // hydration the real localStorage value drives it, and it flips closed
  // reactively when a choice is made here or in another tab.
  const hasDecision = useSyncExternalStore(
    subscribeConsent,
    () => readConsent() !== null,
    () => true,
  );
  // The footer "Configurar cookies" link reopens the banner after a prior
  // choice. Set from an event callback (not synchronously in the effect body).
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => subscribeCookieSettings(() => setForceOpen(true)), []);

  const open = !hasDecision || forceOpen;
  if (!open) return null;

  const decide = (analytics: boolean) => {
    writeConsent(analytics);
    setForceOpen(false);
  };

  return (
    <div
      aria-label={t("title")}
      role="dialog"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-black/10 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-lg sm:px-6"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1f2b27]">{t("title")}</p>
          <p className="mt-1 text-sm leading-6 text-[#52615d]">
            {t.rich("body", {
              link: (chunks) => (
                <Link
                  href="/privacidad"
                  className="font-medium text-[#38645b] underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>

        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => decide(false)}
            className="flex-1 rounded-lg border border-[#c8d4ce] px-4 py-2.5 text-sm font-semibold text-[#38645b] transition hover:bg-[#edf3ef] sm:flex-none"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="flex-1 rounded-lg bg-[#38645b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2e5049] sm:flex-none"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
