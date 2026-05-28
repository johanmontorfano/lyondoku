import { firstEverGrid, firstEverGuess, firstEverWordle } from "@/scripts/game_mgr/data";
import { getDateRange } from "@/scripts/date";
import { Metadata } from "next";
import { ResetProgress } from "@/components/reset_progress";
import { ArchiveEntry } from "@/components/archive";

export const metadata: Metadata = {
    title: "Lyondle – Archive",
    description: "Si vous êtes Lyonnais, vous êtes capable de gagner chaque partie de l'archive.",
};

export default function Page() {
    // HACK: since a new wordle is available every day and we know the date of
    // the first one, we just statically compute all dates from the creation
    const allWordles = getDateRange(firstEverWordle);
    const allGrids = getDateRange(firstEverGrid);
    const allGuesses = getDateRange(firstEverGuess);

    const collapsableContent = [
        ["Wordles", allWordles, "", "lyondle"],
        ["Dokus", allGrids, "doku", "doku"],
        ["Devines", allGuesses, "guess", "guess"]
    ] as const;

    return (
        <div className="pb-8">
            <header className="header">
                <h2 className="text-xl font-semibold">
                    Archive
                </h2>
            </header>
            <br />
            {collapsableContent.map(c => <div className="collapse collapse-arrow bg-base-200 mb-4">
                <input type="radio" name="archive" />
                <h3 className="text-lg font-semibold collapse-title">{c[0]}</h3>
                <ul className="collapse-content list-disc">
                    {c[1].reverse().map(t => <ArchiveEntry
                        id={t}
                        key={`archive-${c[0]}-${t}`}
                        savePrefix={c[3]}
                        gamePathSegment={c[2]}
                        accent
                    />)}
                </ul>
            </div>)}
            <div className="flex justify-end">
                <ResetProgress />
            </div>
        </div>
    );
}
