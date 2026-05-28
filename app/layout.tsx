import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FontEditor } from "@/components/font_editor";
import { dots, serif } from "@/scripts/fonts";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Lyondle",
    description: "Connaissez-vous vraiment les TCL ?",
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
                    <FontEditor />
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
