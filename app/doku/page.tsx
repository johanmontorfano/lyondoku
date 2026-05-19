import { SSRDokuLoader } from "@/components/doku/doku_loader";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function Page() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const day = String(new Date().getDate()).padStart(2, "0");

    return (
        <Suspense
            fallback={
                <div className="w-full flex justify-center">
                    <span className="loading loading-spinner" />
                </div>
            }
        >
            <SSRDokuLoader
                id={`${year}-${month}-${day}`}
                onNotFound={notFound}
            />
        </Suspense>
    );
}
