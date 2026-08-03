import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monitorei - SaaS Multi-tenant de Licitações Públicas",
  description: "Monitoramento automatizado de licitações públicas com inteligência de match e isolamento seguro por inquilino.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
