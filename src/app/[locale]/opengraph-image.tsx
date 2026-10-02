import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

/* next/image cannot be rendered inside an ImageResponse. */
/* eslint-disable @next/next/no-img-element */

// Applies to this segment and every page beneath it, so every route gets a
// branded preview card on WhatsApp, Facebook, X and LinkedIn.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Los Lagos Hotel · El Calafate, Patagonia";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "assets", "old-web-images", "logo-sin-fondo.png"),
  );
  const logoDataUrl = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #fbf8f1 0%, #f0eadf 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -70,
            right: -70,
            bottom: -180,
            height: 320,
            borderRadius: "50% 50% 0 0",
            background: "rgba(11, 167, 173, 0.075)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -65,
            bottom: -95,
            width: 390,
            height: 390,
            transform: "rotate(45deg)",
            border: "5px solid rgba(100, 84, 72, 0.07)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            width: 1164,
            height: 594,
            border: "3px solid rgba(49, 91, 82, 0.25)",
            borderRadius: 28,
          }}
        />

        <img
          alt="Los Lagos Hotel"
          src={logoDataUrl}
          width={520}
          height={420}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  );
}
