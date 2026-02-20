
import React, { useEffect, useState } from 'react';
import { forensicService } from '../services/forensicService';
import { AuditHistoryEntry } from '../types';

interface AuditHistoryTimelineProps {
    recordId: string;
}

const AuditHistoryTimeline: React.FC<AuditHistoryTimelineProps> = ({ recordId }) => {
    const [history, setHistory] = useState<AuditHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        forensicService.getHistory(recordId).then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, [recordId]);

    if (loading) return <div className="p-8 text-center animate-pulse text-slate-400 font-bold">Accessing Secure Ledger...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Forensic Timeline</h4>
            </div>

            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {history.map((entry, idx) => (
                    <div key={entry.id} className="relative group">
                        {/* Dot */}
                        <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm z-10 transition-transform group-hover:scale-125 ${entry.action === 'create' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}></div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all group-hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
                                        {entry.action === 'create' ? 'Original Entry' : 'Revision Logged'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{new Date(entry.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Officer ID</span>
                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{entry.userId}</span>
                                </div>
                            </div>

                            {entry.diff && (
                                <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-[10px] font-mono overflow-x-auto">
                                    <p className="text-slate-400 mb-2 font-bold uppercase tracking-widest">Changes Detected:</p>
                                    <pre className="text-blue-600 dark:text-blue-400">
                                        {JSON.stringify(entry.diff, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {!entry.diff && entry.action === 'create' && (
                                <p className="text-[10px] text-slate-500 italic font-medium">Initial state recorded in immutable ledger.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuditHistoryTimeline;
