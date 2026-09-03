import type { Metadata } from "next";
import Providers from "./providers"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Julu POS - Aplikasi Kasir UMKM",
  description: "Aplikasi kasir buat warung, coffee shop & UMKM. Catat penjualan, stok, modal bahan, biaya operasional & laba bersih harian otomatis. Coba gratis, sudah dipakai Julu Coffee & tenant aktif.",
  keywords: ["aplikasi kasir umkm", "pos umkm", "kasir warung", "laporan laba rugi umkm", "aplikasi stok barang", "kasir coffee shop", "julu pos"],
  openGraph: {
    title: "Julu POS - Kasir UMKM Anti Ribet",
    description: "Dari Rp 1.680.000 omzet, langsung tau laba bersih Rp 712.562. 66 transaksi tercatat otomatis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
