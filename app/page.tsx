import { SSRDokuLoader } from "@/components/doku_loader";
import { Suspense } from "react";

export default function Page() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const day = String(new Date().getDate()).padStart(2, "0");

    return (
        <div>
            <Suspense
                fallback={
                    <div className="w-full flex justify-center">
                        <span className="loading loading-spinner" />
                    </div>
                }
            >
                <SSRDokuLoader
                    id={`${year}-${month}-${day}`}
                    onNotFound={() => <p>not found</p>}
                />
            </Suspense>
        </div>
    );
}
