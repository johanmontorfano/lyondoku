import { UserFacingWordleData } from "./types";

/**
 * Splitting station names for the guessing game implies:
 * - Splitting at /[ ]/
 * - Indicating the position of all /[-']/ in the delimiters object with the
 *   position of the delimiter relative to the word it is in: i.e. word 3 char
 *   2.
*/
export function splitWithDetailsForGuess(text: string) {
    const words = text.split(" ");
    const wordLengths: number[] = words.map(w => w.length);
    const delimiters: UserFacingWordleData["layout"]["delimiters"] = words.map(
        (w, widx) => w.split("").map((c, cidx) => {
            if (c === "'" || c === "-")
                return { widx, cidx, type: c };
            return undefined;
        }).filter(d => d !== undefined)
    ).flat();

    return {
        wordLengths,
        delimiters
    } satisfies UserFacingWordleData["layout"];
}
