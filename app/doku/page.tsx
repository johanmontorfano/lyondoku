import { SSRDokuLoader } from "@/components/doku/doku_loader";
import { getToday } from "@/scripts/date";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Lyondle – Doku",
    description: "Connaissez-vous vraiment les TCL ?",
};

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="w-full flex justify-center">
                    <span className="loading loading-spinner" />
                </div>
            }
        >
            <SSRDokuLoader id={getToday()} onNotFound={notFound} />
        </Suspense>
    );
}
