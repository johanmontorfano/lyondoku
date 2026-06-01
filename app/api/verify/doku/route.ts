import { retrieveDoku, retrieveStation } from "@/scripts/game_mgr/game";
import { DokuData } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({
    gridId: z.string(),
    targetCell: z.string(),
    guess: z.number()
});

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveDoku(body.data.gridId) as DokuData;
    const correct = game !== null &&
        game.validAnswers[body.data.targetCell]?.includes(body.data.guess);
    
    if (!correct)
        return NextResponse.json({ correct, stationData: null });

    const stationData = correct ? await retrieveStation(body.data.guess) : null;

    if (stationData === null)
        return NextResponse.json({ error: "retrieval err" }, { status: 500 });

    let rarity = 1 - stationData.finalScore;

    return NextResponse.json({
        correct,
        stationData,
        score: parseFloat((rarity * 100).toFixed(0))
    });
}
