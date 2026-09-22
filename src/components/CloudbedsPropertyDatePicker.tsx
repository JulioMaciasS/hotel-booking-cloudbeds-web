"use client";

import { useSyncExternalStore } from "react";

interface CloudbedsPropertyDatePickerProps {
  buttonLabel: string;
  currency: string;
  island: string;
  locale: string;
  propertyCode: string;
}

const subscribeToOrigin = () => () => {};

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
  const customUrl = useSyncExternalStore(
    subscribeToOrigin,
    () => {
      const pathname = locale === "en" ? "/en/reservas" : "/reservas";
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
      lang={locale}
      layout="horizontal"
      open-in-new-tab="false"
      property-code={propertyCode}
    />
  );
}
