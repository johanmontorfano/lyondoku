import { mono } from "@/scripts/fonts";
import Link from "next/link";
import { BsGithub, BsSend } from "react-icons/bs";

export function Navbar() {
    return <div className="navbar w-full">
        <div className="navbar-start">
            <Link href="/">
                <h1 className={mono.className +
                    " text-5xl font-bold hover:underline"}>
                    lyondoku
                </h1>
            </Link>
        </div>
        <div className="navbar-end gap-2 items-center">
            <Link href="mailto:hello@johanmontorfano.com">
                <BsSend size={22} className="mt-0.5" />
            </Link>
            <Link href="https://github.com/johanmontorfano/lyondoku">
                <BsGithub size={24} />
            </Link>
        </div>
    </div>
}
