import { retrieveStation, retrieveGuessr } from "@/scripts/game_mgr/game";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url, "https://dummy.com/");

    if (!url.searchParams.has("id"))
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveGuessr(url.searchParams.get("id")!);

    if (game === null)
        return NextResponse.json({ error: "not found" }, { status: 404 });

    const station = await retrieveStation(game.answerId);

    return NextResponse.json({ station });
}
