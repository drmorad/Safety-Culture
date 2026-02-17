
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative w-24 h-24 bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center shadow-2xl">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-400">S</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 animate-bounce"></div>
      </div>
      
      <h1 className="text-3xl font-black tracking-tighter uppercase mb-2 animate-pulse">SmartLog Compliance</h1>
      
      <div className="flex items-center gap-2 mb-8">
         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">System Initialization</p>
      </div>

      <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-1/2 animate-[shimmer_1s_infinite_linear] relative">
           <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
