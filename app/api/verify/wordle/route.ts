import {retrieveStation, retrieveWordle } from "@/scripts/game_mgr/game";
import { WordleAnswer } from "@/scripts/game_mgr/types";
import bearing from "@turf/bearing";
import distance from "@turf/distance";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({ id: z.string(), guess: z.number() });

export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const game = await retrieveWordle(body.data.id);
    
    if (game === null)
        return NextResponse.json({ error: "game not found" }, { status: 404 });

    const answerStation = await retrieveStation(game.answerId);
    const guessStation = await retrieveStation(body.data.guess);

    return NextResponse.json({
        won: game.answerId === body.data.guess,
        data: {
            guess: guessStation!,
            cityMatch:
                answerStation!.stationLocation === guessStation!.stationLocation &&
                answerStation!.stationBorough === guessStation!.stationBorough,
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
        } satisfies WordleAnswer
    });
}
