import { describe, expect, it } from "vitest";
import {
  calculateReviewSummary,
  REVIEW_PLATFORMS,
  REVIEW_SUMMARY,
} from "@/lib/review-summary";

describe("review summary", () => {
  it("combines the current three platforms on a five-point scale", () => {
    expect(REVIEW_SUMMARY).toEqual({
      rating: 4.3,
      reviewCount: 453,
      displayedReviewCount: 450,
    });
  });

  it("only advances the public count at the next multiple of 50", () => {
    expect(
      calculateReviewSummary([{ rating: 5, bestRating: 5, reviewCount: 499 }])
        .displayedReviewCount,
    ).toBe(450);
    expect(
      calculateReviewSummary([{ rating: 5, bestRating: 5, reviewCount: 500 }])
        .displayedReviewCount,
    ).toBe(500);
  });

  it("keeps the editable data limited to Google, Booking and Expedia", () => {
    expect(Object.keys(REVIEW_PLATFORMS)).toEqual(["google", "booking", "expedia"]);
  });
});
