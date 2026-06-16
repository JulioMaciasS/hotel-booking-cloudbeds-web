# Charging a reservation by pay-link — quick guide (front desk)

> Operational guide for the Los Lagos Hotel reception team.
> Spanish version (the one to print/share with staff): [cobro-paylink.md](cobro-paylink.md)

**Why read this:** the price the guest sees on the website and the price fields
stored on the reservation **are computed by the guest's own browser**. They are a
guide, but they can be stale (the FX rate moves) or, in rare cases, tampered
with. **Before charging, always confirm against Cloudbeds' own total and the
official rate of the day.**

## Before sending the link, check 3 things

**1 · Residency → determines whether IVA (21%) applies**

- Check the **Factura T** field: `SI` = resident **abroad** (IVA-exempt —
  Decreto 1043/2016) · `NO` = resident in **Argentina** (pays IVA).
- This is what the **guest declared** on the website. It is validated with
  documentation (passport / proof of residency) at check-in. If they declared it
  wrong, **correct the amount**.

**2 · FX rate → confirm it is current**

- The **FX field (ARS per USD)** is the rate the browser captured at booking
  time.
- Compare it with the **hotel's official rate for the day**. If it differs by
  more than ~**2%** *(adjust this margin per hotel policy)*, recompute with the
  official rate.

**3 · Amount → it must reconcile against Cloudbeds**

- The **ARS total with IVA** in the fields must match (rounding aside) the
  reservation's **own total in Cloudbeds**. If it doesn't → **stop and review**.
- Quick check: `net + IVA = total` · `IVA ≈ net × 21%` ·
  `total USD × FX ≈ total ARS`.

## Which amount to charge

| Guest (Factura T) | Charge | Field to use |
| --- | --- | --- |
| **Abroad** (`SI`) | **Net, WITHOUT IVA** | price without IVA (USD or ARS) |
| **Argentina** (`NO`) | **Total, WITH IVA** | price with IVA (USD or ARS) |

*Pick the USD or ARS column depending on the currency of the link.*

## Stop and escalate if…

- The fields are **empty or zero** → don't guess: use **Cloudbeds' own total +
  the official rate of the day** and compute by hand.
- The numbers **don't reconcile** (the checks in step 3 fail) → stale or
  suspicious reservation; **recompute manually** before charging.
- The guest requests an IVA exemption but **cannot prove residency abroad** →
  charge **with IVA**.

---

*Field reference (default internal names — may differ depending on
configuration):*

| Meaning | Internal name |
| --- | --- |
| FX rate (ARS per USD) | `cf_fx_ars_usd` |
| Net without IVA (ARS / USD) | `cf_precio_sin_iva_ars` / `cf_precio_sin_iva_usd` |
| IVA (ARS / USD) | `cf_iva_ars` / `cf_iva_usd` |
| Total with IVA (ARS / USD) | `cf_precio_ars_con_iva` / `cf_precio_usd_con_iva` |
| Factura T (`SI` = abroad / `NO` = Argentina) | `cf_factura_t` |
