import {useEffect,useMemo,useState} from 'react';
import {ArrowDownToLine,ArrowUpFromLine,Globe2,Handshake,Package,Ship,TrendingUp} from 'lucide-react';

type Props={unlocked:boolean;budget:number;onNotice:(s:string)=>void;onImpact:(impact:{approval?:number;budget?:number;debt?:number;inflation?:number;unemployment?:number})=>void};
type Good={id:string;name:string;category:string;price:number;stock:number;unit:string;};
type TradeState={goods:Good[];balance:number;tariff:number;partner:string;agreements:string[];};
const defaults:Good[]=[
{id:'food',name:'Żywność i produkty rolne',category:'Rolnictwo',price:2.4,stock:80,unit:'tys. ton'},
{id:'energy',name:'Ropa i gaz',category:'Energetyka',price:5.8,stock:45,unit:'mln jednostek'},
{id:'electricity',name:'Energia elektryczna',category:'Energetyka',price:3.1,stock:35,unit:'TWh'},
{id:'machines',name:'Maszyny i urządzenia',category:'Przemysł',price:4.7,stock:55,unit:'tys. szt.'},
{id:'cars',name:'Samochody i części',category:'Przemysł',price:6.2,stock:30,unit:'tys. szt.'},
{id:'metals',name:'Stal i metale',category:'Surowce',price:3.6,stock:60,unit:'tys. ton'},
{id:'chips',name:'Półprzewodniki',category:'Technologie',price:8.5,stock:12,unit:'mln szt.'},
{id:'medicine',name:'Leki i sprzęt medyczny',category:'Zdrowie',price:5.2,stock:24,unit:'tys. pakietów'}
];
const partners=[{id:'north',name:'Republika Północna'},{id:'west',name:'Federacja Zachodnia'},{id:'east',name:'Związek Wschodni'},{id:'south',name:'Unia Południowa'}];
export default function TradeMarket({unlocked,budget,onNotice,onImpact}:Props){
 const [data,setData]=useState<TradeState>(()=>{try{return {...{goods:defaults,balance:0,tariff:5,partner:'west',agreements:[]},...JSON.parse(localStorage.getItem('rep-trade-v1')||'{}')}}catch{return {goods:defaults,balance:0,tariff:5,partner:'west',agreements:[]}}});
 const [quantities,setQuantities]=useState<Record<string,number>>({});
 const [tab,setTab]=useState<'import'|'export'>('import');
 useEffect(()=>{localStorage.setItem('rep-trade-v1',JSON.stringify(data))},[data]);
 const totalValue=useMemo(()=>data.goods.reduce((s,g)=>s+g.price*g.stock,0),[data.goods]);
 const trade=(id:string)=>{const good=data.goods.find(g=>g.id===id);if(!good)return;const qty=Math.max(1,Math.min(100,Math.floor(quantities[id]||1)));const price=good.price*qty;const tariff=tab==='import'?price*data.tariff/100:0;
  if(tab==='import'){const cost=price+tariff;if(budget<cost){onNotice('Za mało środków w budżecie na ten import.');return;}setData(s=>({...s,balance:s.balance-price,goods:s.goods.map(g=>g.id===id?{...g,stock:g.stock+qty}:g)}));onImpact({budget:-cost,approval:good.id==='food'||good.id==='energy'?1:0,inflation:good.id==='energy'?-0.05:0});onNotice('Zaimportowano: '+good.name+'. Koszt: '+cost.toFixed(1)+' mld zł.');}
  else{if(good.stock<qty){onNotice('Brak wystarczających zapasów do eksportu.');return;}const revenue=price*(1-data.tariff/100);setData(s=>({...s,balance:s.balance+revenue,goods:s.goods.map(g=>g.id===id?{...g,stock:g.stock-qty}:g)}));onImpact({budget:revenue,approval:1,unemployment:-0.02});onNotice('Wyeksportowano: '+good.name+'. Przychód: '+revenue.toFixed(1)+' mld zł.');}
 };
 const toggleAgreement=()=>{if(data.agreements.includes(data.partner)){setData(s=>({...s,agreements:s.agreements.filter(x=>x!==s.partner)}));onNotice('Zakończono umowę handlową.');}else{setData(s=>({...s,agreements:[...s.agreements,data.partner]}));onImpact({budget:2,approval:2});onNotice('Podpisano umowę handlową. Prognozowane korzyści dla eksportu.');}};
 return <section className="advanced-suite trade-suite">
  <div className="page-heading"><div><div className="eyebrow">RYNEK · IMPORT · EKSPORT</div><h1>Handel zagraniczny</h1><p>Handluj surowcami i produktami, negocjuj umowy oraz buduj nadwyżkę handlową.</p></div><div className="trade-mark"><Ship size={28}/></div></div>
  {!unlocked&&<div className="panel advanced-panel"><Globe2 size={26}/><h3>Handel państwowy odblokuje się po utworzeniu rządu</h3><p className="muted">Możesz poznać dostępne towary, ale transakcje i umowy będą dostępne po wyborach.</p></div>}
  <div className="trade-summary">
   <div className="trade-metric"><span>Saldo handlowe</span><b className={data.balance>=0?'positive':'negative'}>{data.balance>=0?'+':''}{data.balance.toFixed(1)} mld zł</b></div>
   <div className="trade-metric"><span>Wartość zapasów</span><b>{totalValue.toFixed(1)} mld zł</b></div>
   <div className="trade-metric"><span>Budżet państwa</span><b>{budget.toFixed(1)} mld zł</b></div>
  </div>
  <div className="panel advanced-panel">
   <div className="panel-head"><div><div className="eyebrow">POLITYKA HANDLOWA</div><h3>Umowy i cła</h3><p className="muted">Umowy wspierają wymianę, a cła zwiększają wpływy, ale podnoszą koszt importu.</p></div><Handshake size={23}/></div>
   <div className="trade-controls"><label>Partner handlowy<select value={data.partner} disabled={!unlocked} onChange={e=>setData(s=>({...s,partner:e.target.value}))}>{partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="secondary-btn" disabled={!unlocked} onClick={toggleAgreement}>{data.agreements.includes(data.partner)?'Wypowiedz umowę':'Podpisz umowę handlową'}</button><label className="trade-tariff">Stawka celna: {data.tariff}%<input type="range" min="0" max="30" step="1" value={data.tariff} disabled={!unlocked} onChange={e=>setData(s=>({...s,tariff:Number(e.target.value)}))}/></label></div>
   <div className="trade-agreements"><b>Aktywne umowy:</b> {data.agreements.length?data.agreements.map(x=>partners.find(p=>p.id===x)?.name).join(', '):'Brak'}</div>
  </div>
  <div className="panel advanced-panel">
   <div className="panel-head"><div><div className="eyebrow">GIEŁDA TOWAROWA</div><h3>Import i eksport</h3><p className="muted">Wartości cen są uproszczonymi cenami symulacyjnymi w mld zł za jednostkę transakcji.</p></div><Package size={23}/></div>
   <div className="trade-tabs"><button className={tab==='import'?'active':''} onClick={()=>setTab('import')}><ArrowDownToLine size={16}/> Import</button><button className={tab==='export'?'active':''} onClick={()=>setTab('export')}><ArrowUpFromLine size={16}/> Eksport</button></div>
   <div className="trade-list">{data.goods.map(g=><div className="trade-row" key={g.id}><div className="trade-good"><b>{g.name}</b><small>{g.category} · zapasy: {g.stock} {g.unit}</small></div><div className="trade-price"><b>{g.price.toFixed(1)}</b><small>mld zł / jednostkę</small></div><label className="trade-qty">Ilość<input type="number" min="1" max="100" value={quantities[g.id]||1} disabled={!unlocked} onChange={e=>setQuantities(s=>({...s,[g.id]:Math.max(1,Math.min(100,Number(e.target.value)||1))}))}/></label><button className="primary-btn trade-action" disabled={!unlocked} onClick={()=>trade(g.id)}>{tab==='import'?'Importuj':'Eksportuj'}</button></div>)}</div>
  </div>
  <div className="panel advanced-panel"><div className="panel-head"><div><div className="eyebrow">STRATEGIA</div><h3>Co warto wiedzieć?</h3></div><TrendingUp size={22}/></div><ul className="trade-tips"><li>Importuj energię i półprzewodniki, gdy krajowe zapasy są niskie.</li><li>Eksportuj nadwyżki żywności, metali i produktów przemysłowych.</li><li>Wysokie cła chronią część rynku, ale zwiększają koszty importu.</li><li>Umowy handlowe budują relacje i mogą ograniczać ryzyko embarga.</li></ul></div>
 </section>;
}
