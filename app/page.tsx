import { Guessr } from "@/components/guessr/guessr";
import { getToday } from "@/scripts/date";
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
            <Guessr id={getToday()} />
        </Suspense>
    );
}
