import { DokuGrid } from "@/components/doku";
import { mono } from "@/scripts/fonts";
import { retrieveGame, UserFacingGameData, retrieveAllStationsNames } from "@/scripts/game_mgr/game";
import { notFound } from "next/navigation";

export default async function Page(props: {
    params: Promise<{ game_id: string }>
}) {
    const params = await props.params;
    const gameData = await retrieveGame(params.game_id, true);
    const stations = await retrieveAllStationsNames();
    
    function isToday(date: Date) {
        const today = new Date();

        return (
            date.getDate() === today.getDate() &&   
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    if (gameData === null) notFound();

    return <div>
        <header className={"pb-6 " + mono.className}>
            <h3 className="text-xl font-monospace">
                {isToday(new Date(gameData.createdAt)) ?
                    "grille du jour" : "archive du"}
            </h3>
            <h4 className="text-xl font-monospace">
                {new Intl.DateTimeFormat('fr-FR').format(gameData.createdAt)}
            </h4>
        </header>
        <DokuGrid gameData={gameData as UserFacingGameData} stations={stations} />
    </div>
}
