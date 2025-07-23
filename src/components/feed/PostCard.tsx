import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

// Components
import ReactionOrbs from './ReactionOrbs';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    image_url?: string;
    user_id: string;
    profiles?: {
      username: string;
      avatar_url?: string;
      color_identity: string[];
    };
    reactions?: Array<{
      id: string;
      post_id: string;
      user_id: string;
      reaction_type: string;
    }>;
  };
  onReactionAdded: () => void;
}

const PostCard = ({ post, onReactionAdded }: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  // Get formatted time
  const formattedTime = formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: true,
    locale: es
  });
  
  // Get color identity of user
  const userColorIdentity = post.profiles?.color_identity || [];
  
  // Get first color for theme, or default to blue
  const primaryColor = userColorIdentity.length > 0 
    ? userColorIdentity[0] 
    : 'U';
  
  // Map color letter to class
  const getColorClass = (color: string) => {
    switch (color) {
      case 'W': return 'from-white-mana to-white-accent';
      case 'U': return 'from-blue-mana to-blue-light';
      case 'B': return 'from-black-light to-black-mana';
      case 'R': return 'from-red-mana to-red-light';
      case 'G': return 'from-green-mana to-green-light';
      default: return 'from-blue-mana to-blue-light';
    }
  };
  
  const borderGradient = `bg-gradient-to-r ${getColorClass(primaryColor)}`;
  
  // Handle adding reaction
  const handleReaction = async (reactionType: string) => {
    try {
      setIsReacting(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) throw new Error('User not authenticated');
      
      // Check if user already reacted with this type
      const existingReaction = post.reactions?.find(
        r => r.user_id === userData.user?.id && r.reaction_type === reactionType
      );
      
      if (existingReaction) {
        // Remove reaction if already exists
        await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add new reaction
        await supabase
          .from('reactions')
          .insert({
            post_id: post.id,
            user_id: userData.user.id,
            reaction_type: reactionType
          });
      }
      
      // Notify parent to refresh
      onReactionAdded();
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsReacting(false);
    }
  };
  
  // Get content for display
  const displayContent = isExpanded || post.content.length <= 280
    ? post.content
    : post.content.substring(0, 280) + '...';
  
  return (
    <div className="card-frame overflow-hidden">
      {/* Header with colored border */}
      <div className={`h-1 w-full ${borderGradient}`}></div>
      
      <div className="p-4">
        {/* Author info */}
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden mr-3">
            {post.profiles?.avatar_url ? (
              <img 
                src={post.profiles.avatar_url} 
                alt={post.profiles.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getColorClass(primaryColor)}`}>
                <span className="font-magical text-white text-lg">
                  {post.profiles?.username.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-magical text-white">
              {post.profiles?.username || 'Planeswalker Anónimo'}
            </h3>
            <p className="text-gray-400 text-xs">
              {formattedTime}
            </p>
          </div>
          
          {/* Color identity indicators */}
          <div className="ml-auto flex space-x-1">
            {userColorIdentity.map((color, index) => {
              let bgColor = '';
              switch (color) {
                case 'W': bgColor = 'bg-white-mana'; break;
                case 'U': bgColor = 'bg-blue-mana'; break;
                case 'B': bgColor = 'bg-black-mana'; break;
                case 'R': bgColor = 'bg-red-mana'; break;
                case 'G': bgColor = 'bg-green-mana'; break;
                default: bgColor = 'bg-colorless';
              }
              return <div key={index} className={`w-3 h-3 rounded-full ${bgColor}`}></div>
            })}
          </div>
        </div>
        
        {/* Post content */}
        <div className="text-white mt-2 whitespace-pre-wrap break-words">
          {displayContent}
          
          {post.content.length > 280 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-light ml-2 text-sm hover:underline"
            >
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
        
        {/* Post image if available */}
        {post.image_url && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Post content" 
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
        )}
        
        {/* Reactions */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <ReactionOrbs 
            reactions={post.reactions || []} 
            onReactionClick={handleReaction}
            isDisabled={isReacting}
          />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
