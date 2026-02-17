
import React, { useState } from 'react';
import { InspectionRecord } from '../types';

interface IssueLogsProps {
  records: InspectionRecord[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: InspectionRecord['status']) => void;
  onEdit: (record: InspectionRecord) => void;
}

const IssueLogs: React.FC<IssueLogsProps> = ({ records, onDelete, onUpdateStatus, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [auditorFilter, setAuditorFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);

  const filteredRecords = records.filter(record => 
    (record.faultDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.propertyName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    record.auditorName.toLowerCase().includes(auditorFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none drop-shadow-sm">Audit Trail</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic mt-2 text-lg">Comprehensive ledger of safety compliance.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-8 py-4 rounded-[1.2rem] transition-all shadow-lg hover:shadow-xl font-black uppercase tracking-widest text-[10px] active:scale-95 border border-slate-200 dark:border-slate-700 flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Report
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search narrative or property..." className="w-full pl-14 pr-8 py-5 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none bg-white dark:bg-slate-800 font-semibold shadow-sm transition-all text-slate-900 dark:text-white dark:placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <input type="text" placeholder="Filter by Auditor..." className="w-full pl-14 pr-8 py-5 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none bg-white dark:bg-slate-800 font-semibold shadow-sm transition-all text-slate-900 dark:text-white dark:placeholder-slate-500" value={auditorFilter} onChange={(e) => setAuditorFilter(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4 print:hidden">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 group">
             <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                
                {/* Image Thumbnail */}
                <div className="shrink-0 relative">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shadow-md">
                     <img src={record.photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Evidence" />
                  </div>
                  <div className={`absolute -bottom-3 -right-3 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg ${record.riskLevel === 'High' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {record.riskLevel}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                     <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">{record.category}</span>
                     <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${record.status === 'Resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>{record.status}</span>
                  </div>
                  <h3 className="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate mb-1">{record.propertyName}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic line-clamp-2 leading-relaxed mb-3">"{record.faultDescription}"</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                     <div className="flex items-center gap-1.5">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       {record.location}
                     </div>
                     <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                     <div className="flex items-center gap-1.5">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       {record.inspectionDate}
                     </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-6">
                   <button onClick={() => setSelectedRecord(record)} className="flex-1 lg:flex-none text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-5 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">Review</button>
                   <button onClick={() => onEdit(record)} className="flex-1 lg:flex-none text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-5 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-slate-200 dark:border-slate-600">Edit</button>
                   <button onClick={() => onDelete(record.id)} className="flex-1 lg:flex-none text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-5 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 dark:border-red-800/50">Delete</button>
                </div>
             </div>
          </div>
        ))}

        {filteredRecords.length === 0 && (
          <div className="py-24 text-center bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-xs tracking-widest">No matching registry records found.</p>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8 no-print animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/20">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div>
                <div className="flex gap-2 mb-3">
                   <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 uppercase tracking-widest">ID: {selectedRecord.id}</span>
                   <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${selectedRecord.status === 'Resolved' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'}`}>{selectedRecord.status}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{selectedRecord.propertyName}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">{selectedRecord.category} Violation</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-100 dark:border-slate-700">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="aspect-[4/3] rounded-[2rem] bg-slate-100 dark:bg-slate-800 shadow-inner overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                    <img src={selectedRecord.photoUrl} className="w-full h-full object-cover" alt="Evidence" />
                  </div>
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><svg className="w-16 h-16 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10">Observation Narrative</h4>
                    <p className="text-lg text-slate-800 dark:text-slate-200 font-medium italic leading-relaxed relative z-10">"{selectedRecord.faultDescription}"</p>
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between relative z-10">
                      <div className="text-xs">
                        <span className="block font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedRecord.auditorName}</span>
                        <span className="block text-slate-400 font-bold uppercase tracking-widest">Reporting Officer</span>
                      </div>
                      <div className="text-right text-xs">
                        <span className="block font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedRecord.inspectionDate}</span>
                        <span className="block text-slate-400 font-bold uppercase tracking-widest">Timestamp</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col h-full">
                   <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex-1">
                     <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-8 border-b border-blue-200/50 dark:border-blue-800/30 pb-4 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                       Remediation Protocol (Gemini Core)
                     </h4>
                     <ul className="space-y-6">
                       {selectedRecord.remediationSteps.map((step, idx) => (
                         <li key={idx} className="flex gap-5 items-start group">
                           <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-black shrink-0 shadow-sm group-hover:scale-110 transition-transform">{idx + 1}</div>
                           <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed pt-1">{step}</p>
                         </li>
                       ))}
                     </ul>
                   </div>
                   
                   <div className="flex gap-4 pt-8 mt-auto">
                      <button onClick={() => { onEdit(selectedRecord); setSelectedRecord(null); }} className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black py-4 rounded-xl shadow-sm transition-all uppercase text-[10px] tracking-widest hover:border-slate-800 hover:text-slate-900 dark:hover:border-slate-500 dark:hover:text-white">Modify Findings</button>
                      {selectedRecord.status !== 'Resolved' && (
                        <button onClick={() => { onUpdateStatus(selectedRecord.id, 'Resolved'); setSelectedRecord({...selectedRecord, status: 'Resolved'}); }} className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 transition-all uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:scale-[1.02]">Verify Resolution</button>
                      )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueLogs;
