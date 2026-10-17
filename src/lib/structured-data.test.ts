import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { HOTEL } from "./site-data";
import { lodgingBusinessJsonLd } from "./structured-data";

vi.mock("@/i18n/metadata", () => ({ siteUrl: "https://www.loslagoshotel.com.ar" }));

describe("Los Lagos Hotel identity", () => {
  it.each(["es", "en", "pt"])("keeps visible copy and structured identity aligned in %s", locale => {
    const load = (namespace: string) => JSON.parse(readFileSync(
      resolve(process.cwd(), "messages", locale, `${namespace}.json`), "utf8",
    ));
    const home = load("home");
    const metadata = load("metadata").home;
    const hotel = load("hotel");
    const identity = lodgingBusinessJsonLd(home.hero.subtitle);

    expect(identity["@type"]).toBe("Hotel");
    expect(identity["@id"]).toBe("https://www.loslagoshotel.com.ar/#hotel");
    expect(identity.name).toBe("Los Lagos Hotel");
    expect(identity.alternateName).toBe("Hotel Los Lagos");
    expect(identity.description).toBe(home.hero.subtitle);
    expect(identity.address.postalCode).toBe("Z9405ACF");
    expect(identity.address.streetAddress).toBe(HOTEL.street);
    expect(identity.numberOfRooms).toBe(14);
    expect(identity.logo).toBe("https://www.loslagoshotel.com.ar/opengraph-image");
    expect(identity.geo).toEqual({ "@type": "GeoCoordinates", latitude: -50.3357896, longitude: -72.2666423 });
    for (const text of [home.hero.subtitle, hotel.page.story.paragraph2, metadata.description]) {
      expect(text).toContain("25 de Mayo 220");
      expect(text).toContain("El Calafate");
      expect(text).not.toMatch(/lagos del calafate/i);
    }
    expect(metadata.title).toContain("Los Lagos Hotel");
    expect(metadata.title).toContain("El Calafate");
    expect(metadata.title).toMatch(/oficial|official/i);
    expect(identity.sameAs).toContain(HOTEL.googleMapsUrl);
    expect(identity.sameAs).toContain(HOTEL.tripadvisorUrl);
  });

  it("uses a permanent Maps URL for the exact existing listing, without stay or tracking parameters", () => {
    const maps = new URL(HOTEL.googleMapsUrl);
    expect(maps.hostname).toBe("www.google.com");
    expect(maps.pathname).toBe("/maps");
    expect([...maps.searchParams.keys()]).toEqual(["cid"]);
    expect(maps.searchParams.get("cid")).toBe(BigInt("0xabbbd7fd7dbc58e5").toString());
    expect(HOTEL.cityLine).toContain(HOTEL.postalCode);
  });
});
