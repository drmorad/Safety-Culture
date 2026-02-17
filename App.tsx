
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InspectionForm from './components/InspectionForm';
import IssueLogs from './components/IssueLogs';
import TrainingCenter from './components/TrainingCenter';
import AuditorAssistant from './components/AuditorAssistant';
import LoadingScreen from './components/LoadingScreen';
import { InspectionRecord, RiskLevel, FaultCategory, ChatMessage } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InspectionRecord | null>(null);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hg_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hg_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const defaultLocations = [
    'Main Kitchen', 'Guest Rooms', 'Lobby Area', 'Pool & Spa', 
    'Laundry Facility', 'Chemical Storage', 'Cold Storage A', 
    'Service Bar', 'Back of House', 'Staff Canteen'
  ];

  const defaultProperties = ["Property Alpha", "Property Beta", "Property Gamma"];

  // LAZY INITIALIZATION: Prevents data loss on refresh by loading before first render
  const [records, setRecords] = useState<InspectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('hg_records');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentAuditor, setCurrentAuditor] = useState(() => {
    return localStorage.getItem('hg_auditor') || 'Lead Auditor';
  });

  const [locations, setLocations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hg_locations');
      return saved ? JSON.parse(saved) : defaultLocations;
    } catch (e) {
      return defaultLocations;
    }
  });

  const [properties, setProperties] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hg_properties');
      return saved ? JSON.parse(saved) : defaultProperties;
    } catch (e) {
      return defaultProperties;
    }
  });

  // Persistent Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('hg_chat_history');
      return saved ? JSON.parse(saved) : [
        { role: 'assistant', content: 'Greeting Officer. I am currently monitoring the facility audit stream. How can I assist with your risk analysis today?' }
      ];
    } catch (e) {
      return [{ role: 'assistant', content: 'Greeting Officer. I am currently monitoring the facility audit stream. How can I assist with your risk analysis today?' }];
    }
  });

  useEffect(() => {
    // Simulate system initialization check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('hg_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('hg_auditor', currentAuditor);
  }, [currentAuditor]);

  useEffect(() => {
    localStorage.setItem('hg_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('hg_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('hg_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSaveInspection = (record: InspectionRecord) => {
    setRecords(prevRecords => {
      const index = prevRecords.findIndex(r => r.id === record.id);
      if (index !== -1) {
        const updated = [...prevRecords];
        updated[index] = record;
        return updated;
      }
      return [record, ...prevRecords];
    });
    
    setCurrentAuditor(record.auditorName);
    
    if (record.location && !locations.includes(record.location)) {
      setLocations(prev => [...prev, record.location].sort());
    }

    if (record.propertyName && !properties.includes(record.propertyName)) {
      setProperties(prev => [...prev, record.propertyName].sort());
    }
    
    setEditingRecord(null);
    setActiveTab('logs');
  };

  const handleEditRecord = (record: InspectionRecord) => {
    setEditingRecord(record);
    setActiveTab('inspect');
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Permanently delete this audit log?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, status: InspectionRecord['status']) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleAddProperty = (name: string) => {
    if (name && !properties.includes(name)) {
      setProperties(prev => [...prev, name].sort());
    }
  };

  const handleUpdateProperty = (oldName: string, newName: string) => {
    setProperties(prev => prev.map(p => p === oldName ? newName : p).sort());
    setRecords(prev => prev.map(r => r.propertyName === oldName ? { ...r, propertyName: newName } : r));
  };

  const handleDeleteProperty = (name: string) => {
    if (confirm(`Delete property "${name}"? This will remove it from future audit options.`)) {
      setProperties(prev => prev.filter(p => p !== name));
    }
  };

  const handleResetSystem = () => {
    if (confirm('CRITICAL: Wiping all data. Continue?')) {
      localStorage.clear();
      setRecords([]);
      setLocations(defaultLocations);
      setProperties(defaultProperties);
      setCurrentAuditor('Lead Auditor');
      setChatHistory([{ role: 'assistant', content: 'Greeting Officer. I am currently monitoring the facility audit stream. How can I assist with your risk analysis today?' }]);
      setActiveTab('dashboard');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            records={records} 
            onReset={handleResetSystem} 
            properties={properties}
            onAddProperty={handleAddProperty}
            onUpdateProperty={handleUpdateProperty}
            onDeleteProperty={handleDeleteProperty}
          />
        );
      case 'inspect':
        return (
          <InspectionForm 
            onSave={handleSaveInspection} 
            initialAuditor={currentAuditor} 
            existingLocations={locations} 
            properties={properties}
            editingRecord={editingRecord}
            onCancelEdit={() => { setEditingRecord(null); setActiveTab('logs'); }}
          />
        );
      case 'logs':
        return (
          <IssueLogs 
            records={records} 
            onDelete={handleDeleteRecord} 
            onUpdateStatus={handleUpdateStatus} 
            onEdit={handleEditRecord}
          />
        );
      case 'training':
        return <TrainingCenter records={records} />;
      case 'assistant':
        return <AuditorAssistant records={records} chatHistory={chatHistory} setChatHistory={setChatHistory} />;
      default:
        return <Dashboard records={records} onReset={handleResetSystem} properties={properties} onAddProperty={handleAddProperty} onUpdateProperty={handleUpdateProperty} onDeleteProperty={handleDeleteProperty} />;
    }
  };

  return (
    <>
      {loading && <LoadingScreen />}
      <div className={`flex bg-slate-50 dark:bg-slate-950 h-screen overflow-hidden relative transition-colors duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            if (tab !== 'inspect') setEditingRecord(null);
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }} 
          auditorName={currentAuditor} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={darkMode}
          toggleTheme={toggleTheme}
        />
        
        <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-12 md:pt-12 relative w-full">
          <div className="max-w-7xl mx-auto pb-24 md:pb-0">
            {renderContent()}
          </div>
        </main>

        <div className="fixed bottom-6 right-6 no-print md:hidden z-20">
          <button 
            onClick={() => { setEditingRecord(null); setActiveTab('inspect'); setIsSidebarOpen(false); }}
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ring-4 ring-white/20"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Mobile Header Overlay to Toggle Sidebar */}
        <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center md:hidden z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-slate-900 dark:bg-black rounded-lg flex items-center justify-center text-white font-black text-sm">HG</div>
             <span className="font-black text-slate-800 dark:text-white tracking-tight">HotelGuard</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>
        </div>
      </div>
    </>
  );
};

export default App;
