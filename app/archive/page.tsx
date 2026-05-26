import { FortuneArchiveEntry, GridArchiveEntry, WordleArchiveEntry } from "@/components/archive";
import { getDateRange } from "@/scripts/date";
import { firstEverFortune, firstEverGrid, firstEverWordle } from "@/scripts/game_mgr/data";

export default function Page() {
    // HACK: since a new wordle is available every day and we know the date of
    // the first one, we just statically compute all dates from the creation
    const allWordles = getDateRange(firstEverWordle);
    const allGrids = getDateRange(firstEverGrid);
    const allFortunes = getDateRange(firstEverFortune);

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
            <h3 className="text-lg font-semibold">Fortunes</h3>
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify border-2 border-base-200 rounded-lg">
                {allFortunes.reverse().map((t, i) => (
                    <FortuneArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
            <br />
            <h3 className="text-lg font-semibold">Dokus</h3>
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify border-2 border-base-200 rounded-lg">
                {allGrids.reverse().map((t, i) => (
                    <GridArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
        </div>
    );
}
