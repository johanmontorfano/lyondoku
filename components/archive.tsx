"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DokuSave } from "./doku/doku";

export function ArchiveEntry(props: {
    id: string,
    savePrefix: string,
    gamePathSegment: string,
    accent: boolean
}) {
    const router = useRouter();

    // https://demystifying-rsc.vercel.app/client-components/no-ssr/
    const [isServer, setServer] = useState(true);
    const gameData = useMemo<{ won: boolean } | null>(() => {
        if (isServer) return null;
        const data = localStorage.getItem(`${props.savePrefix}-${props.id}`);

        if (data !== null) return JSON.parse(data);
        return null;
    }, [props.id, isServer]);

    useEffect(() => {
        setServer(false);
    }, []);

    return <button
        role="link"
        onClick={() => router.push(`/${
            props.gamePathSegment !== "" ? props.gamePathSegment + "/" : ""
        }${props.id}`)}
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
            }`}>{gameData.won ? "Gagné" : "Perdu"}</span>
        </div>}
    </button>
}
