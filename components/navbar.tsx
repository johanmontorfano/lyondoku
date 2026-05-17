import { BsSend } from "react-icons/bs";
import Link from "next/link";

export function Navbar() {
    return <div className="navbar px-0 w-full">
        <div className="navbar-start">
            <Link href="/">
                <h1 className="font-(family-name:--font-mono) text-5xl font-bold hover:underline">
                    lyondoku
                </h1>
            </Link>
        </div>
        <div className="navbar-end gap-3 items-center">
            <Link href="mailto:hello@johanmontorfano.com">
                <BsSend size={22} className="mt-0.5" />
            </Link>
        </div>
    </div>
}
