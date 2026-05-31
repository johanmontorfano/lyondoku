import { retrieveStation, retrieveGuessr } from "@/scripts/game_mgr/game";
import { GuessrAnswer } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";
import bearing from "@turf/bearing";
import distance from "@turf/distance";
import z from "zod";

const postReq = z.object({ id: z.string(), guess: z.number() });

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveGuessr(body.data.id);
    
    if (game === null)
        return NextResponse.json({ error: "game not found" }, { status: 404 });

    const answerStation = await retrieveStation(game.answerId);
    const guessStation = await retrieveStation(body.data.guess);

    const boroughMatch = guessStation!.borough.filter((b) => {
        if (b < 0) return false;
        return answerStation!.borough.includes(b);
    });

    return NextResponse.json({
        won: game.answerId === body.data.guess,
        data: {
            guess: guessStation!,
            cityMatch: [
                ...boroughMatch.sort().map(b => `Lyon ${b}`),
                ...guessStation!.city.filter((c) => {
                    if (c === "Lyon") return false; // processed by borough
                    return answerStation!.city.includes(c);
                }),
            ],
            validLinesOnStation:
                guessStation!.connections.filter(
                    c => answerStation!.connections.includes(c)
                ),
            distanceWithAnswer: distance(
                [answerStation!.lon, answerStation!.lat],
                [guessStation!.lon, guessStation!.lat]
            ),
            cardinalDirectionTowardsAnswer: (bearing(
                [answerStation!.lon, answerStation!.lat],
                [guessStation!.lon, guessStation!.lat]
            ) + 360) % 360
        } satisfies GuessrAnswer
    });
}
