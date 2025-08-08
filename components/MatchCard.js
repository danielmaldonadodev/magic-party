// components/MatchCard.js
import Link from 'next/link'
import { formatDate } from '../lib/formatDate'

export default function MatchCard({ match }) {
  const participants = match?.match_participants || []
  // Intentamos localizar los datos del ganador entre los participantes
  const winnerParticipant = participants.find(p => p.player_id === match.winner)

  const commanderImg = winnerParticipant?.commander_image_url || null
  const commanderName = winnerParticipant?.commander_name || null

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Imagen del comandante del ganador si existe */}
      {commanderImg ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={commanderImg}
            alt={commanderName ? `Comandante: ${commanderName}` : 'Comandante ganador'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {commanderName && (
            <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
              {commanderName}
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gray-50 text-gray-400">
          Sin imagen de comandante
        </div>
      )}

      {/* Contenido */}
      <div className="p-4">
        <div className="mb-1 text-sm text-gray-500">{formatDate(match.played_at)}</div>
        <h3 className="text-lg font-semibold text-gray-900">
          {match?.game?.name || 'Juego'}
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-medium">Ganador:</span>{' '}
          {winnerParticipant?.player_name || '—'}
        </p>
      </div>
    </Link>
  )
}
