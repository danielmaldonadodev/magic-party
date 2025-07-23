import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CommanderDamage, GamePlayer } from '../../types/gameTypes';

interface PlayerCardProps {
  player: GamePlayer;
  isActive: boolean;
  onLifeChange?: (playerId: string, amount: number) => void;
  onCommanderTaxChange?: (playerId: string, amount: number) => void;
  onToggleMonarch?: () => void;
  onToggleInitiative?: () => void;
  onCommanderDamage?: () => void;
  commanderDamageReceived?: CommanderDamage[];
}

const PlayerCard = ({
  player,
  isActive,
  onLifeChange,
  onCommanderTaxChange,
  onToggleMonarch,
  onToggleInitiative,
  onCommanderDamage,
  commanderDamageReceived = []
}: PlayerCardProps) => {
  const [showControls, setShowControls] = useState(false);
  
  // Generate background gradient based on deck color identity
  const getGradientClass = () => {
    if (!player.deck?.color_identity || player.deck.color_identity.length === 0) {
      return 'from-gray-700 to-gray-900';
    }
    
    const colors = player.deck.color_identity;
    
    if (colors.includes('W') && colors.includes('U') && colors.includes('B') && colors.includes('R') && colors.includes('G')) {
      return 'from-gold-mana/30 to-gray-900';
    }
    
    if (colors.length === 1) {
      if (colors[0] === 'W') return 'from-white-mana/30 to-gray-900';
      if (colors[0] === 'U') return 'from-blue-mana/30 to-gray-900';
      if (colors[0] === 'B') return 'from-black-mana/30 to-gray-900';
      if (colors[0] === 'R') return 'from-red-mana/30 to-gray-900';
      if (colors[0] === 'G') return 'from-green-mana/30 to-gray-900';
    }
    
    if (colors.length === 2) {
      if (colors.includes('W') && colors.includes('U')) return 'from-white-mana/20 via-blue-mana/20 to-gray-900';
      if (colors.includes('U') && colors.includes('B')) return 'from-blue-mana/20 via-black-mana/20 to-gray-900';
      if (colors.includes('B') && colors.includes('R')) return 'from-black-mana/20 via-red-mana/20 to-gray-900';
      if (colors.includes('R') && colors.includes('G')) return 'from-red-mana/20 via-green-mana/20 to-gray-900';
      if (colors.includes('G') && colors.includes('W')) return 'from-green-mana/20 via-white-mana/20 to-gray-900';
      // Enemy pairs
      if (colors.includes('W') && colors.includes('B')) return 'from-white-mana/20 via-black-mana/20 to-gray-900';
      if (colors.includes('U') && colors.includes('R')) return 'from-blue-mana/20 via-red-mana/20 to-gray-900';
      if (colors.includes('B') && colors.includes('G')) return 'from-black-mana/20 via-green-mana/20 to-gray-900';
      if (colors.includes('R') && colors.includes('W')) return 'from-red-mana/20 via-white-mana/20 to-gray-900';
      if (colors.includes('G') && colors.includes('U')) return 'from-green-mana/20 via-blue-mana/20 to-gray-900';
    }
    
    if (colors.length >= 3) {
      return 'from-gold-mana/30 to-gray-900';
    }
    
    return 'from-gray-700 to-gray-900';
  };
  
  // Border class based on player status
  const getBorderClass = () => {
    if (player.is_eliminated) {
      return 'border-red-mana/30';
    }
    
    if (player.is_monarch) {
      return 'border-gold-mana/70';
    }
    
    if (player.has_initiative) {
      return 'border-blue-mana/70';
    }
    
    return 'border-gray-700';
  };
  
  // Life total color class
  const getLifeTotalClass = () => {
    if (player.is_eliminated) {
      return 'text-red-light';
    }
    
    if (player.life_total > 30) {
      return 'text-green-light';
    }
    
    if (player.life_total <= 10) {
      return 'text-red-light';
    }
    
    return 'text-white';
  };
  
  return (
    <motion.div
      className={`card-frame border-2 ${getBorderClass()} bg-gradient-to-br ${getGradientClass()} overflow-hidden ${
        player.is_eliminated ? 'opacity-70' : ''
      }`}
      animate={{ scale: 1 }}
      whileHover={{ scale: isActive ? 1.02 : 1 }}
    >
      <div className="p-4">
        {/* Player header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              {player.profile?.avatar_url ? (
                <img 
                  src={player.profile.avatar_url} 
                  alt={player.profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-mana flex items-center justify-center">
                  <span className="font-magical text-white">
                    {player.profile?.username.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            {/* User info */}
            <div>
              <p className={`font-magical text-lg ${
                player.is_eliminated 
                  ? 'text-gray-400 line-through' 
                  : 'text-white'
              }`}>
                {player.profile?.username || 'Jugador'}
              </p>
              
              <div className="flex items-center">
                {player.deck?.commander && (
                  <p className="text-gray-400 text-xs">
                    {player.deck.commander}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Special status indicators */}
          <div className="flex space-x-2">
            {player.is_monarch && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ rotate: 10 }}
                title="Monarca"
                className="w-7 h-7 rounded-full bg-gold-mana/30 border border-gold-mana/50 flex items-center justify-center cursor-pointer"
                onClick={isActive && onToggleMonarch ? onToggleMonarch : undefined}
              >
                <span className="text-yellow-400">👑</span>
              </motion.div>
            )}
            
            {player.has_initiative && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ rotate: 10 }}
                title="Iniciativa"
                className="w-7 h-7 rounded-full bg-blue-mana/30 border border-blue-mana/50 flex items-center justify-center cursor-pointer"
                onClick={isActive && onToggleInitiative ? onToggleInitiative : undefined}
              >
                <span className="text-blue-light">🏆</span>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Player stats */}
        <div className="flex justify-between items-center">
          {/* Life total */}
          <div>
            <p className="text-gray-400 text-xs mb-1">Vida</p>
            <div className="flex items-center">
              {isActive && onLifeChange && !player.is_eliminated ? (
                <>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onLifeChange(player.id, -1)}
                    className="w-8 h-8 bg-black/40 hover:bg-red-mana/20 rounded-l-lg flex items-center justify-center border border-gray-700"
                  >
                    <span className="text-red-light text-xl">-</span>
                  </motion.button>
                  
                  <span className={`font-magical text-3xl mx-3 ${getLifeTotalClass()}`}>
                    {player.is_eliminated ? 'X' : player.life_total}
                  </span>
                  
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onLifeChange(player.id, 1)}
                    className="w-8 h-8 bg-black/40 hover:bg-green-mana/20 rounded-r-lg flex items-center justify-center border border-gray-700"
                  >
                    <span className="text-green-light text-xl">+</span>
                  </motion.button>
                </>
              ) : (
                <span className={`font-magical text-3xl ${getLifeTotalClass()}`}>
                  {player.is_eliminated ? 'X' : player.life_total}
                </span>
              )}
            </div>
          </div>
          
          {/* Commander tax (if applicable) */}
          {typeof onCommanderTaxChange === 'function' && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Impuesto</p>
              <div className="flex items-center">
                {isActive && !player.is_eliminated ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onCommanderTaxChange(player.id, -1)}
                      disabled={player.commander_tax === 0}
                      className="w-7 h-7 bg-black/40 hover:bg-blue-mana/20 rounded-l-lg flex items-center justify-center border border-gray-700 disabled:opacity-50"
                    >
                      <span className="text-blue-light text-lg">-</span>
                    </motion.button>
                    
                    <span className="font-magical text-2xl mx-2 text-blue-light">
                      {player.commander_tax}
                    </span>
                    
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onCommanderTaxChange(player.id, 1)}
                      className="w-7 h-7 bg-black/40 hover:bg-blue-mana/20 rounded-r-lg flex items-center justify-center border border-gray-700"
                    >
                      <span className="text-blue-light text-lg">+</span>
                    </motion.button>
                  </>
                ) : (
                  <span className="font-magical text-2xl text-blue-light">
                    {player.commander_tax}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Toggle buttons for Monarch, Initiative, and Commander Damage */}
          {isActive && (typeof onToggleMonarch === 'function' || typeof onToggleInitiative === 'function' || typeof onCommanderDamage === 'function') && !player.is_eliminated && !player.is_monarch && !player.has_initiative && (
            <div>
              <button 
                onClick={() => setShowControls(!showControls)}
                className="text-xs px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                Efectos
              </button>
              
              {showControls && (
                <div className="absolute mt-2 bg-black-light border border-gray-700 rounded-md shadow-lg p-2 z-10">
                  {onToggleMonarch && (
                    <button
                      onClick={onToggleMonarch}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-800 rounded-md text-sm"
                    >
                      <span className="mr-2">👑</span> Asignar monarquía
                    </button>
                  )}
                  
                  {onToggleInitiative && (
                    <button
                      onClick={onToggleInitiative}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-800 rounded-md text-sm"
                    >
                      <span className="mr-2">🏆</span> Asignar iniciativa
                    </button>
                  )}
                  
                  {onCommanderDamage && (
                    <button
                      onClick={onCommanderDamage}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-800 rounded-md text-sm"
                    >
                      <span className="mr-2">⚔️</span> Asignar daño de comandante
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Commander damage section */}
        {commanderDamageReceived && commanderDamageReceived.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-gray-400 text-xs">Daño de comandante</p>
              {typeof onCommanderDamage === 'function' && !player.is_eliminated && (
                <button 
                  onClick={onCommanderDamage}
                  className="text-xs px-2 py-0.5 bg-red-mana/30 hover:bg-red-mana/50 text-red-light rounded-md"
                >
                  Asignar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {commanderDamageReceived.map((damage) => (
                <div key={damage.source_player_id} className="flex items-center justify-between bg-black/30 px-2 py-1 rounded">
                  <span className="text-xs truncate max-w-[80px]">
                    {damage.source_player?.profile?.username || 'Jugador'}
                  </span>
                  <span className={`font-magical text-sm ${damage.damage_amount >= 18 ? 'text-red-light' : 'text-white'}`}>
                    {damage.damage_amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Deck info */}
        <div className="mt-4">
          <p className="text-gray-400 text-xs mb-1">Mazo</p>
          <div className="flex items-center">
            {/* Color identity */}
            <div className="flex mr-2">
              {player.deck?.color_identity?.map((color, index) => (
                <div 
                  key={index}
                  className={`w-5 h-5 rounded-full -ml-1 first:ml-0 flex items-center justify-center
                    ${color === 'W' ? 'bg-white-mana' : ''}
                    ${color === 'U' ? 'bg-blue-mana' : ''}
                    ${color === 'B' ? 'bg-black-mana' : ''}
                    ${color === 'R' ? 'bg-red-mana' : ''}
                    ${color === 'G' ? 'bg-green-mana' : ''}
                  `}
                >
                  <span className="text-xs">
                    {color}
                  </span>
                </div>
              ))}
            </div>
            
            <span className="text-sm text-white">
              {player.deck?.name || 'Mazo desconocido'}
            </span>
          </div>
        </div>
        
        {/* Eliminated badge */}
        {player.is_eliminated && (
          <div className="absolute top-0 right-0 bg-red-mana/60 text-white px-3 py-1 rounded-bl-md text-xs">
            Eliminado
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerCard;
