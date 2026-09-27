import { useNavigate } from 'react-router-dom';
import { Home, LogOut, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function NavigationBar() {
 const navigate = useNavigate();
 const { theme, toggleTheme } = useTheme();

 return (
  <nav className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border-b border-[var(--border)] p-4 flex items-center justify-between shrink-0">
   <div className="flex items-center gap-2">
    <span className="text-[var(--accent-primary)] text-2xl font-bold font-['Space_Grotesk'] tracking-wider">
     ICE-NET
    </span>
    <span className="text-[var(--text-secondary)] text-sm hidden sm:inline">
     | Polar Logistics Command
    </span>
   </div>

   <div className="flex items-center gap-4">
    <motion.button
     whileHover={{ scale: 1.1 }}
     whileTap={{ scale: 0.9 }}
     onClick={toggleTheme}
     className="p-2 rounded-full bg-[var(--bg-panel-raised)] border border-[var(--border)] text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-center shadow-[var(--shadow-glass)]"
    >
     <AnimatePresence mode="wait">
      <motion.div
       key={theme}
       initial={{ opacity: 0, rotate: -90 }}
       animate={{ opacity: 1, rotate: 0 }}
       exit={{ opacity: 0, rotate: 90 }}
       transition={{ duration: 0.2 }}
      >
       {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </motion.div>
     </AnimatePresence>
    </motion.button>

    {/* Landing Page Button */}
    <button
     onClick={() => navigate('/')}
     className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors font-['Work_Sans'] font-medium cursor-pointer"
    >
     <Home size={18} />
     <span>Landing Page</span>
    </button>

    {/* Logout Button */}
    <button
     onClick={() => {
      localStorage.removeItem('activeStation');
      navigate('/login');
     }}
     className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] text-[var(--critical)] hover:bg-[var(--critical)] hover:text-[var(--text-primary)] transition-colors font-['Work_Sans'] font-medium cursor-pointer"
    >
     <LogOut size={18} />
     <span>Logout</span>
    </button>
   </div>
  </nav>
 );
}
