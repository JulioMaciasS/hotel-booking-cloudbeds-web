import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | Los Lagos Hotel",
  description:
    "Política de privacidad y protección de datos personales de Los Lagos Hotel, conforme a la Ley 25.326.",
};

const LAST_UPDATED = "18 de mayo de 2026";

export default function PrivacidadPage() {
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
          Política de Privacidad
        </h1>
        <p className="mt-3 text-sm text-[#5f6e69]">
          Última actualización: {LAST_UPDATED}
        </p>

        <div className="mt-10 space-y-10 text-[#3b4c46]">

          {/* Intro */}
          <section>
            <p className="leading-7">
              En <strong>Los Lagos Hotel</strong> nos comprometemos a proteger
              la privacidad de nuestros huéspedes y visitantes. La presente
              Política de Privacidad describe cómo recolectamos, usamos,
              almacenamos y protegemos sus datos personales, de conformidad con
              la <strong>Ley 25.326 de Protección de los Datos Personales</strong>{" "}
              (LPDP), su Decreto Reglamentario 1558/2001 y las disposiciones de
              la{" "}
              <strong>
                Agencia de Acceso a la Información Pública (AAIP)
              </strong>
              .
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              1. Responsable del tratamiento
            </h2>
            <p className="leading-7">
              <strong>Los Lagos Hotel</strong>
              <br />
              Domicilio: 25 de Mayo 220, Z9405 El Calafate, Provincia de Santa
              Cruz, República Argentina
              <br />
              Correo electrónico:{" "}
              <a
                href="mailto:loslagoshotelcalafate@gmail.com"
                className="text-[#38645b] underline underline-offset-2"
              >
                loslagoshotelcalafate@gmail.com
              </a>
              <br />
              Teléfono: +54 2902 417738
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              2. Datos personales que recolectamos
            </h2>
            <p className="leading-7">
              Recolectamos datos personales en los siguientes contextos:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>Formulario de contacto:</strong> nombre y apellido,
                dirección de correo electrónico, número de teléfono (opcional) y
                el contenido del mensaje.
              </li>
              <li>
                <strong>Reservas en línea:</strong> nombre y apellido, correo
                electrónico, teléfono, número de documento o pasaporte,
                nacionalidad, datos de tarjeta de crédito/débito (procesados
                directamente por el procesador de pagos), fechas de estadía y
                preferencias de habitación.
              </li>
              <li>
                <strong>Check-in presencial:</strong> número de documento o
                pasaporte, según lo exigido por la normativa policial provincial
                de registro de huéspedes.
              </li>
              <li>
                <strong>Navegación web:</strong> dirección IP, tipo de
                navegador, páginas visitadas y tiempo de permanencia, a través
                de cookies técnicas (ver sección 7).
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              3. Finalidad del tratamiento
            </h2>
            <p className="leading-7">
              Sus datos personales son tratados para las siguientes finalidades:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Gestionar y confirmar reservas de alojamiento.</li>
              <li>
                Responder consultas y solicitudes realizadas a través del
                formulario de contacto, correo electrónico o teléfono.
              </li>
              <li>
                Cumplir obligaciones legales de registro de huéspedes ante la
                autoridad policial provincial.
              </li>
              <li>
                Emitir comprobantes fiscales conforme a las exigencias de la
                AFIP.
              </li>
              <li>
                Mejorar la experiencia del usuario en el sitio web mediante el
                análisis agregado del tráfico.
              </li>
              <li>
                Enviar información sobre el establecimiento o promociones, única
                y exclusivamente cuando el titular haya prestado su
                consentimiento expreso.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              4. Base de legitimación
            </h2>
            <p className="leading-7">
              El tratamiento de sus datos se fundamenta en:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>Ejecución de un contrato:</strong> los datos necesarios
                para gestionar la reserva y la estadía.
              </li>
              <li>
                <strong>Cumplimiento de una obligación legal:</strong> registro
                de huéspedes y emisión de comprobantes fiscales.
              </li>
              <li>
                <strong>Consentimiento del titular:</strong> para el envío de
                comunicaciones comerciales y el uso de cookies no estrictamente
                necesarias.
              </li>
              <li>
                <strong>Interés legítimo:</strong> para el análisis agregado de
                la navegación web con fines de mejora del servicio.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              5. Destinatarios y transferencias de datos
            </h2>
            <p className="leading-7">
              Sus datos podrán ser compartidos con:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>Cloudbeds, Inc.</strong> (Estados Unidos): plataforma de
                gestión hotelera y motor de reservas. Cloudbeds procesa datos en
                los Estados Unidos, país que no cuenta con declaración de nivel
                adecuado de protección por parte de la AAIP. El hotel ha
                celebrado con Cloudbeds un acuerdo de procesamiento de datos que
                incluye las garantías adecuadas previstas por el Art. 12 de la
                Ley 25.326.
              </li>
              <li>
                <strong>Procesadores de pago:</strong> los datos de tarjeta son
                procesados directamente por el proveedor de pagos integrado en
                el motor de reservas bajo estándares PCI-DSS. El hotel no
                almacena números de tarjeta.
              </li>
              <li>
                <strong>Autoridades competentes:</strong> Policía Provincial,
                AFIP u otras autoridades cuando exista obligación legal de
                informar.
              </li>
            </ul>
            <p className="mt-3 leading-7">
              No vendemos ni cedemos sus datos personales a terceros con fines
              comerciales propios.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              6. Plazo de conservación
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>Datos de reservas y estadías:</strong> se conservan
                durante 5 (cinco) años desde la fecha de check-out, en
                cumplimiento de los plazos de prescripción contractual previstos
                por el Código Civil y Comercial de la Nación, y de las
                obligaciones impositivas ante la AFIP.
              </li>
              <li>
                <strong>Datos del formulario de contacto:</strong> se conservan
                durante el tiempo necesario para resolver la consulta y, como
                máximo, 1 (un) año posterior a la última comunicación.
              </li>
              <li>
                <strong>Registro policial de huéspedes:</strong> conforme a los
                plazos exigidos por la normativa provincial aplicable.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              7. Cookies
            </h2>
            <p className="leading-7">
              Este sitio web puede utilizar cookies técnicas estrictamente
              necesarias para el funcionamiento del motor de reservas. Estas
              cookies no requieren consentimiento previo ya que son esenciales
              para la prestación del servicio solicitado por el usuario. No se
              emplean cookies de seguimiento o publicidad comportamental de
              terceros.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              8. Derechos del titular (Habeas Data)
            </h2>
            <p className="leading-7">
              De conformidad con los artículos 14 a 16 de la Ley 25.326, el
              titular de los datos tiene derecho a:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>
                <strong>Acceso:</strong> solicitar información sobre los datos
                personales que el hotel posea sobre usted.
              </li>
              <li>
                <strong>Rectificación:</strong> solicitar la corrección de datos
                inexactos, incompletos o desactualizados.
              </li>
              <li>
                <strong>Supresión:</strong> solicitar la eliminación de sus
                datos cuando resulte procedente conforme a la ley.
              </li>
              <li>
                <strong>Confidencialidad:</strong> exigir que sus datos no sean
                cedidos a terceros sin su consentimiento.
              </li>
              <li>
                <strong>Oposición:</strong> oponerse al tratamiento de sus datos
                con fines de comunicaciones comerciales.
              </li>
            </ul>
            <p className="mt-4 rounded-lg bg-[#edf3ef] px-4 py-3 text-sm leading-7">
              Para ejercer cualquiera de estos derechos, diríjase por escrito a{" "}
              <a
                href="mailto:loslagoshotelcalafate@gmail.com"
                className="text-[#38645b] underline underline-offset-2"
              >
                loslagoshotelcalafate@gmail.com
              </a>
              , indicando su nombre completo, número de documento y el derecho
              que desea ejercer. El hotel responderá en el plazo de 5 días
              hábiles conforme al Art. 14 de la Ley 25.326.
            </p>
            <p className="mt-3 leading-7">
              Si considera que su solicitud no ha sido atendida, puede acudir a
              la{" "}
              <strong>
                Agencia de Acceso a la Información Pública (AAIP)
              </strong>
              , organismo de control de la Ley 25.326:{" "}
              <a
                href="https://www.argentina.gob.ar/aaip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38645b] underline underline-offset-2"
              >
                www.argentina.gob.ar/aaip
              </a>
              .
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              9. Seguridad de los datos
            </h2>
            <p className="leading-7">
              El hotel adopta las medidas técnicas y organizativas necesarias
              para garantizar la seguridad e integridad de los datos personales
              y evitar su alteración, pérdida, tratamiento o acceso no
              autorizado, habida cuenta del estado de la tecnología y la
              naturaleza de los datos almacenados (Art. 9, Ley 25.326).
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1f2b27]">
              10. Modificaciones de esta política
            </h2>
            <p className="leading-7">
              El hotel se reserva el derecho de actualizar esta Política de
              Privacidad en cualquier momento. Toda modificación será publicada
              en esta página con la fecha de actualización correspondiente. Se
              recomienda revisar periódicamente este documento.
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
            href="/terminos"
            className="text-[#5f6e69] underline underline-offset-2 transition hover:text-[#1f2b27]"
          >
            ← Términos y Condiciones
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
