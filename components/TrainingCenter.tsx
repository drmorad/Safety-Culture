
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateTrainingMaterials } from '../services/geminiService';
import { TrainingModule, InspectionRecord, RiskLevel, FaultCategory } from '../types';

interface TrainingCenterProps {
  records: InspectionRecord[];
}

const TrainingCenter: React.FC<TrainingCenterProps> = ({ records }) => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeProperty, setActiveProperty] = useState('Rewaya Majestic');

  // Manual Generation State
  const [manualJson, setManualJson] = useState('');
  const [manualProp, setManualProp] = useState('');

  const prevRecordCount = useRef(records.length);

  const refreshTraining = async () => {
    setLoading(true);
    try {
      const currentProp = records[0]?.propertyName || activeProperty;
      if (currentProp !== activeProperty) setActiveProperty(currentProp);

      const propertyRecords = records.filter(r => r.propertyName === currentProp);
      const newModules = await generateTrainingMaterials(propertyRecords, currentProp);
      setModules(newModules);
    } catch (err) {
      console.error("Failed to sync training:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualGenerate = async () => {
    if (!manualJson.trim()) return;

    setLoading(true);
    try {
      const parsedData = JSON.parse(manualJson);

      // Sanitization: Ensure the raw JSON has enough data for the service to work
      // We map the raw input to match InspectionRecord type partially
      const simulatedRecords = Array.isArray(parsedData) ? parsedData.map((item: any) => ({
        ...item,
        // Defaults to ensure service filters pick it up
        riskLevel: item.riskLevel || RiskLevel.HIGH,
        category: item.category || FaultCategory.HYGIENE,
        faultDescription: item.faultDescription || "Manual simulation entry",
        inspectionDate: new Date().toLocaleDateString('en-GB'),
        propertyName: manualProp || 'Simulated Property'
      })) : [];

      if (simulatedRecords.length > 0) {
        const newModules = await generateTrainingMaterials(simulatedRecords as InspectionRecord[], manualProp || 'Simulated Property');
        setModules(prev => [...newModules, ...prev]);
        setManualJson('');
        setManualProp('');
        alert(`Successfully generated ${newModules.length} new training modules from manual input.`);
      }
    } catch (e) {
      alert("Invalid JSON format. Please check your syntax.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (records.length > prevRecordCount.current) {
      const latestRecord = records[0];
      if (latestRecord?.riskLevel === RiskLevel.HIGH) {
        refreshTraining();
      }
      prevRecordCount.current = records.length;
    }
  }, [records]);

  useEffect(() => {
    if (records.length > 0 && modules.length === 0) {
      refreshTraining();
    }
  }, [records]);

  return (
    <div className="space-y-8 pb-10 animate-fade-in-up">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none drop-shadow-sm">Training Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-lg">Adaptive educational modules based on real-time failure patterns.</p>
        </div>
        <div className="flex gap-4">
          <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{loading ? 'AI Sync Active' : 'Intelligence Optimal'}</span>
          </div>
          <button
            onClick={refreshTraining}
            disabled={loading}
            className="bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 py-4 rounded-xl flex items-center gap-3 transition-all disabled:opacity-50 font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Synthesizing...
              </>
            ) : (
              'Recalibrate Hub'
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module) => (
          <div key={module.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-slate-100 dark:border-slate-700 relative">
            {/* Decor header */}
            <div className={`h-2 w-full ${module.priority === 'Urgent' ? 'bg-red-500' : 'bg-blue-500'}`}></div>

            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-sm ${module.priority === 'Urgent' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-1 ring-red-100 dark:ring-red-900/50' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-900/50'
                  }`}>
                  {module.priority}
                </span>
                <span className="text-[9px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest">{module.lastUpdated}</span>
              </div>

              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 leading-tight uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{module.title}</h3>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium line-clamp-2 md:line-clamp-none flex-1 prose prose-slate dark:prose-invert max-w-none overflow-hidden">
                <ReactMarkdown>{module.content}</ReactMarkdown>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between mt-auto">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{module.category}</span>
                <button className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 group/btn bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 hover:text-white transition-all">
                  Start
                  <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {modules.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 grayscale opacity-50">📚</div>
            <h4 className="text-xl font-black text-slate-300 dark:text-slate-500 uppercase tracking-tighter">Educational Matrix Offline</h4>
            <p className="text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-[0.2em] mt-3 max-w-sm mx-auto leading-relaxed">Submit inspections to trigger localized Gemini training generation for site-specific failures.</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 text-white rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-slate-700">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none transform rotate-12 scale-150">
          <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] shadow-black drop-shadow-md">Corporate Performance Score</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Personnel Compliance Grading</h3>
          <p className="text-slate-300 text-base md:text-lg font-medium mb-10 leading-relaxed border-l-4 border-blue-500 pl-6">
            Staff at <span className="text-white font-black">{activeProperty}</span> have achieved a 94.2% course engagement rate. System intelligence suggests a focus on failure protocols for the next cycle.
          </p>
          <button className="bg-white text-slate-900 font-black px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg active:scale-95 uppercase text-[10px] tracking-widest border-b-4 border-slate-200 active:border-b-0">
            Audit Regional Compliance Report
          </button>
        </div>
      </div>

      {/* Manual Training Generation Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 shadow-sm mt-8 no-print">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 text-2xl">⚡</div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Manual Simulation</h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Generate Modules from Raw Data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full">
            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Incident JSON Data</label>
            <textarea
              value={manualJson}
              onChange={(e) => setManualJson(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-orange-500 focus:outline-none font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 min-h-[120px] transition-all"
              placeholder='[{"category":"Hygiene","location":"Kitchen","faultDescription":"Mold on tiles"}]'
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Target Property</label>
            <input
              type="text"
              value={manualProp}
              onChange={(e) => setManualProp(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-orange-500 focus:outline-none font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 transition-all"
              placeholder="e.g. Grand Hotel Alpha"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleManualGenerate}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-orange-200 dark:shadow-orange-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Generate Simulation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCenter;
