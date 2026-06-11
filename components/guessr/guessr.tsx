"use client";

import { Station, GuessrAnswer } from "@/scripts/game_mgr/types";
import { useEffect, useState } from "react";
import {
    StationSelectorPopup,
    useStationSelectorPopup,
} from "@/components/select_station";
import { getDataset } from "@/scripts/firebase/data_provider";
import { isToday } from "@/scripts/date";
import { GuessrRow } from "./row";
import Confetti from "react-confetti-boom";
import { shareGuessrGame } from "@/scripts/share_game";
import { RuledPopup, useRuledPopupContext } from "../popup";
import { useCountdown } from "@/scripts/countdown";

// this game works by making the user guess in 6 tries a station based on 5
// criterias:
// - guess
// - line/connections matching
// - city/borough matching
// - distance with answer
// - cardinal direction towards answer
export function Guessr(props: { id: string }) {
    const popup = useStationSelectorPopup();

    const [won, setWon] = useState<boolean | null>(null);
    const [answers, setAnswers] = useState<GuessrAnswer[]>([]);
    const [loading, setLoading] = useState(false);

    const [countdownRef, startedAt, endedAt] = useCountdown("guessr-rules");

    // we must get the latest answer as this function is called in the answer
    // checker which will not provide it with the new state scope upon call
    async function handleGameEnd(won: boolean, latestAnswer?: GuessrAnswer) {
        const final = [...answers];
        endedAt.current = new Date();

        if (latestAnswer) final.push(latestAnswer);
        if (!won) try {
            const res = await fetch(`/api/solution/guessr?id=${
                props.id
            }`);

            if (!res.ok)
                throw new Error("Request failed");

            const body = await res.json() as Record<"station", Station>;

            final.push({
                guess: body.station,
                cardinalDirectionTowardsAnswer: 0,
                distanceWithAnswer: 0,
                cityMatch: [
                    ...body.station!.borough
                        .filter(b => b > -1)
                        .sort()
                        .map(b => `Lyon ${b}`),
                    ...body.station!.city.filter((c) => {
                        if (c === "Lyon") return false; // processed by borough
                        return c;
                    }),
                ],
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
                startedAt: startedAt.current.getTime(),
                endedAt: endedAt.current!.getTime(),
            }),
        );
    }

    async function handleCheck(guess: number) {
        setLoading(true);
        try {
            const res = await fetch("/api/verify/guessr", {
                method: "POST",
                body: JSON.stringify({ id: props.id, guess }),
            });

            if (!res.ok) throw new Error("Request error");

            const body = await res.json();

            setAnswers((p) => [...p, body.data]);
            popup.setForbiddenStations([
                ...useStationSelectorPopup.getState().forbiddenStations,
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
            startedAt.current = new Date(gameData.startedAt);
            endedAt.current = new Date(gameData.endedAt);
        }
    }, []);

    useEffect(() => {
        if (popup.lastSelected !== null) {
            handleCheck(popup.lastSelected);
            popup.setLastSelected(null);
        }
    }, [popup.lastSelected]);

    return (
        <div className="flex flex-col justify-between grow gap-8">
            {won && <Confetti mode="fall" />}
            <StationSelectorPopup />
            <RuledPopup rule="guessr-rules">
                <p className="font-semibold text-xl">Comment jouer à Guessr</p>
                <br />
                <ul className="list-disc [&>li]:ml-6">
                    <li>
                        Trouvez la station TCL en <strong>
                            6 essais
                        </strong>.
                    </li>
                    <li>
                        Chaque essai permet de récupérer des indices à propos
                        de la station à trouver.
                    </li>
                    <li>
                        Les indices suivants sont fournis: <strong>
                        lignes en commun, communes en commun, distance et 
                        direction</strong>.
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
                    <li>
                        La localité d'une station est définie par <strong>
                            la position de ses quais
                        </strong>. De ce fait, seulement la ville et/ou 
                        l'arrondissement en commun avec la station à trouver
                        seront affichés.
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
                            className={`badge badge-sm ${
                                won ? "badge-success" : "badge-error"
                            }`}
                        >
                            {won ? "Gagné" : "Perdu"}
                        </span>
                    )}
                </div>
            </header>
            <table className="table font-(family-name:--font-doto) bg-base-200 rounded-lg">
                <thead>
                    <tr className="text-base-content/80 text-dyn-md font-bold">
                        <th className="w-[52%]">Station</th>
                        <th className="w-[10%] text-center">Lignes</th>
                        <th className="w-[20%] text-center">Commune</th>
                        <th className="w-[18%] text-right">Distance</th>
                    </tr>
                </thead>
                <tbody>
                    {answers.map((a) => (
                        <GuessrRow {...a} key={a.guess.id} />
                    ))}
                    {answers.length < 6 && won === null && (
                        <tr
                            className="bg-base-200/50 hover:bg-base-200 cursor-pointer transition-colors"
                            onClick={async () => {
                                popup.setPlaceholder(
                                    `Encore ${6 - answers.length} essai${
                                        6 - answers.length > 1 ? "s" : ""
                                    }`,
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
                                        Encore {6 - answers.length} essai{
                                            (6 - answers.length) > 1 ?
                                                "s" : ""
                                        }...
                                    </span>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-start w-full gap-2">
                <button
                    onClick={() => useRuledPopupContext
                        .getState()
                        .setCurrentRule("guessr-rules")
                    }
                    className="btn"
                    key="rules"
                >Voir les règles</button>
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
                            shareGuessrGame(
                                props.id,
                                won,
                                startedAt.current,
                                endedAt.current!,
                                answers,
                                false
                            )
                        }
                        className="btn btn-primary"
                        key="share"
                    >
                        Partager
                    </button>
                </div>}
            </div>
        </div>
    );
}
