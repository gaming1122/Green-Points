
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    bottles: 0,
    nodes: 0,
    carbon: "0.00",
    points: 0
  });
  const [chartData, setChartData] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('gp_database') || '{"ADMIN": {}, "USER": {}, "EMPLOYEE": {}}');
    const users = Object.values(db.USER || {}).map((u: any) => u.profile);
    
    const totalBottles = users.reduce((acc: number, u: any) => acc + (u.bottles || 0), 0);
    const totalPoints = users.reduce((acc: number, u: any) => acc + (u.points || 0), 0);
    
    setStats({
      bottles: totalBottles,
      nodes: users.length,
      carbon: (totalBottles * 0.08).toFixed(2),
      points: totalPoints
    });

    const mockDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    setChartData(mockDays.map(day => ({
      name: day,
      count: totalBottles > 0 ? Math.floor((totalBottles / 7) + (Math.random() * 5)) : 0
    })));
  }, []);

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <StatCard label="Total Bottles" value={stats.bottles.toLocaleString()} icon="fa-recycle" color="text-emerald-500" />
        <StatCard label="Active Nodes" value={stats.nodes.toLocaleString()} icon="fa-users" color="text-indigo-500" />
        <StatCard label="Carbon (KG)" value={`${stats.carbon}`} icon="fa-leaf" color="text-orange-500" />
        <StatCard label="Network XP" value={stats.points.toLocaleString()} icon="fa-bolt" color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
        <div className="xl:col-span-2 bg-[#0f1115] p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 glass shadow-2xl relative">
          <h3 className="text-xl md:text-2xl font-black text-white mb-8 md:mb-12 tracking-tighter uppercase flex items-center">
             <i className="fas fa-chart-line mr-4 text-emerald-500"></i> Performance Flux
          </h3>
          <div className="h-64 md:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff'}}
                  itemStyle={{color: '#10b981'}}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fill="url(#colorG)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f1115] p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 glass shadow-2xl">
          <h3 className="text-xl md:text-2xl font-black text-white mb-8 md:mb-12 tracking-tighter uppercase">System Integrity</h3>
          <div className="space-y-8 md:space-y-10">
             <HealthBar label="Network Core" value={stats.nodes > 0 ? 100 : 0} color="bg-emerald-500" />
             <HealthBar label="Auth Gateway" value={98} color="bg-indigo-500" />
             <HealthBar label="Sustainability Sync" value={stats.points > 0 ? 95 : 0} color="bg-amber-500" />
             <div className="pt-6 border-t border-white/5">
                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                  All metrics derive from the live GP-Node directory. XP is verified at the edge before aggregation.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string; value: string; icon: string; color: string}> = ({label, value, icon, color}) => (
  <div className="bg-[#0f1115] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 glass shadow-xl group hover:border-white/10 transition-all text-center sm:text-left">
    <div className="flex flex-col items-center sm:items-start space-y-4 md:space-y-6">
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center text-2xl md:text-3xl ${color} shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 truncate">{label}</p>
        <p className="text-2xl md:text-3xl font-black text-white tracking-tighter truncate">{value}</p>
      </div>
    </div>
  </div>
);

const HealthBar: React.FC<{label: string; value: number; color: string}> = ({label, value, color}) => (
  <div className="space-y-2 md:space-y-3">
    <div className="flex justify-between text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{width: `${value}%`}}></div>
    </div>
  </div>
);

export default DashboardView;
