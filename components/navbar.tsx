import Image from "next/image";
import Link from "next/link";
import Icon from "@/public/icon.svg";
import { BsEnvelope } from "react-icons/bs";

export function Navbar() {
    return <div className="w-full flex items-center justify-between">
        <Image src={Icon} alt="icon" width={25} height={25} />
        <nav className="flex gap-2 [&>a]:tracking-wide [&>a]:text-sm">
            <Link className="link link-hover" href="/">Lyondle</Link>
            <Link className="link link-hover" href="/doku">Doku</Link>
            <Link className="link link-hover" href="/archive">Archive</Link>
        </nav>
        <Link
            className="link link-hover"
            href="mailto:hello@johanmontorfano.com"
        >
            <BsEnvelope size={20} />
        </Link>
    </div>
}
