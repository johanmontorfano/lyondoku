import { retrieveStation, retrieveWordle } from "@/scripts/game_mgr/game";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log(req);
    const url = new URL(req.url);

    if (!url.searchParams.has("id"))
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    console.log(url.searchParams.get("id"));
    const game = await retrieveWordle(url.searchParams.get("id")!);

    if (game === null)
        return NextResponse.json({ error: "not found" }, { status: 404 });

    const station = await retrieveStation(game.answerId);

    return NextResponse.json({ station });
}
