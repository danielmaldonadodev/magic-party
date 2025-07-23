import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
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
  profile?: Profile;
  deck?: Deck;
  is_eliminated: boolean;
}

interface CommanderDamageModalProps {
  players: GamePlayer[];
  sourcePlayerId: string;
  onClose: () => void;
  onUpdateDamage: (sourcePlayerId: string, targetPlayerId: string, amount: number) => void;
}

const CommanderDamageModal = ({
  players,
  sourcePlayerId,
  onClose,
  onUpdateDamage
}: CommanderDamageModalProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [damageAmount, setDamageAmount] = useState<number>(1);
  const [currentDamage, setCurrentDamage] = useState<number>(0);
  
  const sourcePlayer = players.find(p => p.id === sourcePlayerId);
  
  // Filter out the source player and eliminated players
  const targetPlayers = players.filter(p => 
    p.id !== sourcePlayerId && !p.is_eliminated
  );
  
  // When a player is selected, fetch current damage
  useEffect(() => {
    if (!selectedPlayerId) return;
    
    // In a real implementation, this would fetch the current damage from Supabase
    // For now, we'll simulate it as 0 until we implement the database part
    setCurrentDamage(0);
  }, [selectedPlayerId]);
  
  const handleDamageChange = (change: number) => {
    setDamageAmount(Math.max(1, Math.min(21, damageAmount + change)));
  };
  
  const handleConfirm = () => {
    if (!selectedPlayerId || !sourcePlayerId) return;
    
    onUpdateDamage(sourcePlayerId, selectedPlayerId, damageAmount);
    onClose();
  };
  
  // If there are no valid targets
  if (targetPlayers.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md mx-4"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-magical text-white mb-4">Daño de Comandante</h2>
          
          <p className="text-gray-400 text-center my-6">
            No hay jugadores disponibles para recibir daño de comandante
          </p>
          
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-magical text-white mb-4">Daño de Comandante</h2>
        
        <div className="mb-4">
          <p className="text-gray-400 mb-2">Asignar daño del comandante de:</p>
          <div className="p-3 bg-gray-800 rounded-md">
            <p className="text-white">
              {sourcePlayer?.profile?.username || 'Jugador'} 
              <span className="text-gray-400 ml-1">
                ({sourcePlayer?.deck?.commander || 'Comandante'})
              </span>
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-400 mb-2">Jugador objetivo:</p>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700"
          >
            <option value="">Seleccionar jugador</option>
            {targetPlayers.map(player => (
              <option key={player.id} value={player.id}>
                {player.profile?.username || 'Jugador'}
              </option>
            ))}
          </select>
        </div>
        
        {selectedPlayerId && (
          <>
            <div className="mb-6">
              <p className="text-gray-400 mb-2">Daño actual: 
                <span className="ml-1 text-red-light font-magical">{currentDamage}</span>
                {currentDamage >= 21 && (
                  <span className="ml-2 text-xs text-red-light">(Suficiente para eliminar)</span>
                )}
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => handleDamageChange(-1)}
                  className="w-10 h-10 bg-gray-800 hover:bg-red-mana/20 rounded-lg flex items-center justify-center border border-gray-700"
                >
                  <span className="text-red-light text-xl">-</span>
                </button>
                
                <span className="text-4xl font-magical text-red-light">
                  {damageAmount}
                </span>
                
                <button
                  onClick={() => handleDamageChange(1)}
                  className="w-10 h-10 bg-gray-800 hover:bg-red-mana/20 rounded-lg flex items-center justify-center border border-gray-700"
                >
                  <span className="text-red-light text-xl">+</span>
                </button>
              </div>
              
              <p className="text-gray-400 mt-2 text-center">
                Nuevo total: <span className="text-red-light font-magical">{currentDamage + damageAmount}</span>
                {currentDamage + damageAmount >= 21 && (
                  <span className="ml-2 text-xs text-red-light">(Letal)</span>
                )}
              </p>
            </div>
            
            <div className="text-center text-gray-400 text-sm mb-4">
              Recuerda: 21+ puntos de daño de comandante elimina al jugador
            </div>
          </>
        )}
        
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!selectedPlayerId}
            className={`btn-primary px-4 py-2 ${!selectedPlayerId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CommanderDamageModal;
