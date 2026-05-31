"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { create } from "zustand";

export const useRuledPopupContext = create<{
    currentRule: string | null;
    setCurrentRule(rule: string | null): void;
}>((update) => ({
    currentRule: null,
    setCurrentRule(rule) {
        update({ currentRule: rule });
    },
}));

// shows a popup if a key is not present in local storage
export function RuledPopup(props: { rule: string, children: ReactNode }) {
    const [show, setShow] = useState(false);
    const popupCtx = useRuledPopupContext();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const shouldShow = localStorage.getItem(props.rule) === null;

        if (shouldShow) {
            popupCtx.setCurrentRule(props.rule);
            setShow(shouldShow);
        }
        return () => popupCtx.setCurrentRule(null);
    }, []);

    useEffect(() => {
        popupCtx.setCurrentRule(show ? props.rule : null);
    }, [show]);


    useEffect(() => {
        if (popupCtx.currentRule === props.rule)
            setShow(true);
    }, [popupCtx.currentRule]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 w-full h-dvh z-50 bg-black/40 flex justify-center items-center"
                    onClick={() => {
                        // we don't acknowledge here as the user did not gave
                        // consent to hide the popup forever
                        setShow(false);
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="bg-base-100 shadow-2xl max-w-[500px] w-full rounded-2xl overflow-hidden border border-base-300 mt-5 mx-5"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        <div className="p-4">
                            {props.children}
                        </div>
                        <br />
                        <div className="px-4 pb-4 gap-2 flex justify-end items-center">
                            <button
                                className="btn"
                                onClick={() => {
                                    localStorage.setItem(props.rule, "ok");
                                    setShow(false);
                                }}
                            >Ne plus afficher</button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShow(false)}
                            >OK</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

}
