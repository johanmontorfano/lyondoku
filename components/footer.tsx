import { firestore } from "@/scripts/firebase/server";
import Image from "next/image"
import Link from "next/link";
import { KofiButton } from "./kofi";

export async function Footer() {
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
        <footer className="footer sm:footer-horizontal text-base-content p-4 bg-base-200 border border-base-300 rounded-xl mb-4">
            <aside className="flex flex-row sm:flex-col space-between max-sm:items-center max-sm:bg-base-300 p-4 rounded-lg w-full gap-2">
                <Image
                    className="border-3 max-sm:mr-6"
                    alt="lyondle logo"
                    src="/icon.svg"
                    width={80}
                    height={80}
                />
                <div>
                    <p className="mb-2">
                        Aujourd'hui Lyondle s'appelle,
                        <br />
                        <strong>
                            {title}
                        </strong>
                    </p>
                    <KofiButton />
                </div>
            </aside>
            <nav>
                <h6 className="footer-title">Jeux</h6>
                {games.map((g) => (
                    <Link
                        className="link link-hover"
                        href={g[1]}
                        key={`footer-games-${g[0]}`}
                    >
                        {g[0]} 
                    </Link>
                ))}
            </nav>
            <nav>
                <h6 className="footer-title">Divers</h6>
                <Link className="link link-hover" href="/archive">
                    Archive
                </Link>
                <Link
                    className="link link-hover"
                    href="mailto:hello@johanmontorfano.com"
                >
                    Contact
                </Link>
            </nav>
        </footer>
    );
}
