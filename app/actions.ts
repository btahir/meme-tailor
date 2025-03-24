"use server";

import { Meme } from "@/types/meme";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Interface for the API response
interface MemesResponse {
  success: boolean;
  data: {
    memes: Meme[];
  };
}

// Initialize the Gemini API with the key from environment variables
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Get the image generation model
const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp-image-generation",
});

const generationConfig = {
  temperature: 1,
  responseMimeType: "text/plain",
  responseModalities: ["Text", "Image"],
  maxOutputTokens: 8192,
};

// Function to fetch popular meme templates
export async function getMemes(): Promise<MemesResponse> {
  try {
    const response = await fetch("https://api.imgflip.com/get_memes");
    if (!response.ok) {
      throw new Error("Failed to fetch memes");
    }
    const data: MemesResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching memes:", error);
    throw error;
  }
}

export async function selectMeme(formData: FormData): Promise<void> {
  const memeId = formData.get("memeId") as string;

  // Process the meme ID selection but don't return anything (void)
  console.log(`Selected meme with ID: ${memeId}`);
}

/**
 * Fetch image data from a URL as ArrayBuffer
 */
async function fetchImageAsArrayBuffer(imageUrl: string): Promise<ArrayBuffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.arrayBuffer();
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function submitMemeEdit(formData: FormData): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
  details?: string;
}> {
  const memeId = formData.get("memeId") as string;
  const memeText = formData.get("text0") as string;

  try {
    // Validate inputs
    if (!memeId || !memeText) {
      return {
        success: false,
        error: "Missing required fields",
        details: "Both meme template and text are required",
      };
    }

    // Validate prompt length
    if (memeText.length < 2) {
      return {
        success: false,
        error: "Invalid input",
        details: "Meme text must be at least 2 characters long",
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // First, get all memes to find the selected one
    const memesResponse = await getMemes();
    const selectedMeme = memesResponse.data.memes.find(
      (meme) => meme.id === memeId
    );

    if (!selectedMeme) {
      return {
        success: false,
        error: "Meme not found",
        details: "The selected meme template could not be found",
      };
    }

    console.log("Processing meme edit:");
    console.log("Meme ID:", memeId);
    console.log("Meme URL:", selectedMeme.url);
    console.log("Meme text:", memeText);

    // Fetch the image data from the URL
    const imageBuffer = await fetchImageAsArrayBuffer(selectedMeme.url);
    const base64Image = arrayBufferToBase64(imageBuffer);
    const mimeType = "image/jpeg"; // Assuming JPEG for meme images

    // Generate a prompt for creating the meme
    const prompt = `Edit the entire image according to this instruction: ${memeText}.`;

    // Send the request to Gemini
    console.log("Sending request to Gemini...");

    // Build the content with text prompt and image
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ];

    // Set a timeout for the API call (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(new Error("Gemini API request timed out after 30 seconds")),
        30000
      );
    });

    // Actual API call
    const apiCallPromise = imageModel.generateContent({
      contents: [
        {
          role: "user",
          parts: contents,
        },
      ],
      generationConfig,
    });

    // Race between timeout and actual API call
    const result = await Promise.race([apiCallPromise, timeoutPromise]);

    console.log("Received response from Gemini");

    // Extract the image from the response
    let generatedImageUrl = "";

    // Safely check if candidates exist and get the parts
    const response = result.response;
    const candidates = response.candidates || [];

    if (candidates.length > 0 && candidates[0]?.content?.parts) {
      const parts = candidates[0].content.parts;

      for (const part of parts) {
        if (part.inlineData) {
          // Convert image data to base64 for embedding in HTML
          const imageData = part.inlineData.data;
          generatedImageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`;
          break; // Take the first image only
        }
      }
    }

    if (!generatedImageUrl) {
      return {
        success: false,
        error: "Image generation failed",
        details: "No image was generated in the Gemini response",
      };
    }

    return {
      success: true,
      imageUrl: generatedImageUrl,
    };
  } catch (error) {
    console.error("Error processing meme edit:", error);

    if (error instanceof Error) {
      // Handle specific error scenarios
      if (error.message.includes("GEMINI_API_KEY")) {
        return {
          success: false,
          error: "API configuration error",
          details: "The Gemini API key is missing or invalid",
        };
      }

      if (error.message.includes("timed out")) {
        return {
          success: false,
          error: "Request timeout",
          details:
            "The request to Gemini took too long. Please try again or use simpler text.",
        };
      }

      if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        return {
          success: false,
          error: "Network error",
          details:
            "Could not connect to Gemini. Please check your internet connection and try again.",
        };
      }

      // Return the actual error message for other cases
      return {
        success: false,
        error: "Failed to generate meme",
        details: error.message,
      };
    }

    // Handle other errors
    return {
      success: false,
      error: "Failed to generate meme",
      details: "An unknown error occurred",
    };
  }
}
