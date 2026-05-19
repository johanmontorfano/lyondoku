import { GridArchiveEntry, WordleArchiveEntry } from "@/components/archive";
import { firstEverGrid, firstEverWordle } from "@/scripts/game_mgr/data";

export default function Page() {
    // HACK: since a new wordle is available every day and we know the date of
    // the first one, we just statically compute all dates from the creation
    const allWordles = [];
    const allGrids = [];

    const today = new Date();
    let cursor = new Date(firstEverWordle);
    let cursor2 = new Date(firstEverGrid);

    today.setHours(0, 0, 0, 0);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= today) {
        const year = cursor.getFullYear();
        const month = String(cursor.getMonth() + 1).padStart(2, "0");
        const day = String(cursor.getDate()).padStart(2, "0");

        allWordles.push(`${year}-${month}-${day}`);
        cursor.setDate(cursor.getDate() + 1);
    }

    today.setHours(0, 0, 0, 0);
    cursor.setHours(0, 0, 0, 0);
    while (cursor2 <= today) {
        const year = cursor2.getFullYear();
        const month = String(cursor2.getMonth() + 1).padStart(2, "0");
        const day = String(cursor2.getDate()).padStart(2, "0");

        allGrids.push(`${year}-${month}-${day}`);
        cursor2.setDate(cursor2.getDate() + 1);
    }

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
