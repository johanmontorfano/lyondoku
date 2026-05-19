import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/navbar";
import { FontEditor } from "@/components/font_editor";
import "./globals.css";
import { ResetProgress } from "@/components/reset_progress";

export const metadata: Metadata = {
    title: "Lyondle",
    description: "Metrodoku clone 4 Lyon"
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="font-(family-name:--font-serif) h-full">
            <body className="min-h-dvh flex flex-col justify-between max-w-[600px] w-[96%] mx-auto">
                <div>
                    <br />
                    <Navbar />
                    <FontEditor />
                    <br />
                    {children}
                    <br />
                </div>
                <div>
                    <div className="divider" />
                    <p className="font-semibold text-xl">Comment jouer à Lyondle</p>
                    <ul className="list-disc [&>li]:ml-6">
                        <li>
                            Trouvez la station TCL en <strong>
                                6 essais
                            </strong> maximum
                        </li>
                        <li>
                            Chaque essai vous fourni des indices sur la
                            station à trouver
                        </li>
                        <li>
                            Une nouvelle partie est disponible à <strong>
                                minuit
                            </strong> chaque jour
                        </li>
                    </ul>
                    <br />
                    <div className="flex justify-end">
                        <ResetProgress />
                    </div>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
