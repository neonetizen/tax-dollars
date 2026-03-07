import type { Metadata } from "next";
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
  title: "My Tax Dollars — San Diego Property Tax Receipt",
  description:
    "See exactly where your San Diego property tax dollars go. Enter your assessed value and get a personalized tax receipt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>

          <footer className="border-t border-sd-sky-light/30 bg-sd-navy px-4 py-6 text-sm text-white/70">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <p>
                Built with{" "}
                <a
                  href="https://data.sandiego.gov"
                  className="text-sd-sky underline decoration-sd-sky/40 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  San Diego Open Data
                </a>
              </p>
              <p className="text-white/50">
                Estimates only &middot; Not affiliated with the City of San Diego
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
