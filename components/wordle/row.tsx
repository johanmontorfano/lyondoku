import { WordleAnswer } from "@/scripts/game_mgr/types";
import { BsArrowDown } from "react-icons/bs";

export function WordleRowSkeleton() {
    console.log("hello");

    return <>
        <div className="bg-base-200 p-1 h-12 pb-3 md:pb-2 md:p-2 border-r border-t border-base-content/20" />
        <div className="flex flex-wrap gap-1 border-r border-t p-1 md:p-2 border-base-content/20" />
        <div className="flex flex-wrap gap-1 border-r border-t p-1 md:p-2 border-base-content/20" />
        <div className="flex flex-wrap gap-1 border-t p-1 md:p-2 border-base-content/20" />
    </>

}

export function WordleRow(props: WordleAnswer) {
    const winningRow = props.distanceWithAnswer === 0;

    return <>
        <div className={
            (winningRow ? "bg-success text-base-200" : "bg-base-200") +
            " p-1 pb-3 md:pb-2 md:p-2 border-r border-t border-base-content/20"
        }>
            <p className="font-semibold text-dyn-lg">
                {props.guess.name}
            </p>
            <div className="flex flex-wrap gap-1">
                {props.guess.connections.sort().map((c) => (
                    <img
                        key={props.guess.id + "-conn-" + c}
                        className="img-w-dyn"
                        src={`/lines/${c}.svg`}
                    />
                ))}
            </div>
        </div>
        <div className={
            (winningRow ? "bg-success/70 text-base-100" : "") +
            " flex flex-wrap gap-1 border-r border-t p-1 md:p-2 border-base-content/20"
        }>
            {props.validLinesOnStation.sort().map((c) => (
                <img
                    key={props.guess.id + "-valid-" + c}
                    className="img-w-dyn"
                    src={`/lines/${c}.svg`}
                />
            ))}
        </div>
        <div className={
            (winningRow ?
                "bg-success/70 text-base-100" :
                (props.cityOrBoroughMatch ? "text-success" : "text-error")
            ) +
            " border-r border-t p-1 md:p-2 border-base-content/20 text-dyn-md"
        }>
            {props.guess.stationLocation}
        </div>
        <div className={
            (winningRow ? "bg-success/70 text-base-100" : "") +
            " flex justify-between border-t border-base-content/20 gap-2 p-1 md:p-2 text-dyn-md"
        }>
            <span>
                {props.distanceWithAnswer.toFixed(2).replace(".", ",")}km
            </span>
            <BsArrowDown style={{
                transform: `rotate(${
                    props.cardinalDirectionTowardsAnswer
                }deg)`
            }} />
        </div>
    </>
}
