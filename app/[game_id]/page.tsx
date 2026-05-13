import { DokuGrid } from "@/components/doku";
import { mono } from "@/scripts/fonts";
import {
    retrieveGame,
    UserFacingGameData,
    retrieveAllStationsNames
} from "@/scripts/game_mgr/game";
import { notFound } from "next/navigation";

export default async function Page(props: {
    params: Promise<{ game_id: string }>
}) {
    const params = await props.params;

    // NOTE: when the game_id is "random", we select one of the 10 random grids
    // generated
    if (params.game_id === "random")
        params.game_id = `random_${Math.ceil(Math.random() * 10)}`;

    const stations = await retrieveAllStationsNames();
    const gameData = await retrieveGame(params.game_id, true);

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
                {params.game_id.startsWith("random_") ?
                    "grille aléatoire" :
                    isToday(new Date(gameData.id)) ?
                        "grille du jour" : "archive du"}
            </h3>
            {!params.game_id.startsWith("random_") &&
                <h4 className="text-xl font-monospace">
                    { new Intl.DateTimeFormat('fr-FR').format(
                        new Date(gameData.id).getTime()
                    )}
                </h4>
            }
        </header>
        <DokuGrid gameData={gameData as UserFacingGameData} stations={stations} />
    </div>
}
