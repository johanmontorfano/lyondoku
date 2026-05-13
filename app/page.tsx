import { ResetProgress } from "@/components/reset_progress";
import Link from "next/link";

export default function Page() {
    // HACK: since a new grid is available every day, instead of pulling grid
    // lists from the server, we only show links for a grid a day from the 
    // first grid to today
    const firstEverGrid = new Date("05/12/2026");
    const allGrids = [];

    const today = new Date();
    let cursor = new Date(firstEverGrid);

    today.setHours(0, 0, 0, 0);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= today) {
        const year = cursor.getFullYear();
        const month = String(cursor.getMonth() + 1).padStart(2, '0');
        const day = String(cursor.getDate()).padStart(2, '0');
  
        allGrids.push(`${year}-${month}-${day}`);
        cursor.setDate(cursor.getDate() + 1);
    }

    return <div>
        <h1 className="text-xl font-semibold">Comment jouer à lyondoku?</h1>
        <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify">
            <li>Le but du jeu est de remplir la grille avec des stations lyonnaises 
            de métro, tram et funiculaire qui correspondent aussi bien au 
            critère de la ligne qu'à celui de la colonne.</li>
            <li>Vous perdez si 3 erreurs sont commises.</li>
            <li>Une fois une station placée, elle ne peut être modifiée ou
            réutilisée</li>
            <li>À la fin de la partie, cliquez sur les cases pour consulter les
            réponses possibles</li>
        </ul>
        <div className="divider" />
        <h1 className="text-xl font-semibold">Grilles quotidiennes</h1>
        <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify">
            {allGrids.reverse().map(t => <li key={t}>
                <Link
                    prefetch={false}
                    href={"/" + t}
                    className="hover:underline"
                >{
                    new Intl.DateTimeFormat('fr-FR', {
                        month: "long",
                        day: "2-digit",
                        year: "numeric"
                    }).format(new Date(t))
                }</Link>
            </li>)}
        </ul>
        <br />
        <ResetProgress />
    </div>
}
