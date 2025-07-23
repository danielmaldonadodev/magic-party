import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

interface CreatePostBoxProps {
  onPostCreated: () => void;
}

const CreatePostBox = ({ onPostCreated }: CreatePostBoxProps) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleTextareaFocus = () => {
    setIsExpanded(true);
  };
  
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
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Upload image to Supabase Storage
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      const filePath = `${userData.user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);
      
      setImageUrl(data.publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError('Error al subir la imagen');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Create post
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: userData.user.id,
          content: content.trim(),
          image_url: imageUrl,
          type: 'normal'
        });
      
      if (error) throw error;
      
      // Reset form
      setContent('');
      setImageUrl(null);
      setIsExpanded(false);
      
      // Notify parent
      onPostCreated();
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError('Error al crear la publicación');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    setContent('');
    setImageUrl(null);
    setIsExpanded(false);
    setError(null);
  };
  
  return (
    <div className="card-frame">
      <div className="p-4">
        <h3 className="text-lg font-magical text-white mb-3">
          Comparte tu sabiduría mágica
        </h3>
        
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleTextareaFocus}
            placeholder="¿Qué está pasando en tu multiverso?"
            className="w-full bg-black-light/50 border border-blue-mana/20 rounded-md p-3 text-white min-h-[60px] resize-none focus:ring-2 focus:ring-blue-mana focus:border-transparent"
            rows={isExpanded ? 4 : 2}
            disabled={isLoading}
          />
          
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 flex flex-col space-y-3"
            >
              {/* Image preview */}
              {imageUrl && (
                <div className="relative">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-40 rounded-md object-contain w-full" 
                  />
                  <button 
                    onClick={() => setImageUrl(null)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="text-red-mana text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                {/* Image upload button */}
                <button
                  onClick={handleImageClick}
                  disabled={isLoading}
                  className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </button>
                
                <div className="ml-auto flex space-x-2">
                  {/* Cancel button */}
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  
                  {/* Submit button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={isLoading || (!content.trim() && !imageUrl)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-md transition-all font-medium ${
                      isLoading || (!content.trim() && !imageUrl)
                        ? 'bg-blue-mana/40 text-white/60 cursor-not-allowed'
                        : 'bg-blue-mana text-white hover:bg-blue-mana/80'
                    }`}
                  >
                    {isLoading ? 'Conjurando...' : 'Publicar'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePostBox;
