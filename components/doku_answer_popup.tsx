"use client";
import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { BsX } from "react-icons/bs";

export const useStationSelectorPopup = create<{
    show: boolean;
    // when this variable is set, the popup will only show those stations
    showSpecificStationsReadonly: number[] | null;
    lastSelected: number | null;
    placeholder: string;
    // stations are saved this way since the server only provides ids
    stations: Record<number, string>;
    // used for all stations that are already used in answers
    forbiddenStations: number[];
    setShowSpecificStationsReadonly(stations: number[] | null): void;
    setLastSelected(selected: number | null): void;
    setPlaceholder(placeholder: string): void;
    setStations(stations: Record<number, string>): void;
    setForbiddenStations(forbiddenStations: number[]): void;
    setShow(state: boolean): void;
}>((update) => {
    return {
        show: false,
        lastSelected: null,
        placeholder: "",
        stations: {},
        forbiddenStations: [],
        showSpecificStationsReadonly: null,
        setStations(stations) {
            update({ stations });
        },
        setForbiddenStations(forbiddenStations) {
            update({ forbiddenStations });
        },
        setShowSpecificStationsReadonly(stations) {
            update({ showSpecificStationsReadonly: stations });
        },
        setPlaceholder(placeholder) {
            update({ placeholder });
        },
        setLastSelected(selected) {
            update({ lastSelected: selected });
        },
        setShow(state) {
            update({ show: state });
        },
    };
});

export function StationSelectorPopup() {
    const state = useStationSelectorPopup();

    const [search, setSearch] = useState("");
    const [activeMatch, setActiveMatch] = useState(-1);

    const matches = useMemo(() => {
        setActiveMatch(-1);
        if (search.trim() === "") return [];
        return Object.entries(state.stations).filter((s) =>
            s[1].toLowerCase().includes(search.toLowerCase()) &&
            !state.forbiddenStations.includes(parseInt(s[0]))
        );
    }, [search, state.stations]);

    useEffect(() => {
        setSearch("");
        if (!state.show)
            state.setForbiddenStations([]);
    }, [state.show]);

    const handleKeyDown = (ev: React.KeyboardEvent) => {
        if (ev.key === "ArrowDown") {
            ev.preventDefault();
            setActiveMatch((prev) =>
                prev < matches.length - 1 ? prev + 1 : prev,
            );
        } else if (ev.key === "ArrowUp") {
            ev.preventDefault();
            setActiveMatch((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (ev.key === "Enter" && matches[activeMatch]) {
            setSearch("");
            state.setLastSelected(parseInt(matches[activeMatch][0]));
            state.setShow(false);
        } else if (ev.key === "Escape") {
            state.setShow(false);
        }
    };

    return (
        <AnimatePresence>
            {state.show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 w-full h-dvh z-50 flex justify-center bg-black/40 items-start"
                    onClick={() => state.setShow(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="bg-base-100 shadow-2xl max-w-[450px] w-full rounded-2xl overflow-hidden border border-base-300 mt-5 mx-5"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        <div className="px-4 pt-2 flex justify-end">
                            <button className="btn btn-sm btn-ghost btn-circle" onClick={() => {
                                state.setShow(false);
                            }}>
                                <BsX size={20} />
                            </button>
                        </div>
                        {state.showSpecificStationsReadonly === null &&
                            <div className="p-4 border-b border-base-200">
                                <input
                                    autoFocus
                                    type="text"
                                    className="input input-bordered input-primary w-full"
                                    placeholder={state.placeholder}
                                    value={search}
                                    onChange={(ev) => setSearch(ev.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        }
                        {(search.length > 0 ||
                            state.showSpecificStationsReadonly !== null) && <div className="max-h-[60dvh] overflow-y-auto overflow-x-hidden p-2">
                            <ul className="menu w-full p-0 gap-1">
                                <AnimatePresence mode="popLayout">
                                    {matches.map((station, i) => (
                                        <motion.li
                                            key={station[1]}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="relative"
                                        >
                                            <button
                                                className={`flex justify-between items-center py-3 px-4 rounded-xl transition-colors ${
                                                    activeMatch === i
                                                        ? "text-primary-content"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    state.setLastSelected(
                                                        parseInt(station[0])
                                                    );
                                                    state.setShow(false);
                                                }}
                                                onMouseEnter={() =>
                                                    setActiveMatch(i)
                                                }
                                            >
                                                <span className="relative z-10 font-medium">
                                                    {station[1]}
                                                </span>

                                                {/* The Sliding Highlight */}
                                                {activeMatch === i && (
                                                    <motion.div
                                                        layoutId="active-pill"
                                                        className="absolute inset-0 bg-primary rounded-xl z-0"
                                                        transition={{
                                                            type: "spring",
                                                            bounce: 0.2,
                                                            duration: 0.6,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                                {state.showSpecificStationsReadonly?.map(id => (
                                        <li key={state.stations[id]}>
                                            <p className="flex justify-between items-center py-3 px-4 rounded-xl transition-colors text-medium">
                                                {state.stations[id]}
                                            </p>
                                        </li>
                                    ))}
                                {search && matches.length === 0 && (
                                    <div className="p-8 text-center text-base-content/50 italic">
                                        No stations found for "{search}"
                                    </div>
                                )}
                            </ul>
                        </div>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
