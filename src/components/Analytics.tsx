"use client";

import Script from "next/script";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  POSTHOG_KEY,
  POSTHOG_HOST,
  GA_ID,
  posthogEnabled,
  gaEnabled,
  analyticsEnabled,
  track,
} from "@/lib/analytics";
import { analyticsConsentGranted, subscribeConsent } from "@/lib/consent";

/**
 * Loads PostHog (CDN snippet) and/or Google Analytics 4 (gtag.js) and wires the
 * conversion funnel. Mounted once in the root locale layout so it covers every
 * route, including /reservas.
 *
 * Each tracker is gated by its own env var; loads nothing unless at least one is
 * set, so the site ships tracker-free until configured at deploy time.
 *
 * On top of that, NOTHING analytics-related loads until the visitor has opted in
 * via the cookie banner (see CookieConsentBanner / `consent.ts`). This satisfies
 * the prior-consent rule for non-essential cookies under Ley 25.326 and, for
 * international guests, GDPR/ePrivacy. Withdrawing consent stops both trackers in
 * place without requiring a reload.
 */
export function Analytics() {
  if (!analyticsEnabled) return null;
  return <AnalyticsRuntime />;
}

function AnalyticsRuntime() {
  // Re-renders whenever consent changes (this tab or another). Server snapshot
  // is `false`, so the markup is tracker-free until a client opt-in is read.
  const granted = useSyncExternalStore(
    subscribeConsent,
    analyticsConsentGranted,
    () => false,
  );

  // Enforce the current decision on the already-loaded trackers. Toggling GA's
  // documented `ga-disable-<ID>` kill switch and PostHog's opt-in/out lets a
  // withdrawal take effect immediately, and a re-grant resume, without a reload.
  useEffect(() => {
    if (GA_ID) {
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] =
        !granted;
    }

    if (granted) {
      window.posthog?.opt_in_capturing?.();
    } else {
      window.posthog?.opt_out_capturing?.();
      window.posthog?.stopSessionRecording?.();
    }
  }, [granted]);

  if (!granted) return null;

  // PostHog's official bootstrap snippet: stubs `window.posthog` immediately
  // (queuing calls) and async-loads array.js, then initialises. Pageviews are
  // sent manually on route change (see PageViews), so disable the automatic one.
  const posthogSnippet = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init(${JSON.stringify(POSTHOG_KEY)},{api_host:${JSON.stringify(POSTHOG_HOST)},capture_pageview:false,capture_pageleave:true});
  `;

  return (
    <>
      {posthogEnabled && (
        <Script id="posthog-init" strategy="afterInteractive">
          {posthogSnippet}
        </Script>
      )}

      {gaEnabled && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              // page_view is sent manually on route changes (see PageViews).
              gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      )}

      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      <ConversionEvents />
    </>
  );
}

/** Sends a pageview to each enabled tracker on every client-side navigation. */
function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const url = window.location.origin + path;

    // When consent is granted mid-session the tracker snippets are injected in
    // the same render as this component, so their globals may not exist yet on
    // first run. Retry briefly until the (queuing) stub appears, then send.
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;

    const send = () => {
      if (!window.posthog && !window.gtag && tries < 20) {
        tries += 1;
        timer = setTimeout(send, 100);
        return;
      }

      window.posthog?.capture("$pageview", { $current_url: url });
      window.gtag?.("event", "page_view", {
        page_path: path,
        page_location: url,
        page_title: document.title,
      });
    };

    send();

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

/**
 * One delegated click listener that turns the site's existing links into
 * conversion events — no per-component instrumentation needed. Booking CTAs all
 * point at the picker / engine; lead links use tel:, wa.me and mailto:.
 */
function ConversionEvents() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest("a");
      if (!el) return;
      const href = el.getAttribute("href") ?? "";

      if (
        href.includes("book=1") ||
        href.includes("#reservar") ||
        href.includes("/reservas") ||
        el.dataset.track === "room_cta"
      ) {
        track("book_click", { location: el.dataset.track ?? "link" });
      } else if (href.startsWith("tel:")) {
        track("contact_click", { method: "phone" });
      } else if (href.includes("wa.me") || href.startsWith("whatsapp:")) {
        track("contact_click", { method: "whatsapp" });
      } else if (href.startsWith("mailto:")) {
        track("contact_click", { method: "email" });
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
