"use client"

import { useState, type FormEvent } from "react"
import type { Meme } from "@/types/meme"
import { selectMeme, submitMemeEdit } from "@/app/actions"
import { Sparkles, Download, RefreshCw, Zap, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface MemeGridProps {
  memes: Meme[]
}

export default function MemeGrid({ memes }: MemeGridProps) {
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [isSelectingMeme, setIsSelectingMeme] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState<string | null>(null)

  // Handle meme selection with loading state
  const handleSelectMeme = async (formData: FormData) => {
    const memeId = formData.get("memeId") as string
    const selected = memes.find((meme) => meme.id === memeId)

    if (selected) {
      setIsSelectingMeme(true)
      try {
        await selectMeme(formData)
        setSelectedMeme(selected)
        // Reset any previously generated meme when selecting a new template
        setGeneratedMemeUrl(null)
      } catch (error) {
        console.error("Error selecting meme:", error)
      } finally {
        setIsSelectingMeme(false)
      }
    }
  }

  // Handle meme edit submission with loading state
  const handleSubmitEdit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmittingEdit(true)

    try {
      const formData = new FormData(event.target as HTMLFormElement)
      const result = await submitMemeEdit(formData)

      if (result.success && result.imageUrl) {
        setGeneratedMemeUrl(result.imageUrl)
      } else {
        console.error("Error generating meme:", result.error)
      }
    } catch (error) {
      console.error("Error submitting meme edit:", error)
    } finally {
      setIsSubmittingEdit(false)
    }
  }

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
            Transform ordinary templates into viral masterpieces with just a few clicks! Select a template, add your
            text, and share your creation with the world.
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
              const isSelected = selectedMeme?.id === meme.id
              return (
                <form key={meme.id} action={handleSelectMeme}>
                  <input type="hidden" name="memeId" value={meme.id} />
                  <button
                    type="submit"
                    disabled={isSelectingMeme}
                    className={`w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden 
                      transition-all duration-300 p-3 flex flex-col items-center h-full 
                      ${
                        isSelected
                          ? "ring-4 ring-pink-400 dark:ring-pink-500 transform scale-[1.03] shadow-xl"
                          : "shadow-md hover:shadow-xl hover:scale-[1.02] border border-pink-100 dark:border-pink-900"
                      } ${isSelectingMeme ? "opacity-70 cursor-not-allowed" : ""}`}
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
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-center line-clamp-1 text-pink-800 dark:text-pink-300">
                      {meme.name}
                    </h3>
                  </button>
                </form>
              )
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
                <div className="p-4 pb-8">
                  {/* Meme Preview */}
                  <div className="relative group mb-6 flex justify-center">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg">
                      {generatedMemeUrl ? (
                        <img
                          src={generatedMemeUrl || "/placeholder.svg"}
                          alt="Generated Meme"
                          className="max-h-[200px] max-w-full object-contain rounded"
                        />
                      ) : (
                        <img
                          src={selectedMeme.url || "/placeholder.svg"}
                          alt={selectedMeme.name}
                          className="max-h-[200px] max-w-full object-contain rounded"
                        />
                      )}
                    </div>
                  </div>

                  {/* Mobile Form */}
                  <form onSubmit={handleSubmitEdit} className="space-y-5">
                    <input type="hidden" name="memeId" value={selectedMeme.id} />
                    <input type="hidden" name="boxCount" value={selectedMeme.box_count} />

                    <div>
                      <label htmlFor="text0-mobile" className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300">
                        Make It Funny 🤣
                      </label>
                      <Textarea
                        id="text0-mobile"
                        name="text0"
                        placeholder="Type something hilarious..."
                        rows={3}
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
                      <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                               text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
                        >
                          <a href={generatedMemeUrl} download="viral-meme.jpg">
                            <Download className="w-5 h-5 mr-2" />
                            Download & Share
                          </a>
                        </Button>
                      </div>
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
        <div className="w-full lg:w-1/3 flex-col gap-4 hidden lg:flex">
          <Card
            className={`border-2 ${selectedMeme ? "border-pink-300 dark:border-pink-700" : "border-gray-200 dark:border-gray-700"} shadow-xl overflow-hidden`}
          >
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-2"></div>
            <CardContent className="p-6">
              {selectedMeme ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-xl font-extrabold">Meme Creator 9000</h2>
                  </div>

                  <div className="relative group mb-6 flex justify-center">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg">
                      {generatedMemeUrl ? (
                        <img
                          src={generatedMemeUrl || "/placeholder.svg"}
                          alt="Generated Meme"
                          className="max-h-[300px] max-w-full object-contain rounded"
                        />
                      ) : (
                        <img
                          src={selectedMeme.url || "/placeholder.svg"}
                          alt={selectedMeme.name}
                          className="max-h-[300px] max-w-full object-contain rounded"
                        />
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmitEdit} className="space-y-5">
                    <input type="hidden" name="memeId" value={selectedMeme.id} />
                    <input type="hidden" name="boxCount" value={selectedMeme.box_count} />

                    <div>
                      <label htmlFor="text0" className="block text-sm font-bold mb-2 text-pink-700 dark:text-pink-300">
                        Make It Funny 🤣
                      </label>
                      <Textarea
                        id="text0"
                        name="text0"
                        placeholder="Type something hilarious..."
                        rows={3}
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
                      <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                   text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
                        >
                          <a href={generatedMemeUrl} download="viral-meme.jpg">
                            <Download className="w-5 h-5 mr-2" />
                            Download & Share
                          </a>
                        </Button>
                      </div>
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
                    Pick from the collection on the left and unleash your creativity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
