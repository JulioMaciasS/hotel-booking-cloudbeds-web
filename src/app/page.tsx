import {
  Coffee,
  ConciergeBell,
  Flower2,
  MapPin,
  MountainSnow,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { BookingPriceObserver } from "@/components/BookingPriceObserver";
import { CloudbedsScriptLoader } from "@/components/CloudbedsScriptLoader";
import { publicConfig } from "@/lib/config";
import gardenRoomImage from "../../assets/images/hab-14-doble-twin-superior-vistas-al-jardin.jpg";
import heroImage from "../../assets/images/panorama-of-perito-moreno-glacier-in-patagonia-e-2023-11-27-04-56-41-utc.jpg";
import lobbyImage from "../../assets/images/img-20231015-084100.jpg";
import logoImage from "../../assets/images/logo-sin-fondo-270.png";
import patioRoomImage from "../../assets/images/hab-13-triple-sup-mat-1-vistas-patio-interior.jpg";

const rooms = [
  {
    name: "Doble Superior",
    description: "Habitaciones luminosas con vistas al jardin y descanso amplio.",
    image: gardenRoomImage,
  },
  {
    name: "Triple Superior",
    description: "Una opcion comoda para familias o grupos que viajan juntos.",
    image: patioRoomImage,
  },
];

const amenities = [
  { name: "Desayuno", icon: Coffee },
  { name: "Wi-Fi", icon: Wifi },
  { name: "Recepcion", icon: ConciergeBell },
  { name: "Jardin", icon: Flower2 },
  { name: "Centro de El Calafate", icon: MapPin },
  { name: "Excursiones cercanas", icon: MountainSnow },
];

export default function HomePage() {
  return (
    <main className="hotel-home bg-[#f7f3ea] text-[#1f2b27]">
      <CloudbedsScriptLoader />
      <BookingPriceObserver />

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/65" />

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
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/85 md:flex">
            <a className="transition hover:text-white" href="#hotel">
              Hotel
            </a>
            <a className="transition hover:text-white" href="#habitaciones">
              Habitaciones
            </a>
            <a className="transition hover:text-white" href="#ubicacion">
              Ubicacion
            </a>
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
              Hospedaje calido en El Calafate, cerca del centro y de los
              caminos que llevan a glaciares, lagos y senderos de Patagonia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-white/90">
              <span className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                El Calafate
              </span>
              <span className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                Santa Cruz
              </span>
              <span className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                Reserva directa
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-20 px-5 sm:px-8" id="reservar">
        <div className="mx-auto max-w-6xl rounded-lg bg-white p-4 shadow-[0_24px_70px_rgba(30,45,40,0.18)] ring-1 ring-black/5 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1f2b27]">
                Buscar disponibilidad
              </h2>
              <p className="text-sm text-[#66736f]">
                Elegi tus fechas para continuar la reserva dentro de este sitio.
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

      <section
        className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center"
        id="hotel"
      >
        <div>
          <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
            Una base tranquila para conocer la Patagonia austral.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6e69]">
            Los Lagos Hotel acompana viajes de descanso y aventura con una
            ubicacion practica en El Calafate, espacios simples y atencion
            cercana para organizar cada dia con calma.
          </p>
          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Check-in</dt>
              <dd className="mt-1 text-xl font-semibold">14:00</dd>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Check-out</dt>
              <dd className="mt-1 text-xl font-semibold">12:00</dd>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-sm text-[#66736f]">Destino</dt>
              <dd className="mt-1 text-xl font-semibold">El Calafate</dd>
            </div>
          </dl>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#d8ddd8] shadow-xl">
          <Image
            alt="Interior de Los Lagos Hotel"
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            src={lobbyImage}
          />
        </div>
      </section>

      <section className="bg-white py-24" id="habitaciones">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
              Habitaciones para descansar despues de explorar.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5f6e69]">
              Consulta disponibilidad, condiciones finales y opciones activas en
              el motor oficial de reservas.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {rooms.map((room) => (
              <article
                className="overflow-hidden rounded-lg bg-[#f7f3ea] ring-1 ring-black/5"
                key={room.name}
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    alt={room.name}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={room.image}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-[#1f2b27]">
                    {room.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f6e69]">
                    {room.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.75fr_1fr] lg:items-start">
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2b27] sm:text-4xl">
            Servicios esenciales para una estadia simple.
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {amenities.map(({ icon: Icon, name }) => (
            <li
              className="flex items-center gap-4 rounded-lg bg-white px-5 py-4 text-sm font-semibold text-[#1f2b27] shadow-sm ring-1 ring-black/5"
              key={name}
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf3ef] text-[#38645b]"
              >
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#1f2b27] px-5 py-20 text-white sm:px-8" id="ubicacion">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              El Calafate, Santa Cruz
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
              Desde el hotel podes organizar visitas al Glaciar Perito Moreno,
              navegaciones, caminatas y recorridos por el centro de la ciudad.
            </p>
          </div>
          <a
            className="inline-flex w-fit rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#1f2b27] transition hover:bg-[#edf2ef]"
            href="#reservar"
          >
            Buscar fechas
          </a>
        </div>
      </section>
    </main>
  );
}
