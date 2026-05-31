"use server";

import { retrieveDoku } from "@/scripts/game_mgr/game";
import { DokuGrid } from "./doku";
import { ReactNode } from "react";
import { UserFacingDokuData } from "@/scripts/game_mgr/types";

// NOTE: this function will load a doku data server-side before passing it to
// the client, it must be called with Suspense
export async function SSRDokuLoader(props: {
    id: string,
    onNotFound: () => ReactNode | never
}) {
    const gameData = await retrieveDoku(props.id, true);

    if (gameData === null) return props.onNotFound();
    return <DokuGrid gameData={gameData as UserFacingDokuData} />;
}
