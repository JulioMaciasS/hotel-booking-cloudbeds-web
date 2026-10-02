import { expect, test } from "@playwright/test";
import { mockCloudbeds } from "./mock-cloudbeds";

test.beforeEach(async ({ page }) => {
  await mockCloudbeds(page);
});

test("serves Spanish (default locale) at the unprefixed root", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  // Desktop nav shows the Spanish labels.
  await expect(
    page.locator("header nav").first().getByRole("link", { name: "El Hotel" }),
  ).toBeVisible();
});

test("serves English under /en with translated nav and lang attribute", async ({
  page,
}) => {
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.locator("header nav").first().getByRole("link", { name: "The Hotel" }),
  ).toBeVisible();
  // Inner English routes are prefixed.
  await expect(
    page.locator("header nav").first().getByRole("link", { name: "Rooms" }),
  ).toHaveAttribute("href", "/en/habitaciones");
});

test("English inner page renders translated content", async ({ page }) => {
  await page.goto("/en/habitaciones", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1").first()).toBeVisible();
  // The shared footer is translated.
  await expect(page.getByText("Privacy Policy")).toBeVisible();
});

test("language switcher swaps locale while keeping the same page", async ({
  page,
}) => {
  await page.goto("/hotel", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  // Wait for the client switcher to hydrate before clicking — otherwise the
  // click can fire before its onClick handler is attached and do nothing.
  await page.waitForLoadState("domcontentloaded");
  await page.locator("header").getByRole("button", { name: "Cambiar idioma" })
    .filter({ visible: true }).first().click();
  const enButton = page.getByRole("listbox").getByRole("button", { name: "English" });
  await expect(enButton).toBeEnabled();

  // Click the EN segment of the switcher (desktop one).
  await enButton.click();

  await expect(page).toHaveURL(/\/en\/hotel$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Portuguese routes, metadata and date picker retain their locale", async ({ page }) => {
  await page.goto("/pt", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "pt_BR");
  await expect(page.locator('link[rel="alternate"][hreflang="pt"]')).toHaveAttribute("href", /\/pt$/);
  await expect(page.locator("cb-property-date-picker")).toHaveAttribute("lang", "pt-br");
  await expect(page.locator("cb-property-date-picker")).toHaveAttribute("custom-url", "http://localhost:3100/pt/reservas");
  await page.goto("/pt/hotel?checkin=2027-02-26&checkout=2027-02-28");
  await page.locator("header").getByRole("button", { name: "Mudar idioma" })
    .filter({ visible: true }).first().click();
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(3);
  await page.getByRole("listbox").getByRole("button", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/hotel\?checkin=2027-02-26&checkout=2027-02-28$/);
});

for (const path of ["habitaciones", "hotel", "ubicacion", "que-hacer", "guia", "contacto", "terminos", "privacidad"]) {
  test(`Portuguese /${path} renders without missing translation keys`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`/pt/${path}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
    if (path === "guia") await expect(page.locator("h1").first()).toBeAttached();
    else await expect(page.locator("h1").first()).toBeVisible();
    expect(errors.filter((error) => /MISSING_MESSAGE|INVALID_MESSAGE|FORMATTING_ERROR/.test(error))).toEqual([]);
  });
}
