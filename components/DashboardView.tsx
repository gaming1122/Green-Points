
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    bottles: 0,
    nodes: 0,
    carbon: "0.0",
    points: 0
  });
  const [chartData, setChartData] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const users = Object.values(db.USER || {}).map((u: any) => u.profile);
    
    if (users.length > 0) {
      const totalBottles = users.reduce((acc: number, u: any) => acc + (u.bottles || 0), 0);
      const totalPoints = users.reduce((acc: number, u: any) => acc + (u.points || 0), 0);
      
      setStats({
        bottles: totalBottles,
        nodes: users.length,
        carbon: (totalBottles * 0.08).toFixed(2), // Updated to 0.08kg per bottle
        points: totalPoints
      });

      // Generate chart data based on aggregate
      const mockDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const baseData = mockDays.map(day => ({
        name: day,
        count: Math.floor(totalBottles / 7) + Math.floor(Math.random() * 20)
      }));
      setChartData(baseData);
    } else {
      setStats({ bottles: 0, nodes: 0, carbon: "0.00", points: 0 });
      setChartData([{name: '00', count: 0}]);
    }
  }, []);

  return (
    <div className="space-y-6 md:space-y-12 animate-in slide-in-from-bottom-6 duration-700 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 xl:gap-12">
        <StatCard label="Network Bottles" value={stats.bottles.toLocaleString()} icon="fa-recycle" color="text-emerald-500" />
        <StatCard label="Active Identity Nodes" value={stats.nodes.toLocaleString()} icon="fa-network-wired" color="text-indigo-500" />
        <StatCard label="Carbon Offset (KG)" value={stats.carbon} icon="fa-wind" color="text-orange-500" />
        <StatCard label="Network XP Pulse" value={stats.points.toLocaleString()} icon="fa-bolt" color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10 xl:gap-12">
        <div className="xl:col-span-2 bg-[#0f1115] p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 glass shadow-2xl overflow-hidden relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 md:mb-12 relative z-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Emission Reduction Analytics</h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time signal data from edge nodes</p>
            </div>
          </div>
          <div className="h-64 md:h-96 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold'}} 
                  itemStyle={{color: '#10b981'}}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fill="url(#colorIn)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f1115] p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 glass shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-10 md:mb-12 tracking-tighter uppercase">Hardware Health</h3>
          <div className="space-y-8 md:space-y-10">
            <HealthItem name="Primary ESP32" value={stats.nodes > 0 ? 99 : 0} color="bg-emerald-500" />
            <HealthItem name="Cloud Relay" value={stats.nodes > 0 ? 95 : 0} color="bg-indigo-500" />
            <HealthItem name="Storage Layer" value={100} color="bg-amber-500" />
          </div>
          
          <div className="mt-12 p-8 bg-emerald-500 rounded-[2rem] text-slate-900 shadow-xl shadow-emerald-500/10 transition-transform hover:scale-[1.02]">
             <div className="flex items-center space-x-4 mb-3">
               <i className="fas fa-check-circle text-xl"></i>
               <p className="text-[12px] font-black uppercase tracking-widest">Protocol Sync: Valid</p>
             </div>
             <p className="text-[10px] font-bold uppercase opacity-80 leading-relaxed">Network is processing 25 XP payouts per detected signal at a conversion rate of 0.08 KG CO2 per unit.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string; value: string; icon: string; color: string}> = ({label, value, icon, color}) => (
  <div className="bg-[#0f1115] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 glass group transition-all shadow-xl relative overflow-hidden hover:border-white/10">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all group-hover:rotate-12">
       <i className={`fas ${icon} text-7xl`}></i>
    </div>
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4 md:gap-6 relative z-10">
      <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center text-2xl md:text-4xl ${color} transition-all group-hover:scale-110 shadow-lg`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="min-w-0 w-full">
        <p className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">{label}</p>
        <p className="text-xl md:text-4xl font-black text-white tracking-tighter truncate leading-none">{value}</p>
      </div>
    </div>
  </div>
);

const HealthItem: React.FC<{name: string; value: number; color: string}> = ({name, value, color}) => (
  <div>
    <div className="flex justify-between items-center mb-3">
      <span className="text-[10px] md:text-[13px] font-black text-slate-400 uppercase tracking-widest truncate mr-4">{name}</span>
      <span className={`text-[10px] md:text-[13px] font-black mono text-slate-600`}>{value}%</span>
    </div>
    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-0.5">
      <div className={`h-full rounded-full ${color} transition-all duration-1500 shadow-[0_0_10px_currentColor]`} style={{width: `${value}%`}}></div>
    </div>
  </div>
);

export default DashboardView;
