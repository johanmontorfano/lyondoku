import { retrieveWordle } from "@/scripts/game_mgr/game";
import { WordleData } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url, "https://dummy.com/");

    if (!url.searchParams.has("id"))
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveWordle(url.searchParams.get("id")!) as WordleData;

    return NextResponse.json(game);
}
