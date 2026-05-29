import { UserFacingGuessData } from "@/scripts/game_mgr/game";
import { LetterPosition } from "@/scripts/game_mgr/types";
import { ChangeEvent, KeyboardEvent, useEffect, useRef } from "react";

export function CharInput(props: {
    value: string[],
    layout: UserFacingGuessData["layout"],
    locked: LetterPosition[],
    onChange: (inputs: string[]) => void,
    disabled: boolean
}) {
    const totalLength = props.layout.wordLengths.reduce((p, c) => p + c, 0);
    const inputRefs = useRef<HTMLInputElement[]>([]);

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, totalLength);
    }, [totalLength]);

    function focusNext(currentIdx: number) {
        if (currentIdx >= totalLength - 1) return;
        
        const nextUnlockedIdx = props.locked.findIndex(
            (locked, i) => locked !== LetterPosition.Valid && i > currentIdx,
        );

        if (nextUnlockedIdx !== -1 && inputRefs.current[nextUnlockedIdx]) {
            inputRefs.current[nextUnlockedIdx].focus();
        }
    }

    function focusPrev(currentIdx: number) {
        if (currentIdx <= 0) return;

        // find the closest previous input that isn't valid 
        const prevUnlockedIdx = [...props.locked]
            .map((locked, idx) => ({ locked, idx }))
            .slice(0, currentIdx)
            .reverse()
            .find((item) => item.locked !== LetterPosition.Valid)?.idx;

        if (prevUnlockedIdx !== undefined && inputRefs.current[prevUnlockedIdx]) {
            inputRefs.current[prevUnlockedIdx].focus();
        }
    }

    function onInput(e: ChangeEvent<HTMLInputElement>, idx: number) {
        const val = e.target.value.toUpperCase().slice(-1);
        const newInputs = [...props.value];
        newInputs[idx] = val;
        
        props.onChange(newInputs);
        if (val) queueMicrotask(() => focusNext(idx));
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>, idx: number) {
        if (e.key === "Backspace") {
            const newInputs = [...props.value];

            if (props.value[idx] !== "") {
                newInputs[idx] = "";
                props.onChange(newInputs);
            } else {
                focusPrev(idx);
            }
        }
    }

    return (
        <div className="flex flex-wrap justify-center gap-6 mb-8">
            {props.layout.wordLengths.map((length, i) => {
                const wordOffset = props.layout.wordLengths
                    .slice(0, i)
                    .reduce((acc, len) => acc + len, 0);

                return (<>
                    <div key={i} className="flex flex-wrap justify-center gap-1 lg:gap-2 p-1 lg:p-2 bg-base-300 rounded-xl">
                        {Array.from({ length }).map((_, j) => {
                            const idx = wordOffset + j;
                            const status = props.locked[idx];
                            const isValid = status === LetterPosition.Valid;

                            return (
                                <input
                                    key={idx}
                                    ref={(el) => {
                                        inputRefs.current[idx] = el!;
                                    }}
                                    type="text"
                                    maxLength={1}
                                    value={props.value[idx] || ""}
                                    disabled={isValid || props.disabled}
                                    onChange={(e) => onInput(e, idx)}
                                    onKeyDown={(e) => onKeyDown(e, idx)}
                                    className={`w-9 h-10.5 lg:w-10 lg:h-12.5 text-center text-xl font-bold uppercase rounded-lg border-2 transition-all focus:outline-none
                                        ${
                                            isValid
                                                ? "bg-success text-success-content border-success scale-95"
                                                : status === LetterPosition.Misplaced
                                                ? "bg-warning text-warning-content border-warning"
                                                : "bg-base-100 border-base-content/20 focus:border-primary text-base-content"
                                        }
                                    `}
                                />
                            );
                        })}
                    </div>
                    <div className="flex items-center">
                        {props.layout
                            .delimiters
                            .filter(d => d.after === i + 1)
                            .map(d => (
                                <p>{d.type}</p>
                            ))}
                    </div>
                </>);
            })}
        </div>
    );
}
