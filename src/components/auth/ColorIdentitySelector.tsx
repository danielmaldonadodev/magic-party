import { motion } from 'framer-motion';

interface ColorIdentitySelectorProps {
  selected: string[];
  onChange: (colors: string[]) => void;
}

const ColorIdentitySelector = ({ selected, onChange }: ColorIdentitySelectorProps) => {
  const colors = [
    { id: 'W', name: 'Blanco', bgClass: 'bg-white-mana', textClass: 'text-black', 
      description: 'Orden, protección, comunidad' },
    { id: 'U', name: 'Azul', bgClass: 'bg-blue-mana', textClass: 'text-white', 
      description: 'Conocimiento, astucia, control' },
    { id: 'B', name: 'Negro', bgClass: 'bg-black-mana', textClass: 'text-white', 
      description: 'Poder, ambición, sacrificio' },
    { id: 'R', name: 'Rojo', bgClass: 'bg-red-mana', textClass: 'text-white', 
      description: 'Pasión, impulso, caos' },
    { id: 'G', name: 'Verde', bgClass: 'bg-green-mana', textClass: 'text-white', 
      description: 'Naturaleza, instinto, crecimiento' },
  ];
  
  const toggleColor = (colorId: string) => {
    if (selected.includes(colorId)) {
      onChange(selected.filter(id => id !== colorId));
    } else {
      onChange([...selected, colorId]);
    }
  };
  
  return (
    <div className="space-y-6">
      <p className="text-white-accent text-sm mb-4">
        Selecciona los colores que definen tu identidad mágica (puedes elegir varios)
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {colors.map(color => (
          <motion.button
            key={color.id}
            onClick={() => toggleColor(color.id)}
            className={`flex items-center p-4 rounded-md border transition-all ${
              selected.includes(color.id) 
                ? `${color.bgClass} ${color.textClass} border-white` 
                : 'bg-black-light/50 border-gray-700 hover:bg-black-light'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className={`w-8 h-8 rounded-full ${color.bgClass} mr-4 ${
                selected.includes(color.id) ? 'animate-pulse-slow shadow-mana' : ''
              }`}
            />
            
            <div className="text-left">
              <h3 className={`text-lg font-magical ${selected.includes(color.id) ? color.textClass : 'text-white'}`}>
                {color.name}
              </h3>
              <p className={`text-xs ${selected.includes(color.id) ? `${color.textClass} opacity-90` : 'text-gray-400'}`}>
                {color.description}
              </p>
            </div>
            
            {selected.includes(color.id) && (
              <motion.svg 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="ml-auto w-6 h-6 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </motion.button>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-black-light/30 border border-blue-mana/30 rounded-md">
        <h4 className="text-white font-magical mb-2">Tu identidad: {selected.length === 0 ? 'Incoloro' : selected.join('')}</h4>
        <div className="flex space-x-2">
          {selected.length === 0 ? (
            <div className="w-6 h-6 rounded-full bg-colorless" />
          ) : (
            selected.map(colorId => (
              <motion.div 
                key={colorId}
                className={`w-6 h-6 rounded-full ${
                  colors.find(c => c.id === colorId)?.bgClass || 'bg-colorless'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorIdentitySelector;
