import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Los Lagos Hotel | Reservas directas",
  description:
    "Sitio publico de reservas directas para Los Lagos Hotel en El Calafate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
