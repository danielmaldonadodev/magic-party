import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

interface Deck {
  id: string;
  name: string;
  color_identity: string[];
  commander?: string;
  user_id: string;
}

interface CreateGameModalProps {
  onClose: () => void;
  onGameCreated: () => void;
}

const CreateGameModal = ({ onClose, onGameCreated }: CreateGameModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [format, setFormat] = useState('commander');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerDecks, setPlayerDecks] = useState<Record<string, string>>({});
  
  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [events, setEvents] = useState<{id: string; title: string}[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Available formats
  const availableFormats = [
    { id: 'commander', name: 'Commander', icon: '👑' },
    { id: 'standard', name: 'Standard', icon: '🏆' },
    { id: 'modern', name: 'Modern', icon: '⚡' },
    { id: 'brawl', name: 'Brawl', icon: '🎭' },
    { id: 'other', name: 'Otro', icon: '✨' },
  ];
  
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setCurrentUser(userData.user.id);
          // Auto-select current user
          setSelectedPlayers([userData.user.id]);
        }
        
        // Fetch users
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .order('username');
        
        if (profilesData) {
          setUsers(profilesData);
        }
        
        // Fetch decks
        const { data: decksData } = await supabase
          .from('decks')
          .select('id, name, color_identity, commander, user_id')
          .order('created_at', { ascending: false });
        
        if (decksData) {
          setDecks(decksData);
        }
        
        // Fetch upcoming events
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title')
          .eq('status', 'scheduled')
          .order('created_at', { ascending: false });
        
        if (eventsData) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Toggle player selection
  const togglePlayerSelection = (userId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(userId)) {
        const newSelection = prev.filter(id => id !== userId);
        // Remove player's deck selection if they're removed
        const newPlayerDecks = { ...playerDecks };
        delete newPlayerDecks[userId];
        setPlayerDecks(newPlayerDecks);
        return newSelection;
      } else {
        return [...prev, userId];
      }
    });
  };
  
  // Handle deck selection for a player
  const handleDeckSelection = (userId: string, deckId: string) => {
    setPlayerDecks(prev => ({
      ...prev,
      [userId]: deckId
    }));
  };
  
  // Get user by ID
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  // Get user's decks
  const getUserDecks = (userId: string) => {
    return decks.filter(deck => deck.user_id === userId);
  };
  
  // Create game
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (selectedPlayers.length < 2) {
        throw new Error('Se requieren al menos 2 jugadores');
      }
      
      // Check if all players have selected decks
      const missingDecks = selectedPlayers.filter(playerId => !playerDecks[playerId]);
      if (missingDecks.length > 0) {
        throw new Error('Todos los jugadores deben seleccionar un mazo');
      }
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No estás autenticado');
      }
      
      // Create game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          creator_id: userData.user.id,
          format,
          status: 'active',
          event_id: selectedEvent,
          turn_count: 1
        })
        .select();
      
      if (gameError) throw gameError;
      
      if (!gameData || gameData.length === 0) {
        throw new Error('Error al crear la partida');
      }
      
      const gameId = gameData[0].id;
      
      // Create game players
      const gamePlayers = selectedPlayers.map(playerId => ({
        game_id: gameId,
        user_id: playerId,
        deck_id: playerDecks[playerId],
        life_total: format === 'commander' ? 40 : 20,
        commander_tax: 0,
        is_monarch: false,
        has_initiative: false,
        is_eliminated: false
      }));
      
      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayers);
      
      if (playersError) throw playersError;
      
      // Notify parent component
      onGameCreated();
    } catch (error: any) {
      console.error('Error creating game:', error);
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (selectedPlayers.length < 2) {
        setError('Se requieren al menos 2 jugadores');
        return;
      }
    }
    
    setError(null);
    setStep(step + 1);
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
  };
  
  // Close modal with animation
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Formato
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {availableFormats.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    disabled={loading}
                    className={`flex items-center p-3 rounded-md ${
                      format === f.id
                        ? 'bg-blue-mana text-white'
                        : 'bg-black-light hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{f.icon}</span>
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {events.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Evento (opcional)
                </label>
                <select
                  value={selectedEvent || ''}
                  onChange={(e) => setSelectedEvent(e.target.value || null)}
                  disabled={loading}
                  className="input-magical"
                >
                  <option value="">Ninguno</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Selecciona Jugadores
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {users.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => togglePlayerSelection(user.id)}
                    disabled={loading || (user.id === currentUser)}
                    className={`flex items-center p-3 rounded-md ${
                      selectedPlayers.includes(user.id)
                        ? 'bg-blue-mana text-white'
                        : 'bg-black-light hover:bg-gray-800 text-gray-300'
                    } ${user.id === currentUser ? 'border-2 border-blue-light' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-mana flex items-center justify-center">
                          <span className="font-magical text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="truncate">{user.username}</span>
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Mínimo 2 jugadores. Tú estás seleccionado automáticamente.
              </p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-magical text-white">Seleccionar Mazos</h3>
            
            {selectedPlayers.length === 0 ? (
              <p className="text-gray-400">No hay jugadores seleccionados.</p>
            ) : (
              <div className="space-y-4">
                {selectedPlayers.map(playerId => {
                  const user = getUserById(playerId);
                  const userDecks = getUserDecks(playerId);
                  
                  return (
                    <div key={playerId} className="border border-gray-700 rounded-md p-3">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          {user?.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user?.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-mana flex items-center justify-center">
                              <span className="font-magical text-white">
                                {user?.username.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-white font-medium">{user?.username || 'Jugador'}</span>
                      </div>
                      
                      <label className="block text-sm text-gray-300 mb-1">
                        Mazo
                      </label>
                      {userDecks.length === 0 ? (
                        <p className="text-red-light text-sm">Este jugador no tiene mazos registrados</p>
                      ) : (
                        <select
                          value={playerDecks[playerId] || ''}
                          onChange={(e) => handleDeckSelection(playerId, e.target.value)}
                          disabled={loading}
                          className="input-magical w-full"
                          required
                        >
                          <option value="" disabled>Selecciona un mazo</option>
                          {userDecks.map(deck => (
                            <option key={deck.id} value={deck.id}>
                              {deck.name} {deck.commander ? `(${deck.commander})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  // Modal animation
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
      onClick={handleClose}
    >
      <motion.div
        className="w-full max-w-lg bg-black-mana/90 backdrop-blur-md border border-blue-mana/30 rounded-lg overflow-hidden shadow-xl"
        variants={modalVariants}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-2xl font-magical text-white">
            {step === 1 ? 'Iniciar Nueva Partida' : 'Seleccionar Mazos'}
          </h2>
        </div>
        
        {/* Modal content */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-mana/20 border border-red-mana/50 rounded-md text-red-light text-sm">
              {error}
            </div>
          )}
          
          {loading && step === 1 ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-mana"></div>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>
        
        {/* Modal footer */}
        <div className="p-5 border-t border-gray-700 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={loading}
              className="px-4 py-2 bg-black-light border border-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              Atrás
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-black-light border border-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              Cancelar
            </button>
          )}
          
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={loading || selectedPlayers.length < 2}
              className="px-4 py-2 bg-blue-mana text-white rounded-md hover:bg-blue-mana/80 disabled:bg-blue-mana/40 disabled:text-white/60 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || Object.keys(playerDecks).length !== selectedPlayers.length}
              className="px-4 py-2 bg-blue-mana text-white rounded-md hover:bg-blue-mana/80 disabled:bg-blue-mana/40 disabled:text-white/60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Iniciar Partida'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateGameModal;
