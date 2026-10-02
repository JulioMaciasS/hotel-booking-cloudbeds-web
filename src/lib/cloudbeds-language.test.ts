import { expect, it } from "vitest";
import { getCloudbedsLanguage } from "./cloudbeds-language";

it.each([["es", "es"], ["en", "en"], ["pt", "pt-br"]])(
  "maps site language %s to Cloudbeds %s",
  (locale, expected) => expect(getCloudbedsLanguage(locale)).toBe(expected),
);
