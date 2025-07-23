import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

// Components
import MagicSpinner from '../components/ui/MagicSpinner';
import DeckCard from '../components/decks/DeckCard';
import CreateDeckModal from '../components/decks/CreateDeckModal';

// Types
interface Deck {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color_identity: string[];
  commander?: string;
  image_url?: string;
  created_at: string;
  wins: number;
  losses: number;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

const DecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('my');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserAndDecks = async () => {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUser(userData.user.id);
      }
      
      // Fetch decks
      fetchDecks(userData?.user?.id || null);
    };
    
    getUserAndDecks();
  }, [activeFilter]);
  
  async function fetchDecks(userId: string | null) {
    try {
      setLoading(true);
      setError(null);
      
      // Construct query based on active filter
      let query = supabase
        .from('decks')
        .select(`
          *,
          profiles:user_id(username, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (activeFilter === 'my' && userId) {
        query = query.eq('user_id', userId);
      } else if (activeFilter === 'commander') {
        query = query.not('commander', 'is', null);
      } else if (activeFilter === 'standard') {
        query = query.eq('format', 'standard');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setDecks(data || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleDeckCreated = () => {
    setShowModal(false);
    fetchDecks(currentUser);
  };
  
  const filterButtons = [
    { id: 'my', label: 'Mis Mazos' },
    { id: 'all', label: 'Todos' },
    { id: 'commander', label: 'Commander' },
    { id: 'standard', label: 'Standard' },
  ];
  
  // Color identity icons
  const colorIcons: Record<string, string> = {
    'W': '⚪',
    'U': '🔵',
    'B': '⚫',
    'R': '🔴',
    'G': '🟢',
    'C': '⚙️',
  };
  
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-magical text-white">Mazos</h1>
        
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Mazo
        </motion.button>
      </div>
      
      {/* Filter tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
        {filterButtons.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
              activeFilter === filter.id 
                ? 'bg-blue-mana text-white'
                : 'bg-black-light/50 text-gray-300 hover:bg-black-light'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Decks list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <MagicSpinner colorIdentity="WUBRG" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white">
          Error cargando mazos: {error}
        </div>
      ) : decks.length === 0 ? (
        <div className="p-8 bg-black-light/30 border border-blue-mana/30 rounded-md text-center">
          <p className="text-white text-lg font-magical mb-2">No hay mazos</p>
          <p className="text-gray-400 mb-6">
            {activeFilter === 'my' && 'Aún no has creado ningún mazo.'}
            {activeFilter === 'all' && 'No hay mazos creados aún en el grupo.'}
            {activeFilter === 'commander' && 'No hay mazos de Commander registrados.'}
            {activeFilter === 'standard' && 'No hay mazos de Standard registrados.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Crear tu primer mazo
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {decks.map(deck => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <DeckCard deck={deck} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Create deck modal */}
      <AnimatePresence>
        {showModal && (
          <CreateDeckModal 
            onClose={() => setShowModal(false)} 
            onDeckCreated={handleDeckCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DecksPage;
