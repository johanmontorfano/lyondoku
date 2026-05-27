"use client";

import { Station, WordleAnswer } from "@/scripts/game_mgr/types";
import { useEffect, useRef, useState } from "react";
import {
    StationSelectorPopup,
    useStationSelectorPopup,
} from "@/components/select_station";
import { getDataset } from "@/scripts/firebase/data_provider";
import { isToday } from "@/scripts/date";
import { WordleRow } from "./row";
import Confetti from "react-confetti-boom";
import { shareWordleGame } from "@/scripts/share_game";
import { RuledPopup } from "../popup";

// this game works by making the user guess in 5 tries a station based on 5
// criterias:
// - guess
// - line/connections matching
// - city/borough matching
// - distance with answer
// - cardinal direction towards answer
export function Wordle(props: { id: string }) {
    const popup = useStationSelectorPopup();

    const [won, setWon] = useState<boolean | null>(null);
    const [answers, setAnswers] = useState<WordleAnswer[]>([]);
    const [loading, setLoading] = useState(false);

    const startedAtRef = useRef(new Date());
    const endedAtRef = useRef<Date | null>(null);
    const countdownRef = useRef<HTMLSpanElement>(null);
    const shareWithGuesses = useRef(false);

    // we must get the latest answer as this function is called in the answer
    // checker which will not provide it with the new state scope upon call
    async function handleGameEnd(won: boolean, latestAnswer?: WordleAnswer) {
        const final = [...answers];
        endedAtRef.current = new Date();

        if (latestAnswer) final.push(latestAnswer);
        if (!won) try {
            const res = await fetch(`/api/solution/wordle?id=${
                props.id
            }`);

            if (!res.ok)
                throw new Error("Request failed");

            const body = await res.json() as Record<"station", Station>;

            final.push({
                guess: body.station,
                cardinalDirectionTowardsAnswer: 0,
                distanceWithAnswer: 0,
                cityOrBoroughMatch: true,
                validLinesOnStation: body.station.connections
            });
            setAnswers(final);
        } catch (e) {
            console.error(e);
        }

        setWon(won);
        localStorage.setItem(
            `lyondle-${props.id}`,
            JSON.stringify({
                won,
                answers: final,
                startedAt: startedAtRef.current.getTime(),
                endedAt: endedAtRef.current!.getTime(),
            }),
        );
    }

    async function handleCheck(guess: number) {
        setLoading(true);
        try {
            const res = await fetch("/api/verify/wordle", {
                method: "POST",
                body: JSON.stringify({ id: props.id, guess }),
            });

            if (!res.ok) throw new Error("Request error");

            const body = await res.json();

            setAnswers((p) => [...p, body.data]);
            popup.setForbiddenStations([
                ...popup.forbiddenStations,
                body.data.guess.id,
            ]);

            if (body.won) handleGameEnd(true, body.data);
            // for incults: a function updating a state doesn't get the new
            // state value in its scope unless we are talking about a ref
            else if (answers.length >= 5) handleGameEnd(false, body.data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    useEffect(() => {
        // look if a save is available in local storage for this game
        const save = localStorage.getItem(`lyondle-${props.id}`);

        if (save !== null) {
            const gameData = JSON.parse(save);

            setAnswers(gameData.answers);
            setWon(gameData.won);
            startedAtRef.current = new Date(gameData.startedAt);
            endedAtRef.current = new Date(gameData.endedAt);
        }

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

    useEffect(() => {
        if (popup.lastSelected !== null) {
            handleCheck(popup.lastSelected);
            popup.setLastSelected(null);
        }
    }, [popup.lastSelected]);

    return (
        <div>
            {won && <Confetti mode="fall" />}
            <StationSelectorPopup />
            <RuledPopup rule="dle-rules">
                <p className="font-semibold text-xl">Comment jouer à Lyondle</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Trouvez la station TCL en <strong>
                            6 essais
                        </strong> maximum.
                    </li>
                    <li>
                        Chaque essai vous fourni des indices sur la
                        station à trouver.
                    </li>
                    <li>
                        Les indices suivants sont fournis: <strong>
                        lignes en commun, commune correcte, distance et 
                        direction.</strong>
                    </li>
                    <li>
                        Un indice en vert/la présence d'un pictogramme de 
                        ligne indique que la station les partage 
                        avec la station à deviner.
                    </li>
                    <li>
                        Une nouvelle partie est disponible à <strong>
                            minuit
                        </strong> chaque jour.
                    </li>
                </ul>
            </RuledPopup>
            <header className="header flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">
                        {isToday(new Date(props.id)) ?
                            "Station du jour" : `Archive du ${
                                new Intl.DateTimeFormat('fr-FR').format(
                                    new Date(props.id).getTime()
                                )
                        }`}
                    </h3>
                    {isToday(new Date(props.id)) && <h2>
                        {new Intl.DateTimeFormat('fr-FR').format(
                            new Date(props.id).getTime()
                        )}
                    </h2>}
                </div>
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
            <table className="table font-(family-name:--font-doto) bg-base-200 rounded-lg">
                <thead>
                    <tr className="text-base-content/80 text-dyn-md font-bold p-1">
                        <th className="w-[52%]">Station</th>
                        <th className="w-[10%] text-center">Lignes</th>
                        <th className="w-[20%] text-center">Commune</th>
                        <th className="w-[18%] text-right">Distance</th>
                    </tr>
                </thead>
                <tbody>
                    {answers.map((a) => (
                        <WordleRow {...a} key={a.guess.id} />
                    ))}
                    {answers.length < 6 && won === null && (
                        <tr
                            className="bg-base-200/50 hover:bg-base-200 cursor-pointer transition-colors"
                            onClick={async () => {
                                popup.setPlaceholder(
                                    `Encore ${6 - answers.length} essai(s)`,
                                );
                                popup.setStations(
                                    await getDataset("stations_dict"),
                                );
                                popup.setShow(true);
                            }}
                        >
                            <td colSpan={4}>
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <span className="opacity-60 italic">
                                        Encore {6 - answers.length} essai(s)...
                                    </span>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <br />
            <div className="flex justify-end w-full gap-2">
                {won === null && (
                    <button
                        onClick={() => handleGameEnd(false)}
                        className="btn btn-primary"
                        key="giveup"
                    >
                        Abandonner
                    </button>
                )}
                {won !== null && <div className="flex flex-col gap-1">
                    <button
                        onClick={() =>
                            shareWordleGame(
                                props.id,
                                startedAtRef.current,
                                endedAtRef.current!,
                                answers,
                                shareWithGuesses.current
                            )
                        }
                        className="btn btn-primary"
                        key="share"
                    >
                        Partager
                    </button>
                    <label className="label text-xs">
                        Incl. stations
                        <input
                            type="checkbox"
                            className="toggle toggle-xs"
                            onChange={ev => {
                                shareWithGuesses.current = ev.target.checked;
                            }}
                        />
                    </label>
                </div>}
            </div>
        </div>
    );
}
