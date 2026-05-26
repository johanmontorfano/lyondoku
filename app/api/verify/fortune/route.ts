import { FortuneData, retrieveFortune } from "@/scripts/game_mgr/game";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({ id: z.string(), guess: z.array(z.string()) });

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveFortune(body.data.id) as FortuneData;

    if (game === null)
        return NextResponse.json({ error: "game not found" }, { status: 404 });

    // NOTE: the guess is provided without spaces, so the verification happens
    // without spaces too
    const match = game.name
        .toLowerCase()
        .replaceAll(" ", "")
        .split("")
        .map((c, i) => c === body.data.guess[i].toLowerCase());

    return NextResponse.json({ won: match.reduce((p, c) => p && c), match });
}
