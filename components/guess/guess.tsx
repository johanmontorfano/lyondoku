"use client";

import { isToday } from "@/scripts/date";
import { GuessData, UserFacingGuessData } from "@/scripts/game_mgr/game";
import { useState, useRef, useEffect, useMemo } from "react";
import { RuledPopup, useRuledPopupContext } from "../popup";
import { shareGuessGame } from "@/scripts/share_game";
import { LetterPosition } from "@/scripts/game_mgr/types";
import { CharInput } from "./char_input";
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
        </div>
    );
}

export function Guess(props: { gameData: UserFacingGuessData; id: string }) {
    // WARN: since the back-end doesn't want any whitespaces, we are provided
    // with the length of each word of the station name
    const length = props.gameData.answerWordsLength.reduce((p, c) => p + c, 0);

    // State for current board letters, locked letters, and game loop
    const [won, setWon] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [inputs, setInputs] = useState<string[]>([]);
    const [lockedIndices, setLockedIndices] = useState<LetterPosition[]>([]);
    const [initialAttemptSent, setInitialAttemptSent] = useState(false);

    const startedAtRef = useRef(new Date());
    const endedAtRef = useRef<Date | null>(null);
    const countdownRef = useRef<HTMLSpanElement>(null);

    async function handleGameEnd(won: boolean, indices: typeof lockedIndices) {
        setWon(won);
        endedAtRef.current = new Date();
        if (!won) {
            try {
                const res = await fetch("/api/solution/guess?id=" + props.id);

                if (!res.ok) throw new Error("Request error");

                const body = (await res.json()) as GuessData;

                setInputs(body.name.replaceAll(" ", "").split(""));
                localStorage.setItem(
                    `guess-${props.id}`,
                    JSON.stringify({
                        won: false,
                        attempts: 3,
                        inputs: body.name.replaceAll(" ", "").split(""),
                        locked: indices,
                        startedAt: startedAtRef.current.getTime(),
                        endedAt: endedAtRef.current.getTime(),
                    }),
                );
            } catch (e) {}
        } else {
            localStorage.setItem(
                `guess-${props.id}`,
                JSON.stringify({
                    won: true,
                    inputs,
                    attempts,
                    locked: indices,
                    startedAt: startedAtRef.current.getTime(),
                    endedAt: endedAtRef.current.getTime(),
                }),
            );
        }
    }

    async function handleCheck(keys: string[]) {
        // NOTE: the backend expects the answer to be provided without any
        // spaces to avoid any logic issues between the component repr and
        // and the underlying handlers
        setLoading(true);
        setInputs(keys.slice(0, length));
        if (!initialAttemptSent) setInitialAttemptSent(true);
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
                was === LetterPosition.Valid
                    ? LetterPosition.Valid
                    : body.match[i],
            );

            // to ensure entries stay locked while new ones switch to be locked
            // we must run the matches through a filter before setting
            setLockedIndices(li);
            if (!body.won) setAttempts((p) => p + 1);
            else handleGameEnd(true, li);
            if (!body.won && attempts > 1) handleGameEnd(false, li);
        } catch (e) {}
        setLoading(false);
    }

    useEffect(() => {
        const saveGame = localStorage.getItem(`guess-${props.id}`);

        if (saveGame !== null) {
            const data = JSON.parse(saveGame);

            setWon(data.won);
            setInitialAttemptSent(true);
            setAttempts(data.attempts);
            setInputs(data.inputs);
            setLockedIndices(data.locked);
            startedAtRef.current = new Date(data.startedAt);
            endedAtRef.current = new Date(data.endedAt);
        } else {
            setWon(null);
            setAttempts(0);
            setInputs(Array(length).fill(""));
            setLockedIndices(Array(length).fill(LetterPosition.Invalid));
            startedAtRef.current = new Date();
            endedAtRef.current = null;
        }
    }, [props.gameData]);

    useEffect(() => {
        function updateCountdown() {
            // NOTE: if the rule popup is still visible the countdown must not
            // start.
            // HACK: to avoid too much overhead, the startAt date is just reset
            if (useRuledPopupContext.getState().currentRule === "guess-rules") {
                startedAtRef.current = new Date();
                return requestAnimationFrame(updateCountdown);
            }

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
        <div className="flex flex-col justify-between grow">
            {won && <Confetti mode="fall" />}
            <RuledPopup rule="guess-rules">
                <p className="font-semibold text-xl">Comment jouer à devine</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Trouvez la station TCL en <strong>5 essais</strong>{" "}
                        maximum.
                    </li>
                    <li>
                        Vous ne verrez la forme du nom de la station qu'après
                        le premier essai.
                    </li>
                    <li>
                        Chaque essai vous indique{" "}
                        <strong>l'ensemble des lettres</strong>{" "}
                        valides (vertes) ou mal placées (jaunes).
                    </li>
                    <li>
                        Chaque lettre <strong>valide</strong> reste affichée.
                    </li>
                    <li>
                        Une nouvelle partie est disponible à{" "}
                        <strong>minuit</strong> chaque jour.
                    </li>
                </ul>
            </RuledPopup>
            <header className="header flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {isToday(new Date(props.id))
                            ? "Station du jour"
                            : `Archive du ${new Intl.DateTimeFormat(
                                  "fr-FR",
                              ).format(new Date(props.id).getTime())}`}
                    </h3>
                    {isToday(new Date(props.id)) && (
                        <h2>
                            {new Intl.DateTimeFormat("fr-FR").format(
                                new Date(props.id).getTime(),
                            )}
                        </h2>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span ref={countdownRef}>00:01</span>
                    {won !== null && (
                        <span
                            className={`text-base-200 badge badge-sm ${won ? "badge-success" : "badge-error"}`}
                        >
                            {won ? "Gagné" : "Perdu"}
                        </span>
                    )}
                </div>
            </header>
            <form
                onSubmit={(ev) => {
                    ev.preventDefault();
                    handleCheck(inputs);
                }}
                className="flex flex-col items-center justify-center"
            >
                {initialAttemptSent ? (
                    <CharInput
                        value={inputs}
                        onChange={setInputs}
                        locked={lockedIndices}
                        disabled={won !== null}
                        wordsLength={props.gameData.answerWordsLength}
                    />
                ) : (
                    <input
                        type="text"
                        className="input border-2 text-xl my-8 rounded-lg w-full max-w-[400px] p-6"
                        placeholder="Tentez quelque chose..."
                        onChange={(ev) => {
                            setInputs(
                                ev.target.value.replaceAll(" ", "").split(""),
                            );
                        }}
                    />
                )}
                <input type="submit" disabled={loading} hidden />
            </form>
            <div className="flex justify-between items-center w-full">
                <div className="flex gap-2">
                    {won === null && (
                        <button
                            onClick={() => handleGameEnd(false, lockedIndices)}
                            className="btn"
                            type="button"
                            disabled={loading}
                        >
                            Abandonner
                        </button>
                    )}
                    {won === null && (
                        <button
                            className="btn btn-primary"
                            type="button"
                            disabled={loading}
                            onClick={() => handleCheck(inputs)}
                        >
                            {loading ? (
                                <span className="loading loading-spinner" />
                            ) : (
                                "Tenter"
                            )}
                        </button>
                    )}
                    {won !== null && (
                        <button
                            onClick={() =>
                                shareGuessGame(
                                    props.id,
                                    startedAtRef.current,
                                    endedAtRef.current!,
                                    lockedIndices,
                                    props.gameData.answerWordsLength,
                                )
                            }
                            className="btn btn-primary"
                            type="button"
                        >
                            Partager
                        </button>
                    )}
                </div>
                <Counter count={attempts} />
            </div>
        </div>
    );
}
