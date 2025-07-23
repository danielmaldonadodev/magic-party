import { motion } from 'framer-motion';

interface MagicSpinnerProps {
  colorIdentity: string; // Can be 'W', 'U', 'B', 'R', 'G', 'C' or combinations like 'WUBRG'
}

const MagicSpinner = ({ colorIdentity = 'WUBRG' }: MagicSpinnerProps) => {
  // Convert string like 'WUBRG' to array of colors
  const colors = colorIdentity.split('').map(char => {
    switch (char.toUpperCase()) {
      case 'W': return 'bg-white-mana';
      case 'U': return 'bg-blue-mana';
      case 'B': return 'bg-black-mana';
      case 'R': return 'bg-red-mana';
      case 'G': return 'bg-green-mana';
      case 'C': return 'bg-colorless';
      default: return 'bg-multicolor';
    }
  });

  // If no valid colors, use all five
  const manaColors = colors.length > 0 ? colors : [
    'bg-white-mana',
    'bg-blue-mana',
    'bg-black-mana',
    'bg-red-mana',
    'bg-green-mana'
  ];

  return (
    <div className="relative h-24 w-24 flex items-center justify-center">
      {/* Outer spinning circle */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-white-mana/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner spinning circle */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-blue-mana/50"
        animate={{ rotate: -360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Mana orbs circling */}
      {manaColors.map((color, index) => (
        <motion.div
          key={index}
          className={`absolute w-4 h-4 rounded-full ${color} shadow-mana`}
          animate={{
            x: Math.cos(index * (2 * Math.PI / manaColors.length)) * 40,
            y: Math.sin(index * (2 * Math.PI / manaColors.length)) * 40,
            scale: [1, 1.3, 1]
          }}
          transition={{
            x: { duration: 4, repeat: Infinity, repeatType: "reverse" },
            y: { duration: 4, repeat: Infinity, repeatType: "reverse" },
            scale: { 
              duration: 2, 
              repeat: Infinity, 
              delay: index * 0.3,
              repeatType: "reverse"
            }
          }}
        />
      ))}
      
      {/* Central pulsing orb */}
      <motion.div
        className="w-8 h-8 rounded-full bg-multicolor shadow-mana"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </div>
  );
};

export default MagicSpinner;
