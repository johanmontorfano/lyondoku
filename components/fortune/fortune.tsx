"use client";

import { isToday } from "@/scripts/date";
import { FortuneData, UserFacingFortuneData } from "@/scripts/game_mgr/game";
import React, { useState, useRef, useEffect } from "react";
import Confetti from "react-confetti-boom";

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
            <div
                className={
                    dot + (props.count > 3 ? "border-error bg-error" : "")
                }
            />
            <div
                className={
                    dot + (props.count > 4 ? "border-error bg-error" : "")
                }
            />
        </div>
    );
}

export function Fortune(props: {
    gameData: UserFacingFortuneData;
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
        Array(letters).fill(false),
    );

    const startedAtRef = useRef(new Date());
    const endedAtRef = useRef<Date | null>(null);
    const countdownRef = useRef<HTMLSpanElement>(null);
    const inputRefs = useRef<HTMLInputElement[]>([]);

    async function handleGameEnd(won: boolean) {
        setWon(won);
        endedAtRef.current = new Date();
        if (!won) {
            try {
                const res = await fetch("/api/solution/fortune?id=" + props.id);
                
                if (!res.ok) throw new Error("Request error");

                const body = await res.json() as FortuneData;

                setInputs(body.name.replaceAll(" ", "").split(""));
                localStorage.setItem(`fortune-${props.id}`, JSON.stringify({
                    won: false,
                    attempts: 5,
                    inputs: body.name.replaceAll(" ","").split(""),
                    locked: lockedIndices,
                    startedAt: startedAtRef.current.getTime(),
                    endedAt: endedAtRef.current.getTime()
                }));
            } catch (e) {}
        } else {
            localStorage.setItem(`fortune-${props.id}`, JSON.stringify({
                won: true,
                inputs,
                attempts,
                locked: lockedIndices,
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
            const res = await fetch("/api/verify/fortune", {
                method: "POST",
                body: JSON.stringify({
                    id: props.id,
                    guess: keys,
                }),
            });

            if (!res.ok) throw new Error("Request error");

            const body = await res.json();

            // to ensure entries stay locked while new ones switch to be locked
            // we must run the matches through a filter before setting
            setLockedIndices((p) => p.map((was, i) => was || body.match[i]));
            if (!body.won) setAttempts((p) => p + 1);
            else handleGameEnd(true);

            const firstEmpty = body.match.indexOf(false);
            if (firstEmpty !== -1 && inputRefs.current[firstEmpty])
                inputRefs.current[firstEmpty].focus();

            if (!body.won && attempts > 3) handleGameEnd(false);
        } catch (e) {}
        setLoading(false);
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        flatIndex: number,
    ) => {
        const val = e.target.value.toUpperCase().slice(-1);
        if (val && !/^[A-Z]$/.test(val)) return; // only allow letters

        const newInputs = [...inputs];
        newInputs[flatIndex] = val;
        setInputs(newInputs);

        // move focus forward automatically if a letter was typed
        if (val && flatIndex < letters - 1) {
            const nextUnlocked = lockedIndices.findIndex(
                (locked, idx) => !locked && idx > flatIndex,
            );
            if (nextUnlocked !== -1 && inputRefs.current[nextUnlocked]) {
                inputRefs.current[nextUnlocked].focus();
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
                    .find((item) => !item.locked && item.idx < flatIndex);

                if (prevUnlocked && inputRefs.current[prevUnlocked.idx]) {
                    inputRefs.current[prevUnlocked.idx].focus();
                }
            }
        }
    };

    useEffect(() => {
        const saveGame = localStorage.getItem(`fortune-${props.id}`);

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

    // Helper index counter for nested JSX loops
    let globalIndexCounter = 0;

    return (
        <div>
            {won && <Confetti mode="fall" />}
            <header className="header flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {isToday(new Date(props.id))
                        ? "Station du jour"
                        : `Archive du ${new Intl.DateTimeFormat("fr-FR").format(
                              new Date(props.id).getTime(),
                          )}`}
                </h3>
                <div className="flex items-center gap-2">
                    <span ref={countdownRef}>00:01</span>
                    {won !== null && (
                        <span
                            className={`text-base-200 badge badge-sm ${
                                won ? "badge-success" : "badge-error"
                            }`}
                        >
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
                    {props.gameData.answerWordsLength.map((length, i) => (
                        <div
                            key={i}
                            className="flex gap-2 p-3 bg-base-300 rounded-xl"
                        >
                            {Array.from({ length: length }).map(() => {
                                const currentFlatIndex = globalIndexCounter;
                                globalIndexCounter++;

                                const isLocked =
                                    lockedIndices[currentFlatIndex];

                                return (
                                    <input
                                        key={currentFlatIndex}
                                        ref={(el) => {
                                            if (el)
                                                inputRefs.current[
                                                    currentFlatIndex
                                                ] = el;
                                        }}
                                        type="text"
                                        maxLength={1}
                                        value={inputs[currentFlatIndex]}
                                        disabled={isLocked || won !== null}
                                        onChange={(e) =>
                                            handleInputChange(
                                                e,
                                                currentFlatIndex,
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(e, currentFlatIndex)
                                        }
                                        className={`w-12 h-14 text-center text-xl font-bold uppercase rounded-lg border-2 transition-all focus:outline-none focus:scale-105
                                            ${
                                                isLocked
                                                    ? "bg-success text-success-content border-success shadow-md scale-95"
                                                    : "bg-base-100 border-base-content/20 focus:border-primary text-base-content"
                                            }
                                        `}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        {won === null && (
                            <button
                                onClick={() => setWon(false)}
                                className="btn"
                                type="button"
                                key="giveup"
                            >
                                Abandonner
                        </button>
                        )}
                        {won === null && (
                            <button
                                className="btn btn-primary"
                                type="submit"
                                key="try"
                            >
                                Tenter
                            </button>
                        )}
                    </div>
                    <Counter count={attempts} />
                </div>
            </form>
        </div>
    );
}
