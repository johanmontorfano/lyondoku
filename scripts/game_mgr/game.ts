import "server-only";
import { Constraints, Station } from "./types";
import { firestore } from "../firebase/server";
import stations from "@/public/data/stations.json";

export interface GameData {
    id: string;
    createdAt: number;
    rows: [Constraints, Constraints, Constraints],
    cols: [Constraints, Constraints, Constraints],
    // tl tc tr cl cc cr bl bc br
    validAnswers: { [cell: string]: string[] }
}
export type UserFacingGameData = Omit<GameData, "validAnswers"> & {
    validAnswersCount: { [cell: string]: number }
};

// when the retrieval is userFacing, solutions are not provided but the number
// of possible solutions per cell is provided
export async function retrieveGame(id: string, userFacing = false): Promise<
    GameData | UserFacingGameData | null
> {
    try {
        const snap = await firestore.doc(`grids/${id}`).get();

        if (snap.exists) {
            const data = snap.data()!;

            if (userFacing) {
                data.validAnswersCount = {};
                Object.keys(data.validAnswers).forEach(cell => {
                    data.validAnswersCount[cell] =
                        data.validAnswers[cell].length;
                });
                delete data.validAnswers;
            }
            return data as GameData | UserFacingGameData;
        }
        else throw new Error("Game not found");
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function retrieveStation(name: string) {
    try {
        const snap = await firestore.doc(`config/network/stations/${name}`).get();
        
        if (snap.exists)
            return snap.data() as Station;
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// WARN: as of now, this function consumes way too much quota for nothing
// HACK: station names are delivered from a static json file
// TODO: station names must be saved to GCS and retrieved from GCS
export async function retrieveAllStationsNames() {
    //try {
    //    const snap = await firestore.collection("config/network/stations").get();
    //    const names = snap.docs.map(d => d.id);
    //
    //    return names;
    //} catch (e) {
    //    console.error(e);
    //    return [];
    //}
    return stations;
}
