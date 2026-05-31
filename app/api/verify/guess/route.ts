import { GuessData, retrieveGuess } from "@/scripts/game_mgr/game";
import { LetterPosition } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({ id: z.string(), guess: z.array(z.string()) });

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveGuess(body.data.id) as GuessData;

    if (game === null)
        return NextResponse.json({ error: "game not found" }, { status: 404 });

    // NOTE: the guess is provided without spaces, so the verification happens
    // without spaces too
    const gameName = game.name.toLowerCase()
        .replaceAll(/[- ']/gu, "")
        .split("");
    body.data.guess = body.data.guess
        .filter(c => c !== " ")
        .map(c => c.toLowerCase());

    // since we want misplaced letters to not be signaled when they are too
    // much, all misplaced instances matches get deleted
    function destructiveIncludes(i: number) {
        const idx = gameName.findIndex(v => v === body.data!.guess[i]);

        if (idx > -1) {
            gameName[idx] = "*";
            return true;
        }
        return false;
    }

    const match = Array(gameName.length).fill(0).map((_, i) =>
        body.data.guess[i] === gameName[i] ? LetterPosition.Valid :
        destructiveIncludes(i) ? LetterPosition.Misplaced :
        LetterPosition.Invalid
    );

    return NextResponse.json({
        won: match
            .map(c => c === LetterPosition.Valid)
            .reduce((p, c) => p && c),
        match
    });
}
