import { UserFacingWordleData } from "./types";

/**
 * Splitting station names for the guessing game implies:
 * - Splitting at /[' -]/
 * - Returning the length of words from the splitted string
 * - Returning the index of the word the delimiter is following
 *   and the delimiter itself.
*/
export function splitWithDetailsForGuess(text: string) {
    const wordLengths: number[] = [];
    const delimiters: UserFacingWordleData["layout"]["delimiters"] = [];
  
    const reg = /([^' -]+)|([' -])/g;
    let match;
    let wordCount = 0;

    while ((match = reg.exec(text)) !== null) {
        const word = match[1];
        const delimiter = match[2];

        if (word !== undefined) {
            wordLengths.push(word.length);
            wordCount++;
        } else if (delimiter !== undefined) {
            delimiters.push({
                after: wordCount,
                type: delimiter
            });
        }
    }

    return {
        wordLengths,
        delimiters
    } satisfies UserFacingWordleData["layout"];
}
