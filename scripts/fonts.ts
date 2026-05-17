import { Space_Grotesk, Space_Mono } from "next/font/google";

// NOTE: the migration towards variable-based fonts inclusion is for the only
// aim of allowing Ju to test fonts with a easy-to-use UI

export const grotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-grotesk" 
});
export const mono = Space_Mono({ 
  weight: ["400", "700"], 
  subsets: ["latin"],
  variable: "--font-mono" 
});
