import { GuessData, retrieveGuess } from "@/scripts/game_mgr/game";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    if (!url.searchParams.has("id"))
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveGuess(url.searchParams.get("id")!) as GuessData;

    return NextResponse.json(game);
}
