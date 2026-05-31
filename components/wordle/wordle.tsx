"use client";

import { isToday } from "@/scripts/date";
import { useState, useRef, useEffect } from "react";
import { RuledPopup, useRuledPopupContext } from "../popup";
import { LetterPosition, UserFacingWordleData, WordleData } from "@/scripts/game_mgr/types";
import { CharInput } from "./char_input";
import Confetti from "react-confetti-boom";
import { shareWordleGame } from "@/scripts/share_game";
import { AnimatePresence, motion } from "framer-motion";

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
    const [initialAttemptSent, setInitialAttemptSent] = useState(false);

    // to be funnier to play with, the wordle will keep track of all invalid
    // letters and show them to the user until they place them WITHOUT knowing
    // itself what's the final word
    //
    // therefore, each time a letter is misplaced, the number of the same
    // letter misplaced (if 3 misplaced e, then it is 3) and the number of 
    // valid placed letters (if 1 e placed, then it is 1) will be kept track
    // of
    //
    // fi, if at round 1 the user has placed 1 a at the right spot but another
    // a is misplaced, we know there is at least 1 a misplaced and we show it
    // to the user
    //
    // if at the next turn they placed the 2 a at the right spot and tried a
    // guess with a 3rd a misplaced, then we know there is at least... etc etc
    const [misplaced, setMisplaced] = useState<Record<
        string, Record<"misplaced" | "valid", number>
    >>({});

    const startedAtRef = useRef(new Date());
    const endedAtRef = useRef<Date | null>(null);
    const countdownRef = useRef<HTMLSpanElement>(null);

    async function handleGameEnd(won: boolean, indices: typeof lockedIndices) {
        setWon(won);
        endedAtRef.current = new Date();
        if (!won) {
            try {
                const res = await fetch("/api/solution/wordle?id=" + props.id);

                if (!res.ok) throw new Error("Request error");

                const body = (await res.json()) as WordleData;

                setInputs(body.name.replaceAll(/[\'\s-]/g, "").split(""));
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
            const res = await fetch("/api/verify/wordle", {
                method: "POST",
                body: JSON.stringify({
                    id: props.id,
                    guess: keys,
                }),
            });

            if (!res.ok) throw new Error("Request error");

            const body = await res.json();

            // we check all letters statuses
            setMisplaced(p => {
                const prev = { ...p };
                const matchWithKey: Record<string, LetterPosition> = {};

                // we build a dict first linking the match state with the
                // letter
                body.match.forEach((status: LetterPosition, i: number) => {
                    const letter = keys[i] || "";
                    matchWithKey[letter] = status;
                });

                // we order the keys from no action to valid key to avoid
                // valid operations to reduce misplaced operations wrongfully
                const ordered = Object.entries(matchWithKey).sort().reverse();

                for (const [letter, status] of ordered) {
                    if (letter === "") continue;

                    console.log(letter, status);
                    if (status !== LetterPosition.Invalid) {
                        if (prev[letter] === undefined)
                            prev[letter] = {
                                misplaced: 0,
                                valid: 0
                            };
                        if (status === LetterPosition.Misplaced)
                            prev[letter].misplaced += 1;
                        if (status === LetterPosition.Valid) {
                            // if it is the first round, we cannot remove from the
                            // misplaced entry since we weren't aware before they
                            // were 0 misplaced letter
                            if (prev[letter].misplaced > 0)
                                prev[letter].misplaced -= 1;
                            prev[letter].valid;
                        }
                    }
                }
                return prev;
            });

            // to ensure entries stay locked while new ones switch to be locked
            // we must run the matches through a filter before setting
            setLockedIndices(body.match);
            if (!body.won) setAttempts((p) => p + 1);
            else handleGameEnd(true, body.match);
            if (!body.won && attempts > 1) handleGameEnd(false, body.match);
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
        <div className="flex flex-col justify-between grow gap-8">
            {won && <Confetti mode="fall" />}
            <RuledPopup rule="guess-rules">
                <p className="font-semibold text-xl">Comment jouer au wordle</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Trouvez la station TCL en <strong>3 essais</strong>{" "}
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
                        Vous devez <strong>respecter</strong> la ponctuation.
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
                {initialAttemptSent ? (
                    <CharInput
                        value={inputs}
                        onChange={setInputs}
                        locked={lockedIndices}
                        disabled={won !== null}
                        layout={props.gameData.layout}
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
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {Object.entries(misplaced)
                            .sort()
                            .filter(([_, v]) => v.misplaced > 0)
                            .map(([k, v]) => (
                                <motion.div
                                    key={`misplaced-${k}`}
                                    className="indicator"
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                >
                                    <span className="indicator-item badge badge-warning badge-xs w-4 h-4 rounded-full">
                                        {v.misplaced}
                                    </span>
                                    <div className="w-7 h-8 flex justify-center items-center uppercase rounded-md bg-base-200">
                                        <span>{k}</span>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </AnimatePresence>
                </div>
                <input type="submit" disabled={loading} hidden />
            </form>
            <div className="flex justify-between items-center w-full">
                <div className="flex gap-2">
                    <button
                        onClick={() => useRuledPopupContext
                            .getState()
                            .setCurrentRule("guess-rules")
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
                                    startedAtRef.current,
                                    endedAtRef.current!,
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
                <Counter count={attempts} />
            </div>
        </div>
    );
}
