import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface GamePlayer {
  id: string;
  game_id: string;
  user_id: string;
  profile?: Profile;
  is_eliminated: boolean;
}

interface GameControlsProps {
  players: GamePlayer[];
  onEndGame: (winnerId: string) => void;
  currentUserId: string | null;
}

const GameControls = ({ players, onEndGame, currentUserId }: GameControlsProps) => {
  const [showEndGameDialog, setShowEndGameDialog] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  
  // Non-eliminated players only
  const activePlayers = players.filter(p => !p.is_eliminated);
  
  // Handle winner selection
  const handleSelectWinner = (userId: string) => {
    setSelectedWinner(userId);
  };
  
  // Handle end game confirm
  const handleEndGameConfirm = () => {
    if (selectedWinner) {
      onEndGame(selectedWinner);
      setShowEndGameDialog(false);
    }
  };
  
  return (
    <>
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowEndGameDialog(true)}
          className="px-4 py-2 bg-red-mana/20 hover:bg-red-mana/40 text-red-light rounded-md transition-colors"
        >
          Finalizar Partida
        </button>
      </div>
      
      {/* End Game Dialog */}
      <AnimatePresence>
        {showEndGameDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEndGameDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-black-mana/90 backdrop-blur-md border border-red-mana/30 rounded-lg overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-700">
                <h2 className="text-2xl font-magical text-white">Finalizar Partida</h2>
              </div>
              
              <div className="p-5">
                <p className="text-gray-300 mb-4">
                  Selecciona el ganador de la partida:
                </p>
                
                <div className="grid gap-3 mb-6">
                  {activePlayers.map(player => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectWinner(player.user_id)}
                      className={`flex items-center p-3 rounded-md border ${
                        selectedWinner === player.user_id
                          ? 'bg-gold-mana/20 border-gold-mana/50 text-gold-light'
                          : 'bg-black-light/70 border-gray-700 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
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
                      
                      <span className="text-lg">
                        {player.profile?.username || 'Jugador'}
                      </span>
                      
                      {player.user_id === currentUserId && (
                        <span className="ml-2 text-xs bg-blue-mana/20 px-2 py-1 rounded">Tú</span>
                      )}
                      
                      {selectedWinner === player.user_id && (
                        <span className="ml-auto text-xl">👑</span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowEndGameDialog(false)}
                    className="px-4 py-2 bg-black-light border border-gray-700 text-white rounded-md hover:bg-gray-800"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={handleEndGameConfirm}
                    disabled={!selectedWinner}
                    className="px-4 py-2 bg-gold-mana/60 text-black font-medium rounded-md hover:bg-gold-mana disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finalizar Partida
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameControls;
