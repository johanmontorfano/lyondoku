import { SSRWordleLoader } from "@/components/wordle/wordle_loader";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function Page(props: {
    params: Promise<{ game_id: string }>
}) {
    const params = await props.params;

    return (
        <Suspense
            fallback={
                <div className="w-full flex justify-center">
                    <span className="loading loading-spinner" />
                </div>
            }
        >
            <SSRWordleLoader
                id={params.game_id}
                onNotFound={notFound}
            />
        </Suspense>
    );
}
