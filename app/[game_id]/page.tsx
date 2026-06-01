import { Guessr } from "@/components/guessr/guessr";
import { notFound } from "next/navigation";

export default async function Page(props: {
    params: Promise<{ game_id: string }>
}) {
    const params = await props.params;
    
    try {
        if (isNaN(new Date(params.game_id) as unknown as number))
            throw new Error("not a valid game id");
    } catch (_) {
        notFound();
    }

    return <Guessr id={params.game_id} />
}
