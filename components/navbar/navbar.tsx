import { firestore } from "@/scripts/firebase/server";
import Link from "next/link";
import { GamesDropdown } from "./dropdown";

export async function Navbar() {
    // since the navbar title can be updated, we must load it here to show it
    // WARN: this component MUST NOT be a client component thus
    const titleSnap = await firestore.doc("config/ui").get();
    const title = titleSnap.data()!.navbarTitle as string;

    const games = [
        ["Guesser", "/"],
        ["Doku", "/doku"],
        ["Wordle", "/guess"],
    ];

    return (
        <header className="w-full max-w-3xl mx-auto pt-4">
            <div className="flex items-center justify-between pb-3">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <h1 className="text-lg font-bold tracking-tight">{title}</h1>
                </Link>
                <nav className="flex items-center gap-1 text-sm font-medium">
                    <div className="md:hidden">
                        <GamesDropdown games={games} />
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-base-content/70">
                        {games.map((g) => (
                            <Link key={`h-${g[1]}`} href={g[1]} className="hover:text-base-content transition-colors">
                                {g[0]}
                            </Link>
                        ))}
                    </div>
                    <div className="divider divider-horizontal mx-0" />
                    <Link href="/archive" className="hover:text-base-content text-base-content/70 transition-colors">
                        Archive
                    </Link>
                </nav>
            </div>
        </header>
    );
}
