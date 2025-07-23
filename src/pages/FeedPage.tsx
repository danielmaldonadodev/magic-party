import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

// Components
import PostCard from '../components/feed/PostCard';
import EventPreview from '../components/feed/EventPreview';
import CreatePostBox from '../components/feed/CreatePostBox';
import MagicSpinner from '../components/ui/MagicSpinner';

// Types
interface Post {
  id: string;
  content: string;
  created_at: string;
  image_url?: string;
  type: 'normal' | 'event' | 'deck';
  user_id: string;
  profiles?: {
    username: string;
    avatar_url?: string;
    color_identity: string[];
  };
  reactions?: Reaction[];
  event?: Event;
}

interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  format: string;
  status: string;
}

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostAdded, setNewPostAdded] = useState(false);
  
  useEffect(() => {
    fetchPosts();
  }, [newPostAdded]);
  
  async function fetchPosts() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id(username, avatar_url, color_identity),
          reactions(*),
          event:id(*)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setPosts(data || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleNewPost = () => {
    setNewPostAdded(!newPostAdded);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-6"
    >
      <h1 className="text-2xl font-magical mb-6 text-white">Conclave Feed</h1>
      
      <CreatePostBox onPostCreated={handleNewPost} />
      
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <MagicSpinner colorIdentity="WUBRG" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white">
            Error cargando el feed: {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 bg-black-light/30 border border-blue-mana/30 rounded-md text-center">
            <p className="text-white mb-2">No hay publicaciones aún</p>
            <p className="text-gray-400 text-sm">
              ¡Sé el primero en compartir algo con tu Conclave!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {post.type === 'event' && post.event ? (
                <EventPreview event={post.event} post={post} onReactionAdded={handleNewPost} />
              ) : (
                <PostCard post={post} onReactionAdded={handleNewPost} />
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default FeedPage;
