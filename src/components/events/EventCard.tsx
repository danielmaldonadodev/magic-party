import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    format: string;
    max_players: number;
    status: string;
    created_at: string;
    profiles?: {
      username: string;
      avatar_url?: string;
    };
    event_dates?: Array<{
      id: string;
      proposed_date: string;
      votes: string[];
    }>;
    event_participants?: Array<{
      user_id: string;
      status: string;
    }>;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Get user information on mount
  useState(() => {
    async function getUserInfo() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user.id);
      }
    }
    getUserInfo();
  });
  
  // Format mapping
  const formatIcons: Record<string, string> = {
    'commander': '👑',
    'standard': '🏆',
    'modern': '⚡',
    'draft': '📦',
    'sealed': '🎁',
    'brawl': '🎭',
    'edh': '👑',
    'pioneer': '🚀',
    'vintage': '🏛️',
    'pauper': '🧩',
    'legacy': '📜',
    'historic': '📚',
    'alchemy': '⚗️',
    'limited': '🎲',
    'other': '✨'
  };
  
  // Status mapping
  const statusConfig: Record<string, { class: string, text: string }> = {
    'scheduled': { class: 'bg-green-mana/20 text-green-light', text: 'Programado' },
    'pending': { class: 'bg-blue-mana/20 text-blue-light', text: 'Pendiente' },
    'completed': { class: 'bg-gray-700/20 text-gray-300', text: 'Completado' },
    'canceled': { class: 'bg-red-mana/20 text-red-light', text: 'Cancelado' },
  };
  
  // Format display
  const formatIcon = formatIcons[event.format.toLowerCase()] || formatIcons.other;
  const formatDisplay = event.format.charAt(0).toUpperCase() + event.format.slice(1);
  
  // Status display
  const statusClass = statusConfig[event.status.toLowerCase()]?.class || statusConfig.pending.class;
  const statusText = statusConfig[event.status.toLowerCase()]?.text || 'Pendiente';
  
  // Get confirmed date if any
  const confirmedDate = event.event_dates?.find(date => {
    // If status is scheduled, we consider one date as confirmed
    return event.status === 'scheduled';
  });
  
  // Format date if exists
  const formattedDate = confirmedDate 
    ? format(new Date(confirmedDate.proposed_date), "EEEE d 'de' MMMM, HH:mm", { locale: es })
    : null;
  
  // Get user participation status
  const userParticipation = currentUser 
    ? event.event_participants?.find(p => p.user_id === currentUser)?.status 
    : null;
  
  // Count participants by status
  const participantCounts = {
    going: event.event_participants?.filter(p => p.status === 'going').length || 0,
    maybe: event.event_participants?.filter(p => p.status === 'maybe').length || 0,
    declined: event.event_participants?.filter(p => p.status === 'declined').length || 0,
  };
  
  // Background color based on status
  let bgGradient = 'from-blue-mana/20 to-blue-mana/5';
  if (event.status === 'scheduled') {
    bgGradient = 'from-green-mana/20 to-green-mana/5';
  } else if (event.status === 'completed') {
    bgGradient = 'from-gray-700/20 to-gray-700/5';
  } else if (event.status === 'canceled') {
    bgGradient = 'from-red-mana/20 to-red-mana/5';
  }
  
  return (
    <Link to={`/events/${event.id}`}>
      <motion.div 
        className={`card-frame overflow-hidden hover:shadow-lg transition-all bg-gradient-to-b ${bgGradient}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-5">
          {/* Event header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-magical text-white">{event.title}</h3>
              <div className="flex items-center mt-1">
                <span className="text-lg mr-1">{formatIcon}</span>
                <span className="text-sm text-gray-300">{formatDisplay}</span>
              </div>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>
              {statusText}
            </span>
          </div>
          
          {/* Date display if confirmed */}
          {formattedDate && (
            <div className="flex items-center mb-3 text-white bg-black/30 rounded-md p-2">
              <svg className="w-5 h-5 mr-2 text-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm capitalize">{formattedDate}</span>
            </div>
          )}
          
          {/* Description */}
          <div className="text-white/80 text-sm mb-4 line-clamp-2">
            {event.description}
          </div>
          
          {/* Participants count */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-2">
                {/* Avatar placeholders - would be real avatars in production */}
                {[...Array(Math.min(3, participantCounts.going + participantCounts.maybe))].map((_, index) => (
                  <div 
                    key={index}
                    className="w-7 h-7 rounded-full bg-gray-700 border-2 border-black-light flex items-center justify-center overflow-hidden"
                  >
                    <span className="text-white text-xs">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-gray-300">
                {participantCounts.going} confirmados
                {participantCounts.maybe > 0 && `, ${participantCounts.maybe} quizás`}
              </span>
            </div>
            
            {/* User participation status */}
            {userParticipation && (
              <div className="text-xs">
                {userParticipation === 'going' && (
                  <span className="text-green-light">Asistirás</span>
                )}
                {userParticipation === 'maybe' && (
                  <span className="text-yellow-400">Quizás</span>
                )}
                {userParticipation === 'declined' && (
                  <span className="text-red-light">No asistirás</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default EventCard;
