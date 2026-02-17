
import React, { useState, useMemo } from 'react';
import { InspectionRecord, RiskLevel } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  records: InspectionRecord[];
  onReset?: () => void;
  properties: string[];
  onAddProperty: (name: string) => void;
  onUpdateProperty: (oldName: string, newName: string) => void;
  onDeleteProperty: (name: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  records, 
  onReset, 
  properties, 
  onAddProperty, 
  onUpdateProperty, 
  onDeleteProperty 
}) => {
  const [newPropName, setNewPropName] = useState('');
  const [editingProp, setEditingProp] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const highRisk = records.filter(r => r.riskLevel === RiskLevel.HIGH).length;
  const resolvedCount = records.filter(r => r.status === 'Resolved').length;
  const passRateVal = records.length > 0 
    ? (records.filter(r => r.riskLevel !== RiskLevel.HIGH).length / records.length) * 100 
    : 100;

  // Enriched Data for Chart
  const chartData = useMemo(() => {
    type ChartItem = { name: string; value: number; high: number; medium: number; low: number };
    const agg = records.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = { name: curr.category, value: 0, high: 0, medium: 0, low: 0 };
      }
      acc[curr.category].value += 1;
      if (curr.riskLevel === RiskLevel.HIGH) acc[curr.category].high += 1;
      if (curr.riskLevel === RiskLevel.MEDIUM) acc[curr.category].medium += 1;
      if (curr.riskLevel === RiskLevel.LOW) acc[curr.category].low += 1;
      return acc;
    }, {} as Record<string, ChartItem>);
    return Object.values(agg).sort((a, b) => b.value - a.value); // Sort by highest frequency
  }, [records]);

  const handleAdd = () => {
    if (newPropName.trim()) {
      onAddProperty(newPropName.trim());
      setNewPropName('');
    }
  };

  const handleSaveEdit = () => {
    if (editingProp && editValue.trim()) {
      onUpdateProperty(editingProp, editValue.trim());
      setEditingProp(null);
    }
  };

  const stats = [
    { 
      label: 'Total Audits', 
      value: records.length, 
      colorClass: 'text-slate-800 dark:text-slate-100', 
      bg: 'bg-white/80 dark:bg-slate-900/80',
      border: 'border-white/60 dark:border-slate-700/60',
      icon: (
        <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      )
    },
    { 
      label: 'Critical Risks', 
      value: highRisk, 
      colorClass: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50/80 dark:bg-red-900/20',
      border: 'border-red-100/60 dark:border-red-800/30',
      icon: (
        <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      )
    },
    { 
      label: 'Pass Rate', 
      value: `${passRateVal.toFixed(1)}%`, 
      colorClass: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50/80 dark:bg-emerald-900/20',
      border: 'border-emerald-100/60 dark:border-emerald-800/30',
      icon: (
        <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
    { 
      label: 'Resolution', 
      value: resolvedCount, 
      colorClass: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50/80 dark:bg-blue-900/20',
      border: 'border-blue-100/60 dark:border-blue-800/30',
      icon: (
        <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none drop-shadow-sm">Smart Log Compliance App</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-lg">Global risk stratification and intelligence ledger.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-emerald-100 dark:border-emerald-900/50 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-default">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
             </span>
             <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">System Operational</span>
          </div>
          {onReset && (
            <button 
              onClick={onReset}
              className="text-[10px] font-black text-slate-400 hover:text-white hover:bg-red-500 uppercase tracking-[0.2em] transition-all border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 hover:border-red-500 hover:shadow-red-200 hover:shadow-lg"
            >
              Reset Data
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`
              relative overflow-hidden ${stat.bg} backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] 
              border-2 ${stat.border} shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group
            `}
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
              <div className="p-2 bg-white/60 dark:bg-black/30 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform shadow-sm">
                {stat.icon}
              </div>
            </div>
            <p className={`text-4xl md:text-5xl font-black ${stat.colorClass} tracking-tighter relative z-10`}>{stat.value}</p>
            
            {/* Background decoration */}
            <div className="absolute -bottom-6 -right-6 opacity-5 rotate-12 scale-150 grayscale group-hover:grayscale-0 transition-all duration-700">
              {stat.icon}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/40 pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] border border-white/60 dark:border-slate-800 shadow-xl relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05]">
            <svg className="w-64 h-64 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
          </div>
          
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-black dark:from-slate-700 dark:to-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white ring-4 ring-slate-100 dark:ring-slate-800">
              📈
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Compliance Matrix</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Sector Specific Failure Analysis</p>
            </div>
          </div>
          
          <div className="h-80 relative z-10 w-full bg-slate-50/50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.high > 0 ? '#ef4444' : entry.medium > 0 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase text-xs tracking-widest">
                No Audit Data Available
              </div>
            )}
          </div>
        </section>

        <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/60 dark:border-slate-800 shadow-xl flex flex-col h-full relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
           <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 z-10 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100 dark:border-blue-800 ring-4 ring-blue-50/50 dark:ring-blue-900/20">
              🏨
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Property Registry</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Manage Portfolio</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 flex-1 overflow-y-auto max-h-[350px] pr-2 pb-20 custom-scrollbar">
            {properties.map(p => (
              <div key={p} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group transition-all hover:bg-blue-50/50 dark:hover:bg-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-slate-600 hover:-translate-x-1 shadow-sm">
                {editingProp === p ? (
                  <div className="flex-1 flex gap-2 animate-in fade-in duration-200">
                    <input 
                      type="text" 
                      className="flex-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-blue-500 shadow-inner text-slate-700 dark:text-white"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleSaveEdit} className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 p-2 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></button>
                    <button onClick={() => setEditingProp(null)} className="text-slate-400 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 p-2 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors shadow-sm"></div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{p}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => { setEditingProp(p); setEditValue(p); }} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => onDeleteProperty(p)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-xl transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-20">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Register New Property..."
                  className="w-full pl-5 pr-24 py-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:outline-none font-bold text-sm shadow-xl transition-all hover:border-blue-200 dark:hover:border-slate-600 text-slate-900 dark:text-white dark:placeholder-slate-500"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button 
                  onClick={handleAdd}
                  className="absolute right-2 top-2 bottom-2 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-slate-200 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
                >
                  Add <span className="text-xs">+</span>
                </button>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
