"use server";

import { retrieveWordle } from "@/scripts/game_mgr/game";
import { UserFacingWordleData } from "@/scripts/game_mgr/types";
import { ReactNode } from "react";
import { Wordle } from "./wordle";

// NOTE: this function will load a guess data server-side before passing it to
// the client, it must be called with Suspense
export async function SSRWordleLoader(props: {
    id: string;
    onNotFound: () => ReactNode | never;
}) {
    const gameData = await retrieveWordle(props.id, true);

    if (gameData === null) return props.onNotFound();
    return (
        <Wordle gameData={gameData as UserFacingWordleData} id={props.id} />
    );
}
