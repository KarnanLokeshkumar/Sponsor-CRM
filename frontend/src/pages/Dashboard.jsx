import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw, Building2, Megaphone, Gift, Handshake, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { modules } from '../data/modules';
import { api } from '../services/api';

export default function Dashboard(){
 const [stats,setStats]=useState({sponsors:0,campaigns:0,deliverables:0,benefits:0,modules:[]});
 const [busy,setBusy]=useState(true),[error,setError]=useState('');
 const load=async()=>{setBusy(true);setError('');try{
  const [sponsorStats,campaigns,deliverables,benefits,...workspace]=await Promise.all([
   api.sponsorStats(),api.campaigns(),api.deliverables(),api.benefits(),
   ...modules.filter(m=>!['overview','sponsors','campaigns','deliverables','benefits'].includes(m.key)).map(m=>api.workspaceSummary(m.key).then(data=>({key:m.key,total:data.total||0})).catch(()=>({key:m.key,total:0})))
  ]);
  setStats({sponsors:sponsorStats.total||0,campaigns:campaigns.length,deliverables:deliverables.length,benefits:benefits.length,modules:workspace});
 }catch(e){setError(e.message);}finally{setBusy(false);}};
 useEffect(()=>{load();},[]);
 const core=[{label:'Sponsors',value:stats.sponsors,icon:Building2,path:'/sponsors'},{label:'Campaigns',value:stats.campaigns,icon:Megaphone,path:'/campaigns'},{label:'Deliverables',value:stats.deliverables,icon:Gift,path:'/deliverables'},{label:'Benefits',value:stats.benefits,icon:Handshake,path:'/benefits'}];
 const moduleCount=stats.modules.reduce((sum,x)=>sum+x.total,0)+stats.sponsors+stats.campaigns+stats.deliverables+stats.benefits;
 return <div className="dashboard-page">
  <div className="page-heading-row"><div><div className="page-eyebrow">SPONSOR RELATIONSHIP WORKSPACE</div><h1>Overview</h1><p>A live snapshot of sponsor relationships, activations and partnership operations.</p></div><button className="secondary-button" onClick={load} disabled={busy}><RefreshCw size={15}/> Refresh</button></div>
  {error&&<div className="crm-error">{error}</div>}
  <div className="metrics-grid">{core.map(card=>{const Icon=card.icon;return <Link to={card.path} className="metric-card" key={card.label} style={{textDecoration:'none',color:'inherit'}}><div className="metric-top"><span>{card.label}</span><div className="metric-icon blue"><Icon size={18}/></div></div><div className="metric-value">{busy?'—':card.value}</div><div className="metric-bottom"><span>Open module</span><ArrowUpRight size={14}/></div></Link>;})}</div>
  <section className="panel overview-modules-panel"><div className="panel-heading"><div><h3>All CRM modules</h3><p>{modules.length} workspaces across relationship management, growth, activation, insights and administration.</p></div><div className="overview-total"><Layers3 size={17}/><b>{busy?'—':moduleCount}</b><span>saved records</span></div></div>
   <div className="overview-module-grid">{modules.filter(m=>m.key!=='overview').map(m=>{const total=m.key==='sponsors'?stats.sponsors:m.key==='campaigns'?stats.campaigns:m.key==='deliverables'?stats.deliverables:m.key==='benefits'?stats.benefits:(stats.modules.find(x=>x.key===m.key)?.total||0);const Icon=m.icon;return <Link to={m.path} className="overview-module-card" key={m.key}><span className="overview-module-icon"><Icon size={17}/></span><span className="overview-module-copy"><b>{m.label}</b><small>{busy?'Loading':`${total} records`}</small></span><ArrowUpRight size={14}/></Link>;})}</div>
  </section>
 </div>;
}
