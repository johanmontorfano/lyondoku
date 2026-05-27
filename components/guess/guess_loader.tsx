"use server";

import { retrieveGuess, UserFacingGuessData } from "@/scripts/game_mgr/game";
import { ReactNode } from "react";
import { Guess } from "./guess";

// NOTE: this function will load a guess data server-side before passing it to
// the client, it must be called with Suspense
export async function SSRGuessLoader(props: {
    id: string;
    onNotFound: () => ReactNode | never;
}) {
    const gameData = await retrieveGuess(props.id, true);

    if (gameData === null) return props.onNotFound();
    return (
        <Guess gameData={gameData as UserFacingGuessData} id={props.id} />
    );
}
