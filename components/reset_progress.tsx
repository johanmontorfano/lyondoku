"use client";

import { useEffect, useState } from "react";

export function ResetProgress() {
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        setDisabled(!localStorage.length);
        // we periodically check if local storage is still empty
        const interval = setInterval(() => {
            setDisabled(!localStorage.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return <button className="btn" disabled={disabled} onClick={() => {
        localStorage.clear();
        window.location.reload();
    }}>
        Remettre la progession à zéro
    </button>
}

export function ResetProgressShortcut() {
    useEffect(() => {
        const targetSequence = ["d", "r", "p"];
        let keyBuffer: string[] = [];

        function listener(ev: KeyboardEvent) {
            const hasModifier = ev.ctrlKey || ev.metaKey;
            if (!hasModifier) {
                keyBuffer = [];
                return;
            }

            const pressedKey = ev.key.toLowerCase();
            const nextExpectedKey = targetSequence[keyBuffer.length];

            if (pressedKey === nextExpectedKey) {
                keyBuffer.push(pressedKey);

                if (keyBuffer.length === targetSequence.length) {
                    keyBuffer = [];
                    ev.preventDefault();
                    localStorage.clear();
                    window.location.reload();
                }
            } else {
                keyBuffer =
                    pressedKey === targetSequence[0] ? [pressedKey] : [];
            }
        }

        window.addEventListener("keydown", listener);
        return () => {
            window.removeEventListener("keydown", listener);
        };
    }, []);

    return null;
}
