"use client";

import { ValidDatasetsNames } from "./types";

// Will retrieve a dataset from the server and save it properly
async function retrieveDataset(name: ValidDatasetsNames) {
    try {
        const res = await fetch("/api/data?name=" + name);

        if (!res.ok) throw new Error("Request failed: " + res.status);

        const payload = await res.json();

        if (!("data" in payload)) throw new Error("Invalid response");

        localStorage.setItem("dataset_" + name, JSON.stringify({
            retrievedOn: Date.now(),
            payload: payload.data
        }));
        return payload.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getDataset(name: ValidDatasetsNames) {
    if (typeof window === "undefined") return null;
    if (("dataset_" + name) in localStorage) {
        const dataset = JSON.parse(localStorage.getItem("dataset_" + name)!);

        if (Date.now() - dataset.retrievedOn >= 60 * 60 * 3 * 1000)
            return await retrieveDataset(name);
        return dataset.payload
    }
    return await retrieveDataset(name);
}
