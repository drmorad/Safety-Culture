
import React from 'react';
import { Icons } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  auditorName: string;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, auditorName, isOpen, onClose, isDarkMode, toggleTheme }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Compliance Dashboard', icon: Icons.Dashboard },
    { id: 'inspect', label: 'New Inspection', icon: Icons.Camera },
    { id: 'logs', label: 'Audit Trail', icon: Icons.Logs },
    { id: 'training', label: 'Training Hub', icon: Icons.Training },
    { id: 'assistant', label: 'AI Assistant', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    )},
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white min-h-screen flex flex-col no-print shrink-0 shadow-2xl
        bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black
        transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto md:z-auto
      `}
    >
      <div className="p-8 pb-4 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 shadow-xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-400 font-black text-2xl">S</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">SmartLog</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Compliance AI</p>
            </div>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="md:hidden text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="px-6 py-2">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
              activeTab === item.id 
                ? 'text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-100 border border-blue-500/30"></div>
            )}
            
            <div className={`relative z-10 ${activeTab === item.id ? 'text-white scale-110' : 'group-hover:text-white group-hover:scale-110'} transition-all duration-300`}>
              <item.icon />
            </div>
            <span className="relative z-10 text-sm tracking-wide font-semibold">{item.label}</span>
            
            {activeTab === item.id && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700/50 transition-all group"
        >
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
             </div>
             <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-700'}`}>
             <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
          </div>
        </button>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/50 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-emerald-500">
              <div className="w-full h-full rounded-full border-2 border-slate-900 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auditorName)}&background=0f172a&color=3b82f6&bold=true`} className="w-full h-full object-cover" alt="User" />
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase tracking-tight group-hover:text-blue-200 transition-colors">{auditorName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Lead Auditor</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
