export const FAMILY_NAMES={any:'Nessuno / casuale',offensive:'Aggressive · offensivo',defensive:'Protector’s · difensivo',utility:'Pragmatic · utilità e mobilità',resource:'Resourceful · risorsa',skill:'Adept’s · stat e gradi',resistance:'Chromatic · resistenze'};
export const ACTIONS={add:'Aggiungi affisso',remove:'Rimuovi affisso',focused:'Focused Reroll',chaotic:'Chaotic Reroll',values:'Rilancia valori base',protect:'Incanta: nessuna modifica',enchant:'Incanta una riga',upgrade:'Imprimi Aspetto',temper:'Tempra',restore:'Ripristina un tentativo',quality:'Aumenta qualità',capstone:'Rilancia capstone',power:'Rilancia potere Unico',mythic:'Mitico diretto',transfigure:'Applica esito finale'};
const copy=x=>structuredClone(x);
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
export function rangeFor(stat,power){
 const ranges=(stat?.ranges||[]).filter(r=>r.power<=power);if(!ranges.length)return null;
 const threshold=Math.max(...ranges.map(r=>r.power));const current=ranges.filter(r=>r.power===threshold);
 // Duplicate distinct formulas at one threshold are unresolved; do not choose silently.
 const bounds=current.map(r=>r.bounds);if(bounds.some(b=>!b))return null;
 if(new Set(bounds.map(b=>JSON.stringify(b))).size>1)return null;
 return bounds[0];
}
export function inFamily(a,family){
 if(family==='any')return true;
 const keys=a.stats.map(s=>s.key).join(' '),primary=/CoreStat|Core_Stat|Strength|Dexterity|Intelligence|Willpower/.test(keys+' '+a.internal);
 if(family==='skill')return primary||/Skill_Rank|SkillRank/.test(keys+' '+a.internal);
 if(family==='resistance')return /Resistance/.test(keys+' '+a.internal);
 if(family==='offensive')return a.category===0;
 if(family==='defensive')return a.category===1;
 if(family==='utility')return a.category===2||a.category===4;
 if(family==='resource')return a.category===3;
 return false;
}
export function poolFor(db,state,{tempered=false,family='any',excludeIndex=-1}={}){
 const type=db.types.find(t=>t.id===state.type);if(!type)return [];
 const existing=tempered?[]:state.affixes.filter((_,i)=>i!==excludeIndex).map(a=>a.family);
 return db.affixes.filter(a=>a.candidate&&a.tempered===tempered&&a.classes.includes(state.classId)&&a.labels.some(l=>type.labels.includes(l))&&(a.minPower??0)<=state.power&&(a.maxPower??2000)>=state.power&&inFamily(a,family)&&!existing.includes(a.family)&&a.stats.length===1&&rangeFor(a.stats[0],state.power));
}
export function makeAffix(a,power,rng=Math.random,{max=false}={}){
 assert(a&&a.stats.length===1,'Questa variante ha più statistiche: ricreala manualmente.');
 const range=rangeFor(a.stats[0],power);assert(range,'Range non risolto per questa potenza. Inserisci il range dal tooltip.');
 const integer=!a.stats[0].unit&&/Rank|Skill|CoreStat|Life|Armor|Thorns|Resource_Max|Hitpoints/.test(a.stats[0].key+' '+a.internal);
 let value=max?range.max:range.min+rng()*(range.max-range.min);
 value=integer?Math.round(value):Math.round(value*100)/100;value=Math.max(range.min,Math.min(range.max,value));
 return {id:a.id,name:a.name,family:a.family,category:a.category,internal:a.internal,key:a.stats[0].key,unit:a.stats[0].unit,range:copy(range),value,ga:false,enchanted:false,scales:a.stats[0].scales,target:false};
}
export function createState(db,{type='446836',classId='barbarian',rarity='rare',power=900,itemId=null}={},rng=Math.random){
 const state={schema:1,type,classId,rarity,power,itemId,affixes:[],tempered:null,quality:0,capstone:null,aspect:null,uniquePower:null,temperAttempts:3,unmodifiable:false,crafted:false,finalBonus:null,cost:{},history:[],protectionEnabled:true};
 if(itemId){const item=db.items.find(i=>i.id===itemId);assert(item,'Oggetto non trovato.');assert(item.classes.includes(classId),'Oggetto non utilizzabile dalla classe.');state.type=item.type;state.rarity=item.magic===4||item.qualityModifier===5?'mythic':'unique';
  for(const id of item.forced){const a=db.affixes.find(a=>a.id===id);if(a&&a.stats.length===1&&rangeFor(a.stats[0],power)&&state.affixes.length<4)state.affixes.push(makeAffix(a,power,rng,{max:state.rarity==='mythic'}));}
  state.uniquePower=db.powers.find(p=>item.forced.includes(p.id))?.id||null;
 }
 const count=state.rarity==='common'?0:state.rarity==='magic'?2:4;
 while(state.affixes.length<count){const pool=poolFor(db,state);if(!pool.length)break;state.affixes.push(makeAffix(pool[Math.floor(rng()*pool.length)],power,rng,{max:state.rarity==='mythic'}));}
 state.temperAttempts=(state.rarity==='rare'||state.rarity==='magic')?1:3;
 return state;
}
export function eligibleIndices(state,family='any'){
 return state.affixes.map((a,i)=>({a,i})).filter(({a})=>!(state.protectionEnabled&&a.enchanted)&&inFamily({stats:[{key:a.key}],internal:a.internal||'',category:a.category},family)).map(x=>x.i);
}
export function preview(db,state,action,args={}){
 try{const result=operate(db,state,action,args,()=>.4,true);return {allowed:true,...result.preview};}catch(e){return {allowed:false,reason:e.message};}
}
function charge(state,cost){for(const [k,v] of Object.entries(cost))state.cost[k]=(state.cost[k]||0)+v;}
export function operate(db,input,action,args={},rng=Math.random,dry=false){
 const s=copy(input),family=args.family||'any';let cost={},indices=[],pool=[],message='',mutate=()=>{};
 assert(ACTIONS[action],'Operazione sconosciuta.');assert(!s.unmodifiable,'Oggetto Unmodifiable: nessun altro crafting consentito.');
 const regular=['common','magic','rare','legendary'].includes(s.rarity);
 if(['add','remove','focused','chaotic'].includes(action)){
  assert(regular,'Focused, Chaotic, Add e Remove non sono abilitati qui per Unici / Mitici.');
  if(action==='add'){assert(s.affixes.length<4,'Tutti e quattro i posti base sono pieni.');pool=poolFor(db,s,{family});cost={Raw:5,Coarse:1};mutate=()=>{s.affixes.push(makeAffix(choose(pool,rng),s.power,rng));if(s.rarity==='common')s.rarity='magic';if(s.affixes.length>=3&&s.rarity==='magic')s.rarity='rare';};}
  else{
   if(action==='remove')assert(['magic','rare'].includes(s.rarity),'Rimozione disponibile soltanto su magici / rari nel modello verificato.');
   if(action==='focused')assert(family!=='any','Focused richiede un prisma.');
   indices=eligibleIndices(s,family);assert(indices.length,'Nessuna riga modificabile nella famiglia scelta.');cost={Raw:15,Refined:1};
   if(action!=='remove'){pool=poolFor(db,s,{family:action==='focused'?family:'any',excludeIndex:indices[0]});assert(pool.length,'Nessun risultato con range risolto nel pool candidato.');}
   mutate=()=>{const index=choose(indices,rng);if(action==='remove'){s.affixes.splice(index,1);s.capstone=null;}else{const outputs=poolFor(db,s,{family:action==='focused'?family:'any',excludeIndex:index});assert(outputs.length,'Nessun risultato disponibile per la riga selezionata.');const old=s.affixes[index];const next=makeAffix(choose(outputs,rng),s.power,rng);next.target=old.target;s.affixes[index]=next;}};
  }
  if(family!=='any')cost['Prisma '+family]=1;
  if(action==='add')assert(pool.length,'Nessun affisso con range risolto nel pool candidato.');
 }else if(action==='values'){
  assert(s.rarity!=='common','Il modello richiede un oggetto raro o superiore.');assert(['rare','legendary','unique','mythic'].includes(s.rarity),'Ricetta disponibile sui rari o superiori.');indices=s.affixes.map((a,i)=>!a.ga&&!a.enchanted?i:-1).filter(i=>i>=0);assert(indices.length,'Tutte le righe sono GA o incantate: nessun valore da rilanciare.');cost={Raw:100,Attuned:1};mutate=()=>indices.forEach(i=>{const a=s.affixes[i];a.value=s.rarity==='mythic'?a.range.max:rollRange(a.range,rng,a.unit);});
 }else if(action==='protect'||action==='enchant'){
  const i=Number(args.index);assert(Number.isInteger(i)&&s.affixes[i],'Scegli una riga esistente.');const marked=s.affixes.findIndex(a=>a.enchanted);assert(marked<0||marked===i,'Hai già scelto lo slot permanente di incantamento.');assert(s.rarity!=='common','Non puoi incantare un bianco.');
  indices=[i];cost={'Incantamenti':1};
  if(action==='protect'){assert(s.protectionEnabled,'Attiva la protezione community per provare questo scenario.');mutate=()=>{s.affixes[i].enchanted=true;};}
  else{pool=poolFor(db,s,{excludeIndex:i});assert(pool.length,'Nessun affisso disponibile.');mutate=()=>{const a=makeAffix(choose(pool,rng),s.power,rng,{max:s.rarity==='mythic'});a.enchanted=true;s.affixes[i]=a;};}
 }else if(action==='upgrade'){
  assert(regular&&s.rarity!=='common','Impronta su un raro o leggendario.');assert(['rare','legendary'].includes(s.rarity),'Promuovi prima la base a raro.');const aspect=db.powers.find(p=>p.id===args.aspectId&&p.candidateAspect);assert(aspect,'Scegli un Aspetto del catalogo.');const type=db.types.find(t=>t.id===s.type);assert(aspect.classes.includes(s.classId)&&aspect.labels.some(l=>type.labels.includes(l)),'Aspetto incompatibile con classe o tipo.');cost={'Impronte':1};mutate=()=>{s.rarity='legendary';s.aspect=aspect.id;};
 }else if(action==='temper'){
  assert(['rare','legendary','unique','mythic'].includes(s.rarity),'Tempra disponibile su raro o superiore nel modello.');assert(s.temperAttempts>0,'Tentativi esauriti: usa una pergamena.');pool=poolFor(db,s,{tempered:true});const a=args.affixId?pool.find(a=>a.id===args.affixId):null;assert(a,'Scegli l’affisso di Tempra disponibile.');cost={'Tempra':1};mutate=()=>{s.tempered=makeAffix(a,s.power,rng,{max:s.rarity==='mythic'});s.temperAttempts--;if(s.capstone==='temper')s.capstone=null;};
 }else if(action==='restore'){
  assert(s.rarity!=='common','La base non è temprabile.');cost={'Scroll of Restoration':1};mutate=()=>s.temperAttempts++;
 }else if(action==='quality'){
  assert(['legendary','unique','mythic'].includes(s.rarity),'Completa prima la promozione a leggendario.');assert(s.quality<25,'Qualità già al massimo.');cost={'Operazioni rifinitura':1};mutate=()=>s.quality=Math.min(25,s.quality+2+Math.floor(rng()*4));
 }else if(action==='capstone'){
  assert(s.quality===25,'Capstone disponibile a qualità 25.');indices=s.affixes.map((_,i)=>i);if(s.tempered)indices.push('temper');assert(indices.length,'Non ci sono righe potenziabili.');cost={'Rilanci capstone':1};mutate=()=>s.capstone=choose(indices,rng);
 }else if(action==='power'){
  assert(['unique','mythic'].includes(s.rarity),'Serve un Unico / Mitico.');const p=db.powers.find(p=>p.id===s.uniquePower);assert(p,'Potere non disponibile per questo oggetto.');const ranges=p.stats.map(a=>rangeFor(a,s.power));assert(ranges.length&&ranges.every(Boolean),'Formula del potere incompleta: il rilancio non può essere simulato.');cost={Raw:100,Attuned:1};mutate=()=>{s.powerValues=ranges.map(r=>s.rarity==='mythic'?r.max:rollRange(r,rng,''));};
 }else if(action==='mythic'){
  assert(s.rarity==='unique'&&s.itemId,'Serve un Unico nominato modificabile.');cost={'Resplendent Sparks':5};mutate=()=>{s.rarity='mythic';s.crafted=true;};
 }else if(action==='transfigure'){
  assert(['legendary','unique','mythic'].includes(s.rarity),'Serve un leggendario o superiore.');assert(typeof args.unmodifiable==='boolean','Indica se l’esito rende il pezzo Unmodifiable.');assert(typeof args.bonus==='string'&&args.bonus.trim(),'Scrivi il bonus dell’esito che vuoi valutare.');cost={'Esiti Trasfigurazione impostati':1};mutate=()=>{s.finalBonus=args.bonus.trim().slice(0,300);s.unmodifiable=args.unmodifiable;};
 }
 message=ACTIONS[action];const info={cost,sourceRows:indices,outputCount:pool.length,outputNames:pool.map(a=>a.name),warning:action==='enchant'?'L’esito sostituisce la riga e perde il GA; l’interfaccia reale offre anche Nessuna modifica.':action==='transfigure'?'Esito impostato da te: non è un sorteggio del gioco.':null};
 if(dry)return {preview:info};mutate();charge(s,cost);s.history.unshift({action,label:message,cost,time:new Date().toISOString()});s.history=s.history.slice(0,100);return {state:s,preview:info};
}
function choose(a,rng){assert(a.length,'Pool vuoto.');return a[Math.min(a.length-1,Math.floor(rng()*a.length))];}
function rollRange(r,rng,unit){const v=r.min+rng()*(r.max-r.min);return Math.max(r.min,Math.min(r.max,Math.round(v*100)/100));}
export function effective(a,state,index){if(!a.scales)return a.value;return Math.round(a.value*(1+state.quality/100+(state.capstone===index ? .5 : 0))*100)/100;}
export function validateState(s,db){
 assert(s&&s.schema===1&&db.types.some(t=>t.id===s.type)&&db.classes.includes(s.classId),'File di sessione non compatibile.');assert(['common','magic','rare','legendary','unique','mythic'].includes(s.rarity),'Rarità non valida.');assert(Number.isFinite(s.power)&&s.power>=1&&s.power<=900,'Potenza non valida.');assert(Array.isArray(s.affixes)&&s.affixes.length<=4,'Al massimo quattro affissi base.');
 for(const a of [...s.affixes,...(s.tempered?[s.tempered]:[])]){assert(a&&typeof a.name==='string'&&a.name.length<=150&&typeof a.id==='string'&&typeof a.family==='string'&&typeof a.key==='string','Affisso non valido.');assert(a.range&&Number.isFinite(a.range.min)&&Number.isFinite(a.range.max)&&a.range.max>=a.range.min&&Number.isFinite(a.value)&&a.value>=a.range.min&&a.value<=a.range.max,'Range o valore non valido.');assert(typeof a.ga==='boolean'&&typeof a.enchanted==='boolean'&&typeof a.scales==='boolean','Stato affisso non valido.');}
 assert(s.affixes.filter(a=>a.enchanted).length<=1,'Un solo slot incantabile.');assert(Number.isInteger(s.quality)&&s.quality>=0&&s.quality<=25,'Qualità non valida.');assert(Number.isInteger(s.temperAttempts)&&s.temperAttempts>=0&&s.temperAttempts<=10000,'Tentativi non validi.');assert(s.capstone===null||s.capstone==='temper'&&s.tempered||Number.isInteger(s.capstone)&&s.capstone>=0&&s.capstone<s.affixes.length,'Capstone non valido.');assert(typeof s.unmodifiable==='boolean'&&typeof s.protectionEnabled==='boolean','Protezione non valida.');assert(s.cost&&Object.entries(s.cost).every(([k,v])=>k.length<100&&!['__proto__','constructor','prototype'].includes(k)&&Number.isFinite(v)&&v>=0),'Costi non validi.');assert(Array.isArray(s.history)&&s.history.length<=100,'Cronologia non valida.');return copy(s);
}
