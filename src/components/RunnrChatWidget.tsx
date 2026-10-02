"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import {
  MAP_EXPANDED_EVENT,
  type MapExpandedEventDetail,
} from "@/lib/map-events";

const RUNNR_SCRIPT_SRC = "https://webchat.runnr.ai/chat/chat-widget.js";

/**
 * Loads the official Runnr webchat once for every localized page.
 *
 * Runnr reads its data attributes only on first boot. The small DOM sync keeps
 * the visible copy aligned with client-side locale changes without reinserting
 * the remote script (which would create duplicate launchers/connections).
 */
export function RunnrChatWidget() {
  const t = useTranslations("common.chatWidget");
  const title = t("title");
  const button = t("button");
  const placeholder = t("placeholder");

  useEffect(() => {
    const syncCopy = () => {
      const script = document.querySelector<HTMLScriptElement>(
        'script[data-widget="chat"]',
      );
      script?.setAttribute("data-title", title);
      script?.setAttribute("data-btn-title", button);

      const launcherText = document.querySelector<HTMLElement>(
        "#runnrai-container .wdc-launcher--text",
      );
      if (launcherText && launcherText.textContent !== button) {
        launcherText.textContent = button;
      }

      const headerTitle = document.querySelector<HTMLElement>(
        "#runnrai-container .wdc-header--hotel-name",
      );
      if (headerTitle && headerTitle.textContent?.trim() !== title) {
        headerTitle.textContent = title;
      }

      const messageInput = document.querySelector<HTMLElement>(
        "#runnrai-container .wdc-user-input--text",
      );
      if (messageInput?.getAttribute("placeholder") !== placeholder) {
        messageInput?.setAttribute("placeholder", placeholder);
      }

      const launcher = document.querySelector<HTMLElement>(
        "#runnrai-container .wdc-launcher",
      );
      launcher?.setAttribute("aria-label", button);
    };

    syncCopy();
    const observer = new MutationObserver(syncCopy);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [button, placeholder, title]);

  useEffect(() => {
    const onMapExpanded = (event: Event) => {
      const detail = (event as CustomEvent<MapExpandedEventDetail>).detail;
      if (detail?.expanded === true) {
        document.documentElement.dataset.runnrMapExpanded = "true";
      } else {
        delete document.documentElement.dataset.runnrMapExpanded;
      }
    };

    window.addEventListener(MAP_EXPANDED_EVENT, onMapExpanded);
    return () => {
      window.removeEventListener(MAP_EXPANDED_EVENT, onMapExpanded);
      delete document.documentElement.dataset.runnrMapExpanded;
    };
  }, []);

  return (
    <Script
      async
      crossOrigin="anonymous"
      data-btn-title={button}
      data-primary-color="#0e2d56"
      data-title={title}
      data-widget="chat"
      id="runnr-chat-widget"
      src={RUNNR_SCRIPT_SRC}
      strategy="afterInteractive"
      type="application/javascript"
    />
  );
}
