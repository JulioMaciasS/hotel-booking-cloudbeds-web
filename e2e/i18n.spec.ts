import { expect, test } from "@playwright/test";
import { mockCloudbeds } from "./mock-cloudbeds";

test.beforeEach(async ({ page }) => {
  await mockCloudbeds(page);
});

test("serves Spanish (default locale) at the unprefixed root", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  // Desktop nav shows the Spanish labels.
  await expect(
    page.locator("header nav").first().getByRole("link", { name: "El Hotel" }),
  ).toBeVisible();
});

test("serves English under /en with translated nav and lang attribute", async ({
  page,
}) => {
  await page.goto("/en");
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
  await page.goto("/en/habitaciones");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1").first()).toBeVisible();
  // The shared footer is translated.
  await expect(page.getByText("Privacy Policy")).toBeVisible();
});

test("language switcher swaps locale while keeping the same page", async ({
  page,
}) => {
  await page.goto("/hotel");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  // Click the EN segment of the switcher (desktop one).
  await page.locator("header").getByRole("button", { name: "EN" }).first().click();

  await expect(page).toHaveURL(/\/en\/hotel$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
