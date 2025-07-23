import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import ReactionOrbs from './ReactionOrbs';

// Types
interface EventPreviewProps {
  event: {
    id: string;
    title: string;
    description: string;
    format: string;
    status: string;
  };
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles?: {
      username: string;
      avatar_url?: string;
      color_identity: string[];
    };
    reactions?: Array<{
      id: string;
      post_id: string;
      user_id: string;
      reaction_type: string;
    }>;
  };
  onReactionAdded: () => void;
}

const EventPreview = ({ event, post, onReactionAdded }: EventPreviewProps) => {
  const [isReacting, setIsReacting] = useState(false);

  // Get formatted time
  const formattedTime = formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: true,
    locale: es
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
  const statusClasses: Record<string, string> = {
    'scheduled': 'bg-green-mana/20 text-green-light',
    'pending': 'bg-blue-mana/20 text-blue-light',
    'completed': 'bg-gray-700/20 text-gray-300',
    'canceled': 'bg-red-mana/20 text-red-light',
  };
  
  // Format display
  const formatIcon = formatIcons[event.format.toLowerCase()] || formatIcons.other;
  const formatDisplay = event.format.charAt(0).toUpperCase() + event.format.slice(1);
  
  // Status display
  const statusClass = statusClasses[event.status.toLowerCase()] || statusClasses.pending;
  const statusDisplay = event.status.charAt(0).toUpperCase() + event.status.slice(1);
  
  // Handle reaction
  const handleReaction = async (reactionType: string) => {
    setIsReacting(true);
    await onReactionAdded();
    setIsReacting(false);
  };
  
  return (
    <Link to={`/events/${event.id}`}>
      <motion.div 
        className="card-frame overflow-hidden border-blue-mana/20 hover:border-blue-mana transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-blue-mana to-green-mana"></div>
        
        <div className="p-4">
          {/* Author and time */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden mr-3">
                {post.profiles?.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-mana">
                    <span className="font-magical text-white text-lg">
                      {post.profiles?.username.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <span className="font-magical text-white">
                  {post.profiles?.username || 'Planeswalker Anónimo'}
                </span>
                <p className="text-gray-400 text-xs">
                  {formattedTime}
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>
              {statusDisplay}
            </div>
          </div>
          
          {/* Event title and format */}
          <div className="mb-3">
            <h3 className="text-xl font-magical text-white mb-1">
              {event.title}
            </h3>
            <div className="flex items-center">
              <span className="text-lg mr-1">{formatIcon}</span>
              <span className="text-sm text-gray-300">{formatDisplay}</span>
            </div>
          </div>
          
          {/* Event description */}
          <div className="text-white/80 text-sm mb-4">
            {event.description.length > 140 
              ? event.description.substring(0, 140) + '...' 
              : event.description}
          </div>
          
          {/* Call to action */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-blue-light font-medium">
              Ver detalles y responder
            </div>
            
            <motion.div 
              className="w-7 h-7 rounded-full bg-blue-mana/20 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 text-blue-mana" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>
          
          {/* Reactions */}
          <div className="mt-4 pt-3 border-t border-gray-700" onClick={(e) => e.preventDefault()}>
            <ReactionOrbs 
              reactions={post.reactions || []} 
              onReactionClick={handleReaction}
              isDisabled={isReacting}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default EventPreview;
