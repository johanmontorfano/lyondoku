import { Poppins, Space_Grotesk, Space_Mono } from "next/font/google";

// NOTE: the migration towards variable-based fonts inclusion is for the only
// aim of allowing Ju to test fonts with a easy-to-use UI

export const grotesk = Space_Grotesk({ 
    variable: "--font-grotesk" 
});
export const mono = Space_Mono({ 
    weight: ["400", "700"], 
    variable: "--font-mono" 
});
export const serif = Poppins({
    weight: ["400", "800"],
    variable: "--font-serif"
})
