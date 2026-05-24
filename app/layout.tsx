import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FontEditor } from "@/components/font_editor";
import "./globals.css";
import { ResetProgress } from "@/components/reset_progress";
import { dots, serif } from "@/scripts/fonts";

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
        <html lang="en" className={`${serif.variable} ${dots.variable} h-full`}>
            <body className="min-h-dvh flex flex-col max-w-[600px] w-[96%] mx-auto">
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
                    <p className="font-semibold text-xl">Comment jouer au doku</p>
                    <ul className="list-disc [&>li]:ml-6">
                        <li>
                            Remplissez la grille avec <strong>
                                9 stations TCL
                            </strong> différentes
                        </li>
                        <li>
                            Chaque station doit avoir les caractéristiques de
                            <strong>sa ligne et sa colonne</strong>
                        </li>
                        <li>
                            Vous avez droit à <strong>3 erreurs</strong>
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
                    <br />
                </div>
            </body>
        </html>
    );
}
