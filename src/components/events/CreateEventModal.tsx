import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

interface CreateEventModalProps {
  onClose: () => void;
  onEventCreated: () => void;
}

const CreateEventModal = ({ onClose, onEventCreated }: CreateEventModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('commander');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [proposedDates, setProposedDates] = useState([{ date: '', time: '' }]);
  
  // Available formats
  const availableFormats = [
    { id: 'commander', name: 'Commander', icon: '👑' },
    { id: 'standard', name: 'Standard', icon: '🏆' },
    { id: 'draft', name: 'Draft', icon: '📦' },
    { id: 'modern', name: 'Modern', icon: '⚡' },
    { id: 'brawl', name: 'Brawl', icon: '🎭' },
    { id: 'sealed', name: 'Sealed', icon: '🎁' },
    { id: 'other', name: 'Otro', icon: '✨' },
  ];
  
  // Handle adding another date
  const addDate = () => {
    setProposedDates([...proposedDates, { date: '', time: '' }]);
  };
  
  // Handle removing a date
  const removeDate = (index: number) => {
    const newDates = [...proposedDates];
    newDates.splice(index, 1);
    setProposedDates(newDates);
  };
  
  // Handle date change
  const handleDateChange = (index: number, field: 'date' | 'time', value: string) => {
    const newDates = [...proposedDates];
    newDates[index][field] = value;
    setProposedDates(newDates);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!title.trim()) {
        throw new Error('El título es obligatorio');
      }
      
      if (!description.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      
      if (proposedDates.length === 0) {
        throw new Error('Debes proponer al menos una fecha');
      }
      
      // Check if all dates are valid
      const invalidDates = proposedDates.filter(
        d => !d.date || !d.time
      );
      
      if (invalidDates.length > 0) {
        throw new Error('Todas las fechas propuestas deben tener fecha y hora');
      }
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No estás autenticado');
      }
      
      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          creator_id: userData.user.id,
          title,
          description,
          format,
          max_players: maxPlayers,
          status: 'pending' // Initial status
        })
        .select();
      
      if (eventError) throw eventError;
      
      if (!eventData || eventData.length === 0) {
        throw new Error('Error al crear el evento');
      }
      
      const eventId = eventData[0].id;
      
      // Create event dates
      const eventDates = proposedDates.map(d => {
        const dateTime = `${d.date}T${d.time}`;
        return {
          event_id: eventId,
          proposed_date: dateTime,
          votes: []
        };
      });
      
      const { error: dateError } = await supabase
        .from('event_dates')
        .insert(eventDates);
      
      if (dateError) throw dateError;
      
      // Add creator as participant with 'going' status
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userData.user.id,
          status: 'going'
        });
      
      if (participantError) throw participantError;
      
      // Create post about the event
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userData.user.id,
          content: `¡He creado un nuevo evento: ${title}! Confirma tu asistencia.`,
          type: 'event',
          event_id: eventId
        });
      
      if (postError) throw postError;
      
      // Notify parent component
      onEventCreated();
    } catch (error: any) {
      console.error('Error creating event:', error);
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (!title.trim() || !description.trim()) {
        setError('El título y la descripción son obligatorios');
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
                Título del Evento
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Commander Night"
                className="input-magical"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el evento..."
                className="input-magical min-h-[100px]"
                disabled={loading}
                required
              />
            </div>
            
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
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Número Máximo de Jugadores
              </label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
                min="2"
                max="16"
                className="input-magical"
                disabled={loading}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-magical text-white">Propón Fechas</h3>
            <p className="text-gray-400 text-sm">
              Puedes proponer varias opciones para que los demás voten
            </p>
            
            {proposedDates.map((dateObj, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white mb-1">
                    Fecha {index + 1}
                  </label>
                  <input
                    type="date"
                    value={dateObj.date}
                    onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                    className="input-magical"
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={dateObj.time}
                    onChange={(e) => handleDateChange(index, 'time', e.target.value)}
                    className="input-magical"
                    disabled={loading}
                    required
                  />
                </div>
                
                {proposedDates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDate(index)}
                    disabled={loading}
                    className="mt-6 p-2 text-red-mana hover:text-red-light"
                    aria-label="Eliminar fecha"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addDate}
              disabled={loading}
              className="flex items-center text-blue-light hover:text-blue-mana/80"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Añadir otra fecha
            </button>
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
            {step === 1 ? 'Crear Nuevo Evento' : 'Proponer Fechas'}
          </h2>
        </div>
        
        {/* Modal content */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-mana/20 border border-red-mana/50 rounded-md text-red-light text-sm">
              {error}
            </div>
          )}
          
          {renderStepContent()}
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
              disabled={loading}
              className="px-4 py-2 bg-blue-mana text-white rounded-md hover:bg-blue-mana/80"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-mana text-white rounded-md hover:bg-blue-mana/80"
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateEventModal;
