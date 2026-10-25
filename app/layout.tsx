import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuestra boda — Invitación digital",
  description: "Una invitación digital para celebrar el amor.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
