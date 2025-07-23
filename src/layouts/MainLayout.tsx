import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaCalendarAlt, FaLayerGroup, FaUserCircle, FaDragon } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { GiAchievement } from 'react-icons/gi';

const MainLayout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/feed', icon: <FaHome />, label: 'Feed' },
    { path: '/events', icon: <FaCalendarAlt />, label: 'Eventos' },
    { path: '/decks', icon: <FaLayerGroup />, label: 'Mazos' },
    { path: '/arena', icon: <FaDragon />, label: 'Arena' },
    { path: '/achievements', icon: <GiAchievement />, label: 'Logros' },
    { path: '/profile', icon: <FaUserCircle />, label: 'Perfil' },
    { path: '/settings', icon: <IoSettingsSharp />, label: 'Ajustes' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black-light to-black-mana text-white">
      {/* Top header */}
      <header className="fixed top-0 left-0 w-full bg-black-mana/90 backdrop-blur-md border-b border-blue-mana/20 shadow-md z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/feed" className="font-magical text-xl text-white">
            MagicParty
          </Link>
          
          {/* Menu toggle button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-blue-mana/20 transition-all"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-white transform transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-full h-0.5 bg-white transform transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-full h-0.5 bg-white transform transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </header>
      
      {/* Mobile menu */}
      <motion.div 
        className="fixed top-16 left-0 w-full bg-black-mana/90 backdrop-blur-md shadow-lg z-10"
        animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
        initial={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: isMenuOpen ? 'visible' : 'hidden' }}
      >
        <div className="container mx-auto py-2 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center p-3 rounded-md transition-all ${
                    location.pathname.startsWith(item.path) 
                      ? 'bg-blue-mana text-white' 
                      : 'hover:bg-blue-mana/20'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
      
      {/* Main content */}
      <main className="container mx-auto px-4 pt-20 pb-20 min-h-screen">
        <Outlet />
      </main>
      
      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-black-mana/90 backdrop-blur-md border-t border-blue-mana/20 shadow-md z-10">
        <div className="container mx-auto h-16 grid grid-cols-5 items-center">
          {navItems.slice(0, 5).map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center h-full ${
                location.pathname.startsWith(item.path) 
                  ? 'text-blue-mana' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
