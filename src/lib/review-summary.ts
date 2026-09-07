export type ReviewPlatformValue = {
  rating: number;
  bestRating: number;
  reviewCount: number;
};

// Update these three entries whenever the public platform figures change.
// The hero, platform cards, footer, share image and structured data all derive
// their values automatically from this single block.
export const REVIEW_PLATFORMS = {
  google: { rating: 4.3, bestRating: 5, reviewCount: 107 },
  booking: { rating: 8.6, bestRating: 10, reviewCount: 298 },
  expedia: { rating: 8.4, bestRating: 10, reviewCount: 48 },
} as const satisfies Record<string, ReviewPlatformValue>;

export function calculateReviewSummary(platforms: readonly ReviewPlatformValue[]) {
  const reviewCount = platforms.reduce(
    (total, platform) => total + platform.reviewCount,
    0,
  );
  const weightedRatingTotal = platforms.reduce(
    (total, platform) =>
      total + (platform.rating / platform.bestRating) * 5 * platform.reviewCount,
    0,
  );

  return {
    rating: reviewCount === 0 ? 0 : Number((weightedRatingTotal / reviewCount).toFixed(1)),
    reviewCount,
    displayedReviewCount: Math.floor(reviewCount / 50) * 50,
  };
}

export const REVIEW_SUMMARY = calculateReviewSummary(Object.values(REVIEW_PLATFORMS));
