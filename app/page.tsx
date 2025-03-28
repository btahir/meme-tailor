import { getMemes } from "./actions";
import { MemeGrid } from "@/components/MemeGrid";

export default async function Home() {
  // Fetch memes with error handling
  const memesData = await getMemes();
  const memes = memesData.success ? memesData.data.memes : [];

  return (
    <div>
      {/* Sponsorship Banner */}
      <div className="px-4 w-full bg-gradient-to-b from-gray-900 to-gray-600 text-white py-2 text-center">
        <a
          href="https://www.you-tldr.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline font-medium"
        >
          Sponsored by You-TLDR - Get the TLDR of any YouTube video in seconds!
        </a>
      </div>

      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-950 dark:to-pink-950/20 font-[family-name:var(--font-geist-sans)]">
        <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          <MemeGrid memes={memes} />
        </main>

        <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p> {new Date().getFullYear()} Meme Tailor. All rights reserved.</p>
          <p className="mt-1">Made with ❤️ for meme lovers everywhere</p>
        </footer>
      </div>
    </div>
  );
}
