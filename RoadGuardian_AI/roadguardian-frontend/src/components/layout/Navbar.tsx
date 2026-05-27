import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, Menu, Sun, Moon, Volume2, BellRing } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const ALERTS = [
  { id: 1, type: 'CRITICAL', text: 'SEVERE WATERLOGGING reported at Outer Ring Road. Avoid route.', color: 'text-destructive' },
  { id: 2, type: 'INFO', text: 'Maintenance scheduled for Sector 4 highway this weekend.', color: 'text-[#FF9933]' },
  { id: 3, type: 'UPDATE', text: 'New AI Hazard Detection models deployed successfully. Accuracy increased by 14%.', color: 'text-[#138808]' },
  { id: 4, type: 'NOTICE', text: 'Remember to verify GPS coordinates before submitting structural hazard reports.', color: 'text-primary' },
];

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setSidebarOpen, sidebarOpen, theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();
  
  const [currentAlert, setCurrentAlert] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAlert((prev) => (prev + 1) % ALERTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFontSizeChange = (action: 'decrease' | 'reset' | 'increase') => {
    const htmlElement = document.documentElement;
    if (action === 'decrease') {
      htmlElement.style.fontSize = '14px';
    } else if (action === 'reset') {
      htmlElement.style.fontSize = '16px';
    } else if (action === 'increase') {
      htmlElement.style.fontSize = '18px';
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full flex flex-col bg-background shadow-md">
      {/* Indian Government Tricolor Strip */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>
      
      {/* IRCTC-style Utility Top Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-900 border-b border-border py-1 px-4 flex justify-between items-center text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider relative overflow-hidden">
        <div className="flex items-center space-x-4 z-10">
          <span className="hidden sm:inline-block">Govt of India Initiative</span>
          <span className="text-[#FF9933] hidden sm:inline-block">|</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"><Volume2 className="w-3 h-3"/> Screen Reader Access</span>
        </div>
        
        {/* Dynamic Alert Banner */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center h-full w-full max-w-[40%] justify-center overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAlert}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center text-[10px] sm:text-xs font-bold pointer-events-auto cursor-pointer"
            >
              <BellRing className={`w-3 h-3 mr-2 ${ALERTS[currentAlert].color} animate-pulse`} />
              <span className={`mr-2 ${ALERTS[currentAlert].color}`}>[{ALERTS[currentAlert].type}]</span>
              <span className="truncate max-w-[150px] sm:max-w-xs">{ALERTS[currentAlert].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 z-10">
          <div className="flex items-center space-x-2 border-r border-border pr-2 sm:pr-4">
            <span onClick={() => handleFontSizeChange('decrease')} className="cursor-pointer hover:text-foreground transition-colors">A-</span>
            <span onClick={() => handleFontSizeChange('reset')} className="cursor-pointer hover:text-foreground text-sm transition-colors">A</span>
            <span onClick={() => handleFontSizeChange('increase')} className="cursor-pointer hover:text-foreground text-base transition-colors">A+</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors">
            {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full bg-[#000080] dark:bg-slate-950 border-b border-[#FF9933]/50 text-white shadow-xl relative z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000080] via-[#000080]/90 to-transparent dark:from-slate-950 dark:via-slate-900 z-0"></div>
        <div className="flex h-16 items-center px-4 md:px-6 relative z-10">
          {isAuthenticated && (
            <Button variant="ghost" size="icon" className="md:hidden mr-2 text-white hover:bg-white/20 transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-3 font-bold group">
            <div className="bg-white p-1 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-shadow">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-8 w-6 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="hidden sm:inline-block uppercase tracking-wider text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">राष्ट्रीय सड़क सुरक्षा पोर्टल</span>
              <span className="hidden sm:inline-block uppercase tracking-wider text-[10px] font-bold text-[#FF9933] drop-shadow-md">National Road Safety Portal</span>
            </div>
          </Link>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end border-r border-white/20 pr-4">
                  <span className="text-sm font-bold text-white drop-shadow-md">{user?.fullName || 'Citizen'}</span>
                  <span className="text-[9px] text-white uppercase tracking-widest bg-[#138808]/80 border border-[#138808] px-2 py-0.5 rounded-sm mt-0.5 font-bold shadow-sm">{user?.role}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white hover:text-[#000080] dark:hover:text-slate-900 rounded-sm h-8 font-black uppercase text-xs shadow-sm transition-all">
                  <LogOut className="h-3 w-3 md:mr-2" />
                  <span className="hidden md:inline">Secure Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => navigate('/login')} className="bg-[#FF9933] hover:bg-[#e68a2e] text-white rounded-sm font-black text-[11px] uppercase transition-all shadow-sm border-b-2 border-[#b45309] active:border-b-0 active:translate-y-px h-8 px-4 tracking-wider">Portal Login</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
