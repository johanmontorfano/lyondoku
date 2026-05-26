"use server";

import {
    retrieveFortune,
    UserFacingFortuneData,
} from "@/scripts/game_mgr/game";
import { Fortune } from "./fortune";
import { ReactNode } from "react";

// NOTE: this function will load a fortune data server-side before passing it to
// the client, it must be called with Suspense
export async function SSRFortuneLoader(props: {
    id: string;
    onNotFound: () => ReactNode | never;
}) {
    const gameData = await retrieveFortune(props.id, true);

    if (gameData === null) return props.onNotFound();
    return (
        <Fortune gameData={gameData as UserFacingFortuneData} id={props.id} />
    );
}
