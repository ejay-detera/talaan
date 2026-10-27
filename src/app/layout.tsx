import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Atkinson_Hyperlegible_Next,
  Caveat,
} from "next/font/google";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const atkinsonHyperlegible = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talaan — Notebook-to-Ledger Agent",
  description:
    "Two-phase notebook extraction and centavo-accurate bookkeeping for Philippine sari-sari stores.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tl"
      className={`${bricolageGrotesque.variable} ${atkinsonHyperlegible.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-pencil font-sans">
        {children}
      </body>
    </html>
  );
}
