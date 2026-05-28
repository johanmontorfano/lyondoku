"use client";

import { isToday } from "@/scripts/date";
import { GuessData, UserFacingGuessData } from "@/scripts/game_mgr/game";
import React, { useState, useRef, useEffect } from "react";
import Confetti from "react-confetti-boom";
import { RuledPopup } from "../popup";
import { shareGuessGame } from "@/scripts/share_game";
import { LetterPosition } from "@/scripts/game_mgr/types";

function Counter(props: { count: number }) {
    const dot = "h-3 w-3 border border-2 rounded-full transition-colors ";

    return (
        <div className="flex items-center gap-1">
            <p className="text-sm font-bold mr-2">Tentatives</p>
            <div
                className={
                    dot + (props.count > 0 ? "border-error bg-error" : "")
                }
            />
            <div
                className={
                    dot + (props.count > 1 ? "border-error bg-error" : "")
                }
            />
            <div
                className={
                    dot + (props.count > 2 ? "border-error bg-error" : "")
                }
            />
        </div>
    );
}

export function Guess(props: {
    gameData: UserFacingGuessData;
    id: string;
}) {
    // WARN: since the back-end doesn't want any whitespaces, we are provided
    // with the length of each word of the station name
    const letters = props.gameData.answerWordsLength.reduce((p, c) => p + c, 0);

    // State for current board letters, locked letters, and game loop
    const [won, setWon] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [inputs, setInputs] = useState(Array(letters).fill(""));
    const [lockedIndices, setLockedIndices] = useState(
        Array<LetterPosition>(letters).fill(LetterPosition.Invalid),
    );

    const startedAtRef = useRef(new Date());
    const endedAtRef = useRef<Date | null>(null);
    const countdownRef = useRef<HTMLSpanElement>(null);
    const inputRefs = useRef<HTMLInputElement[]>([]);

    async function handleGameEnd(won: boolean, indices: typeof lockedIndices) {
        setWon(won);
        endedAtRef.current = new Date();
        if (!won) {
            try {
                const res = await fetch("/api/solution/guess?id=" + props.id);
                
                if (!res.ok) throw new Error("Request error");

                const body = await res.json() as GuessData;

                setInputs(body.name.replaceAll(" ", "").split(""));
                localStorage.setItem(`guess-${props.id}`, JSON.stringify({
                    won: false,
                    attempts: 3,
                    inputs: body.name.replaceAll(" ","").split(""),
                    locked: indices,
                    startedAt: startedAtRef.current.getTime(),
                    endedAt: endedAtRef.current.getTime()
                }));
            } catch (e) {}
        } else {
            localStorage.setItem(`guess-${props.id}`, JSON.stringify({
                won: true,
                inputs,
                attempts,
                locked: indices,
                startedAt: startedAtRef.current.getTime(),
                endedAt: endedAtRef.current.getTime()
            }));
        }
    }

    async function handleCheck(keys: string[]) {
        // NOTE: the backend expects the answer to be provided without any
        // spaces to avoid any logic issues between the component repr and
        // and the underlying handlers
        setLoading(true);
        try {
            const res = await fetch("/api/verify/guess", {
                method: "POST",
                body: JSON.stringify({
                    id: props.id,
                    guess: keys,
                }),
            });

            if (!res.ok) throw new Error("Request error");

            const body = await res.json();
            const li = lockedIndices.map((was, i) =>
                was === LetterPosition.Valid ?
                    LetterPosition.Valid : body.match[i]
            );

            // to ensure entries stay locked while new ones switch to be locked
            // we must run the matches through a filter before setting
            setLockedIndices(li);
            if (!body.won) setAttempts((p) => p + 1);
            else handleGameEnd(true, li);

            const firstEmpty = body.match.indexOf(false);
            if (firstEmpty !== -1 && inputRefs.current[firstEmpty])
                inputRefs.current[firstEmpty].focus();

            if (!body.won && attempts > 1) handleGameEnd(false, li);
        } catch (e) {}
        setLoading(false);
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        flatIndex: number,
    ) => {
        const val = e.target.value.toUpperCase().slice(-1);
        const newInputs = [...inputs];

        newInputs[flatIndex] = val;
        setInputs(newInputs);

        if (val && flatIndex < letters - 1) {
            const nextUnlocked = lockedIndices.findIndex(
                (locked, idx) => locked !== LetterPosition.Valid && idx > flatIndex,
            );
            if (nextUnlocked !== -1 && inputRefs.current[nextUnlocked]) {
                setTimeout(() => inputRefs.current[nextUnlocked].focus(), 0);
            }
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        flatIndex: number,
    ) => {
        if (e.key === "Backspace") {
            if (inputs[flatIndex] !== "") {
                // clear current cell
                const newInputs = [...inputs];
                newInputs[flatIndex] = "";
                setInputs(newInputs);
            } else {
                // move focus to previous unlocked cell if current is empty
                const prevUnlocked = [...lockedIndices]
                    .map((locked, idx) => ({ locked, idx }))
                    .reverse()
                    .find((item) => item.locked !== LetterPosition.Valid &&
                          item.idx < flatIndex);

                if (prevUnlocked && inputRefs.current[prevUnlocked.idx]) {
                    inputRefs.current[prevUnlocked.idx].focus();
                }
            }
        }
    };

    useEffect(() => {
        const saveGame = localStorage.getItem(`guess-${props.id}`);

        if (saveGame !== null) {
            const data = JSON.parse(saveGame);

            setWon(data.won);
            setAttempts(data.attempts);
            setInputs(data.inputs);
            setLockedIndices(data.locked);
            startedAtRef.current = new Date(data.startedAt);
            endedAtRef.current = new Date(data.endedAt);
        } else {
            setWon(null);
            setAttempts(0);
            setInputs(Array(letters).fill(""));
            setLockedIndices(Array(letters).fill(false));
            startedAtRef.current = new Date();
            endedAtRef.current = null;
        }
    }, [props.gameData]);

    useEffect(() => {
        function updateCountdown() {
            const elapsed = Math.ceil(
                ((endedAtRef.current
                    ? new Date(endedAtRef.current).getTime()
                    : Date.now()) -
                    startedAtRef.current.getTime()) /
                    1000,
            );

            if (countdownRef.current !== null)
                countdownRef.current.textContent = `${(elapsed / 60)
                    .toFixed(0)
                    .padStart(2, "0")}:${(elapsed % 60)
                    .toString()
                    .padStart(2, "0")}`;
            if (endedAtRef.current === null)
                requestAnimationFrame(updateCountdown);
        }
        updateCountdown();
    }, []);

    return (
        <div>
            {won && <Confetti mode="fall" />}
            <RuledPopup rule="guess-rules">
                <p className="font-semibold text-xl">Comment jouer à devine</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>Trouvez la station TCL en <strong>5 essais</strong> maximum.</li>
                    <li>Chaque essai vous indique <strong>l'ensemble des lettres</strong>.</li>
                    <li>Chaque lettre <strong>valide</strong> reste affichée.</li>
                    <li>Une nouvelle partie est disponible à <strong>minuit</strong> chaque jour.</li>
                </ul>
            </RuledPopup>
            <header className="header flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {isToday(new Date(props.id)) ?
                            "Station du jour" : `Archive du ${
                                new Intl.DateTimeFormat('fr-FR').format(new Date(props.id).getTime())
                        }`}
                    </h3>
                    {isToday(new Date(props.id)) && <h2>
                        {new Intl.DateTimeFormat('fr-FR').format(new Date(props.id).getTime())}
                    </h2>}
                </div>
                <div className="flex items-center gap-2">
                    <span ref={countdownRef}>00:01</span>
                    {won !== null && (
                        <span className={`text-base-200 badge badge-sm ${won ? "badge-success" : "badge-error"}`}>
                            {won ? "Gagné" : "Perdu"}
                        </span>
                    )}
                </div>
            </header>
            <br />
            <form
                onSubmit={(ev) => {
                    ev.preventDefault();
                    handleCheck(inputs);
                }}
                className="flex flex-col items-center justify-center"
            >
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                    {props.gameData.answerWordsLength.map((wordLength, wordIdx) => {
                        // Compute the starting flat index offset for this specific word block cleanly
                        const wordOffset = props.gameData.answerWordsLength
                            .slice(0, wordIdx)
                            .reduce((acc, len) => acc + len, 0);

                        return (
                            <div key={wordIdx} className="flex gap-2 p-3 bg-base-300 rounded-xl">
                                {Array.from({ length: wordLength }).map((_, letterIdx) => {
                                    const idx = wordOffset + letterIdx;
                                    const status = lockedIndices[idx];

                                    return (
                                        <input
                                            key={idx}
                                            ref={(el) => {
                                                if (el) inputRefs.current[idx] = el;
                                            }}
                                            type="text"
                                            maxLength={1}
                                            value={inputs[idx] || ""}
                                            disabled={status === LetterPosition.Valid || won !== null}
                                            onChange={(e) => handleInputChange(e, idx)}
                                            onKeyDown={(e) => handleKeyDown(e, idx)}
                                            className={`w-12 h-14 text-center text-xl font-bold uppercase rounded-lg border-2 transition-all focus:outline-none
                                                ${
                                                    status === LetterPosition.Valid
                                                        ? "bg-success text-success-content border-success shadow-md scale-95"
                                                        : status === LetterPosition.Misplaced ? "bg-warning text-warning-content border-warning" : "bg-base-100 border-base-content/20 focus:border-primary text-base-content"
                                                }
                                            `}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        {won === null && (
                            <button onClick={() => handleGameEnd(false, lockedIndices)} className="btn" type="button">
                                Abandonner
                            </button>
                        )}
                        {won === null && (
                            <button className="btn btn-primary" type="submit">
                                Tenter
                            </button>
                        )}
                        {won !== null && (
                            <button
                                onClick={() => shareGuessGame(
                                    props.id,
                                    startedAtRef.current,
                                    endedAtRef.current!,
                                    lockedIndices,
                                    props.gameData.answerWordsLength
                                )}
                                className="btn btn-primary"
                                type="button"
                            >
                                Partager
                            </button>
                        )}
                    </div>
                    <Counter count={attempts} />
                </div>
            </form>
        </div>
    );
}
