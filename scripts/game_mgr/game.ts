import "server-only";
import { DokuData, GuessrData, Station, UserFacingDokuData, UserFacingWordleData, WordleData } from "./types";
import { firestore } from "../firebase/server";
import { splitWithDetailsForGuess } from "./wordle";
import { getCQL } from "../cql";

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
        const snap = await firestore.doc(`guessr/${id}`).get();

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
        const snap = await firestore.doc(`wordle/${id}`).get();

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
    const res = await getCQL(`IF id == str:[${id}]`, "stations");

    if (res && res.selected.length > 0)
        return res.selected[0] as Station;
    return null;
}
