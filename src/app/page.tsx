import {
  Anchor,
  Bus,
  Car,
  CheckCircle,
  Clock,
  Coffee,
  ConciergeBell,
  ExternalLink,
  Flame,
  Mail,
  MapPin,
  Mountain,
  MountainSnow,
  Package,
  Phone,
  Plane,
  Shirt,
  Star,
  Tv,
  Users,
  Waves,
  Wifi,
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { ReviewsSlider } from "@/components/ReviewsSlider";
import { HotelMapWrapper } from "@/components/HotelMapWrapper";
import { ScrollCenterHandler } from "@/components/ScrollCenterHandler";
import Image from "next/image";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { publicConfig } from "@/lib/config";
import gardenRoomImage from "../../assets/old-web-images/hab-14-doble-twin-superior-vistas-al-jardin.jpg";
import heroImage from "../../assets/old-web-images/panorama-of-perito-moreno-glacier-in-patagonia-e-2023-11-27-04-56-41-utc.jpg";
import tripadvisorLogo from "../../assets/logo/tripadvisor.png";
import googleMapsLogo from "../../assets/logo/Google_Maps_icon_(2020).png";
import lobbyImage from "../../assets/old-web-images/img-20231015-084100.jpg";
import logoImage from "../../assets/old-web-images/logo-sin-fondo-270.png";
import patioRoomImage from "../../assets/old-web-images/hab-13-triple-sup-mat-1-vistas-patio-interior.jpg";
import standardDoubleImage from "../../assets/old-web-images/hab-3-doble-mat-standard-vistas-al-jardin.jpg";
import standardTripleImage from "../../assets/old-web-images/hab-5-triple-standard-vistas-patio-interior.jpg";
import glacierImage from "../../assets/old-web-images/the-perito-moreno-glacier-los-glaciares-national-2023-11-27-04-56-26-utc.jpg";
import glacierCloseImage from "../../assets/old-web-images/the-perito-moreno-glacier-los-glaciares-national-2023-11-27-05-29-51-utc.jpg";
import cerroTorreImage from "../../assets/old-web-images/cerro-torre-los-glaciares-national-park-patagoni-2023-11-27-05-11-13-utc.jpg";
import fitzRoyImage from "../../assets/old-web-images/red-beech-trees-opposite-fitzroy-mount-autumn-in-2023-11-27-04-54-39-utc.jpg";

const rooms = [
  {
    name: "Doble Estándar",
    tier: "Estándar",
    guests: 2,
    bedOptions: ["Cama matrimonial", "Dos camas separadas"],
    image: standardDoubleImage,
  },
  {
    name: "Triple Estándar",
    tier: "Estándar",
    guests: 3,
    bedOptions: ["Matrimonial + individual", "Tres camas individuales"],
    image: standardTripleImage,
  },
  {
    name: "Doble Superior",
    tier: "Superior",
    guests: 2,
    bedOptions: ["Cama matrimonial", "Dos camas separadas"],
    image: gardenRoomImage,
  },
  {
    name: "Triple Superior",
    tier: "Superior",
    guests: 3,
    bedOptions: ["Matrimonial + individual", "Tres camas individuales"],
    image: patioRoomImage,
  },
];


const services = [
  {
    name: "Desayuno Continental",
    description:
      "Pan, tostadas, café, té, leche, yogures, jugos, cereales, mermelada, queso y fiambre. Incluido en todas las tarifas.",
    icon: Coffee,
  },
  {
    name: "Wi-Fi Gratuito",
    description: "Conexión de alta velocidad en todas las instalaciones del hotel.",
    icon: Wifi,
  },
  {
    name: "TV por cable",
    description:
      "Televisor con TV por cable en cada habitación.",
    icon: Tv,
  },
  {
    name: "Calefacción Central",
    description:
      "Radiadores en todas las habitaciones para afrontar los fríos de la Patagonia.",
    icon: Flame,
  },
  {
    name: "Baño Privado con Amenities",
    description:
      "Baño privado con ducha, buena presión de agua caliente, jabón, shampoo y acondicionador.",
    icon: Anchor,
  },
  {
    name: "Servicio Diario de Mucama",
    description:
      "Limpieza diaria de habitaciones. Cambio de toallas cada 2 días y sábanas cada 7 días.",
    icon: CheckCircle,
  },
  {
    name: "Estacionamiento Vigilado",
    description:
      "Estacionamiento descubierto en la puerta del hotel, monitoreado por cámaras de seguridad.",
    icon: Car,
  },
  {
    name: "Guardaequipaje",
    description:
      "Servicio de custodia de equipaje disponible antes del check-in y después del check-out.",
    icon: Package,
  },
  {
    name: "Servicio de Lavandería",
    description: "Servicio de lavandería disponible para los huéspedes.",
    icon: Shirt,
  },
  {
    name: "Conserjería",
    description:
      "Asistencia personalizada para organizar excursiones, traslados y reservas locales.",
    icon: ConciergeBell,
  },
  {
    name: "Apto para Familias",
    description:
      "Habitaciones triples y configuraciones especiales para familias con niños.",
    icon: Users,
  },
  {
    name: "Habitaciones No Fumadores",
    description:
      "Todas las habitaciones y espacios comunes son libres de humo.",
    icon: CheckCircle,
  },
];

const trips = [
  {
    name: "Glaciar Perito Moreno",
    description:
      "El glaciar más famoso de Patagonia. Excursión de día completo en bus con pasarelas de madera y vistas privilegiadas al glaciar en movimiento.",
    duration: "Día completo",
    distance: "80 km · 1.5 h en bus",
    image: glacierImage,
    highlight: "Excursión estrella",
  },
  {
    name: "Minitrekking sobre el Glaciar",
    description:
      "Caminata sobre el hielo del Perito Moreno con crampones y guías certificados. Una experiencia única que combina navegación y trekking.",
    duration: "Día completo",
    distance: "80 km · 1.5 h en bus",
    image: glacierCloseImage,
    highlight: "Experiencia única",
  },
  {
    name: "Navegación Lago Argentino",
    description:
      "Safari lacustre por el Lago Argentino con vistas a los glaciares Upsala, Spegazzini y Onelli. Salida desde Puerto Bandera.",
    duration: "Día completo",
    distance: "45 km · 45 min en bus",
    image: cerroTorreImage,
    highlight: "Navegación glaciar",
  },
  {
    name: "El Chaltén – Fitz Roy",
    description:
      "La capital nacional del trekking. Senderos con vistas al Cerro Fitz Roy y Cerro Torre en el Parque Nacional Los Glaciares.",
    duration: "Día completo",
    distance: "220 km · 2.5 h en bus",
    image: fitzRoyImage,
    highlight: "Trekking legendario",
  },
];

const reviews: Array<{
  author: string; origin: string; date: string; rating: number;
  text: string; trip: string; source: "tripadvisor" | "google";
}> = [
  {
    author: "Maria Esther R.",
    origin: "Sevilla, España",
    date: "Diciembre 2025",
    rating: 5,
    text: "Buenas instalaciones. Personal de recepción muy agradable, sobre todo el chico de la tarde/noche. Desayuno muy completo. Buena relación precio/calidad.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "Rodrigo F.",
    origin: "Santiago, Chile",
    date: "Enero 2025",
    rating: 5,
    text: "Muy buena opción en El Calafate. Cálido, limpio y bien ubicado. El desayuno está muy completo y el personal siempre dispuesto a ayudar con excursiones y traslados.",
    trip: "Viaje en familia",
    source: "google",
  },
  {
    author: "cris_garcia",
    origin: "Avellaneda, Argentina",
    date: "Febrero 2023",
    rating: 5,
    text: "Excelente relación precio calidad. La calefacción, la ducha, los colchones y ropa de cama impecables. La amabilidad y buena predisposición de Juan es para destacar. Nos sentimos muy a gusto en este hotel.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "Patrick H.",
    origin: "Europa",
    date: "Diciembre 2018",
    rating: 5,
    text: "La habitación estaba limpia, la limpiaban cada día y las camas eran cómodas. Desayuno incluido: pan, café, leche, yogures, zumos, cereales, mermelada, queso y jamón. Definitivamente me quedaría aquí de nuevo.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "Laura I.",
    origin: "Buenos Aires, Argentina",
    date: "Marzo 2024",
    rating: 4,
    text: "Excelente relación calidad-precio. Las habitaciones son acogedoras y la calefacción funcionó perfectamente durante las noches frías. La recepción 24 horas fue muy conveniente al llegar tarde.",
    trip: "Viaje en pareja",
    source: "google",
  },
  {
    author: "Dioni Velázquez",
    origin: "Asunción, Paraguay",
    date: "Julio 2023",
    rating: 4,
    text: "Hotel coqueto, pequeño pero muy lindo. Queda cerca de la zona céntrica, los traslados se pueden hacer caminando. Lindas vistas a las montañas nevadas. Buen desayuno incluido.",
    trip: "Viaje en pareja",
    source: "tripadvisor",
  },
  {
    author: "anaannese",
    origin: "Bahía Blanca, Argentina",
    date: "Febrero 2023",
    rating: 4,
    text: "Súper bien ubicado, a 3 cuadras de la calle principal. La ducha con buena presión y buen agua caliente. El WiFi funciona muy bien. La gente que atiende siempre muy amable.",
    trip: "Viaje en solitario",
    source: "tripadvisor",
  },
];

const distances = [
  { label: "Av. del Libertador (calle peatonal)", value: "200 m", note: "caminando", icon: MapPin },
  { label: "Lago Argentino (orilla)", value: "400 m", note: "caminando", icon: Waves },
  { label: "Terminal de Ómnibus", value: "700 m", note: "caminando", icon: Bus },
  { label: "Laguna Nimez (reserva de aves)", value: "1.2 km", note: "caminando", icon: Mountain },
  { label: "Glaciarium (centro de interpretación)", value: "5 km", note: "en auto", icon: MountainSnow },
  { label: "Aeropuerto El Calafate (FTE)", value: "16 km", note: "en auto", icon: Plane },
];

function WhatsAppIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="hotel-home bg-[#f7f3ea] text-[#1f2b27]">
      <ScrollCenterHandler />
      <CloudbedsScriptLoader />
      <BookingPriceObserver />

      {/* ── HERO ── */}
      <section className="relative min-h-[82svh] overflow-hidden bg-[#1d2a28] text-white">
        <Image
          alt="Glaciar Perito Moreno cerca de El Calafate"
          className="object-cover"
          fill
          priority
          quality={90}
          sizes="100vw"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/20 to-black/65" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a className="flex items-center gap-3" href="#inicio">
            <Image
              alt="Los Lagos Hotel"
              className="h-12 w-12 rounded-full bg-white/90 object-contain p-1"
              height={48}
              src={logoImage}
              width={48}
            />
            <span className="text-base font-semibold tracking-wide">
              Los Lagos Hotel
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/85 md:flex">
            <a className="transition hover:text-white" href="#hotel">Hotel</a>
            <a className="transition hover:text-white" href="#habitaciones">Habitaciones</a>
            <a className="transition hover:text-white" href="#servicios">Servicios</a>
            <a className="transition hover:text-white" href="#excursiones">Excursiones</a>
            <a className="transition hover:text-white" href="#opiniones">Opiniones</a>
            <a className="transition hover:text-white" href="#ubicacion">Ubicación</a>
            <a className="transition hover:text-white" href="#contacto">Contacto</a>
          </nav>
          <a
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1f2b27] shadow-sm transition hover:bg-[#f0f4f2]"
            href="#reservar"
          >
            Reservar
          </a>
        </header>

        <div
          className="relative z-10 mx-auto flex min-h-[calc(82svh-88px)] w-full max-w-7xl items-center px-5 pb-28 pt-8 sm:px-8 lg:pb-36"
          id="inicio"
        >
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Los Lagos Hotel
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/88 sm:text-xl">
              Hospedaje cálido en El Calafate, a 200 metros del centro y de los
              caminos que llevan a glaciares, lagos y senderos de Patagonia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-white/90">
              <span className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                El Calafate · Santa Cruz
              </span>
              <span className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                ✦ Desayuno incluido
              </span>
              <span className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                Reserva directa
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOKING WIDGET ── */}
      <section className="relative z-20 -mt-20 px-5 sm:px-8" id="reservar">
        <div className="mx-auto max-w-6xl rounded-lg bg-white p-4 shadow-[0_24px_70px_rgba(30,45,40,0.18)] ring-1 ring-black/5 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1f2b27]">
                Buscar disponibilidad
              </h2>
              <p className="text-sm text-[#66736f]">
                Elegí tus fechas para continuar la reserva dentro de este sitio.
              </p>
            </div>
          </div>
          <cb-property-date-picker
            button-label="Buscar disponibilidad"
            currency={publicConfig.baseCurrency}
            custom-url="/reservas"
            data-testid="cloudbeds-date-picker"
            lang="es"
            layout="horizontal"
            open-in-new-tab="false"
            property-code={publicConfig.propertyCode}
          />
        </div>
      </section>

      {/* ── ABOUT HOTEL ── */}
      <section
        className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center"
        id="hotel"
      >
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
            El Calafate, Patagonia Austral
          </p>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
            Una base tranquila para conocer la Patagonia austral.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6e69]">
            Somos un pequeño hotel familiar de excepcional ubicación, a tan solo
            200 metros del centro de la ciudad, bares, restaurantes y agencias de
            viajes, y a escasos metros de la orilla del Lago Argentino. Un
            alojamiento que combina sencillez, calidez, confort y servicio
            personalizado integral.
          </p>
          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Check-in</dt>
              <dd className="mt-1 text-xl font-semibold">14:00</dd>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Check-out</dt>
              <dd className="mt-1 text-xl font-semibold">10:00</dd>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Habitaciones</dt>
              <dd className="mt-1 text-xl font-semibold">14</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-[#38645b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2e5049]"
              href="#reservar"
            >
              Reservar ahora
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8d4ce] bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#f0f4f2]"
              href="#contacto"
            >
              Contactar
            </a>
          </div>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-[#d8ddd8] shadow-xl">
          <Image
            alt="Interior de Los Lagos Hotel"
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            src={lobbyImage}
          />
        </div>
      </section>

      {/* ── ROOMS ── */}
      <section className="bg-white py-24" id="habitaciones">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Habitaciones
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Doble o triple, estándar o superior.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              4 tipos de habitación, todas con calefacción, TV por cable, Wi-Fi y
              desayuno continental incluido.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {rooms.map((room) => (
              <article
                className="overflow-hidden rounded-lg bg-[#f7f3ea] ring-1 ring-black/5"
                key={room.name}
              >
                <div className="relative aspect-16/10">
                  <Image
                    alt={room.name}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={room.image}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#38645b] backdrop-blur">
                    {room.tier}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[#1f2b27]">{room.name}</h3>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-[#66736f]">
                      <Users aria-hidden="true" size={13} />
                      {room.guests} huéspedes
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {room.bedOptions.map((opt) => (
                      <span
                        key={opt}
                        className="rounded-full border border-[#c8d4ce] bg-white px-3 py-1 text-xs text-[#5f6e69]"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                  <a
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#38645b] hover:underline"
                    href="#reservar"
                  >
                    Ver disponibilidad →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24" id="servicios">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Servicios del hotel
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Todo lo que necesitás para una estadía cómoda.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              Nos encargamos de los detalles para que vos te concentrés en
              disfrutar de la Patagonia.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, name, description }) => (
              <li
                className="flex gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5"
                key={name}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf3ef] text-[#38645b]"
                >
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">{name}</p>
                  <p className="mt-1 text-sm leading-6 text-[#66736f]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── TRIPS / EXCURSIONS ── */}
      <section className="bg-[#1f2b27] py-24 text-white" id="excursiones">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#6dbfaa]">
                Excursiones en bus
              </p>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                El hotel organiza traslados a los principales atractivos de El Calafate.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                Salidas diarias en temporada desde el centro de la ciudad.
                Nuestros recepcionistas te ayudan a planificar y reservar cada
                excursión.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur shrink-0">
              <Bus size={18} aria-hidden="true" />
              <span>Traslados desde el hotel</span>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trips.map((trip) => (
              <article
                key={trip.name}
                className="group flex flex-col overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={trip.name}
                    className="object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    src={trip.image}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-[#38645b] px-3 py-1 text-xs font-semibold text-white">
                    {trip.highlight}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-white">{trip.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-white/65">
                    {trip.description}
                  </p>
                  <dl className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-4 text-xs text-white/55">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} aria-hidden="true" />
                      <span>{trip.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} aria-hidden="true" />
                      <span>{trip.distance}</span>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-white/50">
            Consultá disponibilidad y precios directamente en la recepción del hotel o por WhatsApp.
          </p>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      {/*
        NOTA: Para mostrar reseñas en vivo de Google o TripAdvisor de forma gratuita,
        las mejores opciones son:
        1. Elfsight (elfsight.com) — plan gratuito con 200 visitas/mes, widget de Google Reviews
        2. Trustindex.io — plan gratuito con 50 visitas/mes, soporta Google + TripAdvisor
        3. Widget oficial de TripAdvisor (tripadvisor.com/Widgets) — 100% gratuito, muestra puntuación
        Las reseñas de abajo son reales pero están incorporadas estáticamente.
      */}
      <section className="bg-white py-24" id="opiniones">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
                Opiniones verificadas
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
                Lo que dicen nuestros huéspedes.
              </h2>
            </div>
            {/* Platform badges */}
            <div className="flex shrink-0 flex-wrap gap-3">
              {/* TripAdvisor */}
              <a
                className="flex items-center gap-3 rounded-xl border border-[#00aa6c]/30 bg-[#00aa6c]/5 px-4 py-3 transition hover:bg-[#00aa6c]/10"
                href="https://www.tripadvisor.es/Hotel_Review-g312851-d1883505-Reviews-Los_Lagos_Hotel-El_Calafate_Province_of_Santa_Cruz_Patagonia.html"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image src={tripadvisorLogo} alt="TripAdvisor" width={28} height={28} className="object-contain" />
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1f2b27]">4.1</span>
                    <div className="flex gap-0.5 text-[#00aa6c]">
                      {[1, 2, 3, 4].map((i) => (
                        <Star key={i} aria-hidden="true" fill="currentColor" size={13} strokeWidth={0} />
                      ))}
                      <Star aria-hidden="true" fill="none" size={13} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-xs text-[#5f6e69]">27 opiniones · TripAdvisor</p>
                </div>
              </a>
              {/* Google Maps */}
              <a
                className="flex items-center gap-3 rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/5 px-4 py-3 transition hover:bg-[#4285F4]/10"
                href="https://www.google.com/maps/place/Hotel+Los+Lagos/@-50.3357896,-72.2666423,17z"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Image src={googleMapsLogo} alt="Google Maps" width={20} height={28} className="object-contain" />
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#1f2b27]">4.3</span>
                    <div className="flex gap-0.5 text-[#FBBC05]">
                      {[1, 2, 3, 4].map((i) => (
                        <Star key={i} aria-hidden="true" fill="currentColor" size={13} strokeWidth={0} />
                      ))}
                      <Star aria-hidden="true" fill="none" size={13} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-xs text-[#5f6e69]">43 opiniones · Google</p>
                </div>
              </a>
            </div>
          </div>

          <ReviewsSlider reviews={reviews} />
        </div>
      </section>

      {/* ── LOCATION + MAP ── */}
      <section className="py-24" id="ubicacion">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Cómo llegar
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              En el corazón de El Calafate.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              A solo 200 metros del centro, con acceso fácil a todos los
              atractivos de la ciudad y los servicios de transporte a los
              glaciares.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Map */}
            <div className="min-h-105 overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 lg:min-h-0">
              <HotelMapWrapper />
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-6">
              {/* Address */}
              <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <MapPin size={15} aria-hidden="true" />
                  Dirección
                </h3>
                <p className="mt-2 text-base font-medium text-[#1f2b27]">
                  25 de Mayo 220
                </p>
                <p className="text-sm text-[#5f6e69]">
                  Z9405 El Calafate, Santa Cruz, Argentina
                </p>
                <a
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#38645b] hover:underline"
                  href="https://www.google.com/maps/place/Hotel+Los+Lagos/@-50.335778,-72.2668088,17z"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={13} />
                  Abrir en Google Maps
                </a>
              </div>

              {/* Distances */}
              <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38645b]">
                  <Mountain size={15} aria-hidden="true" />
                  Distancias
                </h3>
                <ul className="space-y-3">
                  {distances.map(({ label, value, note, icon: Icon }) => (
                    <li key={label} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 text-[#5f6e69]">
                        <Icon aria-hidden="true" className="shrink-0 text-[#38645b]" size={14} />
                        {label}
                      </span>
                      <span className="text-right">
                        <span className="font-semibold text-[#1f2b27]">{value}</span>
                        <span className="ml-1 text-[#66736f]">({note})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="bg-[#edf3ef] py-24" id="contacto">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#38645b]">
              Contacto
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              ¿Tenés alguna consulta?
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              Escribinos y te respondemos a la brevedad. También podés llamarnos
              o escribirnos por WhatsApp.
            </p>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {/* Contact details */}
            <div className="flex h-full flex-col divide-y divide-black/5 rounded-lg bg-white shadow-sm ring-1 ring-black/5">
              <a
                className="flex flex-1 items-center gap-4 px-5 py-4 transition hover:bg-[#f7faf8]"
                href="tel:+542902417738"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <Phone aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">+54 2902 417738</p>
                  <p className="text-xs text-[#66736f]">Llamadas</p>
                </div>
              </a>
              <a
                className="flex flex-1 items-center gap-4 px-5 py-4 transition hover:bg-[#f7faf8]"
                href="https://wa.me/5492902417738"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <WhatsAppIcon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">+54 9 2902 417738</p>
                  <p className="text-xs text-[#66736f]">WhatsApp</p>
                </div>
              </a>
              <a
                className="flex flex-1 items-center gap-4 px-5 py-4 transition hover:bg-[#f7faf8]"
                href="mailto:loslagoshotelcalafate@gmail.com"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <Mail aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">loslagoshotelcalafate@gmail.com</p>
                  <p className="text-xs text-[#66736f]">Email</p>
                </div>
              </a>
              <div className="flex flex-1 items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <MapPin aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">25 de Mayo 220</p>
                  <p className="text-xs text-[#66736f]">Z9405 El Calafate, Santa Cruz, Argentina</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3ef] text-[#38645b]">
                  <Clock aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2b27]">Recepción 24 hs</p>
                  <p className="text-xs text-[#66736f]">Todos los días del año</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-[#1f2b27] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            ¿Listo para explorar la Patagonia?
          </h2>
          <p className="max-w-xl text-base leading-8 text-white/70">
            Reservá directamente con nosotros y asegurate la mejor tarifa disponible,
            con desayuno incluido y atención personalizada.
          </p>
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#1f2b27] shadow transition hover:bg-[#edf2ef]"
            href="#reservar"
          >
            Buscar fechas disponibles
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#141e1c] px-5 py-14 text-sm text-white/60 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <a className="flex items-center gap-3" href="#inicio">
                <Image
                  alt="Los Lagos Hotel"
                  className="h-10 w-10 rounded-full bg-white/90 object-contain p-1"
                  height={40}
                  src={logoImage}
                  width={40}
                />
                <span className="text-base font-semibold text-white">
                  Los Lagos Hotel
                </span>
              </a>
              <p className="mt-4 max-w-sm leading-7">
                Pequeño hotel familiar en El Calafate, Patagonia. A 200 metros
                del centro, con desayuno incluido y atención personalizada para
                cada huésped.
              </p>
              <address className="mt-5 not-italic space-y-1.5">
                <p className="flex items-start gap-2">
                  <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[#6dbfaa]" size={14} />
                  25 de Mayo 220, Z9405 El Calafate, Santa Cruz, Argentina
                </p>
                <a className="flex items-center gap-2 transition hover:text-white" href="tel:+542902417738">
                  <Phone aria-hidden="true" className="shrink-0 text-[#6dbfaa]" size={14} />
                  +54 2902 417738
                </a>
                <a className="flex items-center gap-2 transition hover:text-white" href="mailto:loslagoshotelcalafate@gmail.com">
                  <Mail aria-hidden="true" className="shrink-0 text-[#6dbfaa]" size={14} />
                  loslagoshotelcalafate@gmail.com
                </a>
              </address>
            </div>

            {/* Navigation */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                Navegación
              </p>
              <nav>
                <ul className="space-y-2">
                  {[
                    { label: "El Hotel", href: "#hotel" },
                    { label: "Habitaciones", href: "#habitaciones" },
                    { label: "Servicios", href: "#servicios" },
                    { label: "Excursiones", href: "#excursiones" },
                    { label: "Opiniones", href: "#opiniones" },
                    { label: "Ubicación", href: "#ubicacion" },
                    { label: "Contacto", href: "#contacto" },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <a className="transition hover:text-white" href={href}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Links */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                Reseñas &amp; Mapas
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    className="flex items-center gap-2 transition hover:text-white"
                    href="https://www.tripadvisor.es/Hotel_Review-g312851-d1883505-Reviews-Los_Lagos_Hotel-El_Calafate_Province_of_Santa_Cruz_Patagonia.html"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink aria-hidden="true" size={13} />
                    TripAdvisor · 4.1/5
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center gap-2 transition hover:text-white"
                    href="https://www.google.com/maps/place/Hotel+Los+Lagos/@-50.335778,-72.2668088,17z"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink aria-hidden="true" size={13} />
                    Ver en Google Maps
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center gap-2 transition hover:text-white"
                    href="https://wa.me/5492902417738"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <WhatsAppIcon size={13} />
                    WhatsApp
                  </a>
                </li>
              </ul>
              <a
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#38645b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#2e5049]"
                href="#reservar"
              >
                Reservar ahora
              </a>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/10 pt-8 text-center text-xs text-white/30 sm:flex-row sm:justify-between">
            <p>© 2026 Los Lagos Hotel · El Calafate, Patagonia, Argentina</p>
            <div className="flex gap-4">
              <a href="/terminos" className="transition hover:text-white/60">
                Términos y Condiciones
              </a>
              <a href="/privacidad" className="transition hover:text-white/60">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
