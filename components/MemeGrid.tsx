"use client";

import { useState, FormEvent } from "react";
import { Meme } from "@/types/meme";
import { selectMeme, submitMemeEdit } from "@/app/actions";

interface MemeGridProps {
  memes: Meme[];
}

export default function MemeGrid({ memes }: MemeGridProps) {
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [isSelectingMeme, setIsSelectingMeme] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState<string | null>(null);

  // Handle meme selection with loading state
  const handleSelectMeme = async (formData: FormData) => {
    const memeId = formData.get("memeId") as string;
    const selected = memes.find((meme) => meme.id === memeId);

    if (selected) {
      setIsSelectingMeme(true);
      try {
        await selectMeme(formData);
        setSelectedMeme(selected);
        // Reset any previously generated meme when selecting a new template
        setGeneratedMemeUrl(null);
      } catch (error) {
        console.error("Error selecting meme:", error);
      } finally {
        setIsSelectingMeme(false);
      }
    }
  };

  // Handle meme edit submission with loading state
  const handleSubmitEdit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmittingEdit(true);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const result = await submitMemeEdit(formData);

      if (result.success && result.imageUrl) {
        setGeneratedMemeUrl(result.imageUrl);
      } else {
        console.error("Error generating meme:", result.error);
      }
    } catch (error) {
      console.error("Error submitting meme edit:", error);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Scrollable meme selection panel */}
      <div className="w-full lg:w-2/3 h-[500px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Select a Meme Template</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {memes.map((meme: Meme) => {
            const isSelected = selectedMeme?.id === meme.id;
            return (
              <form key={meme.id} action={handleSelectMeme}>
                <input type="hidden" name="memeId" value={meme.id} />
                <button
                  type="submit"
                  disabled={isSelectingMeme}
                  className={`w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all p-2 flex flex-col items-center h-full border-2 ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-300 transform scale-[1.02]"
                      : "border-transparent"
                  } ${isSelectingMeme ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  <div className="relative w-full h-32 mb-2 flex items-center justify-center">
                    {isSelectingMeme && isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 rounded">
                        <div className="h-6 w-6 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={meme.url}
                      alt={meme.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h3 className="text-xs font-medium text-center line-clamp-1">
                    {meme.name}
                  </h3>
                </button>
              </form>
            );
          })}
        </div>
      </div>

      {/* Edit panel for selected meme */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {selectedMeme ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Edit Your Meme</h2>

            <div className="mb-6 flex justify-center">
              {generatedMemeUrl ? (
                <img
                  src={generatedMemeUrl}
                  alt="Generated Meme"
                  className="max-h-[300px] max-w-full object-contain"
                />
              ) : (
                <img
                  src={selectedMeme.url}
                  alt={selectedMeme.name}
                  className="max-h-[300px] max-w-full object-contain"
                />
              )}
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <input type="hidden" name="memeId" value={selectedMeme.id} />
              <input
                type="hidden"
                name="boxCount"
                value={selectedMeme.box_count}
              />

              <div className="mb-4">
                <label
                  htmlFor="text0"
                  className="block text-sm font-medium mb-2"
                >
                  Edit Meme
                </label>
                <textarea
                  id="text0"
                  name="text0"
                  placeholder="Enter your meme text"
                  rows={4}
                  disabled={isSubmittingEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700
                           disabled:opacity-70 disabled:cursor-not-allowed"
                ></textarea>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmittingEdit ? (
                    <>
                      <div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    "Generate Meme"
                  )}
                </button>

                {generatedMemeUrl && (
                  <button
                    type="button"
                    onClick={() => setGeneratedMemeUrl(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md
                           transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                           dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                  >
                    Reset
                  </button>
                )}
              </div>

              {generatedMemeUrl && (
                <div className="mt-4 flex justify-center">
                  <a
                    href={generatedMemeUrl}
                    download="generated-meme.jpg"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                             flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download Meme
                  </a>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center text-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              Select a meme template from the left to start editing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
