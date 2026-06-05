import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { HOTEL, services } from "@/lib/site-data";
import { BOOKING_HREF } from "@/lib/nav";
import facadeImage from "../../../../assets/updated images/otros/fachada frente del hotel 2_ai_edited.png";
import galDesayuno from "../../../../assets/updated images/otros/desayuno 2.jpg";
import galComedor from "../../../../assets/updated images/otros/comedor 1.jpg";
import galJardin from "../../../../assets/updated images/otros/jardin 3.jpg";
import galRecepcion from "../../../../assets/updated images/otros/recepcion 1.jpg";
import galBiblioteca from "../../../../assets/updated images/otros/biblioteca 1.jpg";
import galJardin2 from "../../../../assets/updated images/otros/jardin 5.jpg";

export const metadata: Metadata = {
  title: "El Hotel | Los Lagos Hotel, El Calafate",
  description:
    "Conocé Los Lagos Hotel: un pequeño hotel familiar en el centro de El Calafate, con desayuno casero incluido, servicios pensados para el huésped y atención personalizada las 24 horas.",
};

const gallery = [
  { src: galDesayuno, alt: "Desayuno casero incluido", caption: "Desayuno incluido" },
  { src: galComedor, alt: "Comedor del hotel", caption: "Comedor" },
  { src: galJardin, alt: "Jardín del hotel", caption: "Jardín" },
  { src: galRecepcion, alt: "Recepción 24 horas", caption: "Recepción 24 hs" },
  { src: galBiblioteca, alt: "Rincón de lectura", caption: "Espacios comunes" },
  { src: galJardin2, alt: "Exterior y jardín", caption: "Aire libre" },
];

const faqs = [
  {
    q: "¿Cuáles son los horarios de check-in y check-out?",
    a: "El check-in es a partir de las 14:00 y el check-out hasta las 10:00. La recepción está abierta las 24 horas, todos los días del año, así que podés llegar a cualquier hora.",
  },
  {
    q: "¿El desayuno está incluido?",
    a: "Sí. Todas las tarifas incluyen un desayuno continental casero: pan, tostadas, café, té, leche, yogures, jugos, cereales, mermelada, queso y fiambre.",
  },
  {
    q: "Soy turista extranjero, ¿pago el IVA?",
    a: "No. Las personas residentes en el exterior están exentas del IVA (21%) sobre el alojamiento cuando abonan con medios de pago del exterior. Al reservar podés indicar tu condición y, al hacer el check-in, verificamos tu DNI o pasaporte.",
  },
  {
    q: "¿Cómo es la política de cancelación?",
    a: "Depende de la tarifa elegida. La tarifa flexible permite cancelar sin cargo hasta 48 horas antes del check-in; la tarifa no reembolsable no admite cancelaciones ni cambios. Las condiciones se muestran claramente al reservar.",
  },
  {
    q: "¿Organizan excursiones y traslados a los glaciares?",
    a: "Sí. Coordinamos excursiones al Glaciar Perito Moreno, navegaciones por el Lago Argentino, El Chaltén y más, con salidas en bus desde el centro. Nuestra recepción te ayuda a planificar y reservar.",
  },
  {
    q: "¿Tienen estacionamiento?",
    a: "Sí, contamos con estacionamiento descubierto en la puerta del hotel, monitoreado por cámaras de seguridad, sin costo adicional para los huéspedes.",
  },
  {
    q: "¿Por qué conviene reservar directo en este sitio?",
    a: "Reservando acá conseguís siempre la mejor tarifa disponible, sin comisiones de intermediarios ni cargos ocultos, con confirmación inmediata y atención directa del hotel.",
  },
];

export default function HotelPage() {
  return (
    <main className="bg-[#f7f3ea] text-[#1f2b27]">
      <PageHero
        eyebrow="El Hotel"
        title="Un hotel familiar en el corazón de El Calafate."
        subtitle="Sencillez, calidez y servicio personalizado, a 3 minutos andando del centro de la ciudad."
        image={facadeImage}
        imagePosition="center 60%"
      />

      {/* Story + stats */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
            Nuestra historia
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
            Una base tranquila para conocer la Patagonia austral.
          </h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-[#5f6e69]">
            <p>
              Somos un pequeño hotel familiar de excepcional ubicación, a tan solo
              3 minutos andando del centro de la ciudad, bares, restaurantes y
              agencias de viajes. Un alojamiento que combina sencillez, calidez,
              confort y servicio personalizado integral.
            </p>
            <p>
              Cada huésped recibe una atención cercana: te ayudamos a planificar
              tus excursiones, coordinamos traslados y estamos disponibles las 24
              horas para que tu estadía en El Calafate sea simple y memorable.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Check-in</dt>
              <dd className="mt-1 text-xl font-semibold">{HOTEL.checkIn}</dd>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Check-out</dt>
              <dd className="mt-1 text-xl font-semibold">{HOTEL.checkOut}</dd>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Habitaciones</dt>
              <dd className="mt-1 text-xl font-semibold">{HOTEL.rooms}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              El hotel por dentro
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Calidez patagónica en cada rincón.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              Desde un desayuno casero para arrancar el día hasta el jardín y los
              espacios comunes para relajarte después de las excursiones.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {gallery.map(({ src, alt, caption }) => (
              <div
                key={alt}
                className="group relative aspect-4/3 overflow-hidden rounded-2xl ring-1 ring-black/5"
              >
                <Image
                  alt={alt}
                  className="object-cover transition duration-500 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  src={src}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 translate-y-1 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Servicios del hotel
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Todo pensado para una estadía sin preocupaciones.
            </h2>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, name, description }) => (
              <li key={name} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3ef] text-[#38645b]"
                >
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">{name}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[#66736f]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Preguntas frecuentes
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Todo lo que necesitás saber.
            </h2>
          </div>

          <div className="mt-10 divide-y divide-black/5 rounded-2xl bg-[#f7f3ea] ring-1 ring-black/5">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-[#1f2b27] [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown
                    aria-hidden="true"
                    className="shrink-0 text-[#38645b] transition-transform duration-200 group-open:rotate-180"
                    size={18}
                  />
                </summary>
                <p className="pb-4 text-sm leading-7 text-[#5f6e69]">{a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-[#38645b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
              href={BOOKING_HREF}
            >
              Reservar ahora
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2]"
              href="/contacto"
            >
              Hacé tu consulta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
