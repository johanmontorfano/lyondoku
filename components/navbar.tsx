import Image from "next/image";
import Link from "next/link";
import Icon from "@/public/icon.svg";

export function Navbar() {
    return <div className="w-full flex flex-col items-center">
        <Link href="/">
            <h1 className="text-3xl">
                LYONDLE
            </h1>
        </Link>
        <div className="mx-auto flex gap-6 mt-3">
            <Link className="link link-hover" href="/archive">
                Archive
            </Link>
            <Link
                className="link link-hover"
                href="mailto:hello@johanmontorfano.com"
            >
                Contact
            </Link>
        </div>
    </div>
}

export function Footer() {
    return <footer className="footer footer-horizontal items-center py-4">
        <aside className="grid-flow-col items-center">
            <Image src={Icon} alt="icon" width={20} height={20} />
            <p className="text-lg">LYONDLE</p>
        </aside>
        <nav className="grid-flow-col justify-self-end">
            <Link className="link link-hover" href="/archive">Archive</Link>
            <Link
                className="link link-hover"
                href="mailto:hello@johanmontorfano.com"
            >
                Contact
            </Link>
        </nav>
    </footer>
}
