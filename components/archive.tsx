"use client";

import { WordleAnswer } from "@/scripts/game_mgr/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function WordleArchiveEntry(props: {
    id: string,
    accent: boolean
}) {
    const router = useRouter();

    // https://demystifying-rsc.vercel.app/client-components/no-ssr/
    const [isServer, setServer] = useState(true);
    const gameData = useMemo<{
        startedAt: number,
        endedAt: number,
        answers: WordleAnswer[],
        won: boolean
    } | null>(() => {
        if (isServer) return null;
        const data = localStorage.getItem(`lyondle-${props.id}`);

        if (data !== null) return JSON.parse(data);
        return null;
    }, [props.id, isServer]);

    useEffect(() => {
        setServer(false);
    }, []);

    return <button
        role="link"
        onClick={() => router.push("/" + props.id)}
        className={
            "w-full p-2 flex items-center justify-between cursor-pointer " +
            "hover:bg-base-300 " + (props.accent ? "bg-base-200" : "")
        }
    >
        <p>
            {new Intl.DateTimeFormat("fr-FR", {
                month: "long",
                day: "2-digit",
                year: "numeric",
            }).format(new Date(props.id))}
        </p>
        {gameData && <div>
            <span className={`text-base-200 badge badge-sm ${
                gameData.won ? "badge-success" : "badge-error"
            }`}>{gameData.won ? "Gagnée" : "Perdue"}</span>
        </div>}
    </button>
}
