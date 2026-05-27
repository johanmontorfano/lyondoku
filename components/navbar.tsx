import Link from "next/link";

export function Navbar() {
    const games = [
        ["Wordle", "/"],
        ["Doku", "/doku"],
        ["Devine", "/guess"]
    ];

    return (
        <div className="navbar bg-base-100 w-full px-4 justify-between">
            <div className="navbar-start w-auto">
                <Link href="/" className="flex items-center">
                    <h1 className="text-2xl font-bold font-(family:--font-serif) hover:text-primary transition-colors">LYONDLE</h1>
                </Link>
            </div>
            <div className="navbar-end w-auto">
                <ul className="md:hidden menu menu-horizontal">
                    <li>
                    <details>
                        <summary className="btn btn-ghost">Jeux</summary>
                        <ul className="menu dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow-md">
                            {games.map(g => <li>
                                <Link key={`m-${g[1]}`} href={g[1]}>{g[0]}</Link>
                            </li>)}
                        </ul>
                    </details>
                    </li>
                    <Link className="btn btn-ghost" href="/archive">
                        Archive
                    </Link>
                </ul>
                <ul className="hidden md:flex menu menu-horizontal text-sm">
                    {games.map(g => <li>
                        <Link key={`h-${g[1]}`} href={g[1]}>{g[0]}</Link>
                    </li>)}
                    <li><Link href="/archive">Archive</Link></li>
                </ul>
            </div>
        </div>
    );
}
