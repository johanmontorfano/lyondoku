import { SSRDokuLoader } from "@/components/doku_loader";
import { notFound } from "next/navigation";

export default async function Page(props: {
    params: Promise<{ game_id: string }>
}) {
    const params = await props.params;

    // NOTE: when the game_id is "random", we select one of the 10 random grids
    // generated
    if (params.game_id === "random")
        params.game_id = `random_${Math.ceil(Math.random() * 10)}`;

    return <SSRDokuLoader id={params.game_id} onNotFound={notFound} />
}
