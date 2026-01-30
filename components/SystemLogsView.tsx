
import React from 'react';

const logs = [
  { id: 1, type: 'SUCCESS', message: 'Bottle ingestion validated (Mid: BIN-01, Uid: GP-001)', time: '14:22:01', node: 'Edge_Node_Alpha' },
  { id: 2, type: 'AUTH', message: 'Handshake completed: hardware_signature_verified', time: '14:21:44', node: 'Auth_Gateway' },
  { id: 3, type: 'WARN', message: 'Potential spoof detected: inconsistent weight profiling', time: '14:18:22', node: 'Edge_Node_Beta' },
  { id: 4, type: 'SYSTEM', message: 'Database backup sequence initiated', time: '14:00:00', node: 'Core_Storage' },
  { id: 5, type: 'ERROR', message: 'Node timeout: Bin_Terminal_03 offline', time: '13:55:12', node: 'Network_Control' },
  { id: 6, type: 'SUCCESS', message: 'Redemption processed: Canteen_Voucher_50', time: '13:42:09', node: 'Ledger_Service' },
];

const SystemLogsView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 flex items-center space-x-4">
           <div className="flex items-center space-x-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mono">Live Traffic</span>
           </div>
           <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-slate-500 hover:text-white transition-colors">
             <i className="fas fa-download"></i>
           </button>
        </div>
        
        <div className="mb-10">
          <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Node Stream</h3>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mono">System monitoring / 1.4gb traffic today</p>
        </div>

        <div className="bg-[#05070a] rounded-3xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 p-4 flex items-center space-x-4 border-b border-white/5">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/30"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/30"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/30"></div>
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">Terminal_v2.01</span>
          </div>
          <div className="p-8 max-h-[600px] overflow-y-auto scrollbar-hide space-y-4">
            {logs.map(log => (
              <div key={log.id} className="flex items-start space-x-6 group">
                <span className="text-slate-700 text-[10px] font-black mono pt-1">{log.time}</span>
                <div className={`text-[9px] font-black px-3 py-1 rounded-lg w-20 text-center uppercase tracking-tighter shadow-lg ${
                  log.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                  log.type === 'ERROR' ? 'bg-rose-500/10 text-rose-500' :
                  log.type === 'WARN' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {log.type}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-300 tracking-wide">{log.message}</p>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1 mono">{log.node}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mono">Trace</button>
                </div>
              </div>
            ))}
            <div className="flex items-center space-x-4 opacity-50">
               <span className="text-slate-800 text-[10px] font-black mono">14:22:05</span>
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"></div>
               <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mono animate-pulse">Awaiting next payload...</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <HealthMetric label="Inbound Packet Loss" value="0.002%" status="optimal" />
        <HealthMetric label="API Response Time" value="42ms" status="stable" />
        <HealthMetric label="Edge Node Coverage" value="98%" status="degraded" />
      </div>
    </div>
  );
};

const HealthMetric: React.FC<{label: string; value: string; status: string}> = ({label, value, status}) => (
  <div className="bg-[#0f1115] p-8 rounded-[2.5rem] border border-white/5 glass">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">{label}</p>
      <span className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${
        status === 'optimal' ? 'text-emerald-500 bg-emerald-500' :
        status === 'stable' ? 'text-indigo-500 bg-indigo-500' :
        'text-rose-500 bg-rose-500'
      }`}></span>
    </div>
    <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
  </div>
);

export default SystemLogsView;
