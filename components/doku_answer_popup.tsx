"use client";
import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { BsX } from "react-icons/bs";

export const useStationSelectorPopup = create<{
    show: boolean;
    // when this variable is set, the popup will only show those stations
    showSpecificStationsReadonly: string[] | null;
    lastSelected: string | null;
    placeholder: string;
    stations: string[];
    setShowSpecificStationsReadonly(stations: string[] | null): void;
    setLastSelected(selected: string): void;
    setPlaceholder(placeholder: string): void;
    setStations(stations: string[]): void;
    setShow(state: boolean): void;
}>((update) => {
    return {
        show: false,
        lastSelected: null,
        placeholder: "",
        stations: [],
        showSpecificStationsReadonly: null,
        setStations(stations) {
            update({ stations });
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
        return state.stations.filter((s) =>
            s.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search, state.stations]);

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
            state.setLastSelected(matches[activeMatch]);
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
                    className="absolute top-0 left-0 w-full h-dvh z-50 flex items-center justify-center bg-black/40"
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
                        className="bg-base-100 shadow-2xl max-w-[450px] w-full rounded-2xl overflow-hidden border border-base-300"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        <div className="px-4 py-2 flex justify-end">
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
                                            key={station}
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
                                                        station,
                                                    );
                                                    state.setShow(false);
                                                }}
                                                onMouseEnter={() =>
                                                    setActiveMatch(i)
                                                }
                                            >
                                                <span className="relative z-10 font-medium">
                                                    {station}
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
                                {state.showSpecificStationsReadonly?.map(station => (
                                        <li key={station}>
                                            <p className="flex justify-between items-center py-3 px-4 rounded-xl transition-colors text-medium">
                                                {station}
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
