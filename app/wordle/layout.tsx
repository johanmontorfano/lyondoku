import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Lyondle – Wordle TCL : Devinez la station de métro, tram, funiculaire ou navigône du jour | Lyondle",
    description: "Le Wordle des transports lyonnais ! Trouvez la station TCL mystère en 6 tentatives. Utilisez les indices pour valider vos lettres.",
};

export default function Layout(props: { children: ReactNode }) {
    return props.children;
}
