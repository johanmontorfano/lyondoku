"use client";

import { ValidDatasetsNames } from "./types";

async function retrieveDataset(name: ValidDatasetsNames) {
    try {
        const res = await fetch("/api/data?name=" + name);
        if (!res.ok) throw new Error("Request failed: " + res.status);

        const payload = await res.json();
        if (!("data" in payload)) throw new Error("invalid body");

        try {
            localStorage.setItem("dataset_" + name, JSON.stringify({
                retrievedOn: Date.now(),
                payload: payload.data
            }));
        } catch (e) {
            console.warn("failed to cache dataset in localStorage:", e);
        }
        return payload.data;
    } catch (e) {
        console.error("failed to retrieve dataset from server:", e);
        return null;
    }
}

export async function getDataset(name: ValidDatasetsNames) {
    if (typeof window === "undefined") return null;
    try {
        const cachedItem = localStorage.getItem("dataset_" + name);
        
        if (cachedItem !== null) {
            const dataset = JSON.parse(cachedItem);
            if (dataset &&
                typeof dataset.retrievedOn === "number" &&
                dataset.payload
            ) {
                if (!(Date.now() - dataset.retrievedOn >= 60 * 60 * 3 * 1000))
                    return dataset.payload;
            }
        }
    } catch (e) {
        console.warn("failed to read from localStorage", e);
    }
    return await retrieveDataset(name);
}
