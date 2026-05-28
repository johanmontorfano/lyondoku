import { WordleAnswer } from "@/scripts/game_mgr/types";
import { BsArrowDown } from "react-icons/bs";

export function WordleRow(props: WordleAnswer) {
    const isExactMatch = props.distanceWithAnswer === 0;

    return (
        <tr className="border-b [&>td]:p-3 font-semibold">
            <td className={isExactMatch ? "text-success-content" : "text-error-content"}>
                <p className="text-base mb-1 text-dyn-md">
                    {props.guess.name}
                </p>
            </td>
            <td>
                <div className="flex flex-wrap gap-1 justify-center">
                    {props.validLinesOnStation.sort().map((c) => (
                        <img
                            key={`${props.guess.id}-valid-${c}`}
                            className="img-w-dyn"
                            src={`/lines/${c}.svg`}
                             alt={`Ligne ${c}`}
                        />
                    ))}
                </div>
            </td>
            <td className={`p-2 text-center text-dyn-md ${
                props.cityMatch ? "text-success-content" : "text-error-content"
            }`}>
                {props.guess.stationLocation} {
                    props.guess.stationBorough > -1 ?
                        props.guess.stationBorough :
                        ""
                }
            </td>
            <td className={isExactMatch ? "text-success-content" : "text-error-content"}>
                <div className="flex items-center justify-end gap-1.5">
                    <span className="text-dyn-md whitespace-nowrap">
                        {props.distanceWithAnswer === 0 ? "Exact" : `${
                            props.distanceWithAnswer
                                .toFixed(2)
                                .replace(".", ",")
                        } km`}
                    </span>
                    {props.distanceWithAnswer > 0 && (
                        <BsArrowDown
                            style={{
                                rotate: `${
                                    props.cardinalDirectionTowardsAnswer
                                }deg`
                            }}
                            size={14}
                        />
                    )}
                </div>
            </td>
        </tr>
    );
}
