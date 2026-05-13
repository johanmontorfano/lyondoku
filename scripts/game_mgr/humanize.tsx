import { ReactNode } from "react";
import { Constraints } from "./types";

import linesData from "@/public/data/lines.json";

export function humanizeConstraint(
    constraint: Constraints
): ReactNode | string {
    const [prop, op, val] = (constraint as unknown as string).split(":");
    const formatOr = (input: string): string => {
        if (!input) return "";

        const expressions = input.split("|").map(item => item.trim());
        if (expressions.length <= 1) return expressions[0] || "";

        const lastExpression = expressions.pop();
        return `${expressions.join(", ")} ou ${lastExpression}`;
    };
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
            if (op === "includes") return `Contient '${val}'`;
            if (op === "word-includes") return `Contient ${formatOr(val)}`;
            if (op === "wordlen")
                return `Comporte ${val} mot${parseInt(val) > 1 ? "s" : ""}`;
            if (op === "minwordlen") return `Comporte au moins ${val} mots`;
            break;
        case "nameCharacteristics":
            return `Fait référence à ${labels[val] || val}`;
        case "linesColor":
            const colorstl: Record<string, string> = {
                green: "verte",
                pink: "rose",
                blue: "bleue",
                red: "rouge",
                orange: "orange"
            };
            if (op === "includes")
                return <>
                    Sur une ligne {colorstl[val]}
                    <div className="flex flex-wrap gap-1">
                        {linesData.byColor[val as "green"].map((l: string) =>
                            <img
                                key={l}
                                src={"lines/" + l + ".svg"}
                                className="w-[clamp(0.5rem,4cqi,2.2rem)]"
                            />)}
                    </div>
                </>;
        case "linesType":
            if (labels[val])
                return `Sur le ${labels[val]}`;
            return `Sur une ligne de ${val}`;
        case "stationCharacteristics":
            return `Est ${labels[val] || val}`;
        case "stationBorough":
            return `Dans un arrondissement ${op === "odd" ? "impair" : "pair"}`;
        case "stationLocation":
            if (op === "not") return `Ne se situe pas à ${val}`;
            if (op === "equals") return `Se situe à ${val}`;
            if (op === "includes") return `Se situe à ${formatOr(val)}`;
            break;
        case "connections":
            if (!(val in labels) && isLineName(val))
                return <>
                    Sur la ligne
                    <img
                         src={"lines/" + val + ".svg"}
                         className="w-[clamp(0.5rem,4cqi,2.2rem)]"
                    />
                </> 
            return `Sur le ${labels[val] || val}`;
        case "terminus":
            if (op === "bool" && val === "True") return "Est un terminus";
            return "N'est pas un terminus";
    }
    return val;
}
