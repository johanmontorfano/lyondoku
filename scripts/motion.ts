import { Variants } from "framer-motion";

export const buttonAnimate: Variants = {
    exit: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0 }
}

export const cellAnimate: Variants = {
    exit: { opacity: 0, scale: 0.7 },
    show: { opacity: 1, scale: 1 }
}
