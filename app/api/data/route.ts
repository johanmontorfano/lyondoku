import { storage } from "@/scripts/firebase/server";
import { validDatasetsNames } from "@/scripts/firebase/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const datasetName = url.searchParams.get("name");

    if (!datasetName || !validDatasetsNames.includes(datasetName))
        return NextResponse.json({ error: "not found" }, { status: 404 });
    
    const snap = await storage.bucket()
        .file(`data/${datasetName}.json`)
        .download();

    return NextResponse.json({ data: JSON.parse(snap[0].toString()) });
}
