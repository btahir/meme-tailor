import { getMemes } from "./actions"
import MemeGrid from "@/components/MemeGrid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Meme Tailor | Create and Share Viral Memes",
  description:
    "Transform ordinary templates into viral masterpieces with Meme Tailor. Select a template, add your text, and share your creation with the world.",
  keywords: ["meme generator", "meme creator", "viral memes", "funny memes", "meme maker"],
  openGraph: {
    title: "Meme Tailor | Create and Share Viral Memes",
    description: "Transform ordinary templates into viral masterpieces with Meme Tailor.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Meme Tailor - Create viral memes in seconds",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meme Tailor | Create and Share Viral Memes",
    description: "Transform ordinary templates into viral masterpieces with Meme Tailor",
  },
}

export default async function Home() {
  // Fetch memes with error handling
  const memesData = await getMemes()
  const memes = memesData.success ? memesData.data.memes : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-950 dark:to-pink-950/20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <MemeGrid memes={memes} />
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Meme Tailor. All rights reserved.</p>
        <p className="mt-1">Made with ❤️ for meme lovers everywhere</p>
      </footer>
    </div>
  )
}

