import { WordleAnswer } from "@/scripts/game_mgr/types";
import { BsArrowDown } from "react-icons/bs";

export function WordleRowSkeleton() {
    return <>
        <div className="bg-base-200 p-1 h-12 pb-3 md:pb-2 md:p-2 border-r border-t border-base-content/20" />
        <div className="flex flex-wrap gap-1 border-r border-t p-1 md:p-2 border-base-content/20" />
        <div className="flex flex-wrap gap-1 border-r border-t p-1 md:p-2 border-base-content/20" />
        <div className="flex flex-wrap gap-1 border-t p-1 md:p-2 border-base-content/20" />
    </>

}

export function WordleRow(props: WordleAnswer) {
    const isExactMatch = props.distanceWithAnswer === 0;

    return (
        <tr className="text-dyn-sm border-b [&>td]:p-3">
            <td className={isExactMatch ?
                "bg-success/40 text-success-content" : "bg-error/40"
            }>
                <p className="text-base mb-1 text-dyn-md">
                    {props.guess.name}
                </p>
                <div className="flex flex-wrap gap-1">
                    {props.guess.connections.sort().map((c) => (
                        <img
                            key={`${props.guess.id}-conn-${c}`}
                            className="img-w-dyn"
                            src={`/lines/${c}.svg`}
                            alt={`Ligne ${c}`}
                        />
                    ))}
                </div>
            </td>
            <td className={
                props.validLinesOnStation.length > 0 ?
                    "bg-success/40" : "bg-error/40"
            }>
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
            <td className={`p-2 text-center text-dyn-sm ${
                props.cityOrBoroughMatch ? "bg-success/40" : "bg-error/40"
            }`}>
                {props.guess.stationLocation}
            </td>
            <td className={isExactMatch ?
                "bg-success/40" :
                "bg-error/40"
            }>
                <div className="flex items-center justify-end gap-1.5">
                    <span className="text-dyn-sm">
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
