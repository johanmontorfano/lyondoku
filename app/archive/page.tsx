import { firstEverGrid, firstEverWordle, firstEverGuessr } from "@/scripts/game_mgr/data";
import { getDateRange } from "@/scripts/date";
import { Metadata } from "next";
import { ArchiveEntry } from "@/components/archive";

export const metadata: Metadata = {
    title: "Lyondle – Archive",
    description: "Si vous êtes Lyonnais, vous êtes capable de gagner chaque partie de l'archive.",
};

export default function Page() {
    // HACK: since a new wordle is available every day and we know the date of
    // the first one, we just statically compute all dates from the creation
    const allWordles = getDateRange(firstEverGuessr);
    const allGrids = getDateRange(firstEverGrid);
    const allGuesses = getDateRange(firstEverWordle);

    const collapsableContent = [
        ["Guessr", allWordles, "", "guessr"],
        ["Doku", allGrids, "doku", "doku"],
        ["Wordle", allGuesses, "wordle", "wordle"]
    ] as const;

    return (
        <div className="pb-8">
            <header className="header">
                <h2 className="text-xl font-semibold">
                    Archive
                </h2>
            </header>
            <br />
            {collapsableContent.map(c =>
                <div key={c[0]} className="collapse collapse-arrow bg-base-200 mb-4">
                    <input type="checkbox" />
                    <h3 className="text-lg font-semibold collapse-title">
                        {c[0]}
                    </h3>
                    <ul className="collapse-content list-disc">
                        {c[1].reverse().map(t => <ArchiveEntry
                            id={t}
                            key={`archive-${c[0]}-${t}`}
                            savePrefix={c[3]}
                            gamePathSegment={c[2]}
                            accent
                        />)}
                    </ul>
                </div>
            )}
        </div>
    );
}
