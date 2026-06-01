import { navbarGames } from "@/components/navbar/navbar";
import { dots } from "@/scripts/fonts";
import Link from "next/link";

export default function NotFound() {
    return <div className="flex flex-grow flex-col justify-center items-center">
        <h1 className={`text-8xl font-bold ${dots.className}`}>=(</h1>
        <br />
        <br />
        <p className="text-xl">Il semblerait que vous vous êtes perdu</p>
        <br />
        <div className="flex items-center gap-4 text-base-content/70">
            {navbarGames.map((g) => (
                <Link key={`h-${g[1]}`} href={g[1]} className="hover:text-base-content transition-colors">
                    {g[0]}
                </Link>
            ))}
        </div>
    </div>
}
