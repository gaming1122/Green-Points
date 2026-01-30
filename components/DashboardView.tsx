
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '01', count: 420 }, { name: '02', count: 380 }, { name: '03', count: 650 },
  { name: '04', count: 890 }, { name: '05', count: 520 }, { name: '06', count: 1050 }, { name: '07', count: 1240 },
];

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Recycled" value="12,482" icon="fa-recycle" color="text-emerald-500" />
        <StatCard label="Active Nodes" value="1,240" icon="fa-network-wired" color="text-indigo-500" />
        <StatCard label="CO2 Saved" value="3,205kg" icon="fa-wind" color="text-orange-500" />
        <StatCard label="System Uptime" value="99.9%" icon="fa-clock" color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Community Growth</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Network traffic vs previous period</p>
            </div>
            <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl mono">+22.4% INCREMENT</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{backgroundColor: '#05070a', border: '1px solid #1e293b', borderRadius: '16px'}} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fill="url(#colorIn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass shadow-2xl">
          <h3 className="text-2xl font-black text-white mb-10 tracking-tighter uppercase">Machine Health</h3>
          <div className="space-y-8">
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
  <div className="bg-[#0f1115] p-8 rounded-[2.5rem] border border-white/5 glass transition-all hover:translate-y-[-5px] hover:shadow-2xl hover:shadow-emerald-500/5 group">
    <div className="flex items-center space-x-6">
      <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl ${color} group-hover:scale-110 transition-transform`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </div>
  </div>
);

const HealthItem: React.FC<{name: string; value: number; color: string; alert?: boolean}> = ({name, value, color, alert}) => (
  <div>
    <div className="flex justify-between items-center mb-3">
      <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{name}</span>
      <span className="text-[11px] font-black mono text-slate-500">{value}% CAPACITY</span>
    </div>
    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} ${alert ? 'animate-pulse' : ''}`} style={{width: `${value}%`}}></div>
    </div>
  </div>
);

export default DashboardView;
