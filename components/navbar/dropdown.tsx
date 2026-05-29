"use client";

import Link from "next/link";
import { useState } from "react";

export function GamesDropdown(props: { games: string[][] }) {
    const [open, setOpen] = useState(false);

    return <details open={open} className="dropdown">
        <summary
            className="cursor-pointer list-none hover:text-base-content text-base-content/70 transition-colors"
            onClick={e => {
                e.preventDefault();
                setOpen(p => !p);
            }}
        >
            Jeux
        </summary>
        <ul className="menu dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow-md">
            {props.games.map((g) => (
                <li key={`gd-${g[1]}`} onClick={() => setOpen(false)}>
                    <Link href={g[1]}>
                        {g[0]}
                    </Link>
                </li>
            ))}
        </ul>
    </details>
}
