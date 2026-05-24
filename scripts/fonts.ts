import { Doto, Plus_Jakarta_Sans } from "next/font/google";

// NOTE: the migration towards variable-based fonts inclusion is for the only
// aim of allowing Ju to test fonts with a easy-to-use UI

export const serif = Plus_Jakarta_Sans({
    weight: ["400", "600", "700", "800"],
    variable: "--font-serif",
    display: "swap"
});

export const dots = Doto({
    subsets: ["latin"],
    variable: "--font-doto",
    display: "swap"
});
