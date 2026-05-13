"use client";

import { UserFacingGameData } from "@/scripts/game_mgr/game";
import React, { useEffect, useRef, useState } from "react";
import {
    StationSelectorPopup,
    useStationSelectorPopup,
} from "./doku_answer_popup";
import { Constraints, Station } from "@/scripts/game_mgr/types";
import { humanizeConstraint } from "@/scripts/game_mgr/humanize";
import Confetti from "react-confetti-boom";

function ConstraintCell(props: { constraint: Constraints }) {
    return <div className="bg-base-200 flex items-center rounded-xl">
        <div className="ml-2 font-semibold text-[clamp(0.4rem,2.4cqi,0.85rem)]">
            {humanizeConstraint(props.constraint)}
        </div>
    </div>;
}

function Cell(props: {
    answer: Station | undefined,
    allAnswers: string[] | undefined,
    onClick: () => void
}) {
    return <div
        role="button"
        className={`w-full h-full ${
            !props.answer || props.allAnswers ? "cursor-pointer" : ""
        } border border-2 rounded-xl hover:bg-base-300 transition-colors`}
      onClick={() => {
            if (!props.answer || props.allAnswers) props.onClick();
        }} 
    >
        {props.answer && <div className="m-2 relative h-full">
            <p className="font-semibold text-[clamp(0.4rem,2.4cqi,0.85rem)]">
                {props.answer.name}
            </p>
            <div className="absolute bottom-4 pointer-events-none">
                <div className="flex gap-1">
                    {props.answer.connections
                        .filter(c => c[0] === "M")
                        .sort()
                        .map(c => <img
                             key={c}
                             className="w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"lines/" + c + ".svg"}
                        />)}
                </div>
                <div className="flex gap-1">
                    {props.answer.connections
                        .filter(c => c[0] === "T" || c[0] === "R")
                        .sort()
                        .map(c => <img
                             key={c}
                             className="mt-1 w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"lines/" + c + ".svg"}
                        />)}
                </div>
                <div className="flex gap-1">
                    {props.answer.connections
                        .filter(c => c.startsWith("NAVI") || c[0] === "F")
                        .sort()
                        .map(c => <img
                             key={c}
                             className="mt-1 w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"lines/" + c + ".svg"}
                        />)}
                </div>
            </div>
        </div>}
    </div>
}

function ErrorsCounter(props: { count: number }) {
    const dot = "h-3 w-3 border border-2 rounded-full transition-colors ";

    return <div className="flex items-center gap-1">
        <p className="text-sm font-bold mr-2">Erreurs</p>
        <div className={
            dot + (props.count > 0 ? "border-error bg-error" : "")
        } />
        <div className={
            dot + (props.count > 1 ? "border-error bg-error" : "")
        } />
        <div className={
            dot + (props.count > 2 ? "border-error bg-error" : "")
        } />
    </div>
}

export function DokuGrid(props: {
    gameData: UserFacingGameData;
    stations: string[];
}) {
    const popup = useStationSelectorPopup();
    const [won, setWon] = useState<boolean | null>(null);
    const [answers, setAnswers] = useState<{ [key: string]: Station }>({});
    const [allAnswers, setAllAnswers] = useState<{ [key: string]: string[] }>({});
    const [errorCount, setErrorCount] = useState(0);

    const focusedCellKey = useRef("tl");

    const cellKeys = [
        ["tl", "tc", "tr"],
        ["cl", "cc", "cr"],
        ["bl", "bc", "br"],
    ];

    async function handleCheck(cellKey: string, guess: string) {
        console.log(cellKey, guess);
        try {
            const res = await fetch("/api/verify", {
                method: "POST",
                body: JSON.stringify({
                    gridId: props.gameData.id,
                    targetCell: cellKey,
                    guess
                })
            });

            if (!res.ok)
                throw new Error("Request error");

            const body = await res.json();

            if (body.correct) {
                setAnswers(prev => ({
                    ...prev,
                    [cellKey]: body.stationData
                }));
            } else {
                setErrorCount(p => p + 1);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function getAllAnswers() {
        try {
            const res = await fetch("/api/solutions?id=" + props.gameData.id);
            
            if (!res.ok)
                throw new Error("Request error");
            setAllAnswers(await res.json());
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        // if there is a record for this game on local storage, it means the
        // grid has already been played and the user might have either won or
        // lost
        const saveGame = localStorage.getItem(props.gameData.id);

        popup.setShowSpecificStationsReadonly(null);
        if (saveGame !== null) {
            const saveData = JSON.parse(saveGame);

            setWon(saveData.won);
            setAnswers(saveData.answers);
            setErrorCount(saveData.errors);
        }
    }, [props.gameData]);

    useEffect(() => {
        if (popup.lastSelected !== null) {
            handleCheck(focusedCellKey.current, popup.lastSelected);
            popup.setLastSelected(null);
        }
    }, [popup.lastSelected]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        // NOTE: when the game is a random_ one, we don't save the score
        if (Object.keys(answers).length === 9 && errorCount < 3) {
            setWon(true);
            if (!props.gameData.id.startsWith("random_"))
                localStorage.setItem(props.gameData.id, JSON.stringify({
                    won: true,
                    answers: answers,
                    errors: errorCount
                }));
            getAllAnswers();
        } else if (errorCount >= 3) {
            setWon(false);
            if (!props.gameData.id.startsWith("random_"))
                localStorage.setItem(props.gameData.id, JSON.stringify({
                    won: false,
                    answers: answers,
                    errors: 3
                }));
            getAllAnswers();
        }
    }, [answers, errorCount]);

    return (
        <>
            {won && <Confetti mode="fall" /> }
            <StationSelectorPopup />
            <div className="grid grid-cols-4 grid-rows-4 max-sm:gap-1 gap-2 w-full aspect-square">
                <div />
                {props.gameData.cols.map((col, i) => (
                    <ConstraintCell key={"col-" + i} constraint={col} />
                ))}
                {cellKeys.map((keys, i) => (
                    <React.Fragment key={`row-frag-${i}`}>
                        <ConstraintCell constraint={props.gameData.rows[i]} />
                        {keys.map((key) => (
                            <Cell
                                key={key}
                                answer={answers[key]}
                                allAnswers={allAnswers[key]}
                                onClick={() => {
                                    if (allAnswers[key] !== undefined) {
                                        popup.setShowSpecificStationsReadonly(
                                            allAnswers[key]
                                        );
                                        popup.setShow(true);
                                        return;
                                    }

                                    const answersCount = 
                                        props.gameData.validAnswersCount[key];
                                    focusedCellKey.current = key;

                                    popup.setForbiddenStations(
                                        Object.values(answers).map(a => a.name)
                                    )
                                    popup.setPlaceholder(`${
                                        answersCount
                                    } réponse${
                                        answersCount > 1 ? "s" : ""
                                    } possibles`);
                                    popup.setStations(props.stations);
                                    popup.setShow(true);
                                }}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>
            <br />
            <div className="flex justify-between">
                <button
                    onClick={() => setErrorCount(3)}
                    className="btn btn-primary"
                    disabled={won !== null}
                >Abandonner</button>
                <ErrorsCounter count={errorCount} />
            </div>
        </>
    );
}
