import { GridArchiveEntry, WordleArchiveEntry } from "@/components/archive";
import { getDateRange } from "@/scripts/date";
import { firstEverGrid, firstEverWordle } from "@/scripts/game_mgr/data";

export default function Page() {
    // HACK: since a new wordle is available every day and we know the date of
    // the first one, we just statically compute all dates from the creation
    const allWordles = getDateRange(firstEverWordle);
    const allGrids = getDateRange(firstEverGrid);

    return (
        <div className="pb-8">
            <header className="header">
                <h2 className="text-xl font-semibold">
                    Archive
                </h2>
            </header>
            <br />
            <h3 className="text-lg font-semibold">Lyondles</h3>
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify">
                {allWordles.reverse().map((t, i) => (
                    <WordleArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
            <br />
            <h3 className="text-lg font-semibold">Dokus</h3>
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify">
                {allGrids.reverse().map((t, i) => (
                    <GridArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
        </div>
    );
}
