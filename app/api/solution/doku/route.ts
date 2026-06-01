import { getCQL } from "@/scripts/cql";
import { retrieveDoku } from "@/scripts/game_mgr/game";
import { DokuData } from "@/scripts/game_mgr/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url, "https://dummy.com/");

    if (!url.searchParams.has("id"))
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const { validAnswers } = await retrieveDoku(url.searchParams.get("id")!) as DokuData;
    const final: Record<string, [number, number][]> = {}

    await Promise.all(Object.keys(validAnswers).map(async k => {
        const res = await getCQL(
            `SELECT id,finalScore IF id in list:[${validAnswers[k].join(",")}]`,
            "stations"
        );

        if (res) final[k] = res.selected.map(s => {
            return [s.id!, s.finalScore!];
        });
    }));

    return NextResponse.json(final);
}
