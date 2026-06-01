import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Lyondle – Sudoku TCL : Devinez les stations de métro, tram, funiculaire ou navigône composant la grille du jour | Lyondle",
    description: "Le Sudoku des transports lyonnais ! Remplissez la grille avec 9 stations différentes.",
};

export default function Layout(props: { children: ReactNode }) {
    return props.children;
}
