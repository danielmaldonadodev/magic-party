import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabaseClient';

// Components
import MagicSpinner from '../components/ui/MagicSpinner';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface EventDate {
  id: string;
  event_id: string;
  proposed_date: string;
  is_confirmed: boolean;
  votes: number;
}

interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  profile: Profile;
}

interface Event {
  id: string;
  title: string;
  description: string;
  format: string;
  max_players: number;
  status: string;
  created_at: string;
  creator_id: string;
  image_url?: string;
  creator: Profile;
  event_dates: EventDate[];
  event_participants: EventParticipant[];
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserStatus, setCurrentUserStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch event and current user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        setCurrentUserId(userData?.user?.id || null);
        
        if (!id) {
          setError('ID de evento no encontrado');
          return;
        }
        
        // Fetch event details with related data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            *,
            creator:creator_id(*),
            event_dates(*),
            event_participants(*, profile:user_id(*))
          `)
          .eq('id', id)
          .single();
        
        if (eventError) {
          throw eventError;
        }
        
        setEvent(eventData);
        
        // Check if current user is participant
        if (userData?.user?.id) {
          const userParticipant = eventData.event_participants.find(
            (p: EventParticipant) => p.user_id === userData.user?.id
          );
          
          setCurrentUserStatus(userParticipant?.status || null);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up subscription for real-time updates
    if (id) {
      const subscription = supabase
        .channel(`event_${id}`)
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'events', filter: `id=eq.${id}` },
            () => fetchData())
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'event_dates', filter: `event_id=eq.${id}` },
            () => fetchData())
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'event_participants', filter: `event_id=eq.${id}` },
            () => fetchData())
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [id]);
  
  // Format event status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pendiente', class: 'bg-yellow-mana/20 text-yellow-light' };
      case 'scheduled':
        return { text: 'Confirmado', class: 'bg-green-mana/20 text-green-light' };
      case 'completed':
        return { text: 'Completado', class: 'bg-blue-mana/20 text-blue-light' };
      case 'cancelled':
        return { text: 'Cancelado', class: 'bg-red-mana/20 text-red-light' };
      default:
        return { text: 'Desconocido', class: 'bg-gray-700 text-gray-300' };
    }
  };
  
  // Join event
  const handleJoinEvent = async () => {
    if (!event || !currentUserId) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: currentUserId,
          status: 'attending'
        });
      
      if (error) throw error;
      
      setCurrentUserStatus('attending');
    } catch (error) {
      console.error('Error joining event:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Leave event
  const handleLeaveEvent = async () => {
    if (!event || !currentUserId) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', event.id)
        .eq('user_id', currentUserId);
      
      if (error) throw error;
      
      setCurrentUserStatus(null);
    } catch (error) {
      console.error('Error leaving event:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Vote for date
  const handleVoteDate = async (dateId: string) => {
    if (!event || !currentUserId) return;
    
    try {
      setSubmitting(true);
      
      // Check if user has already voted for this date
      const { data: existingVotes, error: checkError } = await supabase
        .from('event_date_votes')
        .select('*')
        .eq('date_id', dateId)
        .eq('user_id', currentUserId);
      
      if (checkError) throw checkError;
      
      if (existingVotes && existingVotes.length > 0) {
        // Remove vote
        const { error: deleteError } = await supabase
          .from('event_date_votes')
          .delete()
          .eq('date_id', dateId)
          .eq('user_id', currentUserId);
        
        if (deleteError) throw deleteError;
        
        // Update votes count
        const { error: updateError } = await supabase
          .from('event_dates')
          .update({ votes: supabase.rpc('decrement') })
          .eq('id', dateId);
        
        if (updateError) throw updateError;
      } else {
        // Add vote
        const { error: insertError } = await supabase
          .from('event_date_votes')
          .insert({
            date_id: dateId,
            user_id: currentUserId
          });
        
        if (insertError) throw insertError;
        
        // Update votes count
        const { error: updateError } = await supabase
          .from('event_dates')
          .update({ votes: supabase.rpc('increment') })
          .eq('id', dateId);
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error voting for date:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Check if max players reached
  const isEventFull = event 
    ? event.event_participants.filter(p => p.status === 'attending').length >= event.max_players
    : false;
  
  // Get confirmed date if available
  const confirmedDate = event 
    ? event.event_dates.find(date => date.is_confirmed)
    : null;
  
  return (
    <div className="pb-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <MagicSpinner colorIdentity="WUBRG" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white mb-6">
          {error}
        </div>
      ) : !event ? (
        <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white mb-6">
          No se ha encontrado el evento
        </div>
      ) : (
        <>
          {/* Event header */}
          <div className="mb-6">
            <Link to="/events" className="text-blue-light hover:underline mb-2 inline-block">
              ← Volver a eventos
            </Link>
            
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-magical text-white">{event.title}</h1>
              
              <div className={`px-3 py-1 rounded-full text-sm ${getStatusDisplay(event.status).class}`}>
                {getStatusDisplay(event.status).text}
              </div>
            </div>
            
            <p className="text-gray-400 mt-1">
              Creado por {event.creator?.username || 'Usuario desconocido'} • 
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: es })}
            </p>
          </div>
          
          {/* Event details */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="card-frame">
                <h2 className="text-xl font-magical text-white mb-3">Descripción</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
              </div>
              
              {/* Confirmed date info */}
              {confirmedDate && (
                <div className="card-frame border-2 border-green-mana/50">
                  <h2 className="text-xl font-magical text-white mb-3">Fecha confirmada</h2>
                  <div className="bg-green-mana/10 rounded-md p-3 text-white">
                    <p className="text-lg">{formatDate(confirmedDate.proposed_date)}</p>
                  </div>
                </div>
              )}
              
              {/* Proposed dates */}
              {!confirmedDate && event.event_dates.length > 0 && (
                <div className="card-frame">
                  <h2 className="text-xl font-magical text-white mb-3">Fechas propuestas</h2>
                  <div className="space-y-3">
                    {event.event_dates.map(date => (
                      <div 
                        key={date.id} 
                        className="flex justify-between items-center p-3 rounded-md bg-black-light/50 hover:bg-black-light/70 transition-colors"
                      >
                        <div>
                          <p className="text-white">{formatDate(date.proposed_date)}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-3">
                            {date.votes} {date.votes === 1 ? 'voto' : 'votos'}
                          </span>
                          
                          {currentUserStatus === 'attending' && (
                            <button
                              onClick={() => handleVoteDate(date.id)}
                              disabled={submitting}
                              className="px-3 py-1 bg-blue-mana/20 text-blue-light rounded-md hover:bg-blue-mana/40 disabled:opacity-50"
                            >
                              Votar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Format info */}
              <div className="card-frame">
                <h2 className="text-xl font-magical text-white mb-3">Formato</h2>
                <p className="text-white">{event.format}</p>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action buttons */}
              <div className="card-frame">
                {currentUserStatus ? (
                  <button
                    onClick={handleLeaveEvent}
                    disabled={submitting || event.creator_id === currentUserId}
                    className="w-full py-2 bg-red-mana/20 hover:bg-red-mana/40 text-red-light rounded-md transition-colors disabled:opacity-50"
                  >
                    {event.creator_id === currentUserId ? 'No puedes abandonar tu propio evento' : 'Abandonar evento'}
                  </button>
                ) : (
                  <button
                    onClick={handleJoinEvent}
                    disabled={submitting || isEventFull || event.status !== 'pending'}
                    className="w-full py-2 bg-blue-mana hover:bg-blue-mana/80 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {isEventFull ? 'Evento completo' : event.status !== 'pending' ? 'No disponible' : 'Unirse al evento'}
                  </button>
                )}
              </div>
              
              {/* Participants */}
              <div className="card-frame">
                <h2 className="text-xl font-magical text-white mb-3">
                  Participantes ({event.event_participants.length}/{event.max_players})
                </h2>
                <div className="space-y-2">
                  {event.event_participants.length === 0 ? (
                    <p className="text-gray-400">Aún no hay participantes</p>
                  ) : (
                    event.event_participants.map(participant => (
                      <div key={participant.id} className="flex items-center p-2 rounded-md hover:bg-black-light/50">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          {participant.profile?.avatar_url ? (
                            <img 
                              src={participant.profile.avatar_url} 
                              alt={participant.profile.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-mana flex items-center justify-center">
                              <span className="font-magical text-white">
                                {participant.profile?.username.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <span className="text-white">
                          {participant.profile?.username || 'Usuario desconocido'}
                          {participant.user_id === event.creator_id && (
                            <span className="ml-2 text-xs bg-blue-mana/20 px-2 py-1 rounded">Organizador</span>
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetailPage;
