import "server-only";
import { Constraints, Station } from "./types";
import { firestore } from "../firebase/server";
import { splitWithDetailsForGuess } from "./guess";

export interface GameData {
    id: string;
    createdAt: number;
    rows: [Constraints, Constraints, Constraints],
    cols: [Constraints, Constraints, Constraints],
    // tl tc tr cl cc cr bl bc br
    validAnswers: { [cell: string]: number[] }
    scoring: { [cell: string]: number }
}
export type UserFacingGameData = Omit<GameData, "validAnswers"> & {
    validAnswersCount: { [cell: string]: number }
};

export interface WordleData {
    answerId: number;
}

export interface GuessData {
    answerId: number;
    name: string;
}

export type UserFacingGuessData = Omit<GuessData, "name"> & {
    layout: {
        wordLengths: number[],
        delimiters: { after: number, type: string }[]
    }
}

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

export async function retrieveWordle(id: string): Promise<WordleData | null> {
    try {
        const snap = await firestore.doc(`wordle/${id}`).get();

        if (snap.exists) {
            return snap.data()! as WordleData;
        } else throw new Error("Game not found");
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function retrieveGuess(id: string, userFacing = false): Promise<
    GuessData | UserFacingGuessData | null
> {
    try {
        const snap = await firestore.doc(`guess/${id}`).get();

        if (snap.exists) {
            const data = snap.data()! as GuessData;

            if (userFacing) return {
                answerId: data.answerId,
                layout: splitWithDetailsForGuess(data.name)
            } satisfies UserFacingGuessData;
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
