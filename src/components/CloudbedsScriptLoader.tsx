"use client";

import { useEffect } from "react";

const CLOUDBEDS_SCRIPT_ID = "cloudbeds-immersive-experience-script";
const CLOUDBEDS_SCRIPT_SRC =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

export function CloudbedsScriptLoader() {
  useEffect(() => {
    if (document.getElementById(CLOUDBEDS_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cloudbedsImmersive = "true";
    script.dataset.cookieconsent = "ignore";
    script.id = CLOUDBEDS_SCRIPT_ID;
    script.src = CLOUDBEDS_SCRIPT_SRC;
    script.type = "text/javascript";

    document.head.append(script);
  }, []);

  return null;
}
