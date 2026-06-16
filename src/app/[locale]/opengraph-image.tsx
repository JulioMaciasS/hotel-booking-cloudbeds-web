import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

// Applies to this segment and every page beneath it, so every route gets a
// branded preview card on WhatsApp, Facebook, X and LinkedIn.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Los Lagos Hotel · El Calafate, Patagonia";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const TAGLINE: Record<string, string> = {
  es: "Reserva directa · Mejor tarifa garantizada",
  en: "Direct booking · Best rate guaranteed",
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline = TAGLINE[locale] ?? TAGLINE.es;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1f2b27 0%, #2e5049 100%)",
          color: "white",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#6dbfaa",
            fontWeight: 600,
          }}
        >
          El Calafate · Patagonia
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 110, fontWeight: 700, lineHeight: 1 }}>
            Los Lagos Hotel
          </div>
          <div style={{ fontSize: 40, marginTop: 28, color: "rgba(255,255,255,0.85)" }}>
            {tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <div style={{ display: "flex", gap: 4, color: "#fbbf24" }}>
            {"★★★★".split("").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
          <span style={{ color: "rgba(255,255,255,0.8)" }}>
            4.3 · +400 reviews · loslagoshotel.com.ar
          </span>
        </div>
      </div>
    ),
    size,
  );
}
