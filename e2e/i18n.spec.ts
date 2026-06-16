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
  const enButton = page
    .locator("header")
    .getByRole("button", { name: "EN" })
    .first();
  await expect(enButton).toBeEnabled();

  // Click the EN segment of the switcher (desktop one).
  await enButton.click();

  await expect(page).toHaveURL(/\/en\/hotel$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
