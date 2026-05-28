import { firestore } from "@/scripts/firebase/server";
import Link from "next/link";

export async function Navbar() {
    // since the navbar title can be updated, we must load it here to show it
    // WARN: this component MUST NOT be a client component thus
    const titleSnap = await firestore.doc("config/ui").get();
    const title = titleSnap.data()!.navbarTitle as string;

    const games = [
        ["Wordle", "/"],
        ["Doku", "/doku"],
        ["Devine", "/guess"],
    ];

    return (
        <div className="bg-base-100 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
                <Link href="/" className="flex items-center">
                    <h1 className="text-2xl font-bold text-center">{title}</h1>
                </Link>
                <span className="text-xs text-base-content/50 italic">
                    LYONDLE
                </span>
            </div>
            <div className="flex gap-2">
                <div className="bg-base-200 rounded-full shadow-sm my-4">
                    <ul className="md:hidden menu menu-horizontal">
                        <li>
                            <details>
                                <summary className="btn btn-ghost">
                                    Jeux
                                </summary>
                                <ul className="menu dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow-md">
                                    {games.map((g) => (
                                        <li key={`m-${g[1]}`}>
                                            <Link href={g[1]}>
                                                {g[0]}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </li>
                        <li>
                            <Link
                                className="btn btn-ghost rounded-full"
                                href="/archive"
                            >
                                Archive
                            </Link>
                        </li>
                    </ul>
                    <ul className="hidden md:flex menu menu-horizontal text-sm">
                        {games.map((g) => (
                            <li key={`h-${g[1]}`}>
                                <Link
                                    href={g[1]}
                                    className="rounded-full"
                                >
                                    {g[0]}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="hidden md:flex bg-base-200 rounded-full shadow-sm my-4">
                    <ul className="menu menu-horizontal">
                        <li>
                            <Link
                                href="/archive"
                                className="rounded-full"
                            >Archive</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
