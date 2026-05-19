"use client";

import { UserFacingGameData } from "@/scripts/game_mgr/game";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    StationSelectorPopup,
    useStationSelectorPopup,
} from "./doku_answer_popup";
import { Constraints, Station } from "@/scripts/game_mgr/types";
import { humanizeConstraint, humanizeRarity } from "@/scripts/game_mgr/humanize";
import { getDataset } from "@/scripts/firebase/data_provider";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti-boom";
import { buttonAnimate } from "@/scripts/motion";
import { shareGame } from "@/scripts/share_game";

export interface CellData {
    answer?: Station;
    validAnswers: number[];
    score: number;
    errors: number;
};

function ConstraintCell(props: {
    constraint: Constraints,
    group: "row" | "column"
}) {
    return <div className={`bg-base-200 border-base-300 flex items-center ${
        props.group === "row" ?
            "rounded-l-[20%_50%]" :
            "rounded-t-[50%_20%]"
    } rounded-sm`}>
        <div className="mx-2 font-semibold text-[clamp(0.4rem,2.4cqi,0.85rem)]">
            {humanizeConstraint(props.constraint)}
        </div>
    </div>;
}

function Cell(props: {
    data: CellData,
    onClick: () => void,
    disabled: boolean
}) {
    const [animation, setAnimation] = useState("");
    const [was, setWas] = useState({
        answered: !!props.data?.answer,
        disabled: props.disabled
    });

    useEffect(() => {
        if (was.disabled && !props.disabled && !props.data.answer)
            setAnimation("animate-flash-red");
        else if (was.disabled && !props.disabled && !!props.data.answer)
            setAnimation("animate-flash-green");
        setWas({
            answered: !!props.data?.answer,
            disabled: props.disabled
        });
        if (was.disabled && !props.disabled) {
            const timer = setTimeout(() => setAnimation(""), 1000);
            return () => clearTimeout(timer);
        }
    }, [props]);

    return <motion.div
        role="button"
        className={`w-full h-full ${!props.data?.answer ||
            props.data.validAnswers ? "cursor-pointer" : ""} ${animation} 
            border border-1 rounded-md dark:border-neutral-700 hover:bg-base-300 
            overflow-clip transition-colors ${props.disabled ?
                "bg-black dark:bg-neutral-500 opacity-30 pointer-events-none" : ""}
        `}
        onClick={() => {
            console.log(props.data);
            if (!props.data.answer || props.data.validAnswers.length > 0)
                props.onClick();
        }} 
    >
        {props.data.answer && <div className="relative h-full">
            <p className="font-semibold text-[clamp(0.4rem,2.4cqi,0.85rem)] p-2">
                {props.data.answer.name}
            </p>
            <div className="absolute bottom-0 pointer-events-none w-full">
                <div className="flex gap-1 px-2">
                    {props.data.answer.connections
                        .filter(c => c[0] === "M")
                        .sort()
                        .map(c => <img
                             key={c}
                             className="w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"lines/" + c + ".svg"}
                        />)}
                </div>
                <div className="flex gap-1 px-2">
                    {props.data.answer.connections
                        .filter(c => c[0] === "T" || c === "RX")
                        .sort((a, b) => {
                            if (a === "RX" || a > b) return 1;
                            if (a < b) return -1;
                            return 0;
                        })
                        .map(c => <img
                             key={c}
                             className="mt-1 w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"lines/" + c + ".svg"}
                        />)}
                </div>
                <div className="flex gap-1 px-2">
                    {props.data.answer.connections
                        .filter(c => c.startsWith("NAVI") || c[0] === "F")
                        .sort()
                        .map(c => <img
                             key={c}
                             className="mt-1 w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"lines/" + c + ".svg"}
                        />)}
                </div>
                <p className="w-full text-center bg-base-200 py-0.5 text-[clamp(0.3rem,2.4cqi,0.65rem)] mt-1">
                    {
                        props.data.score
                    }% – {humanizeRarity(props.data.score)}
                </p>
            </div>
        </div>}
    </motion.div>
}

