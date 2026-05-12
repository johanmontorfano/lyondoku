import type { Metadata } from "next";
import { grotesk } from "@/scripts/fonts";
import "./globals.css";

export const metadata: Metadata = {
    title: "LyonDoku",
    description: "Metrodoku clone 4 Lyon",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${grotesk.className} h-full`}
        >
            <body className="max-w-[600px] w-[90%] mx-auto">{children}</body>
        </html>
    );
}
