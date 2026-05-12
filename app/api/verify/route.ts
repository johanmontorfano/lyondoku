import { GameData, retrieveGame, retrieveStation } from "@/scripts/game_mgr/game";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({
    gridId: z.string(),
    targetCell: z.string(),
    guess: z.string()
});

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveGame(body.data.gridId) as GameData;
    const correct = game !== null &&
        game.validAnswers[body.data.targetCell]?.includes(body.data.guess);

    return NextResponse.json({
        correct,
        stationData: correct ? await retrieveStation(body.data.guess) : null
    });
}
