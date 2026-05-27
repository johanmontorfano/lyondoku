import { GridArchiveEntry, GuessArchiveEntry, WordleArchiveEntry } from "@/components/archive";
import { firstEverGrid, firstEverGuess, firstEverWordle } from "@/scripts/game_mgr/data";
import { getDateRange } from "@/scripts/date";
import { Metadata } from "next";
import { ResetProgress } from "@/components/reset_progress";

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

    return (
        <div className="pb-8">
            <header className="header">
                <h2 className="text-xl font-semibold">
                    Archive
                </h2>
            </header>
            <br />
            <h3 className="text-lg font-semibold">Lyondles</h3>
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify border-2 border-base-200 rounded-lg">
                {allWordles.reverse().map((t, i) => (
                    <WordleArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
            <br />
            <h3 className="text-lg font-semibold">Guess</h3>
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify border-2 border-base-200 rounded-lg">
                {allGuesses.reverse().map((t, i) => (
                    <GuessArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
            <br />
            <h3 className="text-lg font-semibold">Dokus</h3>
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify border-2 border-base-200 rounded-lg">
                {allGrids.reverse().map((t, i) => (
                    <GridArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
            <br />
            <div className="flex justify-end">
                <ResetProgress />
            </div>
        </div>
    );
}
