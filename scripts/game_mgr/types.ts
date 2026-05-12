// this file contains all the types about a game/grid

// this explicitly defines all valid constraints integrated into the
// dataset
// NOTE: the constraints have a programatic format that can be executed, much
// like a regex. It is formatted as <station_target_prop>:<param>
export const constraints = [
    "name:includes:u",
    "name:includes:p",
    "name:includes:v",

    "name:includes:Rue",
    "name:includes-either:Lycée|ENS|Université|IUT",

    "name:wordlen:1",
    "name:minwordlen:2",

    "nameCharacteristics:includes:historicalFigure",

    "linesType:includes:tram",
    "linesType:includes:metro",
    "linesType:includes:funicular",

    "stationCharacteristics:includes:std",
    "stationCharacteristics:includes:terminus",

    "stationBorough:odd",
    "stationBorough:even",

    "stationLocation:equals:Lyon",
    "stationLocation:equals:Villeurbanne",
    "stationLocation:either:Vénissieux|St-Priest",
    "stationLocation:either:Lyon|Villeurbanne",

    "stationConnection:includes:MA",
    "stationConnection:includes:MB",
    "stationConnection:includes:MC",
    "stationConnection:includes:MD",

    "stationConnection:includes:T1",
    "stationConnection:includes:T2",
    "stationConnection:includes:T3",
    "stationConnection:includes:T4",
    "stationConnection:includes:T5",
    "stationConnection:includes:T6",
    "stationConnection:includes:T7",
    "stationConnection:includes:RX",

    "stationConnection:includes:F1",
    "stationConnection:includes:F2",

    "stationConnection:includes:SNCF",

    "stationConnection:includes:greenLine",
    "stationConnection:includes:pinkLine",
    "stationConnection:includes:blueLine",
] as const;
export type Constraints = typeof constraints;

// a line (either row or column) is a member of a grid, it defines the
// constraints of the answer of a specific line
export interface Station {
    name: string;
    nameCharacteristics: "historicalFigure"[];
    
    linesType: "tram" | "metro" | "funicular";
    // NOTE: connections includes actual lines and lines groups, such as
    // greenLine
    connections: string[];
    stationCharacteristics: ("std" | "terminus" | "centralPlatform")[];

    location: string;
    // NOTE: when the station is outside of Lyon, we default to odd
    stationBorough: "odd" | "even";
    stationLocation: string;
}
