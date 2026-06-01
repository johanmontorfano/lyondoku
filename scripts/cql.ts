import { Station } from "./game_mgr/types";

export async function getCQL(
    query: string,
    target: "stations"
): Promise<{
    selected: Partial<Station>[],
    success: boolean
} | null> {
    try {
        const res = await fetch("https://api.lyondle.fr/cql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ target, query })
        });

        if (!res.ok) throw Error("Request error " + res.status);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}
