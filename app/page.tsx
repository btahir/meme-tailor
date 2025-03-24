"use server";

import { getMemes } from "./actions";
import MemeGrid from "@/components/MemeGrid";

export default async function Home() {
  const memesData = await getMemes();
  const memes = memesData.success ? memesData.data.memes : [];

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Meme Tailor</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a meme template to start editing
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        <MemeGrid memes={memes} />
      </main>
    </div>
  );
}
