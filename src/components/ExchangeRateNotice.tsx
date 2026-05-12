import { formatArsRate } from "@/lib/currency";

type ExchangeRateNoticeProps = {
  arsPerUsd: number;
};

export function ExchangeRateNotice({ arsPerUsd }: ExchangeRateNoticeProps) {
  return (
    <aside
      className="rounded-2xl border border-border bg-surface p-5 text-sm leading-6 text-muted"
      data-no-currency-conversion="true"
    >
      <strong className="block text-base text-foreground">
        Precios mostrados en USD
      </strong>
      Los importes se convierten visualmente con la cotizacion manual del hotel:
      1 USD = {formatArsRate(arsPerUsd)}. Cloudbeds procesa internamente la
      reserva en ARS y sigue siendo la fuente de verdad.
    </aside>
  );
}
