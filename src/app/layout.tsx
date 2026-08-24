import { Fraunces, Source_Sans_3 } from "next/font/google";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NochGut – Lebensmittel retten",
    template: "%s · NochGut",
  },
  description:
    "NochGut Liechtenstein: Bäckereien, Metzgereien, Restaurants und Hofläden retten überschüssige und MHD+-Lebensmittel. Abholung und Zahlung nur vor Ort.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
