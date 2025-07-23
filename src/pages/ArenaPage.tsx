import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

// Components
import MagicSpinner from '../components/ui/MagicSpinner';
import ActiveGameCard from '../components/arena/ActiveGameCard';
import CreateGameModal from '../components/arena/CreateGameModal';

// Types
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

const ArenaPage = () => {
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [pastGames, setPastGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPastGames, setShowPastGames] = useState(false);
  
  useEffect(() => {
    fetchGames();
    
    // Set up realtime subscription for game updates
    const gameSubscription = supabase
      .channel('game_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' }, 
        () => {
          fetchGames();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_players' }, 
        () => {
          fetchGames();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(gameSubscription);
    };
  }, []);
  
  async function fetchGames() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch active games
      const { data: activeGamesData, error: activeGamesError } = await supabase
        .from('games')
        .select(`
          *,
          game_players(
            *,
            profile:user_id(*),
            deck:deck_id(*)
          )
        `)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });
      
      if (activeGamesError) throw activeGamesError;
      
      // Fetch recent completed games
      const { data: pastGamesData, error: pastGamesError } = await supabase
        .from('games')
        .select(`
          *,
          game_players(
            *,
            profile:user_id(*),
            deck:deck_id(*)
          )
        `)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (pastGamesError) throw pastGamesError;
      
      setActiveGames(activeGamesData || []);
      setPastGames(pastGamesData || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleGameCreated = () => {
    setShowModal(false);
    fetchGames();
  };
  
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-magical text-white">Arena</h1>
        
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Partida
        </motion.button>
      </div>
      
      {/* Active games */}
      <section>
        <h2 className="text-xl font-magical text-white mb-4">Partidas en Curso</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <MagicSpinner colorIdentity="WUBRG" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white mb-6">
            Error cargando partidas: {error}
          </div>
        ) : activeGames.length === 0 ? (
          <div className="p-8 bg-black-light/30 border border-blue-mana/30 rounded-md text-center mb-8">
            <p className="text-white text-lg font-magical mb-2">No hay partidas en curso</p>
            <p className="text-gray-400 mb-6">
              Inicia una nueva partida para comenzar a registrar vida y efectos.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Iniciar partida
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <AnimatePresence initial={false}>
              {activeGames.map(game => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ActiveGameCard game={game} isActive={true} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
      
      {/* Past games */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-magical text-white">Partidas Recientes</h2>
          
          <button
            onClick={() => setShowPastGames(!showPastGames)}
            className="flex items-center text-blue-light hover:text-blue-mana"
          >
            {showPastGames ? 'Ocultar' : 'Mostrar'}
            <svg 
              className={`w-5 h-5 ml-1 transform transition-transform ${showPastGames ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <AnimatePresence>
          {showPastGames && pastGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {pastGames.map(game => (
                  <ActiveGameCard key={game.id} game={game} isActive={false} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {showPastGames && pastGames.length === 0 && !loading && (
          <div className="p-4 bg-black-light/30 border border-gray-800 rounded-md text-center">
            <p className="text-gray-400">
              No hay partidas completadas recientes.
            </p>
          </div>
        )}
      </section>
      
      {/* Create game modal */}
      <AnimatePresence>
        {showModal && (
          <CreateGameModal 
            onClose={() => setShowModal(false)} 
            onGameCreated={handleGameCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArenaPage;
