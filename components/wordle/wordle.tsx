"use client";

import { WordleAnswer } from "@/scripts/game_mgr/types";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
    StationSelectorPopup,
    useStationSelectorPopup,
} from "@/components/select_station";
import { getDataset } from "@/scripts/firebase/data_provider";
import { isToday } from "@/scripts/date";
import { WordleRow, WordleRowSkeleton } from "./row";
import Confetti from "react-confetti-boom";

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

    async function getStations() {
        const data = await getDataset("stations_dict");
        if (data) popup.setStations(data);
    }

    // we must get the latest answer as this function is called in the answer
    // checker which will not provide it with the new state scope upon call
    function onWinOrLost(won: boolean, latestAnswer: WordleAnswer) {
        endedAtRef.current = new Date();

        setWon(won);
        localStorage.setItem(`lyondle-${props.id}`, JSON.stringify({
            won, answers: [...answers, latestAnswer],
            startedAt: startedAtRef.current.getTime(),
            endedAt: endedAtRef.current!.getTime()
        }));
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
                body.data.guess.id
            ]);

            if (body.won) onWinOrLost(true, body.data);
            // for incults: a function updating a state doesn't get the new
            // state value in its scope unless we are talking about a ref
            else if (answers.length >= 5) onWinOrLost(false, body.data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    function NewAttemptButton(props: {
        children: ReactNode,
        accentCol?: boolean,
        noRightBorder?: boolean
    }) {
        return  <button className={
            (props.accentCol ? "bg-base-200 " : "") +
            (props.noRightBorder !== true ? "border-r " : "") +
            "text-dyn-sm italic text-base-content/60 py-4 border-t border-base-content/20 p-2 cursor-pointer"
            }
            onClick={async () => {
                await getStations();
                popup.setPlaceholder("Entrez le nom d'une station")
                popup.setShow(true);
            }}
        >
            {props.children}
        </button>
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
                ((
                    endedAtRef.current ?
                        new Date(endedAtRef.current).getTime() : Date.now()
                )- startedAtRef.current.getTime()) / 1000
            );

            if (countdownRef.current !== null)
                countdownRef.current.textContent = `${
                    (elapsed / 60).toFixed(0).padStart(2, "0")
                }:${
                    (elapsed % 60).toString().padStart(2, "0")
                }`;
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
            {won && <Confetti
                mode="fall"
                fadeOutHeight={Infinity}
                colors={[
                    "#D9A050",
                    "#C86A4C",
                    "#B55261",
                    "#A24936"
                ]}
            />}
            <StationSelectorPopup />
            <header className="header flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {isToday(new Date(props.id)) ?
                        "Grille du jour" : `Archive du ${
                            new Intl.DateTimeFormat('fr-FR').format(
                                new Date(props.id).getTime()
                            )
                    }`}
                </h3>
                <span ref={countdownRef}>00:01</span>
            </header>
            <br />
            <div className="grid grid-cols-[40%_27%_18%_15%] w-full">
                <p className="text-dyn-sm bg-base-200 border-r border-base-content/20 p-1 md:p-2">
                    Station
                </p>
                <p className="text-dyn-sm border-r border-base-content/20 p-1 md:p-2">
                    Lignes en commun
                </p>
                <p className="text-dyn-sm border-r border-base-content/20 p-1 md:p-2">Ville</p>
                <p className="text-dyn-sm p-1 md:p-2">Distance</p>
                {answers.map((a) => (
                    <WordleRow {...a} key={a.guess.id} />
                ))}
                {(answers.length < 6 && won === null) && <>
                    <NewAttemptButton accentCol>
                        Encore {6 - answers.length} essais...
                    </NewAttemptButton>
                    <NewAttemptButton>...</NewAttemptButton>
                    <NewAttemptButton>...</NewAttemptButton>
                    <NewAttemptButton noRightBorder>...</NewAttemptButton>
                </>}
                {new Array((won ? 6 : 5) - answers.length).fill(0).map((_, i) => (
                    <WordleRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
