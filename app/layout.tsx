import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/navbar";
import { dots, serif } from "@/scripts/fonts";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import { ResetProgressShortcut } from "@/components/reset_progress";

import "./globals.css";

export const metadata: Metadata = {
    title: "Lyondle | Devinez de nouvelles stations TCL chaque jour",
    description: "Connaissez-vous vraiment les TCL ? Testez-vous chaque jour sur notre Wordle, Doku, et Guessr des stations de métro, tram, funiculaire et navigône de Lyon !",
    icons: {
        icon: [
            {
                url: "https://www.lyondle.fr/icon.svg",
                type: "image/svg+xml"
            },
            {
                url: "https://www.lyondle.fr/favicon.ico",
                sizes: "any"
            }
        ],
        apple: "https://www.lyondle.fr/apple-touch.png"
    },
    openGraph: {
        title: "Lyondle | Devinez de nouvelles stations TCL chaque jour",
        description:
            "Testez-vous chaque jour sur un Sudoku, un Wordle et un Guessr 100% dédiés aux TCL.",
        url: "https://www.lyondle.fr",
        siteName: "Lyondle",
        locale: "fr_FR",
        type: "website",
        images: [
            {
                url: "https://www.lyondle.fr/og-banner.png",
                width: 1200,
                height: 630,
                alt: "Jouer à la trilogie de jeux de Lyondle"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Lyondle | La trilogie de jeux des TCL",
        description:
            "Testez-vous chaque jour sur un Sudoku, un Wordle et un Guessr 100% dédiés aux TCL.",
        images: ["https://www.lyondle.fr/twitter-banner.png"]
    },
    alternates: {
        canonical: "https://www.lyondle.fr"
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${serif.variable} ${dots.variable} h-full`}>
            <body className="min-h-dvh flex flex-col justify-between max-w-[600px] w-[96%] mx-auto">
                <div className="flex flex-col grow min-h-[80dvh]">
                    <br />
                    <Navbar />
                    <ResetProgressShortcut />
                    <br />
                    {children}
                    <br />
                </div>
                <Footer />
                <Analytics />
            </body>
        </html>
    );
}
