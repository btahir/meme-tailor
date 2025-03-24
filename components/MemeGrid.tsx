"use client";

import { useState, type FormEvent, useRef, useEffect } from "react";
import type { Meme } from "@/types/meme";
import { submitMemeEdit } from "@/app/actions";
import {
  Sparkles,
  Download,
  RefreshCw,
  Zap,
  Edit,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as htmlToImage from "html-to-image";

interface MemeGridProps {
  memes: Meme[];
  selectedMeme?: Meme;
}

export function MemeGrid({
  memes,
  selectedMeme: initialSelectedMeme,
}: MemeGridProps) {
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState<string | null>(null);
  const [isSelectingMeme, setIsSelectingMeme] = useState(false);
  const [selectedMeme, setSelectedMeme] = useState<Meme | undefined>(
    initialSelectedMeme
  );
  const [error, setError] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const memeRef = useRef<HTMLDivElement>(null);

  const handleSelectMeme = (meme: Meme) => {
    setIsSelectingMeme(true);
    setSelectedMeme(meme);
    setGeneratedMemeUrl(null);
    setTopText("");
    setBottomText("");
    setError(null);
    setIsSelectingMeme(false);
  };

  const handleSubmitEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMeme) return;

    setIsSubmittingEdit(true);
    setGeneratedMemeUrl(null);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await submitMemeEdit(formData);

      if (result.success && result.imageUrl) {
        setGeneratedMemeUrl(result.imageUrl);
      } else {
        console.error("Error generating meme:", result.error);
        setError(result.error || "Failed to generate meme");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("429")) {
        setError(
          "You've hit the rate limit. Please wait a few minutes before trying again."
        );
      } else {
        console.error("Error submitting edit:", error);
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const captureScreenshot = () => {
    if (memeRef.current) {
      setIsCapturing(true);

      // Temporarily remove rounded corners for the screenshot
      const originalClasses = memeRef.current.className;
      memeRef.current.classList.add("rounded-none");

      htmlToImage
        .toPng(memeRef.current, {
          style: {
            borderRadius: "0",
            overflow: "hidden",
          },
          skipFonts: false, // Include fonts to ensure text renders properly
        })
        .then((dataUrl) => {
          setIsCapturing(false);

          // Restore original classes
          if (memeRef.current && originalClasses) {
            memeRef.current.className = originalClasses;
          }

          // Create a download link and trigger it automatically
          const downloadLink = document.createElement("a");
          downloadLink.href = dataUrl;
          downloadLink.download = "viral-meme.jpg";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        })
        .catch((error) => {
          console.error("Error generating screenshot:", error);
          setError("Failed to generate screenshot");
          setIsCapturing(false);

          // Ensure we restore the original classes even on error
          if (memeRef.current && originalClasses) {
            memeRef.current.className = originalClasses;
          }
        });
    }
  };

  useEffect(() => {
    if (generatedMemeUrl) {
      // Reset any previous state when a new meme is generated
    }
  }, [generatedMemeUrl]);

  useEffect(() => {
    setGeneratedMemeUrl(null);
    setTopText("");
    setBottomText("");
    setError(null);
  }, [selectedMeme?.id]);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Enhanced vibrant header */}
      <header className="mb-8 text-center relative overflow-hidden py-8 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold mb-3 text-white drop-shadow-md">
            Meme <span className="text-yellow-300">Tailor</span>
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
            Transform ordinary templates into viral masterpieces with just a few
            clicks! Select a template, add your text, and share your creation
            with the world.
          </p>
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-3 bg-white/20 rounded-full blur-sm"></div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Meme selection panel with fun styling */}
        <div className="w-full lg:w-2/3 h-[600px] overflow-y-auto p-6 bg-gradient-to-br from-pink-50 to-indigo-50 dark:from-pink-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-pink-200 dark:border-pink-800 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-indigo-500 text-transparent bg-clip-text">
              Choose Your Meme Vibe
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {memes.map((meme: Meme) => {
              const isSelected = selectedMeme?.id === meme.id;
              return (
                <div key={meme.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectMeme(meme)}
                    disabled={isSelectingMeme}
                    className={`w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden 
                      transition-all duration-300 p-3 flex flex-col items-center h-full 
                      ${
                        isSelected
                          ? "ring-4 ring-pink-400 dark:ring-pink-500 transform scale-[1.03] shadow-xl"
                          : "shadow-md hover:shadow-xl hover:scale-[1.02] border border-pink-100 dark:border-pink-900"
                      } ${
                      isSelectingMeme ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="relative w-full aspect-square mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                      {isSelectingMeme && isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10 rounded">
                          <div className="h-8 w-8 border-t-2 border-l-2 border-pink-500 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={meme.url || "/placeholder.svg"}
                        alt={meme.name}
                        className="w-full h-full object-contain max-h-[150px] p-2"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-center line-clamp-1 text-pink-800 dark:text-pink-300">
                      {meme.name}
                    </h3>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile drawer trigger button - only visible when a meme is selected */}
        {selectedMeme && (
          <div className="fixed bottom-6 right-6 z-20 lg:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full h-14 w-14 shadow-lg"
                  size="icon"
                >
                  <Edit className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-center text-xl font-bold bg-gradient-to-r from-pink-600 to-indigo-500 text-transparent bg-clip-text">
                    Edit Your Meme
                  </DrawerTitle>
                  <DrawerDescription className="text-center text-gray-500 dark:text-gray-400">
                    Customize your selected meme with funny text
                  </DrawerDescription>
                </DrawerHeader>

                {/* Mobile Meme Editor Content */}
                <div className="p-4 pb-8 max-h-[70vh] overflow-y-auto">
                  {/* Meme Preview */}
                  <div className="relative group mb-6 flex justify-center">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                    <div
                      ref={memeRef}
                      className="relative bg-white dark:bg-gray-800 p-2 rounded-lg"
                    >
                      <div className="relative">
                        {generatedMemeUrl ? (
                          <div className="relative inline-block">
                            <img
                              src={generatedMemeUrl || "/placeholder.svg"}
                              alt="Generated Meme"
                              className="max-h-[200px] w-auto object-contain rounded max-w-full"
                            />
                            {topText && (
                              <div className="absolute top-2 left-0 right-0 text-center">
                                <p className="text-white font-bold uppercase break-words mx-2 text-shadow-meme">
                                  {topText}
                                </p>
                              </div>
                            )}
                            {bottomText && (
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-white font-bold uppercase break-words mx-2 text-shadow-meme">
                                  {bottomText}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <img
                            src={selectedMeme.url || "/placeholder.svg"}
                            alt={selectedMeme.name}
                            className="max-h-[200px] w-auto object-contain rounded max-w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Alert - Mobile */}
                  {error && (
                    <Alert
                      variant="destructive"
                      className="mb-3 animate-in fade-in slide-in-from-top-5 duration-500"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription className="text-sm">
                        {error.includes("Rate limit")
                          ? "You've hit the rate limit. Please wait a few minutes before trying again."
                          : error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Mobile Form */}
                  <form onSubmit={handleSubmitEdit} className="space-y-3">
                    <input
                      type="hidden"
                      name="memeId"
                      value={selectedMeme.id}
                    />
                    <input
                      type="hidden"
                      name="boxCount"
                      value={selectedMeme.box_count}
                    />

                    <div>
                      <label
                        htmlFor="text0-mobile"
                        className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300"
                      >
                        Edit Image Instruction ✏️
                      </label>
                      <Textarea
                        id="text0-mobile"
                        name="text0"
                        placeholder="Type an instruction for creating your meme..."
                        rows={2}
                        required
                        disabled={isSubmittingEdit}
                        className="w-full border-2 border-pink-200 dark:border-pink-800 focus:border-pink-400 focus:ring-pink-400 rounded-lg
                               text-base font-medium placeholder:text-pink-300 dark:placeholder:text-pink-700"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isSubmittingEdit}
                        className="flex-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 
                               text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all
                               disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmittingEdit ? (
                          <>
                            <div className="h-5 w-5 border-t-2 border-l-2 border-white rounded-full animate-spin mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>

                      {generatedMemeUrl && (
                        <Button
                          type="button"
                          onClick={() => setGeneratedMemeUrl(null)}
                          variant="outline"
                          className="bg-transparent border-2 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300
                                 hover:bg-pink-50 dark:hover:bg-pink-900/30 font-bold rounded-lg w-12 flex-shrink-0 flex items-center justify-center"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {generatedMemeUrl && (
                      <>
                        <div>
                          <label
                            htmlFor="topText-mobile"
                            className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300"
                          >
                            Top Text 👆
                          </label>
                          <Textarea
                            id="topText-mobile"
                            value={topText}
                            onChange={(e) => setTopText(e.target.value)}
                            placeholder="Type top text here..."
                            rows={2}
                            disabled={isSubmittingEdit}
                            className="w-full border-2 border-pink-200 dark:border-pink-800 focus:border-pink-400 focus:ring-pink-400 rounded-lg
                                 text-base font-medium placeholder:text-pink-300 dark:placeholder:text-pink-700"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="bottomText-mobile"
                            className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300"
                          >
                            Bottom Text 👇
                          </label>
                          <Textarea
                            id="bottomText-mobile"
                            value={bottomText}
                            onChange={(e) => setBottomText(e.target.value)}
                            placeholder="Type bottom text here..."
                            rows={2}
                            disabled={isSubmittingEdit}
                            className="w-full border-2 border-pink-200 dark:border-pink-800 focus:border-pink-400 focus:ring-pink-400 rounded-lg
                                 text-base font-medium placeholder:text-pink-300 dark:placeholder:text-pink-700"
                          />
                        </div>

                        <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-500">
                          <Button
                            onClick={captureScreenshot}
                            disabled={isCapturing}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
                          >
                            {isCapturing ? (
                              <>
                                <div className="h-5 w-5 border-t-2 border-l-2 border-white rounded-full animate-spin mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Download className="w-5 h-5 mr-2" />
                                Download & Share
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>

                  <div className="mt-6 w-full">
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        className="w-full border-2 border-gray-200 dark:border-gray-700"
                      >
                        Close Editor
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}

        {/* Desktop Edit panel - hidden on mobile */}
        <div className="w-full lg:w-1/3 flex-col gap-4 hidden lg:flex h-[600px] overflow-y-auto">
          <Card
            className={`border-2 ${
              selectedMeme
                ? "border-pink-300 dark:border-pink-700"
                : "border-gray-200 dark:border-gray-700"
            } shadow-xl h-full`}
          >
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-2"></div>
            <CardContent className="px-2 overflow-y-auto flex flex-col h-[calc(100%-8px)]">
              {selectedMeme ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-xl font-extrabold">
                      Meme Creator 9000
                    </h2>
                  </div>

                  <div className="relative group mb-6 flex justify-center">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                    <div
                      ref={memeRef}
                      className="relative bg-white dark:bg-gray-800 p-2 rounded-lg"
                    >
                      <div className="relative">
                        {generatedMemeUrl ? (
                          <div className="relative inline-block">
                            <img
                              src={generatedMemeUrl || "/placeholder.svg"}
                              alt="Generated Meme"
                              className="h-[220px] w-auto object-contain rounded max-w-full"
                            />
                            {topText && (
                              <div className="absolute top-2 left-0 right-0 text-center">
                                <p className="text-white text-xl font-bold uppercase break-words mx-2 text-shadow-meme">
                                  {topText}
                                </p>
                              </div>
                            )}
                            {bottomText && (
                              <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-white text-xl font-bold uppercase break-words mx-2 text-shadow-meme">
                                  {bottomText}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <img
                            src={selectedMeme.url || "/placeholder.svg"}
                            alt={selectedMeme.name}
                            className="h-[220px] w-auto object-contain rounded max-w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert
                      variant="destructive"
                      className="mt-2 mb-2 animate-in fade-in slide-in-from-top-5 duration-500"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription className="text-sm">
                        {error.includes("Rate limit")
                          ? "You've hit the rate limit. Please wait a few minutes before trying again."
                          : error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form
                    onSubmit={handleSubmitEdit}
                    className="space-y-3 flex-shrink-0"
                  >
                    <input
                      type="hidden"
                      name="memeId"
                      value={selectedMeme.id}
                    />
                    <input
                      type="hidden"
                      name="boxCount"
                      value={selectedMeme.box_count}
                    />

                    <div>
                      <label
                        htmlFor="text0"
                        className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300"
                      >
                        Edit Image Instruction ✏️
                      </label>
                      <Textarea
                        id="text0"
                        name="text0"
                        placeholder="Type an instruction for creating your meme..."
                        rows={2}
                        required
                        disabled={isSubmittingEdit}
                        className="w-full border-2 border-pink-200 dark:border-pink-800 focus:border-pink-400 focus:ring-pink-400 rounded-lg
                                 text-base font-medium placeholder:text-pink-300 dark:placeholder:text-pink-700"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isSubmittingEdit}
                        className="flex-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 
                               text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all
                               disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmittingEdit ? (
                          <>
                            <div className="h-5 w-5 border-t-2 border-l-2 border-white rounded-full animate-spin mr-2"></div>
                            Creating Magic...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Meme
                          </>
                        )}
                      </Button>

                      {generatedMemeUrl && (
                        <Button
                          type="button"
                          onClick={() => setGeneratedMemeUrl(null)}
                          variant="outline"
                          className="bg-transparent border-2 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300
                                   hover:bg-pink-50 dark:hover:bg-pink-900/30 font-bold rounded-lg w-12 flex-shrink-0 flex items-center justify-center"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {generatedMemeUrl && (
                      <>
                        <div>
                          <label
                            htmlFor="topText"
                            className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300"
                          >
                            Top Text 👆
                          </label>
                          <Textarea
                            id="topText"
                            value={topText}
                            onChange={(e) => setTopText(e.target.value)}
                            placeholder="Type top text here..."
                            rows={2}
                            disabled={isSubmittingEdit}
                            className="w-full border-2 border-pink-200 dark:border-pink-800 focus:border-pink-400 focus:ring-pink-400 rounded-lg
                                 text-base font-medium placeholder:text-pink-300 dark:placeholder:text-pink-700"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="bottomText"
                            className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300"
                          >
                            Bottom Text 👇
                          </label>
                          <Textarea
                            id="bottomText"
                            value={bottomText}
                            onChange={(e) => setBottomText(e.target.value)}
                            placeholder="Type bottom text here..."
                            rows={2}
                            disabled={isSubmittingEdit}
                            className="w-full border-2 border-pink-200 dark:border-pink-800 focus:border-pink-400 focus:ring-pink-400 rounded-lg
                                 text-base font-medium placeholder:text-pink-300 dark:placeholder:text-pink-700"
                          />
                        </div>

                        <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-500">
                          <Button
                            onClick={captureScreenshot}
                            disabled={isCapturing}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                   text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
                          >
                            {isCapturing ? (
                              <>
                                <div className="h-5 w-5 border-t-2 border-l-2 border-white rounded-full animate-spin mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Download className="w-5 h-5 mr-2" />
                                Download & Share
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-[400px] space-y-4">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-full animate-ping opacity-30"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-full">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-pink-700 dark:text-pink-300">
                    Select a meme template to start your viral masterpiece!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pick from the collection on the left and unleash your
                    creativity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
