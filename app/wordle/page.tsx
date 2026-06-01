import { SSRWordleLoader } from "@/components/wordle/wordle_loader";
import { getToday } from "@/scripts/date";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="w-full flex justify-center">
                    <span className="loading loading-spinner" />
                </div>
            }
        >
            <SSRWordleLoader id={getToday()} onNotFound={notFound} />
        </Suspense>
    );
}
