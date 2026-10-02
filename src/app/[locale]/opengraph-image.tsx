import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

/* next/image cannot be rendered inside an ImageResponse. */
/* eslint-disable @next/next/no-img-element */

// Applies to this segment and every page beneath it, so every route gets a
// branded preview card on WhatsApp, Facebook, X and LinkedIn.
// Square artwork also survives WhatsApp's compact thumbnail layout. Keep the
// logo close to its native resolution, rather than upscaling the raster asset.
export const size = { width: 600, height: 600 };
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
          background: "#fbf8f1",
        }}
      >
        <img
          alt="Los Lagos Hotel"
          src={logoDataUrl}
          width={548}
          height={354}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  );
}
