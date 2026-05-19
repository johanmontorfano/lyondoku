import { Wordle } from "@/components/wordle/wordle";

export default async function Page(props: {
    params: Promise<{ game_id: string }>
}) {
    const params = await props.params;

    return <Wordle id={params.game_id} />
}
