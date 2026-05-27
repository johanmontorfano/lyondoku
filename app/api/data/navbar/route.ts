import { firestore } from "@/scripts/firebase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const postReq = z.object({ title: z.string() });

export async function GET(req: NextRequest) {
    const auth = req.headers.get("authorization");

    if (auth === `Bearer ${process.env.JWS_ACCESS_SECRET}`) {
        const titleSnap = await firestore.doc("config/ui").get();
        const title = titleSnap.data()!.title as string;

        return NextResponse.json({ title });
    } else return NextResponse.json({ title: null }, { status: 401 });
}

// NOTE: this route is used to update the title in the navbar, it will both
// save a new string AND revalidate the root layout
// HACK: since this is managed through a JWS interface, this route can be
// accessed unauthenticated with a SECRET
export async function POST(req: NextRequest) {
    const body = postReq.safeParse(await req.json());

    if (body.error)
        return NextResponse.json({ error: "invalid req" }, { status: 400 });

    const auth = req.headers.get("authorization");

    if (auth === `Bearer ${process.env.JWS_ACCESS_SECRET}`) {
        await firestore.doc("config/ui").set({ navbarTitle: body.data.title });
        revalidatePath("/");
        return NextResponse.json({ success: true });
    } else return NextResponse.json({ success: false }, { status: 401 });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    })
}
