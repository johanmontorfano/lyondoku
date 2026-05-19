"use server";

import { retrieveGame, UserFacingGameData } from "@/scripts/game_mgr/game";
import { DokuGrid } from "./doku";
import { ReactNode } from "react";

// NOTE: this function will load a doku data server-side before passing it to
// the client, it must be called with Suspense
export async function SSRDokuLoader(props: {
    id: string,
    onNotFound: () => ReactNode | never
}) {
    const gameData = await retrieveGame(props.id, true);



    if (gameData === null) return props.onNotFound();
    return <div>
        <header className="font-(family-name:--font-mono)">
            <h3 className="text-xl font-(family-name:--font-mono">
                {props.id.startsWith("random_") ?
                    "grille aléatoire" :
                    isToday(new Date(gameData.id)) ?
                        "grille du jour" : "archive du"}
            </h3>
            {!props.id.startsWith("random_") &&
                <h4 className="text-lg font-(family-name:--font-mono)">
                    {new Intl.DateTimeFormat('fr-FR').format(
                        new Date(gameData.id).getTime()
                    )}
                </h4>
            }
        </header>
        <br />
        <DokuGrid gameData={gameData as UserFacingGameData} />
    </div>
}
