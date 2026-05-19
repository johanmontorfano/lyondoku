import { WordleArchiveEntry } from "@/components/archive";
import { ResetProgress } from "@/components/reset_progress";
import { firstEverWordle } from "@/scripts/game_mgr/data";

export default function Page() {
    // HACK: since a new wordle is available every day and we know the date of
    // the first one, we just statically compute all dates from the creation
    const allWordles = [];

    const today = new Date();
    let cursor = new Date(firstEverWordle);

    today.setHours(0, 0, 0, 0);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= today) {
        const year = cursor.getFullYear();
        const month = String(cursor.getMonth() + 1).padStart(2, "0");
        const day = String(cursor.getDate()).padStart(2, "0");

        allWordles.push(`${year}-${month}-${day}`);
        cursor.setDate(cursor.getDate() + 1);
    }

    return (
        <div className="pb-8">
            <header className="header">
                <h3 className="text-lg font-semibold">
                    Archive
                </h3>
            </header>
            <br />
            <ul className="list-disc [&>li]:ml-4 [&>li]:text-justify">
                {allWordles.reverse().map((t, i) => (
                    <WordleArchiveEntry id={t} key={t} accent={!(i % 2)} />
                ))}
            </ul>
        </div>
    );
}
