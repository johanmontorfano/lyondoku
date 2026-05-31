import Image from "next/image";
import { KofiButton } from "./kofi";
import Link from "next/link";

export async function Footer() {
    return (
        <footer className="w-full py-6 text-base-content/60 text-xs">
            <div className="flex flex-col min-[464px]:flex-row items-center md:items-center justify-between gap-4 border-t border-base-200 pt-4">
                
                <div className="flex items-center gap-3 max-w-md">
                    <Image
                        alt="lyondle logo"
                        src="/icon.svg"
                        width={40} 
                        height={40}
                        className="hover:scale-200 hover:-rotate-10 transition-all"
                    />
                    <p className="leading-tight">
                        Développé en solo. Et pourtant, moins de pannes que sur 
                        le métro B.
                    </p>
                </div>
                <KofiButton />
            </div>
            <div>
                <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                    <Link
                        href="https://johanmontorfano.com/blog/7ecf765c-143f-43e0-b252-64191d08527c"
                        className="hover:text-base-content transition-colors"
                    >
                        Technologie
                    </Link>
                    <Link
                        href="mailto:hello@johanmontorfano.com"
                        className="hover:text-base-content transition-colors"
                    >
                        Contact
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
