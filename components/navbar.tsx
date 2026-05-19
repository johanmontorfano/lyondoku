import Image from "next/image";
import Link from "next/link";
import Icon from "@/public/icon.svg";

export function Navbar() {
    return <div className="w-full flex items-center justify-between">
        <Link href="/" className="flex gap-2 items-center">
            <Image src={Icon} alt="icon" width={20} height={20} />
            <p className="text-lg">LYONDLE</p>
        </Link>
        <nav className="flex gap-2">
            <Link className="link link-hover" href="/doku">Doku</Link>
            <Link className="link link-hover" href="/archive">Archive</Link>
            <Link
                className="link link-hover"
                href="mailto:hello@johanmontorfano.com"
            >
                Contact
            </Link>
        </nav>
    </div>
}
