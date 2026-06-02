import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const auth = req.headers.get("authorization");

    if (auth === `Bearer ${process.env.CRON_SECRET}`) {
        revalidatePath("/");
        revalidatePath("/doku");
        revalidatePath("/wordle");
        revalidatePath("/archive");
        return NextResponse.json({ success: true });
    } else return NextResponse.json({ success: false }, { status: 401 });
}
