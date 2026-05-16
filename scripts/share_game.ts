"use client";
import type { CellData } from "@/components/doku";
import { firstEverGrid } from "./game_mgr/data";

function cellData2Emoji(data: CellData) {
    if (!data.answer) return "🔴";
    else if (data.errors > 0) return "🟡";
    else return "🟢";
}

export function shareGame(
    id: string,
    startedAt: number,
    endedAt: number,
    cells: CellData[]
) {
    const cellKeys = [
        ["tl", "tc", "tr"],
        ["cl", "cc", "cr"],
        ["bl", "bc", "br"],
    ];

    const score = cells.map(c => c.score).reduce((a, b) => a + b, 0);
    const errors = cells.map(c => c.errors).reduce((a, b) => a + b, 0);
    const elapsed = Math.ceil((endedAt - startedAt) / 1000);
    const dailyNumber = Math.ceil(
        (Date.now() - firstEverGrid.getTime()) / (1000 * 60 * 60 * 24)
    );

    const text = [
        `LyonDoku #${dailyNumber} (${
            new Intl.DateTimeFormat('fr-FR').format(new Date(id).getTime())
        })`,
        `${(elapsed/60).toFixed(0)}:${elapsed%60} – ${score}/900 – ${
            errors 
        } erreur(s)`,
        "",
        ...cellKeys.map(r => {
            return r.map(c => cellData2Emoji(cells[
                cellKeys.flat().findIndex(i => i === c)
            ])).join("");
        }),
        "",
        "lyondoku.vercel.app"
    ].join("\n");

    navigator.share({ text });
}
