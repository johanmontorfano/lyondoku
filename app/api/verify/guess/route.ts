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
    body.data.guess = body.data.guess.filter(c => c !== " ").map(
        c => c.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    );
    const gameName =  game.name.toLowerCase()
        .normalize("NFD")
        .replaceAll(/\p{Diacritic}/gu, "")
        .replaceAll(" ", "")
        .split("");
    const match = gameName.map((c, i) =>
        c === body.data.guess[i] ? LetterPosition.Valid :
        body.data.guess.includes(c) ? LetterPosition.Misplaced :
        LetterPosition.Invalid
    );

    return NextResponse.json({
        won: match
            .map(c => c === LetterPosition.Valid)
            .reduce((p, c) => p && c),
        match
    });
}
