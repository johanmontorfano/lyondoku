import { ReactNode, Suspense } from "react";

export default function Layout(props: { children: ReactNode }) {
    return <Suspense fallback={<div className="w-full flex justify-center">
        <span className="loading loading-spinner" />
    </div>}>
        {props.children}
    </Suspense>
}
