import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm">© {new Date().getFullYear()} Web de Colegueo</p>
        <div className="flex space-x-4 text-sm">
          <Link href="/stats" className="hover:text-white">
            Estadísticas
          </Link>
          <Link href="/players" className="hover:text-white">
            Perfiles
          </Link>
          <Link href="/matches/new" className="hover:text-white">
            Nueva partida
          </Link>
        </div>
      </div>
    </footer>
  )
}
