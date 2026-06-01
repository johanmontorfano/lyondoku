import { retrieveWordle } from "@/scripts/game_mgr/game";
import { LetterPosition, WordleData } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({ id: z.string(), guess: z.array(z.string()) });

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveWordle(body.data.id) as WordleData;

    if (game === null)
        return NextResponse.json({ error: "game not found" }, { status: 404 });

    // NOTE: the guess is provided without spaces, so the verification happens
    // without spaces too
    const gameName = game.name.toLowerCase().replaceAll(/[- ']/gu, "").split("");
    const guess = body.data.guess.filter(c => c !== " ").map(c => c.toLowerCase());

    const match = Array(gameName.length).fill(LetterPosition.Invalid);
    const secretWordPool = [...gameName];
    const userGuessPool: (string | null)[] = [...guess];

    for (let i = 0; i < gameName.length; i++) {
        if (userGuessPool[i] && secretWordPool[i] &&
            userGuessPool[i] === secretWordPool[i]) {
            match[i] = LetterPosition.Valid;
            secretWordPool[i] = "*";
            userGuessPool[i] = null;
        }
    }

    for (let i = 0; i < gameName.length; i++) {
        if (!userGuessPool[i] || userGuessPool[i] === null) continue;

        const misplacedIdx = secretWordPool.indexOf(userGuessPool[i]!);
        if (misplacedIdx > -1) {
            match[i] = LetterPosition.Misplaced;
            secretWordPool[misplacedIdx] = "*";
        }
    }

    return NextResponse.json({
        won: match.every(c => c === LetterPosition.Valid),
        match
    });
}
