import { Constraints } from "./types";

export function humanizeConstraint(constraint: Constraints): string {
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
            return `Correspond avec le ${labels[val] || val}`;
        case "stationCharacteristics":
            return `Est ${labels[val] || val}`;
        case "stationBorough":
            return `Dans un arrondissement ${op === "odd" ? "impair" : "pair"}`;
        case "stationLocation":
            if (op === "equals") return `Se situe à ${val}`;
            if (op === "either") return `Se situe à ${formatOr(val)}`;
            break;
        case "stationConnection":
            const connection = labels[val] || `la ligne ${val}`;
            return `Sur la ${connection}`;
    }

    return "??";
}
