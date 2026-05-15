"use server";

import { retrieveGame, UserFacingGameData } from "@/scripts/game_mgr/game";
import { DokuGrid } from "./doku";
import { mono } from "@/scripts/fonts";
import { ReactNode } from "react";

// NOTE: this function will load a doku data server-side before passing it to
// the client, it must be called with Suspense
export async function SSRDokuLoader(props: {
    id: string,
    onNotFound: () => ReactNode | never
}) {
    const gameData = await retrieveGame(props.id, true);

    function isToday(date: Date) {
        const today = new Date();

        return (
            date.getDate() === today.getDate() &&   
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    if (gameData === null) return props.onNotFound();
    return <div>
        <header className={mono.className}>
            <h3 className="text-xl font-monospace">
                {props.id.startsWith("random_") ?
                    "grille aléatoire" :
                    isToday(new Date(gameData.id)) ?
                        "grille du jour" : "archive du"}
            </h3>
            {!props.id.startsWith("random_") &&
                <h4 className="text-xl font-monospace">
                    { new Intl.DateTimeFormat('fr-FR').format(
                        new Date(gameData.id).getTime()
                    )}
                </h4>
            }
        </header>
        <br />
        <DokuGrid gameData={gameData as UserFacingGameData} />
    </div>
}
