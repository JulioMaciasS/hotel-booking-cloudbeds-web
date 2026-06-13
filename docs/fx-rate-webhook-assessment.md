# FX Rate Delivery — Webhook vs. Current Approach

**Assessment for business analysis · 13 Jun 2026**
**Scope:** `hotel-booking-cloudbeds-web` (public booking site) and `hotel-rate-cloudbeds-ops` (rate operations)

---

## Executive summary

The booking website converts Argentine-peso (ARS) prices into US dollars (USD) for
guests using an exchange rate produced by our operations system. The question raised
was whether a **webhook** (the rate system actively "pushes" updates to the website)
would be more appropriate than the **current approach** (the website periodically
"pulls" the latest rate).

**Conclusion: keep the current pull-based approach.** A webhook would add cost and new
failure points while solving the wrong part of the problem. The freshness concern that
motivated the question is better and more cheaply addressed with small website-side
tuning — and even that is optional, given the rate changes only ~1–2 times per day.

**Decision taken:** leave the implementation as-is for now.

---

## Background — how it works today

1. Operations confirms a new USD/ARS rate roughly **1–2 times per day** (driven by
   scheduled central-bank rate checks during Argentine business hours).
2. The booking website asks operations for "the latest confirmed rate" and uses it to
   display USD prices next to the peso prices inside the Cloudbeds booking widget.
3. Multiple safety layers keep prices sensible: a sanity range, a "stale" flag for
   older rates, a last-known-good fallback, and a rule to leave prices in ARS rather
   than ever guess a rate.

Importantly, **the guest is always charged in ARS through Cloudbeds.** The USD figure is
an *indicative display* to help international guests, not the amount billed.

---

## The proposal evaluated — would a webhook help?

A webhook would have operations notify the website the moment a rate changes, instead
of the website checking periodically. In principle this reduces unnecessary checks and
speeds up updates. In our specific setup, it does neither meaningfully:

| Consideration | Finding |
|---|---|
| **Who needs the fresh rate?** | The guest's browser. A webhook can only notify our *server*, not the guest's open browser tab — so the guest-facing speed does not improve without building a separate live-push channel (a much larger project). |
| **Update frequency** | The rate changes 1–2×/day. The website already avoids redundant checks via caching, so there is little waste to eliminate. |
| **Reliability** | Webhooks are "fire-and-forget": if a delivery fails (e.g. during a deployment), the update is lost and we'd need retries plus a periodic check as backup anyway. The current approach self-corrects on every cycle. |
| **New infrastructure** | A webhook would require a secured public endpoint and shared storage on the website side that does not exist today. |
| **Net benefit** | Marginal cost savings, no real freshness gain for guests, more moving parts. |

This is a textbook case where periodic pulling of a cached value is the right pattern.

---

## The real driver — freshness — and where the delay actually is

The concern motivating the webhook idea was **freshness** (guests seeing an up-to-date
rate). The delay a guest could experience does **not** come from the website↔operations
link a webhook would speed up. It comes from two other places:

1. A short caching window on the website (up to ~2 minutes) — only affects a *fresh
   page load*.
2. The website fetches the rate once when the page opens and does not update an
   already-open tab.

A webhook addresses neither of these. The cheap, no-new-infrastructure fix would be to
shorten the caching window so fresh page loads get a more current rate.

We deliberately are **not** auto-updating the rate inside an open tab, because changing a
displayed price while a guest is mid-reservation is poor experience. Freezing the rate
for the duration of a booking is the safer, intended behavior.

---

## Recommendation

- **Do not build a webhook** for FX rate delivery. The cost/complexity is not justified
  by the benefit.
- **Optional, low-risk improvement (deferred):** shorten the website's rate-cache window
  so new visitors see a fresher rate. Invisible to anyone already booking; no
  operations changes required. *Not being implemented at this time.*
- **Keep the rate stable during an active reservation** — current behavior — so a
  guest's displayed price never shifts mid-checkout.

## Why this is low-risk to leave as-is

Because the rate moves only 1–2×/day and the guest is billed in ARS regardless, a
display that is a few minutes behind has no commercial impact. The current design
already degrades gracefully (stale flag, last-known-good, ARS fallback), so guests are
never shown a wrong or missing price.

---

*Prepared by engineering. Decision of record: no change at this time.*
