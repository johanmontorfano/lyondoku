"use client";

import { UserFacingGameData } from "@/scripts/game_mgr/game";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    StationSelectorPopup,
    useStationSelectorPopup,
} from "@/components/select_station";
import { Station } from "@/scripts/game_mgr/types";
import { getDataset } from "@/scripts/firebase/data_provider";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti-boom";
import { buttonAnimate } from "@/scripts/motion";
import { shareGame } from "@/scripts/share_game";
import { isToday } from "@/scripts/date";
import { RuledPopup } from "../popup";
import { Cell, ConstraintCell } from "./cells";

export interface CellData {
    answer?: Station;
    validAnswers: number[];
    score: number;
    errors: number;
};

export interface DokuSave {
    won: boolean;
    cells: CellData[];
    attempts: number;
    startedAt: number;
    endedAt: number;
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
    const [scorePenality, setScorePenality] = useState(0);
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
        .reduce((p, c) => p + c, 0) - scorePenality,
    [cells, scorePenality]);
    const focusedCellKey = useRef("tl");

    const startedAtRef = useRef(new Date());
    const endedAtRef = useRef<Date | null>(null);
    const countdownRef = useRef<HTMLSpanElement>(null);

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
            const res = await fetch("/api/solution/doku?id=" + props.gameData.id);
            
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
        endedAtRef.current = new Date();
        setWon(won);
        if (!props.gameData.id.startsWith("random_"))
            localStorage.setItem(`doku-${props.gameData.id}`, JSON.stringify({
                won, cells, attempts,
                startedAt: startedAtRef.current.getTime(),
                endedAt: endedAtRef.current.getTime()
            } satisfies DokuSave));
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
        const saveGame = localStorage.getItem(`doku-${props.gameData.id}`);

        popup.setShowSpecificStationsReadonly(null);
        if (saveGame !== null) {
            const saveData = JSON.parse(saveGame);

            startedAtRef.current = new Date(saveData.startedAt);
            endedAtRef.current = new Date(saveData.endedAt);
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

    useEffect(() => {
        let lastTime = Date.now();

        function updateCountdown() {
            const now = Date.now();
            const elapsed = Math.ceil(
                ((endedAtRef.current ? new Date(endedAtRef.current).getTime() : now) - startedAtRef.current.getTime()) / 1000
            );
        
            const deltaElapsed = (now - lastTime) / 1000;
            lastTime = now;

            setScorePenality(p => p + deltaElapsed * Math.floor(elapsed / 60));

            if (countdownRef.current !== null) {
                countdownRef.current.textContent = `${
                    Math.floor(elapsed / 60).toString().padStart(2, "0")
                }:${
                    (elapsed % 60).toString().padStart(2, "0")
                }`;
            }    
            if (endedAtRef.current === null)
                requestAnimationFrame(updateCountdown);
        }
        requestAnimationFrame(updateCountdown); 
    }, []);

    return (
        <div>
            {won && <Confetti mode="fall" />}
            <RuledPopup rule="doku-rules">
                <p className="font-semibold text-xl">Comment jouer au doku</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Remplissez la grille avec <strong>
                            9 stations TCL
                        </strong> différentes
                    </li>
                    <li>
                        Chaque station doit avoir les caractéristiques de
                        <strong> sa ligne et sa colonne</strong>
                    </li>
                    <li>
                        Vous avez droit à <strong>3 erreurs</strong>
                    </li>
                    <li>
                        Une nouvelle partie est disponible à <strong>
                            minuit
                        </strong> chaque jour
                    </li>
                </ul>
            </RuledPopup>
            <header className="header flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {isToday(new Date(props.gameData.id)) ?
                            "Grille du jour" : "Archive"}
                    </h3>
                    {!isNaN(Date.parse(props.gameData.id)) && <h2>
                        {new Intl.DateTimeFormat('fr-FR').format(
                            new Date(props.gameData.id).getTime()
                        )}
                    </h2>}
                </div>
                <div className="flex items-center gap-2">
                    <span ref={countdownRef}>00:01</span>
                    {won !== null &&
                        <span className={`text-base-200 badge badge-sm ${
                        won ? "badge-success" : "badge-error"
                        }`}>{won ? "Gagné" : "Perdu"}</span>}
                </div>
            </header>
            <br />
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
                                startedAtRef.current,
                                endedAtRef.current!,
                                cells
                            )}
                            className="btn btn-primary"
                            key="share"
                        >Partager</motion.button>}
                    </AnimatePresence>
                </div>
                <Counter score={Math.floor(score) - attempts * 50} count={errorCount} />
            </div>
        </div>
    );
}