function Counter(props: {
    score: number,
    count: number
}) {
    const dot = "h-3 w-3 border border-2 rounded-full transition-colors ";

    return <div className="flex items-center gap-1">
        <p className="text-sm font-bold mr-2">{props.score}/900</p>
        <p className="text-sm font-bold mr-2">–</p>
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

export function DokuGrid(props: { gameData: UserFacingGameData }) {
    const cellKeys = [
        ["tl", "tc", "tr"],
        ["cl", "cc", "cr"],
        ["bl", "bc", "br"],
    ];

    const popup = useStationSelectorPopup();
    const [won, setWon] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttemps] = useState(0);
    const [cells, setCells] = useState<CellData[]>(cellKeys.flat().map(() => ({
        score: 0,
        errors: 0,
        validAnswers: []
    })));

    const errorCount = useMemo(() => Object.values(cells)
        .map(c => c.errors)
        .reduce((p, c) => p + c, 0),
    [cells]);
    const score = useMemo(() => Object.values(cells)
        .map(c => c.score)
        .reduce((p, c) => p + c, 0),
    [cells]);
    const focusedCellKey = useRef("tl");
    const startedAt = useRef(Date.now());
    const endedAt = useRef(Infinity);

    const getKeyId = (k: string) => cellKeys.flat().findIndex(v => v === k);

    async function handleCheck(cellKey: string, guess: number) {
        setLoading(true);
        try {
            const res = await fetch("/api/verify/doku", {
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

            if (body.correct) 
                setCells(prev => {
                    prev[getKeyId(cellKey)] = {
                        ...prev[getKeyId(cellKey)],
                        answer: body.stationData,
                        score: body.score
                    }
                    return [...prev];
                });
            else setCells(prev => {
                prev[getKeyId(cellKey)] = {
                    ...prev[getKeyId(cellKey)],
                    errors: prev[getKeyId(cellKey)].errors + 1
                }
                return [...prev];
            });
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function getStations() {
        const data = await getDataset("stations_dict");

        // TODO: add error handling
        if (data) popup.setStations(data);
    }

    async function getAllAnswers() {
        try {
            const res = await fetch("/api/solutions?id=" + props.gameData.id);
            
            if (!res.ok)
                throw new Error("Request error");
            
            const body = await res.json();

            setCells(prev => {
                Object.entries(body).forEach(([k, v]) => {
                    prev[getKeyId(k)].validAnswers = v as number[];
                });
                return [...prev];
            });
        } catch (e) {
            console.error(e);
        }
    }
    
    function handleGameEnd(won: boolean) {
        endedAt.current = Date.now();
        setWon(won);
        if (!props.gameData.id.startsWith("random_"))
            localStorage.setItem(props.gameData.id, JSON.stringify({
                won, cells, attempts,
                startedAt: startedAt.current,
                endedAt: endedAt.current
            }));
        getAllAnswers();
    }

    useEffect(() => {
        setLoading(true);
        // we reload stations everytime game data changes to ensure stations
        // list is not stalled on the doku context
        getStations();

        // if there is a record for this game on local storage, it means the
        // grid has already been played and the user might have either won or
        // lost
        const saveGame = localStorage.getItem(props.gameData.id);

        popup.setShowSpecificStationsReadonly(null);
        if (saveGame !== null) {
            const saveData = JSON.parse(saveGame);

            startedAt.current = saveData.startedAt;
            endedAt.current = saveData.endedAt;
            setWon(saveData.won);
            setCells(saveData.cells);
            setAttemps(saveData.attempts);
            getAllAnswers();
        } else {
            // even if we don't have any save data, the state is reset because
            // we are not dealing with the same dataset
            setWon(null);
            setCells(cellKeys.flat().map(() => ({
                score: 0,
                errors: 0,
                validAnswers: []
            })));
            setAttemps(0);
        }
        setLoading(false);
    }, [props.gameData]);

    useEffect(() => {
        if (popup.lastSelected !== null) {
            handleCheck(focusedCellKey.current, popup.lastSelected);
            popup.setLastSelected(null);
        }
    }, [popup.lastSelected]);

    useEffect(() => {
        if (won !== null) return;
        if (typeof window === "undefined") return;
        // NOTE: when the game is a random_ one, we don't save the score
        if (props.gameData.id.startsWith("random_")) return;
        if (Object.values(cells).filter(c => !!c.answer).length === 9 &&
            errorCount < 3) {
            handleGameEnd(true);
        } else if (errorCount >= 3) {
            handleGameEnd(false);
        }
    }, [cells, errorCount]);

    return (
        <>
            {won && <Confetti mode="fall" />}
            <StationSelectorPopup />
            <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full aspect-square">
                <div />
                {props.gameData.cols.map((col, i) => (
                    <ConstraintCell
                        key={"col-" + i}
                        constraint={col}
                        group="column"
                    />
                ))}
                {cellKeys.map((keys, i) => (
                    <React.Fragment key={`row-frag-${i}`}>
                        <ConstraintCell
                            constraint={props.gameData.rows[i]}
                            group="row"
                        />
                        {keys.map((key) => (
                            <Cell
                                key={key}
                                data={cells[getKeyId(key)]}
                                onClick={async () => {
                                    const data = cells[getKeyId(key)];

                                    await getStations();
                                    if (data.validAnswers.length > 0) {
                                        popup.setShowSpecificStationsReadonly(
                                            data.validAnswers
                                        );
                                        popup.setShow(true);
                                        return;
                                    }

                                    const answersCount = 
                                        props.gameData.validAnswersCount[key];
                                    focusedCellKey.current = key;

                                    popup.setForbiddenStations(
                                        Object.values(cells)
                                            .filter(a => a.answer !== undefined)
                                            .map(a => a.answer!.id)
                                    );
                                    popup.setPlaceholder(`${
                                        answersCount
                                    } réponse${
                                        answersCount > 1 ? "s" : ""
                                    } possibles`);
                                    popup.setShow(true);
                                }}
                                disabled={loading &&
                                    focusedCellKey.current === key}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>
            <br />
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <AnimatePresence>
                        {won === null && <motion.button
                            variants={buttonAnimate}
                            initial="exit"
                            animate="show"
                            exit="exit"
                            onClick={() => handleGameEnd(false)}
                            className="btn btn-primary"
                            key="giveup"
                        >Abandonner</motion.button>}
                        {won === false && <motion.button
                            variants={buttonAnimate}
                            initial="exit"
                            animate="show"
                            exit="exit"
                            onClick={() => {
                                setAttemps(p => p + 1);
                                setWon(null);
                            }}
                            className="btn btn-ghost"
                            disabled={errorCount < 3}
                            key="retry"
                        >Réessayer</motion.button>}
                        {won !== null && !props.gameData.id.startsWith("random_") && <motion.button
                            variants={buttonAnimate}
                            initial="exit"
                            animate="show"
                            exit="exit"
                            onClick={() => shareGame(
                                props.gameData.id,
                                startedAt.current,
                                endedAt.current,
                                cells
                            )}
                            className="btn btn-primary"
                            key="share"
                        >Partager</motion.button>}
                    </AnimatePresence>
                </div>
                <Counter score={score - attempts * 50} count={errorCount} />
            </div>
        </>
    );
}
