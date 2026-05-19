import Link from "next/link";

export default function NotFound() {
    return <div className="w-full h-full">
        <p className="text-lg font-semibold">
            Cette grille n'existe pas ou n'est pas encore disponible.
        </p>
        <Link href="/" className="hover:underline">Retourner a l'accueil</Link>
    </div>
}
