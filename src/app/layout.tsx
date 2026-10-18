import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VTeamFit | Entrenamiento de Alto Rendimiento — Vicky Iglesias",
  description:
    "Plataforma oficial de entrenamiento físico, preparación de pádel y transformación corporal dirigida por Victoria Iglesias.",
  icons: {
    icon: "/images/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-carbon-canvas min-h-screen text-white antialiased selection:bg-[#A08A56] selection:text-black">
        {children}
      </body>
    </html>
  );
}
