export interface DokuData {
    id: string;
    createdAt: number;
    rows: [Constraints, Constraints, Constraints],
    cols: [Constraints, Constraints, Constraints],
    // tl tc tr cl cc cr bl bc br
    validAnswers: { [cell: string]: number[] }
    scoring: { [cell: string]: number }
}
export type UserFacingDokuData = Omit<DokuData, "validAnswers"> & {
    validAnswersCount: { [cell: string]: number }
};

export interface GuessrData {
    answerId: number;
}

export interface WordleData {
    answerId: number;
    name: string;
}

export type UserFacingWordleData = Omit<WordleData, "name"> & {
    layout: {
        wordLengths: number[],
        delimiters: { after: number, type: string }[]
    }
}

// this explicitly defines all valid constraints integrated into the
// dataset
// NOTE: the constraints have a programatic format that can be executed, much
// like a regex. It is formatted as <station_target_prop>:<param>
export type Constraints = string;

// a line (either row or column) is a member of a grid, it defines the
// constraints of the answer of a specific line
export interface Station {
    id: number;
    name: string;
    nameCharacteristics: ("historicalFigure" | "det")[];
    
    linesType: ("tram" | "metro" | "funicular")[];
    // NOTE: connections includes actual lines and lines groups, such as
    // greenLine
    connections: string[];
    stationCharacteristics: "std"[];

    street: string[];
    lat: number;
    lon: number;
    // NOTE: when the station is outside of Lyon, we default to -1
    borough: number[];
    city: string[];
    terminus: boolean;
    cognitiveScore: number;
    finalScore: number;
    stopsId: number[];
}

export interface GuessrAnswer {
    guess: Station;
    validLinesOnStation: string[];
    cityMatch: string[];
    distanceWithAnswer: number;
    cardinalDirectionTowardsAnswer: number;
}

export enum LetterPosition {
    Valid,
    Misplaced,
    Invalid
}
