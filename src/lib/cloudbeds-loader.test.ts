import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendCloudbedsLoader, CLOUDBEDS_LOADER_URL, CLOUDBEDS_SCRIPT_ID } from "./cloudbeds-loader";
import { CLOUDBEDS_PUBLIC_RATE_PLAN_ID, CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID } from "./cloudbeds-rate-plan-guard";

describe("Cloudbeds bootstrap", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/reservas?checkin=2027-02-26&checkout=2027-02-27");
    delete document.documentElement.dataset.hotelGhsTechnicalRatePlan;
  });
  afterEach(() => {
    document.getElementById(CLOUDBEDS_SCRIPT_ID)?.remove();
    vi.restoreAllMocks();
  });

  it("uses the official stable loader with the essential immersive dataset", () => {
    const appendChild = Node.prototype.appendChild;
    appendCloudbedsLoader();
    const script = document.getElementById(CLOUDBEDS_SCRIPT_ID) as HTMLScriptElement;
    expect(script.src).toBe(CLOUDBEDS_LOADER_URL);
    expect(script.async).toBe(true);
    expect(script.crossOrigin).toBe("anonymous");
    expect(script.dataset.entry).toBe("immersive");
    expect(script.dataset.cookieconsent).toBe("ignore");
    expect(Node.prototype.appendChild).toBe(appendChild);
  });

  it("does not insert a second loader on remount", () => {
    appendCloudbedsLoader();
    appendCloudbedsLoader();
    expect(document.querySelectorAll(`#${CLOUDBEDS_SCRIPT_ID}`)).toHaveLength(1);
  });

  it("rewrites the technical GHS URL before the loader can execute", () => {
    window.history.replaceState({}, "", `/reservas?origin=gha&rpid=${CLOUDBEDS_TECHNICAL_GHS_RATE_PLAN_ID}&checkin=2027-02-26&currency=USD`);
    const append = document.head.append.bind(document.head);
    const spy = vi.spyOn(document.head, "append").mockImplementation((...nodes) => {
      expect(new URL(window.location.href).searchParams.get("rpid")).toBe(CLOUDBEDS_PUBLIC_RATE_PLAN_ID);
      expect(document.documentElement.dataset.hotelGhsTechnicalRatePlan).toBe("true");
      append(...nodes);
    });
    appendCloudbedsLoader();
    expect(spy).toHaveBeenCalledOnce();
    expect(new URL(window.location.href).searchParams.get("currency")).toBe("USD");
  });

  it("leaves normal dates and public rate plans unchanged", () => {
    const before = window.location.href;
    appendCloudbedsLoader();
    expect(window.location.href).toBe(before);
    expect(document.documentElement.dataset.hotelGhsTechnicalRatePlan).toBeUndefined();
  });
});
