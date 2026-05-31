import { Guessr } from "@/components/guessr/guessr";

export default async function Page(props: {
    params: Promise<{ game_id: string }>
}) {
    const params = await props.params;

    return <Guessr id={params.game_id} />
}
