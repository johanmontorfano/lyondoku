"use client";

export function ResetProgress() {
    return <button className="btn btn-primary" onClick={() => {
        localStorage.clear();
    }}>
        Remettre la progession à zéro
    </button>
}
