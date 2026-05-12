import Script from "next/script";
import { publicConfig } from "@/lib/config";

const CLOUDBEDS_SCRIPT_ID = "cloudbeds-immersive-experience-script";
const CLOUDBEDS_SCRIPT_SRC =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

export function CloudbedsBookingEmbed() {
  return (
    <div className="min-h-[760px] bg-white" data-testid="cloudbeds-embed-root">
      <Script
        data-cloudbeds-immersive="true"
        data-cookieconsent="ignore"
        id={CLOUDBEDS_SCRIPT_ID}
        src={CLOUDBEDS_SCRIPT_SRC}
        strategy="afterInteractive"
        type="text/javascript"
      />
      <cb-immersive-experience
        currency={publicConfig.baseCurrency}
        data-testid="cloudbeds-standard-embed"
        mode="standard"
        property-code={publicConfig.propertyCode}
      />
      <noscript>
        <a href={`https://us2.cloudbeds.com/reservation/${publicConfig.propertyCode}`}>
          Abrir reserva en Cloudbeds
        </a>
      </noscript>
    </div>
  );
}
