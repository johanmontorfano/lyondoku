import { Constraints } from "./types";

export function humanizeConstraint(constraint: Constraints): string {
    const [prop, op, val] = (constraint as unknown as string).split(":");
    
    // Utilitaire pour transformer "Lycée|ENS" en "Lycée ou ENS"
    const formatOr = (input: string) => input?.replace(/\|/g, " ou ");

    // Cartographie des caractéristiques pour des noms plus naturels
    const labels: Record<string, string> = {
        historicalFigure: "un personnage historique",
        tram: "le tramway",
        metro: "le métro",
        funicular: "le funiculaire",
        std: "une station classique",
        terminus: "un terminus",
        SNCF: "le réseau SNCF",
    };

    switch (prop) {
        case "name":
            if (op === "includes") return `Le nom de la station contient "${val}"`;
            if (op === "includes-either") return `Le nom de la station contient "${formatOr(val)}"`;
            if (op === "wordlen") return `Le nom de la station est composé d'exactement ${val} mot(s)`;
            if (op === "minwordlen") return `Le nom de la station comporte au moins ${val} mots`;
            break;

        case "nameCharacteristics":
            return `Le nom de la station fait référence à ${labels[val] || val}`;

        case "linesType":
            return `La station est desservie par ${labels[val] || val}`;

        case "stationCharacteristics":
            return `La station est ${labels[val] || val}`;

        case "stationBorough":
            return `L'arrondissement de la station est ${op === "odd" ? "impair" : "pair"}`;

        case "stationLocation":
            if (op === "equals") return `La station se situe à ${val}`;
            if (op === "either") return `La station se situe à ${formatOr(val)}`;
            break;

        case "stationConnection":
            const connection = labels[val] || `la ligne ${val}`;
            return `La station est en correspondance avec ${connection}`;
    }

    return constraint; // Retourne la contrainte brute si aucune règle ne correspond
}
