import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import ColorIdentitySelector from '../auth/ColorIdentitySelector';

interface CreateDeckModalProps {
  onClose: () => void;
  onDeckCreated: () => void;
}

const CreateDeckModal = ({ onClose, onDeckCreated }: CreateDeckModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('commander');
  const [commander, setCommander] = useState('');
  const [colorIdentity, setColorIdentity] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Available formats
  const availableFormats = [
    { id: 'commander', name: 'Commander', icon: '👑' },
    { id: 'standard', name: 'Standard', icon: '🏆' },
    { id: 'modern', name: 'Modern', icon: '⚡' },
    { id: 'brawl', name: 'Brawl', icon: '🎭' },
    { id: 'pauper', name: 'Pauper', icon: '🧩' },
    { id: 'other', name: 'Otro', icon: '✨' },
  ];
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 2MB');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload image to Supabase Storage
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      const filePath = `${userData.user.id}/decks/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('deck-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('deck-images')
        .getPublicUrl(filePath);
      
      setImageUrl(data.publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError('Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle color identity change
  const handleColorIdentityChange = (colors: string[]) => {
    setColorIdentity(colors);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!name.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      if (colorIdentity.length === 0) {
        throw new Error('Debes seleccionar al menos un color');
      }
      
      // Format-specific validations
      if (format === 'commander' && !commander.trim()) {
        throw new Error('Debes especificar un comandante para mazos Commander');
      }
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No estás autenticado');
      }
      
      // Create deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert({
          user_id: userData.user.id,
          name: name.trim(),
          description: description.trim(),
          format,
          commander: format === 'commander' ? commander.trim() : null,
          color_identity: colorIdentity,
          image_url: imageUrl,
          wins: 0,
          losses: 0
        })
        .select();
      
      if (deckError) throw deckError;
      
      if (!deckData || deckData.length === 0) {
        throw new Error('Error al crear el mazo');
      }
      
      // Notify parent component
      onDeckCreated();
    } catch (error: any) {
      console.error('Error creating deck:', error);
      setError(error.message);
      setLoading(false);
    }
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (!name.trim()) {
        setError('El nombre es obligatorio');
        return;
      }
      
      if (format === 'commander' && !commander.trim()) {
        setError('Debes especificar un comandante para mazos Commander');
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
                Nombre del Mazo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Slivers tribales"
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
                placeholder="Describe tu mazo..."
                className="input-magical min-h-[80px]"
                disabled={loading}
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
            
            {format === 'commander' && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Comandante
                </label>
                <input
                  type="text"
                  value={commander}
                  onChange={(e) => setCommander(e.target.value)}
                  placeholder="Ej: Sliver Queen"
                  className="input-magical"
                  disabled={loading}
                />
              </div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Identidad de Color
              </label>
              <ColorIdentitySelector
                selectedColors={colorIdentity}
                onChange={handleColorIdentityChange}
                disabled={loading}
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-white mb-1">
                Imagen del Mazo (opcional)
              </label>
              <div className="mt-2 flex items-center">
                {!imageUrl ? (
                  <button
                    type="button"
                    onClick={handleImageClick}
                    disabled={loading}
                    className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-md p-6 w-full hover:border-blue-mana transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-2 text-sm text-gray-400">Subir imagen</span>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                  </button>
                ) : (
                  <div className="relative w-full">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="h-48 w-full object-cover rounded-md"
                    />
                    <button 
                      onClick={() => setImageUrl(null)}
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-1 text-white"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
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
            {step === 1 ? 'Crear Nuevo Mazo' : 'Identidad de Color e Imagen'}
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
              disabled={loading || colorIdentity.length === 0}
              className="px-4 py-2 bg-blue-mana text-white rounded-md hover:bg-blue-mana/80 disabled:bg-blue-mana/40 disabled:text-white/60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Mazo'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateDeckModal;
