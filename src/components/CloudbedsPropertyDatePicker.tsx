"use client";

import { useSyncExternalStore } from "react";
import { hasLocale } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCloudbedsLanguage } from "@/lib/cloudbeds-language";

interface CloudbedsPropertyDatePickerProps {
  buttonLabel: string;
  currency: string;
  island: string;
  locale: string;
  propertyCode: string;
}

const subscribeToOrigin = () => () => {};
const mobileLayoutQuery = "(max-width: 767px)";
const subscribeToMobileLayout = (onChange: () => void) => {
  const media = window.matchMedia(mobileLayoutQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getMobileLayout = () => window.matchMedia(mobileLayoutQuery).matches;
const getServerMobileLayout = () => false;

/**
 * Cloudbeds requires `custom-url` to be fully qualified. Build it in the
 * browser so the picker keeps working on localhost, Amplify, and the final
 * hotel domain without hard-coding any of those origins.
 */
export function CloudbedsPropertyDatePicker({
  buttonLabel,
  currency,
  island,
  locale,
  propertyCode,
}: CloudbedsPropertyDatePickerProps) {
  const mobileLayout = useSyncExternalStore(
    subscribeToMobileLayout,
    getMobileLayout,
    getServerMobileLayout,
  );
  const customUrl = useSyncExternalStore(
    subscribeToOrigin,
    () => {
      const pathname = getPathname({
        locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
        href: "/reservas",
      });
      return new URL(pathname, window.location.origin).toString();
    },
    () => null,
  );

  if (!customUrl) return null;

  return (
    <cb-property-date-picker
      button-label={buttonLabel}
      currency={currency}
      custom-url={customUrl}
      data-testid="cloudbeds-date-picker"
      island={island}
      lang={getCloudbedsLanguage(locale)}
      layout={mobileLayout ? "vertical" : "horizontal"}
      open-in-new-tab="false"
      property-code={propertyCode}
    />
  );
}
