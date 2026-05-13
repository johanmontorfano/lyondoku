// this file contains all the types about a game/grid

// this explicitly defines all valid constraints integrated into the
// dataset
// NOTE: the constraints have a programatic format that can be executed, much
// like a regex. It is formatted as <station_target_prop>:<param>
export type Constraints = string;

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
