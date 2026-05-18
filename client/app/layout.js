import "./globals.css";
import { Outfit, Inter } from "next/font/google";
import ThemeProvider from "../components/ThemeProvider";
import ModalProvider from "../components/ModalProvider";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://task-cryptopolio-main-two.vercel.app"),
  title: {
    default: "CryptoFolio — Master Your Digital Wealth",
    template: "%s | CryptoFolio",
  },
  description:
    "Institutional-grade crypto portfolio management with real-time analytics, secure execution, and AI-driven insights.",
  icons: { icon: "/favicon.ico", apple: "/logo192.png" },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <ThemeProvider>
          <ModalProvider>
            <div className="min-h-dvh flex flex-col">
              <Nav />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
