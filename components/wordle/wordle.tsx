"use client";

import { isToday } from "@/scripts/date";
import { useState, useEffect } from "react";
import { RuledPopup, useRuledPopupContext } from "../popup";
import { LetterPosition, UserFacingWordleData, WordleData } from "@/scripts/game_mgr/types";
import { CharInput } from "./char_input";
import Confetti from "react-confetti-boom";
import { shareWordleGame } from "@/scripts/share_game";
import { useCountdown } from "@/scripts/countdown";

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

export function Wordle(props: { gameData: UserFacingWordleData; id: string }) {
    // WARN: since the back-end doesn't want any whitespaces, we are provided
    // with the length of each word of the station name
    const length = props.gameData.layout.wordLengths.reduce((p, c) => p + c, 0);

    // State for current board letters, locked letters, and game loop
    const [won, setWon] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [inputs, setInputs] = useState<string[]>([]);
    const [lockedIndices, setLockedIndices] = useState<LetterPosition[]>([]);

    const [countdownRef, startedAt, endedAt] = useCountdown("wordle-rules");

    async function handleGameEnd(won: boolean, indices: typeof lockedIndices) {
        setWon(won);
        endedAt.current = new Date();
        if (!won) {
            try {
                const res = await fetch("/api/solution/wordle?id=" + props.id);

                if (!res.ok) throw new Error("Request error");

                const body = (await res.json()) as WordleData;

                setInputs(body.name.replaceAll(/[\s]/g, "").split(""));
                localStorage.setItem(
                    `guess-${props.id}`,
                    JSON.stringify({
                        won: false,
                        attempts: 3,
                        inputs: body.name.replaceAll(" ", "").split(""),
                        locked: indices,
                        startedAt: startedAt.current.getTime(),
                        endedAt: endedAt.current.getTime(),
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
                    startedAt: startedAt.current.getTime(),
                    endedAt: endedAt.current.getTime(),
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
        try {
            const res = await fetch("/api/verify/wordle", {
                method: "POST",
                body: JSON.stringify({
                    id: props.id,
                    guess: keys,
                }),
            });

            if (!res.ok) throw new Error("Request error");

            const body: {
                match: [LetterPosition, string | null][],
                won: boolean
            } = await res.json();

            // to ensure entries stay locked while new ones switch to be locked
            // we must run the matches through a filter before setting
            setLockedIndices(body.match.map(m => m[0]));
            if (!body.won) setAttempts((p) => p + 1);
            else handleGameEnd(true, body.match.map(m => m[0]));
            if (!body.won && attempts > 1)
                handleGameEnd(false, body.match.map(m => m[0]));
        } catch (e) {}
        setLoading(false);
    }

    useEffect(() => {
        const saveGame = localStorage.getItem(`guess-${props.id}`);

        if (saveGame !== null) {
            const data = JSON.parse(saveGame);

            setWon(data.won);
            setAttempts(data.attempts);
            setInputs(data.inputs);
            setLockedIndices(data.locked);
            startedAt.current = new Date(data.startedAt);
            endedAt.current = new Date(data.endedAt);
        } else {
            setWon(null);
            setAttempts(0);
            setInputs(Array(length).fill(""));
            setLockedIndices(Array(length).fill(LetterPosition.Invalid));
            startedAt.current = new Date();
            endedAt.current = null;
        }
    }, [props.gameData]);

    return (
        <div className="flex flex-col justify-between grow gap-8">
            {won && <Confetti mode="fall" />}
            <RuledPopup rule="wordle-rules">
                <p className="font-semibold text-xl">Comment jouer au wordle</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Trouvez la station TCL en <strong>3 essais</strong>.
                    </li>
                    <li>
                        Chaque essai vous indique lesquelles des{" "}
                        <strong>lettres tentées</strong> sont
                        valides (vertes) ou mal placées (jaunes).
                    </li>
                    <li>
                        Chaque lettre <strong>valide</strong> reste affichée.
                    </li>
                    <li>
                        Vous devez <strong>respecter</strong> la ponctuation.
                    </li>
                    <li>
                        Une nouvelle partie est disponible à{" "}
                        <strong>minuit</strong> chaque jour.
                    </li>
                </ul>
                <br />
                <p className="font-semibold text-lg">
                    Attention
                </p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Le nom des stations correspond à celui inscrit sur le
                        <strong> mobilier en station</strong>.
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
                            className={`badge badge-sm ${won ? "badge-success" : "badge-error"}`}
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
                className="flex flex-col items-center justify-center gap-2"
            >
                <CharInput
                    value={inputs}
                    onChange={setInputs}
                    locked={lockedIndices}
                    disabled={won !== null}
                    layout={props.gameData.layout}
                />
                <input type="submit" disabled={loading} hidden />
            </form>
            <div className="flex justify-between items-center flex-wrap-reverse">
                <div className="flex gap-2">
                    <button
                        onClick={() => useRuledPopupContext
                            .getState()
                            .setCurrentRule("wordle-rules")
                        }
                        className="btn"
                        key="rules"
                    >Voir les règles</button>
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
                                shareWordleGame(
                                    props.id,
                                    startedAt.current,
                                    endedAt.current!,
                                    lockedIndices,
                                    props.gameData.layout,
                                )
                            }
                            className="btn btn-primary"
                            type="button"
                        >
                            Partager
                        </button>
                    )}
                </div>
                <div className="flex justify-end flex-grow py-8">
                    <Counter count={attempts} />
                </div>
            </div>
        </div>
    );
}
