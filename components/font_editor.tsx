"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

export function FontEditor() {
    const [show, setShow] = useState(false);
    const [selectedFont, setSelectedFont] = useState("Space Grotesk");
    const [targetVariable, setTargetVariable] = useState("--font-grotesk");

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const panelRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const targetSequence = ["d", "k", "b", "g"];
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
                    setShow((prev) => !prev);
                    keyBuffer = [];
                    ev.preventDefault();
                }
            } else {
                keyBuffer = pressedKey === targetSequence[0] ? [pressedKey] : [];
            }
        }

        window.addEventListener("keydown", listener);
        return () => {
            window.removeEventListener("keydown", listener);
        };
    }, []);


    useEffect(() => {
        setSelectedFont("");
    }, [targetVariable]);

    useEffect(() => {
        if (selectedFont === "") return;

        const linkId = "dynamic-font-tester" + targetVariable;
        let linkElement = document.getElementById(linkId) as HTMLLinkElement;

        if (!linkElement) {
            linkElement = document.createElement("link");
            linkElement.id = linkId;
            linkElement.rel = "stylesheet";
            document.head.appendChild(linkElement);
        }

        let formattedFontName;

        try {
            const url = new URL(selectedFont);
            formattedFontName = url.pathname.split("/").reverse()[0];
        } catch (_) {
            formattedFontName = selectedFont.replace(/\s+/g, "+");
        }
        linkElement.href = `https://fonts.googleapis.com/css2?family=${
            formattedFontName
        }:wght@400;700&display=swap`;

        document.documentElement.style.setProperty(
            targetVariable,
            selectedFont,
        );
    }, [selectedFont]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // prevent dragging if interacting with inputs, selects, or buttons
        if (
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLSelectElement ||
            e.target instanceof HTMLButtonElement
        ) {
            return;
        }

        isDragging.current = true;
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
        });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const formData = new FormData(ev.currentTarget);
        const fontInput = formData.get("fontName") as string;
        if (fontInput) setSelectedFont(fontInput);
    };

    return show && (
        <div
            ref={panelRef}
            onMouseDown={handleMouseDown}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
            className="fixed bottom-5 right-5 z-[99999] w-64 rounded-xl border border-base-300 bg-base-200 p-5 shadow-2xl text-base-content cursor-grab active:cursor-grabbing select-none"
        >
            <div className="flex justify-center mb-1 opacity-40">
                <div className="w-8 h-1 rounded-full bg-base-content/40" />
            </div>
            <h3 className="mb-4 text-center text-base font-semibold tracking-wide">
                Font Playground
            </h3>
            <div className="form-control mb-3 w-full">
                <label className="label py-1">
                    <span className="label-text-alt text-xs font-bold uppercase tracking-wider opacity-60">
                        Modify Variable
                    </span>
                </label>
                <select
                    value={targetVariable}
                    onChange={(e) => setTargetVariable(e.target.value)}
                    className="select select-bordered select-sm w-full bg-base-300 focus:outline-none"
                >
                    <option value="--font-grotesk">
                        --font-grotesk
                    </option>
                    <option value="--font-mono">
                        --font-mono
                    </option>
                    <option value="--font-mono">
                        --font-serif
                    </option>
                </select>
            </div>
            <form onSubmit={handleSubmit} className="form-control w-full">
                <label className="label py-1">
                    <span className="label-text-alt text-xs font-bold uppercase tracking-wider opacity-60">
                        Choose Font
                    </span>
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="fontName"
                        placeholder="e.g., Inter, Roboto"
                        className="input input-bordered input-sm w-full bg-base-300 focus:outline-none"
                    />
                    <button type="submit" className="btn btn-primary btn-sm normal-case">
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
}
