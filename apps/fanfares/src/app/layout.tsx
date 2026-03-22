import { Navbar } from "@/app/components/Navbar"
import "./globals.css"
import type { Metadata } from "next"
import { ContainerGrid } from "@/app/components/ContainerGrid"
import { Providers } from "./components/Providers"
import { DebugOverlay } from "./components/DebugOverlay"
import { Gloock } from "next/font/google"

import { config } from "@fortawesome/fontawesome-svg-core"
import { GlobalAudioPlayer } from "./components/GlobalAudioPlayer"
import Toast from "./components/Toast"
import MobileTopNavbar from "./components/MobileTopNavbar"

config.autoAddCss = false

// ✅ FIXED FONT
const gloock = Gloock({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gloock",
})

// ✅ FIXED METADATA
export const metadata: Metadata = {
  metadataBase: new URL("https://fanfares.vercel.app"), // 🔥 replace with your domain
  title: "Fanfares",
  description: "Podcasting built on Nostr",
  openGraph: {
    title: "Fanfares",
    description: "Podcasting built on Nostr",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={gloock.variable}>
      <body className="md:flex">
        <Providers>
          {/* <DebugOverlay /> */}

          <header>
            <Navbar />
            <MobileTopNavbar isLoggedIn={false} pubkey="123" />
          </header>

          <ContainerGrid className="block md:ml-44 md:h-screen pb-32 md:pb-0">
            <Toast />
            {children}
          </ContainerGrid>

          <GlobalAudioPlayer />
        </Providers>
      </body>
    </html>
  )
}