"use client";
import type { CellData } from "@/components/doku/doku";
import { firstEverGrid, firstEverWordle, firstEverGuessr } from "./game_mgr/data";
import { LetterPosition, GuessrAnswer, UserFacingWordleData } from "./game_mgr/types";
import { getDateTZ } from "./date";

function cellData2Emoji(data: CellData) {
    if (!data.answer) return "🔴";
    else if (data.errors > 1) return "🟠";
    else if (data.errors > 0) return "🟡";
    else return "🟢";
}

export function shareDokuGame(
    id: string,
    startedAt: Date,
    endedAt: Date,
    cells: CellData[]
) {
    const cellKeys = [
        ["tl", "tc", "tr"],
        ["cl", "cc", "cr"],
        ["bl", "bc", "br"],
    ];

    const score = cells.map(c => c.score).reduce((a, b) => a + b, 0);
    const errors = cells.map(c => c.errors).reduce((a, b) => a + b, 0);
    const elapsed = Math.ceil((endedAt.getTime() - startedAt.getTime()) / 1000);
    const dailyNumber = Math.ceil(
        (Date.now() - getDateTZ(firstEverGrid).getTime()) / (1000 * 60 * 60 * 24)
    );

    const text = [
        `Lyondle Doku #${dailyNumber} (${
            new Intl.DateTimeFormat('fr-FR').format(new Date(id).getTime())
        })`,
        `${(elapsed / 60).toFixed(0).padStart(2, "0")}:${
            (elapsed % 60).toString().padStart(2, "0")
        } – ${score}/900 – ${
            errors 
        } erreur(s)`,
        "",
        ...cellKeys.map(r => {
            return r.map(c => cellData2Emoji(cells[
                cellKeys.flat().findIndex(i => i === c)
            ])).join("");
        }),
        "",
        "https://www.lyondle.fr/doku"
    ].join("\n");

    navigator.share({ text });
}

export function shareGuessrGame(
    id: string,
    won: boolean,
    startedAt: Date,
    endedAt: Date,
    answers: GuessrAnswer[],
    withGuesses: boolean
) {
    const elapsed = Math.ceil((endedAt.getTime() - startedAt.getTime()) / 1000);
    const dailyNumber = Math.ceil(
        (Date.now() - getDateTZ(firstEverGuessr).getTime()) / (1000 * 60 * 60 * 24)
    );

    const text = [
        `Lyondle Guessr #${dailyNumber} (${
            new Intl.DateTimeFormat('fr-FR').format(new Date(id).getTime())
        })`,
        `${(elapsed / 60).toFixed(0).padStart(2, "0")}:${
            (elapsed % 60).toString().padStart(2, "0")
        }`,
        "",
        ...(!won ? answers.slice(0, answers.length - 1) : answers).map(r => {
            return `${
                r.distanceWithAnswer === 0 ? "🟩" : "🟥"
            } ${
                r.validLinesOnStation.length > 0 ? "🟩": "🟥"
            } ${
                r.cityMatch ? "🟩" : "🟥"
            } ${
                r.distanceWithAnswer === 0 ? "🟩" : "🟥"
            }   ${r.distanceWithAnswer > 0 && withGuesses ? r.guess.name : ""}`
        }),
        "",
        "https://www.lyondle.fr"
    ].join("\n");

    navigator.share({ text });
}

export function shareWordleGame(
    id: string,
    startedAt: Date,
    endedAt: Date,
    locked: LetterPosition[],
    layout: UserFacingWordleData["layout"]
) {
    const elapsed = Math.ceil((endedAt.getTime() - startedAt.getTime()) / 1000);
    const dailyNumber = Math.ceil(
        (Date.now() - getDateTZ(firstEverWordle).getTime()) / (1000 * 60 * 60 * 24)
    );

    const text = [
        `Lyondle Wordle #${dailyNumber} (${
            new Intl.DateTimeFormat('fr-FR').format(new Date(id).getTime())
        })`,
        `${(elapsed / 60).toFixed(0).padStart(2, "0")}:${
            (elapsed % 60).toString().padStart(2, "0")
        }`,
        "",
        layout.wordLengths.map((w, i) => {
            const wordStats = new Array(w).fill(0).map((_, x) => {
                return locked[x + [0, ...layout.wordLengths.slice(
                    0, i
                )].reduce(
                    (p, c) => p + c
                )] === LetterPosition.Valid ? "🟩" : "🟥";
            }).join("");;
            const delimiters = layout.delimiters.filter(
                d => d.after === i + 1
            ).map(d => d.type).join("");

            return wordStats + delimiters;
        }).join(""),
        "",
        "https://www.lyondle.fr/guess"
    ].join("\n");

    navigator.share({ text });
}
