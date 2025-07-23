import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
}

interface ReactionOrbsProps {
  reactions: Reaction[];
  onReactionClick: (type: string) => void;
  isDisabled: boolean;
}

const ReactionOrbs = ({ reactions, onReactionClick, isDisabled }: ReactionOrbsProps) => {
  const [showSelector, setShowSelector] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get count of each reaction type
  const reactionCounts: Record<string, number> = {};
  reactions.forEach(reaction => {
    reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
  });
  
  // Available reaction types (mana colors)
  const reactionTypes = [
    { id: 'W', label: 'Orden', class: 'mana-w' },
    { id: 'U', label: 'Sabiduría', class: 'mana-u' },
    { id: 'B', label: 'Poder', class: 'mana-b' },
    { id: 'R', label: 'Pasión', class: 'mana-r' },
    { id: 'G', label: 'Naturaleza', class: 'mana-g' },
  ];
  
  // Check if current user already reacted with specific type
  const hasUserReacted = (type: string): boolean => {
    if (!currentUserId) return false;
    return reactions.some(r => r.user_id === currentUserId && r.reaction_type === type);
  };
  
  // Get current user on component mount
  useState(() => {
    async function getCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    }
    
    getCurrentUser();
  });
  
  // Handle reaction click
  const handleReactionClick = (type: string) => {
    if (isDisabled) return;
    onReactionClick(type);
    setShowSelector(false);
  };
  
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {/* Show existing reaction types */}
        {Object.entries(reactionCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => handleReactionClick(type)}
            disabled={isDisabled}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
              hasUserReacted(type) 
                ? 'bg-gray-700/70 shadow-md' 
                : 'bg-gray-800/40'
            } transition-all hover:bg-gray-700`}
          >
            <span className={`w-4 h-4 rounded-full ${reactionTypes.find(r => r.id === type)?.class || 'mana-c'}`}></span>
            <span className="text-xs text-white">{count}</span>
          </button>
        ))}
        
        {/* Add reaction button */}
        <motion.button
          onClick={() => setShowSelector(!showSelector)}
          disabled={isDisabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-full bg-gray-800/40 flex items-center justify-center hover:bg-gray-700 transition-all"
        >
          <span className="text-white text-xl font-thin">+</span>
        </motion.button>
      </div>
      
      {/* Reaction selector */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute bottom-full left-0 mb-2 p-2 bg-black-light/90 backdrop-blur-sm border border-blue-mana/30 rounded-lg shadow-lg z-10"
          >
            <div className="flex space-x-2 items-center">
              {reactionTypes.map(type => (
                <motion.button
                  key={type.id}
                  onClick={() => handleReactionClick(type.id)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 rounded-full ${type.class} shadow-md flex items-center justify-center`}
                  title={type.label}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionOrbs;
