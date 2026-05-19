import { GameData, retrieveGame, retrieveStation } from "@/scripts/game_mgr/game";
import { Station } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({
    gridId: z.string(),
    targetCell: z.string(),
    guess: z.number()
});

function computeStationRarity(station: Station) {
    let score = 100;

    if (station.terminus) score -= 15;
    if (station.connections.length > 1)
        score -= (station.connections.length - 1) * 10;
    return Math.max(10, score);
}

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveGame(body.data.gridId) as GameData;
    const correct = game !== null &&
        game.validAnswers[body.data.targetCell]?.includes(body.data.guess);
    
    if (!correct)
        return NextResponse.json({ correct, stationData: null });

    const stationData = correct ? await retrieveStation(body.data.guess) : null;

    if (stationData === null)
        return NextResponse.json({ error: "retrieval err" }, { status: 500 });
    return NextResponse.json({
        correct,
        stationData,
        score: computeStationRarity(stationData)
    });
}
