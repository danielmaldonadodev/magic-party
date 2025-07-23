import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

// Components
import MagicSpinner from '../components/ui/MagicSpinner';
import EventCard from '../components/events/EventCard';
import CreateEventModal from '../components/events/CreateEventModal';

// Types
interface Event {
  id: string;
  creator_id: string;
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
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('upcoming');
  
  useEffect(() => {
    fetchEvents();
  }, [activeFilter]);
  
  async function fetchEvents() {
    try {
      setLoading(true);
      setError(null);
      
      // Construct query based on active filter
      let query = supabase
        .from('events')
        .select(`
          *,
          profiles:creator_id(username, avatar_url),
          event_dates(*),
          event_participants(*)
        `)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (activeFilter === 'upcoming') {
        query = query.eq('status', 'scheduled');
      } else if (activeFilter === 'pending') {
        query = query.eq('status', 'pending');
      } else if (activeFilter === 'past') {
        query = query.eq('status', 'completed');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleEventCreated = () => {
    setShowModal(false);
    fetchEvents();
  };
  
  const filterButtons = [
    { id: 'upcoming', label: 'Próximos' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'past', label: 'Pasados' },
    { id: 'all', label: 'Todos' },
  ];
  
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-magical text-white">Eventos</h1>
        
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Evento
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
      
      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <MagicSpinner colorIdentity="WUBRG" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white">
          Error cargando eventos: {error}
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 bg-black-light/30 border border-blue-mana/30 rounded-md text-center">
          <p className="text-white text-lg font-magical mb-2">No hay eventos</p>
          <p className="text-gray-400 mb-6">
            {activeFilter === 'upcoming' && 'No hay eventos próximos programados.'}
            {activeFilter === 'pending' && 'No hay eventos pendientes de confirmación.'}
            {activeFilter === 'past' && 'No hay eventos pasados registrados.'}
            {activeFilter === 'all' && 'No hay eventos creados aún.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Crear el primer evento
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {events.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Create event modal */}
      <AnimatePresence>
        {showModal && (
          <CreateEventModal 
            onClose={() => setShowModal(false)} 
            onEventCreated={handleEventCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsPage;
