import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const fontMain = Jost({
  variable: "--font-main",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meme Tailor | Create Your Own Personalized Viral Memes",
  description: "Personalize the most popular memes into viral masterpieces with Meme Tailor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontMain.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
