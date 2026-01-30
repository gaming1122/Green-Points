
import React from 'react';

const BackendSpecView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-in fade-in duration-700">
      <div className="xl:col-span-3 space-y-8">
        <section className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass shadow-2xl">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <i className="fas fa-database text-indigo-500"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter">Schema Definitions</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mono">BSON STRUCTURES / v2.0</p>
            </div>
          </div>
          <div className="bg-[#05070a] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-[10px] font-black text-slate-800 uppercase tracking-widest mono">MongoDB Cluster</div>
            <pre className="text-xs text-emerald-500/90 mono leading-relaxed overflow-x-auto scrollbar-hide">
{`// CORE: User Identity
const UserSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  bio: {
    name: String,
    avatar: String,
    cohort: String
  },
  wallet: {
    balance: { type: Number, default: 0 },
    transactions: [{ type: ObjectId, ref: 'Ledger' }]
  },
  metrics: {
    totalBottles: { type: Number, default: 0 },
    rankScore: { type: Number, default: 100 }
  }
});

// EDGE: IoT Ingestion
const CollectionSchema = new Schema({
  origin: { type: String, required: true }, // Machine ID
  subject: { type: ObjectId, ref: 'User' },
  payload: {
    weight: Number,
    material: { type: String, default: 'PET' }
  },
  stamped: { type: Date, default: Date.now }
});`}
            </pre>
          </div>
        </section>

        <section className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass">
          <div className="flex items-center space-x-4 mb-8">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <i className="fas fa-bolt text-emerald-500"></i>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter">API Handshake Logic</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AuthCard title="Hardware Signature" type="AES-256" desc="Encrypted handshake between ESP32 and Cloud Node." icon="fa-key" />
            <AuthCard title="JWT Sessions" type="Bearer" desc="Stateless auth for mobile and dashboard access." icon="fa-shield-halved" />
          </div>
        </section>
      </div>

      <div className="xl:col-span-2 space-y-8">
        <section className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass shadow-2xl sticky top-8">
          <h3 className="text-2xl font-black text-white mb-10 tracking-tighter">Endpoint Registry</h3>
          <div className="space-y-4">
            <Endpoint method="GET" path="/core/leaderboard" status="stable" latency="12ms" />
            <Endpoint method="POST" path="/ingest/bottle" status="protected" latency="45ms" />
            <Endpoint method="PUT" path="/user/redeem" status="stable" latency="88ms" />
            <Endpoint method="GET" path="/system/health" status="public" latency="5ms" />
            <Endpoint method="PATCH" path="/bin/status" status="internal" latency="2ms" />
          </div>

          <div className="mt-12 p-8 bg-emerald-500 rounded-[2rem] shadow-xl text-slate-900">
             <div className="flex justify-between items-center mb-6">
               <h4 className="text-sm font-black uppercase tracking-widest">Postman Preview</h4>
               <i className="fas fa-paper-plane"></i>
             </div>
             <div className="bg-[#05070a] rounded-2xl p-6 text-[11px] mono text-emerald-500 border border-black/20">
               <span className="text-white">POST</span> /ingest/bottle <br/>
               <span className="text-slate-500 font-bold mt-2 block">HEADERS:</span>
               Authorization: Bearer x92... <br/>
               <span className="text-slate-500 font-bold mt-2 block">BODY:</span>
               {`{ "mid": "A-1", "uid": "USR-99" }`}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const Endpoint: React.FC<{method: string; path: string; status: string; latency: string}> = ({method, path, status, latency}) => (
  <div className="flex items-center space-x-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer group">
    <div className={`text-[10px] font-black w-16 py-2 rounded-xl text-center shadow-lg uppercase tracking-widest ${
      method === 'GET' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-900'
    }`}>{method}</div>
    <div className="flex-1">
      <code className="text-xs font-black text-white mono">{path}</code>
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{status}</span>
        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
        <span className="text-[10px] text-emerald-500 font-bold mono">{latency}</span>
      </div>
    </div>
    <i className="fas fa-chevron-right text-slate-700 group-hover:text-emerald-500 transition-colors"></i>
  </div>
);

const AuthCard: React.FC<{title: string; type: string; desc: string; icon: string}> = ({title, type, desc, icon}) => (
  <div className="p-6 bg-[#05070a] rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
        <i className={`fas ${icon} text-indigo-500`}></i>
      </div>
      <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">{type}</span>
    </div>
    <h4 className="text-white text-sm font-black tracking-tight mb-2 uppercase">{title}</h4>
    <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
  </div>
);

export default BackendSpecView;
