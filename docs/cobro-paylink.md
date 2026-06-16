# Cobro por link de pago — guía rápida (recepción)

> Guía operativa para el equipo de recepción de Los Lagos Hotel.
> Versión en inglés (referencia): [cobro-paylink.en.md](cobro-paylink.en.md)

**Por qué leer esto:** el importe que ve el huésped en la web y los campos de
precio de la reserva **los calcula el navegador del huésped**. Sirven como guía,
pero pueden quedar desactualizados (el tipo de cambio se mueve) o, en casos
raros, venir alterados. **Antes de cobrar, confirmá siempre contra Cloudbeds y el
tipo de cambio oficial del día.**

## Antes de enviar el link, verificá 3 cosas

**1 · Residencia → define si paga IVA (21 %)**

- Mirá el campo **Factura T**: `SI` = residente en el **exterior** (exento de IVA
  — Decreto 1043/2016) · `NO` = residente en **Argentina** (paga IVA).
- Es lo que **declaró el huésped** en la web. Se valida con documentación
  (pasaporte / acreditación de residencia) en el check-in. Si declaró mal,
  **corregí el importe**.

**2 · Tipo de cambio → confirmá que esté vigente**

- El campo **TC (ARS por USD)** es el que tomó el navegador al momento de
  reservar.
- Compará con el **TC oficial del hotel del día**. Si difiere más de ~**2 %**
  *(ajustá este margen según política del hotel)*, recalculá con el oficial.

**3 · Importe → tiene que cerrar contra Cloudbeds**

- El **total en ARS con IVA** de los campos debe coincidir (salvo redondeo) con
  el **total propio de la reserva en Cloudbeds**. Si no coincide → **frená y
  revisá**.
- Chequeo rápido: `neto + IVA = total` · `IVA ≈ neto × 21 %` ·
  `total USD × TC ≈ total ARS`.

## Qué importe cobrar

| Huésped (Factura T) | Se cobra | Campo a usar |
| --- | --- | --- |
| **Exterior** (`SI`) | **Neto, SIN IVA** | precio sin IVA (USD o ARS) |
| **Argentina** (`NO`) | **Total, CON IVA** | precio con IVA (USD o ARS) |

*Elegí la columna USD o ARS según la moneda en la que armás el link.*

## Frená y escalá si…

- Los campos están **vacíos o en cero** → no adivines: usá el **total propio de
  Cloudbeds + TC oficial del día** y calculá a mano.
- Los números **no cierran entre sí** (los chequeos del punto 3 fallan) →
  reserva desactualizada o sospechosa; **recalculá manualmente** antes de cobrar.
- El huésped pide exención de IVA pero **no acredita residencia en el exterior**
  → cobrá **con IVA**.

---

*Referencia de campos (nombres internos por defecto, pueden variar según
configuración):*

| Significado | Nombre interno |
| --- | --- |
| Tipo de cambio (ARS por USD) | `cf_fx_ars_usd` |
| Neto sin IVA (ARS / USD) | `cf_precio_sin_iva_ars` / `cf_precio_sin_iva_usd` |
| IVA (ARS / USD) | `cf_iva_ars` / `cf_iva_usd` |
| Total con IVA (ARS / USD) | `cf_precio_ars_con_iva` / `cf_precio_usd_con_iva` |
| Factura T (`SI` = exterior / `NO` = Argentina) | `cf_factura_t` |
