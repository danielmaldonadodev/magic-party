import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // After animation, navigate to login
    const timer = setTimeout(() => {
      navigate('/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black-mana flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: [0, 5, 0, -5, 0],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 2,
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: "easeInOut"
        }}
        className="text-center"
      >
        <h1 className="font-magical text-6xl bg-gradient-to-r from-blue-mana via-purple-500 to-red-mana bg-clip-text text-transparent mb-4">
          MagicParty
        </h1>
        
        <div className="mt-8 flex justify-center space-x-4">
          {/* WUBRG Mana Symbols */}
          {['w', 'u', 'b', 'r', 'g'].map((color, index) => (
            <motion.div
              key={color}
              className={`mana-orb mana-${color}`}
              animate={{ 
                scale: [1, 1.2, 1],
                y: [0, -15, 0] 
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <motion.p 
          className="text-white-mana mt-6 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          El Conclave te espera...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashPage;
