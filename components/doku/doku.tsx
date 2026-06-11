"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    StationSelectorPopup,
    useStationSelectorPopup,
} from "@/components/select_station";
import { Station, UserFacingDokuData } from "@/scripts/game_mgr/types";
import { getDataset } from "@/scripts/firebase/data_provider";
import { shareDokuGame } from "@/scripts/share_game";
import { isToday } from "@/scripts/date";
import { RuledPopup, useRuledPopupContext } from "../popup";
import { Cell, ConstraintCell } from "./cells";
import Confetti from "react-confetti-boom";
import { useCountdown } from "@/scripts/countdown";

export interface CellData {
    answer?: Station;
    validAnswers: [number, number][];
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

export function DokuGrid(props: { gameData: UserFacingDokuData }) {
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

    const [countdownRef, startedAt, endedAt] = useCountdown("doku-rules");

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
                    prev[getKeyId(k)].validAnswers = v as [number, number][];
                });
                return [...prev];
            });
        } catch (e) {
            console.error(e);
        }
    }
    
    function handleGameEnd(won: boolean) {
        endedAt.current = new Date();
        setWon(won);
        if (!props.gameData.id.startsWith("random_"))
            localStorage.setItem(`doku-${props.gameData.id}`, JSON.stringify({
                won, cells, attempts,
                startedAt: startedAt.current.getTime(),
                endedAt: endedAt.current.getTime()
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

            startedAt.current = new Date(saveData.startedAt);
            endedAt.current = new Date(saveData.endedAt);
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
        <div>
            {won && <Confetti mode="fall" />}
            <RuledPopup rule="doku-rules">
                <p className="font-semibold text-xl">Comment jouer au doku</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Remplissez la grille avec <strong>
                            9 stations TCL
                        </strong> différentes.
                    </li>
                    <li>
                        Chaque station doit remplir les conditions de
                        <strong> sa ligne et sa colonne</strong>.
                    </li>
                    <li>
                        Moins la station est évidente à trouver, plus elle
                        donne de points.
                    </li>
                    <li>
                        Vous avez droit à <strong>3 erreurs</strong>.
                    </li>
                    <li>
                        Une nouvelle grille est disponible à <strong>
                            minuit
                        </strong> chaque jour.
                    </li>
                </ul>
                <br />
                <p className="font-semibold text-lg">
                    Attention
                </p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Il est possible de se bloquer dans le remplissage de
                        la grille, <strong>réflechissez bien</strong>.
                    </li>
                    <li>
                        Comme en grammaire, un mot composé est considéré 
                        comme n'étant <strong>qu'un seul mot</strong>.
                    </li>
                    <li>
                        Le nom des stations correspond à celui inscrit sur le
                        <strong> mobilier en station</strong>.
                    </li>
                    <li>
                        La localité d'une station est définie par <strong>
                            la position de ses quais
                        </strong>. De ce fait, une station peut se trouver dans
                        plusieurs villes et/ou arrondissements simultanément.
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
                        <span className={`badge badge-sm ${
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
                        i={i + 1}
                    />
                ))}
                {cellKeys.map((keys, i) => (
                    <React.Fragment key={`row-frag-${i}`}>
                        <ConstraintCell
                            constraint={props.gameData.rows[i]}
                            group="row"
                            i={(i + 1) * 4}
                        />
                        {keys.map((key, j) => (
                            <Cell
                                i={(i + 1) * 4 + j}
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
            <div className="flex justify-between items-center flex-wrap-reverse">
                <div className="flex gap-2">
                    <button
                        onClick={() => useRuledPopupContext
                            .getState()
                            .setCurrentRule("doku-rules")
                        }
                        className="btn"
                        key="rules"
                    >Voir les règles</button>
                    {won === null && <button
                        onClick={() => handleGameEnd(false)}
                        className="btn btn-primary"
                        key="giveup"
                    >Abandonner</button>}
                    {won === false && <button
                        onClick={() => {
                            setAttemps(p => p + 1);
                            setWon(null);
                        }}
                        className="btn btn-ghost"
                        disabled={errorCount < 3}
                        key="retry"
                    >Réessayer</button>}
                    {won !== null && <button
                        onClick={() => shareDokuGame(
                            props.gameData.id,
                            startedAt.current,
                            endedAt.current!,
                            cells
                        )}
                        className="btn btn-primary"
                        key="share"
                    >Partager</button>}
                </div>
                <div className="flex justify-end flex-grow py-8">
                    <Counter score={Math.floor(score) - attempts * 50} count={errorCount} />
                </div>
            </div>
        </div>
    );
}
