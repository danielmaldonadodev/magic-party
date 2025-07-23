import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

// Components
import MagicSpinner from '../../components/ui/MagicSpinner';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [spellCasting, setSpellCasting] = useState(false);
  const [error, setError] = useState('');
  
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSpellCasting(true);
    
    setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Navigate to feed on successful login
        navigate('/feed');
      } catch (error: any) {
        setError(error.message || 'Error al intentar el acceso');
      } finally {
        setLoading(false);
        setSpellCasting(false);
      }
    }, 1500); // Tiempo para la animación de "spell casting"
  }
  
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-lg shadow-purple-500/20 p-8">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-magical text-white">MagicParty</h1>
        <p className="text-purple-300 mt-2">Reúne a tu Conclave</p>
      </motion.div>
      
      {spellCasting ? (
        <div className="flex flex-col items-center justify-center py-12">
          <MagicSpinner colorIdentity="WUBRG" />
          <p className="text-purple-300 mt-6">Lanzando hechizo de invocación...</p>
        </div>
      ) : (
        <motion.form 
          onSubmit={handleLogin} 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {error && (
            <motion.div 
              className="p-3 bg-red-mana/20 border border-red-mana/50 rounded-md text-red-light text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Grimorio (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-magical"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              Palabra Arcana (Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-magical"
              required
              disabled={loading}
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white font-bold py-2 px-4 rounded-md transform transition hover:scale-105"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Lanzar Hechizo de Invocación
          </motion.button>
        </motion.form>
      )}
      
      <div className="mt-6 text-center">
        <Link to="/auth/register" className="text-purple-300 hover:text-purple-100 text-sm">
          ¿Aún no formas parte del Conclave? Únete
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
