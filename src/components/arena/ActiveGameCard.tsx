import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  color_identity: string[];
}

interface Deck {
  id: string;
  name: string;
  color_identity: string[];
  commander?: string;
  image_url?: string;
}

interface GamePlayer {
  id: string;
  game_id: string;
  user_id: string;
  deck_id: string;
  life_total: number;
  commander_tax: number;
  is_monarch: boolean;
  has_initiative: boolean;
  is_eliminated: boolean;
  profile?: Profile;
  deck?: Deck;
}

interface Game {
  id: string;
  creator_id: string;
  format: string;
  status: string;
  created_at: string;
  updated_at: string;
  winner_id?: string;
  event_id?: string;
  turn_count: number;
  game_players: GamePlayer[];
}

interface ActiveGameCardProps {
  game: Game;
  isActive: boolean;
}

const ActiveGameCard = ({ game, isActive }: ActiveGameCardProps) => {
  // Format mapping
  const formatIcons: Record<string, string> = {
    'commander': '👑',
    'standard': '🏆',
    'modern': '⚡',
    'draft': '📦',
    'sealed': '🎁',
    'brawl': '🎭',
    'edh': '👑',
    'other': '✨'
  };
  
  // Format display
  const formatIcon = formatIcons[game.format.toLowerCase()] || formatIcons.other;
  const formatDisplay = game.format.charAt(0).toUpperCase() + game.format.slice(1);
  
  // Get time ago
  const timeAgo = formatDistanceToNow(new Date(game.updated_at), { 
    addSuffix: true,
    locale: es
  });
  
  // Get winner if game is completed
  const winner = game.status === 'completed' && game.winner_id
    ? game.game_players.find(p => p.user_id === game.winner_id)
    : null;
  
  // Sort players by life_total descending
  const sortedPlayers = [...game.game_players].sort((a, b) => {
    // Eliminated players go to the bottom
    if (a.is_eliminated && !b.is_eliminated) return 1;
    if (!a.is_eliminated && b.is_eliminated) return -1;
    
    // Otherwise sort by life total
    return b.life_total - a.life_total;
  });
  
  // Generate background gradient based on format
  let gradientClass = 'from-gray-700 to-gray-900';
  if (game.format === 'commander' || game.format === 'edh') {
    gradientClass = 'from-gold-mana/30 to-gray-900';
  } else if (game.format === 'standard') {
    gradientClass = 'from-blue-mana/30 to-gray-900';
  } else if (game.format === 'modern') {
    gradientClass = 'from-red-mana/30 to-gray-900';
  }
  
  // Border class based on game status
  const borderClass = isActive 
    ? 'border-green-mana/40 hover:border-green-mana/70' 
    : 'border-gray-700 hover:border-gray-600';
  
  return (
    <Link to={`/arena/${game.id}`}>
      <motion.div 
        className={`card-frame border-2 ${borderClass} bg-gradient-to-br ${gradientClass} overflow-hidden`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-4">
          {/* Game header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-lg mr-2">{formatIcon}</span>
              <div>
                <span className="font-magical text-white text-lg">{formatDisplay}</span>
                <p className="text-gray-400 text-xs">
                  {isActive ? `Turno ${game.turn_count}` : 'Finalizada'}
                  {' • '}
                  {timeAgo}
                </p>
              </div>
            </div>
            
            {isActive ? (
              <span className="px-3 py-1 bg-green-mana/20 text-green-light text-xs rounded-full">
                Activa
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-700/40 text-gray-300 text-xs rounded-full">
                Completada
              </span>
            )}
          </div>
          
          {/* Players list */}
          <div className="space-y-3">
            {sortedPlayers.map((player) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  player.is_eliminated 
                    ? 'bg-black/40 opacity-70' 
                    : player.user_id === game.winner_id
                    ? 'bg-gold-mana/20 border border-gold-mana/40' 
                    : 'bg-black/20'
                }`}
              >
                <div className="flex items-center">
                  {/* User avatar */}
                  <div className={`w-8 h-8 rounded-full overflow-hidden mr-2 flex items-center justify-center ${
                    player.is_eliminated ? 'grayscale' : ''
                  }`}>
                    {player.profile?.avatar_url ? (
                      <img 
                        src={player.profile.avatar_url} 
                        alt={player.profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-mana flex items-center justify-center">
                        <span className="font-magical text-white text-sm">
                          {player.profile?.username.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* User info and deck */}
                  <div className="mr-2">
                    <div className="flex items-center">
                      <p className={`font-medium text-sm ${
                        player.is_eliminated 
                          ? 'text-gray-500 line-through' 
                          : player.user_id === game.winner_id
                          ? 'text-gold-light' 
                          : 'text-white'
                      }`}>
                        {player.profile?.username || 'Jugador'}
                      </p>
                      
                      {/* Special status indicators */}
                      <div className="flex ml-2">
                        {player.is_monarch && (
                          <span title="Monarca" className="w-4 h-4 text-yellow-400 flex items-center justify-center text-xs">
                            👑
                          </span>
                        )}
                        {player.has_initiative && (
                          <span title="Iniciativa" className="w-4 h-4 text-blue-light flex items-center justify-center text-xs ml-1">
                            🏆
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Deck name or commander */}
                    <p className="text-gray-400 text-xs truncate max-w-[150px]">
                      {player.deck?.commander || player.deck?.name || 'Mazo desconocido'}
                    </p>
                  </div>
                </div>
                
                {/* Life total */}
                <div className={`px-3 py-2 rounded-lg ${
                  player.is_eliminated 
                    ? 'bg-red-mana/20 text-gray-500' 
                    : player.life_total > 30
                    ? 'bg-green-mana/20 text-green-light' 
                    : player.life_total <= 10
                    ? 'bg-red-mana/20 text-red-light' 
                    : 'bg-blue-mana/20 text-blue-light'
                }`}>
                  <span className="font-magical text-lg">
                    {player.is_eliminated ? 'X' : player.life_total}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Winner banner */}
          {winner && (
            <div className="mt-4 text-center p-2 bg-gold-mana/20 rounded-md">
              <span className="text-gold-light font-magical">
                {winner.profile?.username || 'Jugador'} ha ganado
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default ActiveGameCard;
