import { expect, test, type Page } from "@playwright/test";
import { mockCloudbeds } from "./mock-cloudbeds";

/** Public routes. /reservas needs booking params or it redirects home. */
const PAGES = [
  { name: "home", path: "/" },
  { name: "habitaciones", path: "/habitaciones" },
  { name: "hotel", path: "/hotel" },
  { name: "experiencias", path: "/experiencias" },
  { name: "ubicacion", path: "/ubicacion" },
  { name: "contacto", path: "/contacto" },
  { name: "reservas", path: "/reservas?checkin=2026-06-01&checkout=2026-06-03" },
  { name: "privacidad", path: "/privacidad" },
  { name: "terminos", path: "/terminos" },
  { name: "not-found", path: "/esta-ruta-no-existe-404" },
];

const LG_BREAKPOINT = 1024;

test.beforeEach(async ({ page }) => {
  await mockCloudbeds(page);
});

/** Right-edge overflow offenders, computed only when a page overflows. */
async function overflowOffenders(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth + 1;
    const offenders: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll("*"))) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      // Ignore elements clipped by an overflow-hidden ancestor (carousels,
      // hero slideshows) — they can extend past the edge without scrolling.
      const style = getComputedStyle(el);
      if (style.position === "fixed") continue;
      if (rect.right > limit) {
        const tag = el.tagName.toLowerCase();
        const cls =
          typeof el.className === "string" && el.className
            ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
            : "";
        offenders.push(`${tag}${cls} (right=${Math.round(rect.right)})`);
      }
    }
    return Array.from(new Set(offenders)).slice(0, 15);
  });
}

for (const { name, path } of PAGES) {
  test.describe(`${name} page`, () => {
    test("has no horizontal overflow and renders its heading", async ({
      page,
    }, testInfo) => {
      // Don't wait for "load"/"networkidle": in `next dev` the on-demand
      // opengraph-image (Satori) generation contends with the image optimizer
      // and those events can stall. Wait for real content instead.
      await page.goto(path, { waitUntil: "domcontentloaded" });

      // 1. A primary heading is rendered (also serves as the readiness wait
      //    before measuring layout). The /reservas page is the Cloudbeds embed
      //    (no h1 of its own), so we check its branded header instead.
      if (name === "reservas") {
        await expect(
          page.getByRole("link", { name: "Los Lagos Hotel" }),
        ).toBeVisible();
      } else {
        await expect(page.locator("h1").first()).toBeVisible();
      }

      // 2. The document must not scroll horizontally.
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      const offenders =
        scrollWidth > innerWidth + 1 ? await overflowOffenders(page) : [];
      expect(
        scrollWidth,
        `${name} @ ${testInfo.project.name} overflows horizontally. ` +
          `scrollWidth=${scrollWidth} > innerWidth=${innerWidth}. ` +
          `Offenders: ${offenders.join(" | ") || "none found"}`,
      ).toBeLessThanOrEqual(innerWidth + 1);
    });
  });
}

test.describe("site header navigation", () => {
  test("shows the right nav affordance for the breakpoint", async ({
    page,
  }) => {
    const width = page.viewportSize()!.width;
    const isDesktop = width >= LG_BREAKPOINT;

    // Use an inner page: the home page mounts the Cloudbeds booking loader,
    // whose full-screen "Cargando" overlay would intercept the hamburger click.
    // The header is identical across the site.
    await page.goto("/contacto", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");

    const hamburger = page.getByRole("button", { name: /Abrir menú|Cerrar menú/ });
    const desktopNav = page.locator("header nav").first();
    const reservarCta = page.getByRole("link", { name: "Reservar", exact: true });

    // The booking CTA is always reachable.
    await expect(reservarCta).toBeVisible();

    if (isDesktop) {
      await expect(desktopNav).toBeVisible();
      await expect(desktopNav.getByRole("link", { name: "El Hotel" })).toBeVisible();
      await expect(hamburger).toBeHidden();
    } else {
      await expect(hamburger).toBeVisible();
      await expect(desktopNav).toBeHidden();

      // Opening the hamburger reveals the drawer links.
      await hamburger.click();
      const drawerNav = page.locator("header nav").last();
      await expect(drawerNav.getByRole("link", { name: "El Hotel" })).toBeVisible();
    }
  });
});

test.describe("mobile booking bar", () => {
  test("appears only on mobile after scrolling", async ({ page }) => {
    const width = page.viewportSize()!.width;
    const isDesktop = width >= LG_BREAKPOINT;

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("domcontentloaded");

    const bar = page.getByText("Reservá tu estadía");

    if (isDesktop) {
      // lg:hidden — not part of the desktop layout.
      await expect(bar).toBeHidden();
      return;
    }

    // On mobile the bar exists but is translated off-screen until the user
    // scrolls past the hero; after scrolling it sits inside the viewport.
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect(bar).toBeVisible();

    const viewportHeight = page.viewportSize()!.height;
    await expect
      .poll(async () => {
        const box = await bar.boundingBox();
        return box ? box.y : Number.POSITIVE_INFINITY;
      })
      .toBeLessThan(viewportHeight - 10);
  });
});
