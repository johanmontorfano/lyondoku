import { retrieveDoku } from "@/scripts/game_mgr/game";
import { DokuData } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url, "https://dummy.com/");

    if (!url.searchParams.has("id"))
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveDoku(url.searchParams.get("id")!) as DokuData;

    return NextResponse.json(game.validAnswers);
}
