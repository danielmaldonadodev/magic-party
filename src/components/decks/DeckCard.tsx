import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DeckCardProps {
  deck: {
    id: string;
    name: string;
    description: string;
    color_identity: string[];
    commander?: string;
    image_url?: string;
    wins: number;
    losses: number;
    profiles?: {
      username: string;
      avatar_url?: string;
    };
  };
}

const DeckCard = ({ deck }: DeckCardProps) => {
  // Format color identity
  const colorOrder = ['W', 'U', 'B', 'R', 'G', 'C'];
  const sortedColors = [...deck.color_identity].sort(
    (a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b)
  );
  
  // Color identity icons
  const colorIcons: Record<string, string> = {
    'W': '⚪',
    'U': '🔵',
    'B': '⚫',
    'R': '🔴',
    'G': '🟢',
    'C': '⚙️',
  };
  
  // Generate color classes based on color identity
  let gradientClass = 'from-gray-700/40 to-gray-800/20';
  let borderClass = 'border-gray-700';
  
  if (deck.color_identity.length === 1) {
    const color = deck.color_identity[0];
    switch (color) {
      case 'W':
        gradientClass = 'from-white-mana/20 to-white-mana/5';
        borderClass = 'border-white-mana/30';
        break;
      case 'U':
        gradientClass = 'from-blue-mana/20 to-blue-mana/5';
        borderClass = 'border-blue-mana/30';
        break;
      case 'B':
        gradientClass = 'from-black-mana/20 to-black-mana/5';
        borderClass = 'border-black-mana/30';
        break;
      case 'R':
        gradientClass = 'from-red-mana/20 to-red-mana/5';
        borderClass = 'border-red-mana/30';
        break;
      case 'G':
        gradientClass = 'from-green-mana/20 to-green-mana/5';
        borderClass = 'border-green-mana/30';
        break;
      case 'C':
        gradientClass = 'from-gray-700/20 to-gray-700/5';
        borderClass = 'border-gray-700';
        break;
    }
  } else if (deck.color_identity.length === 2) {
    if (deck.color_identity.includes('W') && deck.color_identity.includes('U')) {
      gradientClass = 'from-white-mana/20 to-blue-mana/20';
      borderClass = 'border-blue-mana/30';
    } else if (deck.color_identity.includes('U') && deck.color_identity.includes('B')) {
      gradientClass = 'from-blue-mana/20 to-black-mana/20';
      borderClass = 'border-blue-mana/30';
    } else if (deck.color_identity.includes('B') && deck.color_identity.includes('R')) {
      gradientClass = 'from-black-mana/20 to-red-mana/20';
      borderClass = 'border-red-mana/30';
    } else if (deck.color_identity.includes('R') && deck.color_identity.includes('G')) {
      gradientClass = 'from-red-mana/20 to-green-mana/20';
      borderClass = 'border-red-mana/30';
    } else if (deck.color_identity.includes('G') && deck.color_identity.includes('W')) {
      gradientClass = 'from-green-mana/20 to-white-mana/20';
      borderClass = 'border-green-mana/30';
    }
  } else if (deck.color_identity.length >= 3) {
    gradientClass = 'from-gold-mana/20 to-gold-mana/5';
    borderClass = 'border-gold-mana/30';
  }
  
  // Calculate win rate
  const totalGames = deck.wins + deck.losses;
  const winRate = totalGames > 0 ? Math.round((deck.wins / totalGames) * 100) : 0;
  
  // Win rate color
  let winRateColor = 'text-gray-400';
  if (winRate >= 70) {
    winRateColor = 'text-green-light';
  } else if (winRate >= 50) {
    winRateColor = 'text-blue-light';
  } else if (winRate > 0) {
    winRateColor = 'text-red-light';
  }
  
  return (
    <Link to={`/decks/${deck.id}`}>
      <motion.div 
        className={`card-frame overflow-hidden border-2 ${borderClass} transition-all bg-gradient-to-br ${gradientClass}`}
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Deck image or placeholder */}
        <div className="h-32 bg-black-light relative overflow-hidden">
          {deck.image_url ? (
            <img 
              src={deck.image_url} 
              alt={deck.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-mana/30 to-black-mana/50">
              <span className="font-magical text-white text-lg opacity-80">
                {deck.name.substring(0, 2)}
              </span>
            </div>
          )}
          
          {/* Color identity display */}
          <div className="absolute bottom-2 right-2 flex space-x-1">
            {sortedColors.map((color, index) => (
              <div 
                key={index} 
                className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg
                  ${color === 'W' ? 'bg-white-mana text-white-light' : ''}
                  ${color === 'U' ? 'bg-blue-mana text-blue-light' : ''}
                  ${color === 'B' ? 'bg-black-mana text-black-light' : ''}
                  ${color === 'R' ? 'bg-red-mana text-red-light' : ''}
                  ${color === 'G' ? 'bg-green-mana text-green-light' : ''}
                  ${color === 'C' ? 'bg-gray-700 text-gray-300' : ''}`}
              >
                <span>{colorIcons[color] || '?'}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          {/* Deck name and owner */}
          <div className="mb-2">
            <h3 className="text-lg font-magical text-white">{deck.name}</h3>
            {deck.profiles && (
              <div className="flex items-center text-gray-400 text-xs">
                <span>Por {deck.profiles.username || 'Usuario'}</span>
              </div>
            )}
          </div>
          
          {/* Commander display if present */}
          {deck.commander && (
            <div className="mb-3 text-sm text-blue-light flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Commander: {deck.commander}</span>
            </div>
          )}
          
          {/* Description */}
          <div className="text-white/80 text-sm mb-3 line-clamp-2">
            {deck.description || 'Sin descripción'}
          </div>
          
          {/* Stats */}
          <div className="mt-3 flex items-center text-sm border-t border-gray-700/50 pt-3">
            <div className="flex items-center mr-4">
              <svg className="w-4 h-4 mr-1 text-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-light">{deck.wins}</span>
            </div>
            
            <div className="flex items-center mr-4">
              <svg className="w-4 h-4 mr-1 text-red-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-light">{deck.losses}</span>
            </div>
            
            <div className="ml-auto">
              <span className={`${winRateColor} font-medium`}>
                {winRate}% victorias
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default DeckCard;
