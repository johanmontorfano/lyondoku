"use client";

import { useEffect, useState } from "react";

export function ResetProgress() {
    const [disabled, setDisabled] = useState(!localStorage.length);

    useEffect(() => {
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
