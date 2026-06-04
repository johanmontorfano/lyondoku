import { useRuledPopupContext } from "@/components/popup";
import { useEffect, useRef } from "react";

// this component is used as a countdown across other components, it features
// the ability to be disabled while a ruled popup is visible.
export function useCountdown(disableWithRule?: string) {
    const startedAt = useRef(new Date());
    const endedAt = useRef<Date | null>(null);
    const countdownRef = useRef<HTMLElement>(null);

    function update() {
        if (disableWithRule &&
            useRuledPopupContext.getState().currentRule === disableWithRule) {
            startedAt.current = new Date();
            return requestAnimationFrame(update);
        }

        const elapsed = Math.ceil(((endedAt.current
            ? new Date(endedAt.current).getTime() : Date.now()) -
            startedAt.current.getTime()) / 1000,
        );

        if (countdownRef.current !== null)
            countdownRef.current.textContent = `${
                Math.floor(elapsed / 60).toString().padStart(2, "0")
            }:${
                (elapsed % 60).toString().padStart(2, "0")
            }`;
        if (endedAt.current === null)
            requestAnimationFrame(update);
    }

    useEffect(() => {
        update();
    }, []);

    return [countdownRef, startedAt, endedAt] as const;
}
