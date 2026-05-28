// this file contains all the types about a game/grid/wordle

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
    nameCharacteristics: "historicalFigure"[];
    
    linesType: "tram" | "metro" | "funicular";
    // NOTE: connections includes actual lines and lines groups, such as
    // greenLine
    connections: string[];
    stationCharacteristics: ("std" | "terminus" | "centralPlatform")[];

    location: string;
    lat: number;
    lon: number;
    // NOTE: when the station is outside of Lyon, we default to -1
    stationBorough: number;
    stationLocation: string;
    terminus: boolean;
}

export interface WordleAnswer {
    guess: Station;
    validLinesOnStation: string[];
    cityMatch: boolean;
    distanceWithAnswer: number;
    cardinalDirectionTowardsAnswer: number;
}
