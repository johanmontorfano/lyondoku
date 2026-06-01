"use client";

import { Constraints } from "@/scripts/game_mgr/types";
import { CellData } from "./doku";
import { humanizeConstraint, humanizeRarity } from "@/scripts/game_mgr/humanize";
import { motion } from "framer-motion";
import React, { Suspense, useEffect, useState } from "react";

function _ConstraintCell(props: {
    constraint: Constraints,
    group: "row" | "column"
}) {
    const [isServer, setServer] = useState(true);

    useEffect(() => {
        setServer(false);
    }, []);

    return <div className={`bg-base-200 border-base-300 flex items-center ${
        props.group === "row" ?
            "rounded-l-[20%_50%]" :
            "rounded-t-[50%_20%]"
    } rounded-sm`}>
        <div className="mx-2 font-semibold text-[clamp(0.4rem,2.4cqi,0.85rem)]">
            {!isServer && <Suspense>
                {humanizeConstraint(props.constraint)}
            </Suspense>}
        </div>
    </div>;
}

export const ConstraintCell = React.memo(_ConstraintCell);

export function Cell(props: {
    data: CellData,
    onClick: () => void,
    disabled: boolean
}) {
    const [animation, setAnimation] = useState("");
    const [was, setWas] = useState({
        answered: !!props.data?.answer,
        disabled: props.disabled
    });

    useEffect(() => {
        if (was.disabled && !props.disabled && !props.data.answer)
            setAnimation("animate-flash-red");
        else if (was.disabled && !props.disabled && !!props.data.answer)
            setAnimation("animate-flash-green");
        setWas({
            answered: !!props.data?.answer,
            disabled: props.disabled
        });
        if (was.disabled && !props.disabled) {
            const timer = setTimeout(() => setAnimation(""), 1000);
            return () => clearTimeout(timer);
        }
    }, [props]);

    return <motion.div
        role="button"
        className={`w-full h-full ${!props.data?.answer ||
            props.data.validAnswers ? "cursor-pointer" : ""} ${animation} 
            border border-1 rounded-md dark:border-neutral-700 hover:bg-base-300 
            overflow-clip transition-colors ${props.disabled ?
                "bg-black dark:bg-neutral-500 opacity-30 pointer-events-none" : ""}
        `}
        onClick={() => {
            if (!props.data.answer || props.data.validAnswers.length > 0)
                props.onClick();
        }} 
    >
        {props.data?.score === 67 && <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 1, 0] }}
            transition={{ duration: 4 }}
            src="/67.gif"
        />}
        {props.data.answer && <div className="relative h-full">
            <p className="font-semibold text-[clamp(0.4rem,2.4cqi,0.85rem)] p-2">
                {props.data.answer.name}
            </p>
            <div className="absolute bottom-0 pointer-events-none w-full">
                <div className="flex gap-1 px-2">
                    {props.data.answer.connections
                        .filter(c => c[0] === "M")
                        .sort()
                        .map(c => <img
                             key={c}
                             className="w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"/lines/" + c + ".svg"}
                        />)}
                </div>
                <div className="flex gap-1 px-2">
                    {props.data.answer.connections
                        .filter(c => c[0] === "T" || c === "RX")
                        .sort((a, b) => {
                            if (a === "RX" || a > b) return 1;
                            if (a < b) return -1;
                            return 0;
                        })
                        .map(c => <img
                             key={c}
                             className="mt-1 w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"/lines/" + c + ".svg"}
                        />)}
                </div>
                <div className="flex gap-1 px-2">
                    {props.data.answer.connections
                        .filter(c => c.startsWith("NAVI") || c[0] === "F")
                        .sort()
                        .map(c => <img
                             key={c}
                             className="mt-1 w-[clamp(0.5rem,4cqi,2.2rem)]"
                             src={"/lines/" + c + ".svg"}
                        />)}
                </div>
                <p className="w-full text-center bg-base-200 py-0.5 text-[clamp(0.3rem,2.4cqi,0.65rem)] mt-1">
                    {
                        props.data.score
                    }% – {humanizeRarity(props.data.score)}
                </p>
            </div>
        </div>}
    </motion.div>
}
