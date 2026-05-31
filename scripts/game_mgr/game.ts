import "server-only";
import { DokuData, GuessrData, Station, UserFacingDokuData, UserFacingWordleData, WordleData } from "./types";
import { firestore } from "../firebase/server";
import { splitWithDetailsForGuess } from "./wordle";

// when the retrieval is userFacing, solutions are not provided but the number
// of possible solutions per cell is provided
export async function retrieveDoku(id: string, userFacing = false): Promise<
    DokuData | UserFacingDokuData | null
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
            return data as DokuData | UserFacingDokuData;
        }
        else throw new Error("Game not found");
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function retrieveGuessr(id: string): Promise<GuessrData | null> {
    try {
        const snap = await firestore.doc(`wordle/${id}`).get();

        if (snap.exists) {
            return snap.data()! as GuessrData;
        } else throw new Error("Game not found");
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function retrieveWordle(id: string, userFacing = false): Promise<
    WordleData | UserFacingWordleData | null
> {
    try {
        const snap = await firestore.doc(`guess/${id}`).get();

        if (snap.exists) {
            const data = snap.data()! as WordleData;

            if (userFacing) return {
                answerId: data.answerId,
                layout: splitWithDetailsForGuess(data.name)
            } satisfies UserFacingWordleData;
            return data;
        } else throw new Error("Game not found");
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function retrieveStation(id: number) {
    try {
        const snap = await firestore.doc(`config/network/stations/${id}`).get();
        
        if (snap.exists)
            return snap.data() as Station;
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}
