import { ReactNode } from "react";
import { Constraints } from "./types";

import linesData from "@/public/data/lines.json";

export function humanizeConstraint(
    constraint: Constraints
): ReactNode | string {
    const [prop, op, val] = (constraint as unknown as string).split(":");
    const formatOr = (input: string) => input?.replace(/\|/g, " ou ");
    const labels: Record<string, string> = {
        historicalFigure: "une figure historique",
        tram: "tramway",
        metro: "métro",
        funicular: "funiculaire",
        std: "station classique",
        terminus: "terminus",
        SNCF: "réseau SNCF",
    };

    // determines if a string is about a line, thus if it starts with M T or F
    function isLineName(str: string) {
        return ("MTF".includes(str[0]) && str.length === 2) ||
            str.startsWith("NAVI");
    }

    switch (prop) {
        case "name":
            if (op === "includes") return `Contient "${val}"`;
            if (op === "includes-either") return `Content "${formatOr(val)}"`;
            if (op === "wordlen") return `Comporte ${val} mot(s)`;
            if (op === "minwordlen") return `Comporte au moins ${val} mots`;
            break;
        case "nameCharacteristics":
            return `Fait référence à ${labels[val] || val}`;
        case "linesType":
            if (labels[val])
                return `Sur le ${labels[val]}`;
            return `Correspond avec le ${val}`;
        case "stationCharacteristics":
            return `Est ${labels[val] || val}`;
        case "stationBorough":
            return `Dans un arrondissement ${op === "odd" ? "impair" : "pair"}`;
        case "stationLocation":
            if (op === "equals") return `Se situe à ${val}`;
            if (op === "either") return `Se situe à ${formatOr(val)}`;
            break;
        case "stationConnection":
            if (!(val in labels) && isLineName(val)) {
                return <>
                    Sur la ligne
                    <img
                        width={30}
                         src={"lines/" + val + ".svg"}
                         className="mt-1"
                    />
                </>
            } else if (val.endsWith("Line")) { // dealing with color
                return <>
                    Sur une des lignes
                    {linesData.byColor[val.replace("Line", "") as "green" | "blue" | "pink"].map((l: string) =>
                        <img
                            key={l}
                            width={30}
                            src={"lines/" + l + ".svg"}
                            className="mt-1"
                        />)}
                </>
            }
            return `Sur le ${labels[val] || val}`;
    }
    return "??";
}
