import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";
import { routing } from "./routing";

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      Object.entries(flatten(child, prefix ? `${prefix}.${key}` : key)),
    ),
  );
}

const messageRoot = resolve(process.cwd(), "messages");
const namespaces = readdirSync(resolve(messageRoot, "es"));
const tokens = (message: string) =>
  [...new Set([...message.matchAll(/\{(\w+)(?:[,}])|<\/?(\w+)>/g)].map(
    (match) => match[1] ? `variable:${match[1]}` : `tag:${match[2]}`,
  ))].sort();

describe("Booking confirmation copy", () => {
  it.each(routing.locales)("requires payment instead of promising instant confirmation in %s", (locale) => {
    const load = (namespace: string) => flatten(JSON.parse(readFileSync(
      resolve(messageRoot, locale, `${namespace}.json`), "utf8",
    )));
    const rooms = load("rooms")["page.cta.description"];
    const hotel = load("hotel")["page.faq.items.directBooking.a"];
    const legal = load("legal")["terms.sections.2.body"];
    const instant = /confirmaci[oó]n inmediata|(?:instant|immediate) confirmation|confirmação imediata/i;
    for (const namespace of namespaces) {
      expect(readFileSync(resolve(messageRoot, locale, namespace), "utf8")).not.toMatch(instant);
    }
    const payment = { es: /pendiente de confirmación.*pago requerido/, en: /pending confirmation.*payment required/, pt: /pendente de confirmação.*pagamento exigido/ };
    for (const text of [rooms, hotel, legal]) expect(text).toMatch(payment[locale]);
  });
});

describe("Portuguese message completeness", () => {
  for (const namespace of namespaces) {
    it(`preserves all keys and formatting tokens in ${namespace}`, () => {
      const load = (locale: string) => flatten(JSON.parse(readFileSync(
        resolve(messageRoot, locale, namespace), "utf8",
      )));
      const spanish = load("es");
      const portuguese = load("pt");
      expect(Object.keys(portuguese).sort()).toEqual(Object.keys(spanish).sort());
      // Flat message keys are tested independently so arrays and rich text
      // are checked without imposing a different shape on next-intl messages.
      for (const [key, message] of Object.entries(portuguese)) {
        expect(message.trim(), key).not.toBe("");
        expect(tokens(message), key).toEqual(tokens(spanish[key]));
        const values = Object.fromEntries(tokens(message).map((token) => {
          const [kind, name] = token.split(":");
          return [name, kind === "tag" ? (chunks: unknown) => chunks : 2];
        }));
        // One message at a time avoids interpreting flattened dots as nesting.
        const single = createTranslator({ locale: "pt-BR", messages: { text: message },
          onError: (error) => { throw error; } });
        expect(() => single.rich("text", values as Parameters<typeof single.rich>[1]), key)
          .not.toThrow();
      }
    });
  }

  it("adds Portuguese without changing the default language or URL rules", () => {
    expect(routing.locales).toEqual(["es", "en", "pt"]);
    expect(routing.defaultLocale).toBe("es");
    expect(routing.localePrefix).toBe("as-needed");
    expect(routing.localeDetection).toBe(false);
  });
});
