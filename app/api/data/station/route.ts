import { retrieveStation } from "@/scripts/game_mgr/game";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id === null)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });
    
    const station = await retrieveStation(parseInt(id));

    return NextResponse.json({ station }, { status: station ? 200 : 404 });
}
