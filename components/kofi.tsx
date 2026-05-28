"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export function KofiButton() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            className="btn btn-primary btn-sm flex items-center gap-2 relative"
            href="https://ko-fi.com/lyondle"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <motion.div
                    animate={isHovered ? {
                        scaleY: [1, 0.8, 1.1, 1],
                        scaleX: [1, 1.2, 0.9, 1],
                    } : {}}
                    transition={{ duration: 0.4, delay: 0.35 }}
                >
                    <Image
                        alt="kofi"
                        src="https://storage.ko-fi.com/cdn/cup-border.png"
                        width={20}
                        height={20}
                    />
                </motion.div>
                {isHovered && (
                    <motion.span
                        className="absolute bg-amber-400 rounded-full w-2 h-2"
                        initial={{ y: -25, x: -2, opacity: 0, scale: 0.5 }}
                        animate={{
                            y: [-25, -2, -6, -2],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            times: [0, 0.6, 0.8, 1],
                            ease: "easeIn",
                        }}
                    />
                )}
            </div>
            <span>SOUTENIR LYONDLE</span>
        </Link>
    );
}
