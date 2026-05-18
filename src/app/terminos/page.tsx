import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Los Lagos Hotel",
  description:
    "Términos y condiciones de reserva y alojamiento de Los Lagos Hotel, El Calafate, Argentina.",
};

const LAST_UPDATED = "18 de mayo de 2026";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      {/* Header */}
      <header className="border-b border-black/5 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#38645b] transition hover:text-[#2e5049]"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
          <span className="text-sm text-[#5f6e69]">Los Lagos Hotel</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#38645b]">
          Legal
        </p>
        <h1 className="text-3xl font-semibold text-[#1f2b27] sm:text-4xl">
          Términos y Condiciones
        </h1>
        <p className="mt-3 text-sm text-[#5f6e69]">
          Última actualización: {LAST_UPDATED}
        </p>

        <div className="prose-custom mt-10 space-y-10 text-[#3b4c46]">

          {/* 1 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              1. Datos del prestador
            </h2>
            <p className="leading-7">
              El presente sitio web y el servicio de alojamiento son prestados
              por <strong>Los Lagos Hotel</strong>, con domicilio en 25 de Mayo
              220, Z9405 El Calafate, Provincia de Santa Cruz, República
              Argentina. Contacto:{" "}
              <a
                href="mailto:loslagoshotelcalafate@gmail.com"
                className="text-[#38645b] underline underline-offset-2"
              >
                loslagoshotelcalafate@gmail.com
              </a>{" "}
              / +54 2902 417738.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              2. Objeto
            </h2>
            <p className="leading-7">
              Los presentes Términos y Condiciones regulan la relación entre Los
              Lagos Hotel y el huésped con respecto a la reserva y prestación del
              servicio de alojamiento, de conformidad con la{" "}
              <strong>Ley 24.240 de Defensa del Consumidor</strong> y el{" "}
              <strong>Código Civil y Comercial de la Nación</strong> (Ley
              26.994).
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              3. Proceso de reserva y confirmación
            </h2>
            <p className="leading-7">
              Las reservas pueden realizarse a través del motor de reservas en
              línea (gestionado por Cloudbeds), por correo electrónico o por
              teléfono. La reserva se considerará confirmada una vez que el
              huésped reciba una comunicación escrita de confirmación por parte
              del hotel. El hotel se reserva el derecho de no confirmar una
              reserva sin necesidad de expresar causa alguna, en cuyo caso
              reintegrará de inmediato todo importe eventualmente abonado.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              4. Precios, moneda y facturación
            </h2>
            <p className="leading-7">
              Los precios publicados se expresan en pesos argentinos (ARS) o en
              dólares estadounidenses (USD) según se indique en el proceso de
              reserva. Para los turistas extranjeros no residentes en la
              República Argentina podrá aplicarse la alícuota diferenciada
              prevista por la normativa vigente del Banco Central de la
              República Argentina (BCRA). El hotel emitirá la factura
              correspondiente de acuerdo con los requerimientos de la AFIP. Los
              precios incluyen los impuestos nacionales y provinciales vigentes,
              salvo indicación expresa en contrario.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              5. Política de cancelación
            </h2>
            <p className="leading-7">
              Las condiciones específicas de cancelación se informan en el
              momento de la reserva y varían según la tarifa seleccionada:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>Tarifa flexible:</strong> cancelación sin cargo hasta 48
                horas antes de la fecha de check-in prevista.
              </li>
              <li>
                <strong>Tarifa no reembolsable:</strong> sin derecho a
                reembolso ante cancelación, modificación o no presentación (no
                show).
              </li>
            </ul>
            <p className="mt-3 leading-7">
              En todos los casos, el hotel reintegrará los importes
              correspondientes dentro de los plazos previstos por la Ley 24.240
              y sus modificatorias.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              6. Derecho de revocación (Art. 34, Ley 24.240)
            </h2>
            <p className="leading-7">
              El huésped que haya contratado a distancia (por internet, correo
              electrónico o teléfono) tiene derecho a revocar la aceptación
              dentro de los{" "}
              <strong>
                10 (diez) días hábiles contados desde la fecha de confirmación
                de la reserva
              </strong>
              , sin responsabilidad alguna y sin necesidad de expresar causa,
              siempre que la fecha de check-in no sea inminente y el
              cumplimiento del contrato no haya comenzado. Para ejercer este
              derecho, el huésped debe notificar al hotel por correo electrónico
              o por teléfono.
            </p>
            <p className="mt-3 leading-7">
              Transcurrido dicho plazo, se aplicará la política de cancelación
              descripta en la sección 5.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              7. Check-in y check-out
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>Check-in:</strong> a partir de las 14:00 hs. Se
                solicitará documento de identidad (DNI o pasaporte) al momento
                del ingreso, de conformidad con la normativa de registro de
                huéspedes vigente.
              </li>
              <li>
                <strong>Check-out:</strong> hasta las 10:00 hs. La permanencia
                más allá de ese horario podrá ser facturada como una noche
                adicional.
              </li>
              <li>
                El depósito anticipado o el importe total de la reserva podrá
                ser requerido al momento del check-in como garantía.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              8. Obligaciones del huésped
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-7">
              <li>
                Presentar documento de identidad vigente al momento del
                check-in.
              </li>
              <li>
                Hacer uso de las instalaciones de manera responsable y
                respetuosa.
              </li>
              <li>
                Está prohibido fumar en el interior de las habitaciones y áreas
                comunes cerradas, conforme a la Ley 26.687 de Lucha Antitabaco.
              </li>
              <li>
                El huésped será responsable por los daños materiales que cause
                en las instalaciones del hotel, pudiendo ser facturados antes del
                check-out.
              </li>
              <li>
                El ingreso de visitas externas a las habitaciones deberá ser
                comunicado a la recepción.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              9. Responsabilidad
            </h2>
            <p className="leading-7">
              El hotel no se responsabiliza por la pérdida, robo o daño de
              objetos de valor que no hayan sido depositados en la caja de
              seguridad disponible en las habitaciones o en recepción. Se
              recomienda a los huéspedes utilizar los medios de resguardo
              provistos a tal fin.
            </p>
            <p className="mt-3 leading-7">
              El hotel no será responsable por incumplimientos derivados de
              causas de fuerza mayor o caso fortuito (incluyendo, sin limitación,
              desastres naturales, cortes de servicios públicos, actos de
              autoridad pública o situaciones de emergencia) conforme a los
              artículos 1730 y 1731 del Código Civil y Comercial de la Nación.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              10. Propiedad intelectual
            </h2>
            <p className="leading-7">
              Todos los contenidos de este sitio web (textos, imágenes,
              logotipos, diseño) son propiedad de Los Lagos Hotel o de sus
              licenciantes, y están protegidos por la{" "}
              <strong>Ley 11.723 de Propiedad Intelectual</strong>. Queda
              prohibida su reproducción, distribución o comunicación pública sin
              autorización expresa.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              11. Resolución de conflictos
            </h2>
            <p className="leading-7">
              Ante cualquier inconveniente, el huésped puede contactar al hotel
              directamente. Si no se alcanza una solución satisfactoria, el
              consumidor puede recurrir a:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>
                  Dirección Nacional de Defensa del Consumidor (DNDC):
                </strong>{" "}
                Sistema de resolución de conflictos en línea COPREC:{" "}
                <a
                  href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#38645b] underline underline-offset-2"
                >
                  www.argentina.gob.ar/defensadelconsumidor
                </a>
                .
              </li>
              <li>
                <strong>Defensa del Consumidor de la Provincia de Santa Cruz</strong>{" "}
                (jurisdicción local).
              </li>
            </ul>
          </section>

          {/* 12 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              12. Ley aplicable y jurisdicción
            </h2>
            <p className="leading-7">
              Los presentes Términos y Condiciones se rigen por las leyes de la
              República Argentina. Para la resolución de cualquier controversia,
              las partes se someten a la jurisdicción de los Tribunales
              Ordinarios de la ciudad de El Calafate, Provincia de Santa Cruz,
              con renuncia expresa a cualquier otro fuero o jurisdicción que
              pudiere corresponder, sin perjuicio de los derechos que la Ley
              24.240 y sus modificatorias reconocen al consumidor.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              13. Modificaciones
            </h2>
            <p className="leading-7">
              El hotel se reserva el derecho de modificar los presentes Términos
              y Condiciones en cualquier momento. Los cambios serán publicados en
              este sitio web con indicación de la fecha de última actualización.
              Las reservas ya confirmadas se regirán por los términos vigentes al
              momento de su confirmación.
            </p>
          </section>
        </div>

        {/* Bottom nav */}
        <div className="mt-14 flex flex-col gap-3 border-t border-black/5 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-[#38645b] transition hover:text-[#2e5049]"
          >
            <ArrowLeft size={15} />
            Volver al inicio
          </Link>
          <Link
            href="/privacidad"
            className="text-[#5f6e69] underline underline-offset-2 transition hover:text-[#1f2b27]"
          >
            Política de Privacidad →
          </Link>
        </div>
      </main>

      {/* Mini footer */}
      <footer className="bg-[#141e1c] px-5 py-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Los Lagos Hotel · El Calafate, Patagonia,
        Argentina
      </footer>
    </div>
  );
}
