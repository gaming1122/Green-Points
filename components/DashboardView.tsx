
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '01', count: 420 }, { name: '02', count: 380 }, { name: '03', count: 650 },
  { name: '04', count: 890 }, { name: '05', count: 520 }, { name: '06', count: 1050 }, { name: '07', count: 1240 },
];

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <StatCard label="Recycled" value="12,482" icon="fa-recycle" color="text-emerald-500" />
        <StatCard label="Nodes" value="1,240" icon="fa-network-wired" color="text-indigo-500" />
        <StatCard label="CO2 Saved" value="3,205kg" icon="fa-wind" color="text-orange-500" />
        <StatCard label="Uptime" value="99.9%" icon="fa-clock" color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-[#0f1115] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 glass shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">Community Growth</h3>
              <p className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1">Network traffic vs previous period</p>
            </div>
            <div className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg mono">+22.4% INC</div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 9, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 9, fontWeight: 700}} />
                <Tooltip contentStyle={{backgroundColor: '#05070a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px'}} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fill="url(#colorIn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f1115] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 glass shadow-2xl">
          <h3 className="text-xl md:text-2xl font-black text-white mb-8 md:mb-10 tracking-tighter uppercase">Machine Health</h3>
          <div className="space-y-6 md:space-y-8">
            <HealthItem name="Hub Alpha" value={82} color="bg-emerald-500" />
            <HealthItem name="Sector 04" value={45} color="bg-amber-500" />
            <HealthItem name="Terminal C" value={98} color="bg-rose-500" alert />
            <HealthItem name="West Wing" value={12} color="bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string; value: string; icon: string; color: string}> = ({label, value, icon, color}) => (
  <div className="bg-[#0f1115] p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 glass group transition-all">
    <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-3 md:gap-6">
      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-lg md:text-2xl ${color} transition-transform`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
        <p className="text-lg md:text-3xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </div>
  </div>
);

const HealthItem: React.FC<{name: string; value: number; color: string; alert?: boolean}> = ({name, value, color, alert}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[9px] md:text-[11px] font-black text-slate-300 uppercase tracking-widest">{name}</span>
      <span className="text-[9px] md:text-[11px] font-black mono text-slate-500">{value}%</span>
    </div>
    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} ${alert ? 'animate-pulse' : ''}`} style={{width: `${value}%`}}></div>
    </div>
  </div>
);

export default DashboardView;
