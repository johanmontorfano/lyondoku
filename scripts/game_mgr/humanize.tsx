import { Constraints, Station } from "./types";
import linesData from "@/public/data/lines.json";

export async function humanizeConstraint(
    constraint: Constraints
) {
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
        det: "déterminants",
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
            str.startsWith("NAVI") || str === "RX";
    }

    switch (prop) {
        case "name":
            if (op === "includes") return `Contient '${val}'`;
            if (op === "word-includes") return `Contient ${formatOr(val)}`;
            if (op === "wordlen")
                return `Comporte seulement ${val} mot${parseInt(val) > 1 ? "s" : ""}`;
            if (op === "minwordlen") return `Comporte au moins ${val} mots`;
            break;
        case "nameCharacteristics":
            if (val === "historicalFigure")
                return "Fait référence à une figure historique"
            else if (val === "det")
                return "Comporte au moins un déterminant"
            break;
        // NOTE: THIS PROPERTY IS SPECIAL AS NO METHOD APPLIES TO IT
        case "near":
        case "notNear":
            const distance = parseInt(op);
            const place = val.split("->")[0];
            const prefix = distance.toString()[0] === "1" ? "d'" : "de ";

            return `À moins ${prefix}${
                (distance / 1000).toString().replace(".", ",")
            }km ${place}`;
        // NOTE: this one too
        case "farFromStation":
            const distanceFfs = parseInt(op);
            const stationFfsRes = await fetch("/api/data/station?id=" + val);

            if (!stationFfsRes.ok)
                return "Erreur (code: station-retrieval-issue)";

            const stationffs = await stationFfsRes.json() as Record<
                "station", Station
            >;
            const prefixffs = distanceFfs.toString()[0] === "1" ? "d'" : "de ";

            return <>
                <p>À plus {prefixffs}{
                    (distanceFfs / 1000).toString().replace(".", ",")
                }km de {stationffs.station.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {stationffs.station.connections.sort().map((l: string) =>
                        <img
                            key={"ffs-" + l}
                            src={"/lines/" + l + ".svg"}
                            className="w-[clamp(0.5rem,4cqi,2.2rem)]"
                        />)}
                </div>
            </>
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
                        {linesData.byColor[val as "green"].sort().map((l: string) =>
                            <img
                                key={l}
                                src={"/lines/" + l + ".svg"}
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
        case "borough":
            return `Dans le ${val}${val === "1" ? "er" : "ème"} arrondissement`;
        case "city":
            if (op === "not") return `Ne se situe pas à ${formatOr(val)}`;
            if (op === "equals") return `Se situe à ${val}`;
            if (op === "includes") return `Se situe à ${formatOr(val)}`;
            break;
        case "connections":
            if (!(val in labels) && isLineName(val))
                return <>
                    Sur la ligne
                    <img
                         src={"/lines/" + val + ".svg"}
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

export function humanizeRarity(rarity: number) {
    if (rarity > 79) return "très rare";
    else if (rarity > 50) return "rare";
    else if (rarity > 30) return "peu commun";
    return "commun";
}
