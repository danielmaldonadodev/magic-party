import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

// Components
import MagicSpinner from '../../components/ui/MagicSpinner';
import ColorIdentitySelector from '../../components/auth/ColorIdentitySelector';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [colorIdentity, setColorIdentity] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            color_identity: colorIdentity.join(''),
          },
        },
      });
      
      if (authError) throw authError;
      
      // Create profile record if sign up was successful
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              username,
              color_identity: colorIdentity,
              bio: '',
              favorite_commanders: [],
              favorite_formats: [],
              achievement_ids: [],
            },
          ]);
          
        if (profileError) throw profileError;
      }
      
      // Navigate to feed on successful registration
      navigate('/feed');
    } catch (error: any) {
      setError(error.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }
  
  const nextStep = () => {
    if (currentStep === 1 && (!email || !password)) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (currentStep === 2 && !username) {
      setError('Por favor elige un nombre de invocador');
      return;
    }
    
    setError('');
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };
  
  // Render based on current step
  const renderStep = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <MagicSpinner colorIdentity={colorIdentity.join('')} />
          <p className="text-purple-300 mt-6">Forjando tu vínculo planeswalker...</p>
        </div>
      );
    }
    
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-white text-xl mb-4 font-magical">Credenciales Arcanas</h2>
            <div className="space-y-4">
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
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white font-bold py-2 px-4 rounded-md transform transition hover:scale-105"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-white text-xl mb-4 font-magical">Tu Identidad</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-1">
                  Nombre de Invocador
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-magical"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={prevStep}
                className="w-1/2 bg-black-light border border-gray-600 text-white font-bold py-2 px-4 rounded-md transform transition hover:bg-gray-800"
              >
                Atrás
              </button>
              <button
                onClick={nextStep}
                className="w-1/2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white font-bold py-2 px-4 rounded-md transform transition hover:scale-105"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-white text-xl mb-4 font-magical">Tu Identidad de Color</h2>
            
            <ColorIdentitySelector
              selected={colorIdentity}
              onChange={setColorIdentity}
            />
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={prevStep}
                className="w-1/2 bg-black-light border border-gray-600 text-white font-bold py-2 px-4 rounded-md transform transition hover:bg-gray-800"
              >
                Atrás
              </button>
              <button
                onClick={handleRegister}
                className="w-1/2 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-red-700 text-white font-bold py-2 px-4 rounded-md transform transition hover:scale-105"
                disabled={loading}
              >
                Completar Registro
              </button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-lg shadow-purple-500/20 p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-magical text-white">Unirse al Conclave</h1>
        <p className="text-purple-300 mt-2">Crea tu identidad de planeswalker</p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className={`w-1/3 h-1 rounded-full ${
              currentStep >= step ? 'bg-blue-mana' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-mana/20 border border-red-mana/50 rounded-md text-red-light text-sm mb-4">
          {error}
        </div>
      )}
      
      {/* Step content */}
      {renderStep()}
      
      {/* Sign in link */}
      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-purple-300 hover:text-purple-100 text-sm">
          ¿Ya tienes acceso al Conclave? Inicia sesión
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
