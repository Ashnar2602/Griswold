import {rangeFor} from './engine.mjs';
export const CLASS_NAMES={barbarian:'Barbaro',rogue:'Tagliagole',sorcerer:'Incantatore',necromancer:'Negromante',druid:'Druido',spiritborn:'Spiritista',paladin:'Paladino',warlock:'Stregone'};
export const TYPE_NAMES={Helm:'Elmo',ChestArmor:'Corazza',Gloves:'Guanti',Legs:'Pantaloni',Boots:'Stivali',Ring:'Anello',Amulet:'Amuleto',Shield:'Scudo',Sword:'Spada',Sword2H:'Spada a due mani',Dagger:'Pugnale',Axe:'Ascia',Axe2H:'Ascia a due mani',Mace:'Mazza',Mace2H:'Mazza a due mani',Staff:'Bastone',Wand:'Bacchetta',Bow:'Arco',Crossbow2H:'Balestra',Scythe:'Falce',Scythe2H:'Falce a due mani',OffHandTotem:'Totem',Focus:'Focus',Quarterstaff:'Bastone ferrato',Glaive:'Falcione',Flail:'Mazzafrusto'};
export const PRISMS={offensive:{name:'Aggressive Tuning Prism',label:'Offensivo',part:'Offensive'},defensive:{name:"Protector’s Tuning Prism",label:'Difensivo',part:'Defensive'},utility:{name:'Pragmatic Tuning Prism',label:'Utilità',part:'Utility'},resource:{name:'Resourceful Tuning Prism',label:'Risorsa',part:'Resource'},skill:{name:"Adept’s Tuning Prism",label:'Statistiche e gradi',part:'Skill'},resistance:{name:'Chromatic Tuning Prism',label:'Resistenze',part:'Resistance'},any:{name:'Nessun prisma',label:'Tutti',part:'Random'}};
const TRANSLATIONS={'All Stats':'Tutte le statistiche','Armor':'Armatura','Attack Speed':'Velocità di attacco','Barrier Generation':'Generazione di barriera','Cooldown Reduction':'Riduzione del recupero','Critical Strike Chance':'Probabilità di critico','Dodge Chance':'Probabilità di schivata','Fortify Generation':'Generazione di Fortificazione','Healing Received':'Cure ricevute','Impairment Reduction':'Riduzione degli effetti debilitanti','Life On Hit':'Vita per colpo','Life On Kill':'Vita per uccisione','Life Regeneration':'Rigenerazione della vita','Lucky Hit Chance':'Probabilità di colpo fortunato','Maximum Life':'Vita massima','Maximum Resource':'Risorsa massima','Movement Speed':'Velocità di movimento','Resistance to All Elements':'Resistenza a tutti gli elementi','Resource Cost Reduction':'Riduzione del costo delle risorse','Resource Generation':'Generazione delle risorse','Strength':'Forza','Dexterity':'Destrezza','Intelligence':'Intelligenza','Willpower':'Volontà','Thorns':'Spine','x All Damage Multiplier':'Danni totali [x]','x Critical Strike Damage Multiplier':'Danni critici [x]','x Damage Over Time Multiplier':'Danni nel tempo [x]','x Vulnerable Damage Multiplier':'Danni ai vulnerabili [x]'};
const ELEMENTS={Fire:'fuoco',Cold:'freddo',Lightning:'fulmine',Poison:'veleno',Shadow:'ombra',Physical:'fisici',Holy:'sacri'};
const GEMS={Fire:'Royal Ruby',Cold:'Royal Sapphire',Lightning:'Royal Topaz',Poison:'Royal Emerald',Shadow:'Royal Amethyst',Physical:'Royal Skull'};
export function translated(a){
 const n=a.internal||'',s=a.stats?.[0];
 const element=Object.keys(ELEMENTS).find(e=>new RegExp('(?:Single_|Type_)'+e+'(?:_|$)').test(n));
 if(element&&/Resistance/.test(n))return 'Resistenza al '+ELEMENTS[element];
 if(element&&/Damage/.test(n))return 'Danni '+ELEMENTS[element]+(a.tempered?'':' [x]');
 if(s?.key==='Resource_On_Kill')return 'Risorsa per uccisione';
 if(s?.key==='Resource_Regen_Per_Second')return 'Rigenerazione della risorsa';
 if(a.name.startsWith('Ranks:'))return 'Gradi di '+a.name.slice(7);
 if(/Tempered_CritDamage/.test(n))return 'Danni critici';
 if(/Tempered_Damage_Generic_All/.test(n))return 'Danni totali';
 return TRANSLATIONS[a.name]||a.name.replace(/^x /,'').replace(/ Multiplier$/,' [x]');
}
export const typeKey=a=>a.stats[0].key+':'+a.stats[0].param;
export function families(a){
 const f=[],tags=a.tags||[];
 if(a.category===0)f.push('offensive');if(a.category===1)f.push('defensive');if(a.category===3)f.push('resource');
 if(tags.includes('HoradricCube_Utility_Mobility')||a.category===2||a.category===4)f.push('utility');
 if(tags.includes('HoradricCube_CoreStat_SkillRank'))f.push('skill');
 if(tags.includes('Cube_Resistances')||a.stats.some(s=>/Resistance/.test(s.key)))f.push('resistance');
 return f;
}
export function catalogFor(db,base,{tempered=false,includeForced=true}={}){
 const type=db.types.find(t=>t.id===base.type);if(!type||!type.classes.includes(base.classId))return [];
 const forced=new Set(includeForced&&!tempered?(db.items.find(i=>i.id===base.itemId)?.forced||[]):[]),groups=new Map();
 for(const a of db.affixes){
  const normal=a.candidate&&a.tempered===tempered&&a.classes.includes(base.classId)&&a.labels.some(l=>type.labels.includes(l))&&(a.minPower??0)<=base.power&&(a.maxPower??2000)>=base.power;
  if((!normal&&!forced.has(a.id))||a.stats.length!==1)continue;
  const key=typeKey(a);let group=groups.get(key);
  if(!group){group={key,name:translated(a),english:a.name,family:a.family,prisms:[],variants:[],range:null,unit:a.stats[0].unit,rollable:normal,source:a.source,element:Object.keys(GEMS).find(e=>a.internal.includes('Resistance_Single_'+e))||null};groups.set(key,group);}
  group.rollable||=normal;for(const f of families(a))if(!group.prisms.includes(f))group.prisms.push(f);
  group.variants.push(a);
 }
 for(const g of groups.values()){
  // Prefer the highest learned manual for presentation; never count tiers as separate roll types.
  const ordered=g.variants.toSorted((a,b)=>Number(/Tier3/.test(b.internal))-Number(/Tier3/.test(a.internal)));
  g.representative=ordered[0];const bounds=ordered.map(a=>rangeFor(a.stats[0],base.power)).filter(Boolean);
  g.range=bounds.length?bounds[0]:null;g.rangeAmbiguous=new Set(bounds.map(r=>JSON.stringify(r))).size>1||bounds.length<g.variants.length;
 }
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,'it'));
}
export function seeded(seed=1){return ()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const cloneState=s=>({...s,rows:s.rows.map(a=>({...a}))});
const has=(s,key,ga=false)=>s.rows.some(r=>r.key===key&&(!ga||r.ga));
const merge=(a,b)=>{for(const [k,v] of Object.entries(b))a[k]=(a[k]||0)+v;return a;};
function costFrom(db,internal,fallback){const r=db.recipes.find(r=>r.internal===internal);if(!r)return fallback;return Object.fromEntries(r.ingredients.map(i=>[i.name.replace(/\{[^}]+\}/g,'').trim(),i.quantity]));}
export function createContext(db,input){
 const base=input.base,catalog=catalogFor(db,base),byKey=new Map(catalog.map(g=>[g.key,g]));
 const targets=input.targets.map(t=>typeof t==='string'?{key:t,ga:false}:t),goalSet=new Set(targets.map(t=>t.key));
 const gaSet=new Set(targets.filter(t=>t.ga).map(t=>t.key));
 const state={rows:base.affixes.filter(Boolean).map(a=>({key:a.key,ga:!!a.ga,enchanted:!!a.enchanted})),rarity:base.rarity};
 if(!['common','magic','rare','legendary','unique','mythic'].includes(base.rarity)||base.affixes.length>4)throw new Error('Rarità o numero di posti base non validi.');
 if(base.quality!==undefined&&(!Number.isInteger(base.quality)||base.quality<0||base.quality>25))throw new Error('La qualità deve essere un numero intero fra 0 e 25.');
 if(!targets.length||targets.length>4||goalSet.size!==targets.length)throw new Error('Scegli da uno a quattro affissi diversi.');
 if(!db.classes.includes(base.classId)||!db.types.some(t=>t.id===base.type&&t.classes.includes(base.classId))||!Number.isInteger(base.power)||base.power<1||base.power>900)throw new Error('Classe, oggetto o potenza non validi.');
 if(state.rows.length>4||state.rows.some(r=>!byKey.has(r.key)))throw new Error('La base contiene un affisso incompatibile.');
 if(targets.some(t=>!byKey.has(t.key)))throw new Error('Un obiettivo non è compatibile con questa base.');
 const conflicts=rows=>new Set(rows.map(r=>byKey.get(r.key).family)).size!==rows.length;
 if(conflicts(state.rows)||conflicts(targets))throw new Error('Questi affissi appartengono a una famiglia che non può coesistere.');
 if(state.rows.filter(r=>r.enchanted).length>1)throw new Error('Un oggetto ha un solo slot incantato.');
 if(base.temperAttempts!==undefined&&(!Number.isInteger(base.temperAttempts)||base.temperAttempts<0||base.temperAttempts>10000))throw new Error('Tentativi di Tempra non validi.');
 if(base.tempered&&!catalogFor(db,base,{tempered:true}).some(g=>g.key===base.tempered.key))throw new Error('La Tempra presente non è compatibile.');
 if(base.capstone&&(base.quality!==25||(base.capstone==='temper'?!base.tempered:!state.rows.some(r=>r.key===base.capstone))))throw new Error('Il capstone presente deve essere su una riga esistente a qualità 25.');
 const normal=catalog.filter(g=>g.rollable),cache=new Map();
 const ctx={db,input,base,catalog,byKey,normal,targets,goalSet,gaSet,state,cache};
 ctx.met=(s,goals=targets)=>goals.every(t=>has(s,t.key,t.ga));
 ctx.missing=s=>targets.filter(t=>!has(s,t.key,t.ga));
 ctx.pool=(s,index=-1,family='any',exact=null)=>{
  const occupied=new Set(s.rows.filter((_,i)=>i!==index).map(r=>byKey.get(r.key).family));
  return normal.filter(g=>!occupied.has(g.family)&&(family==='any'||g.prisms.includes(family))&&(!exact||g.key===exact));
 };
 ctx.cost=(kind,family='any',element=null)=>{
  const part=PRISMS[family].part,gem=element?'_'+element:'';
  const prefix=kind==='add'?'X2_Recipe_HoradricCube_AddAffix_'+part+gem:kind==='remove'?'X2_Recipe_HoradricCube_RemoveAffix_'+part:'X2_HoradricCube_ChangeAffix_'+part+'_To_'+(kind==='focused'?part+gem:'Random');
  const fallback=kind==='add'?{'Raw Primordial Dust':5,'Coarse Primordial Dust':1}:{'Raw Primordial Dust':15,'Refined Primordial Dust':1};
  if(family!=='any')fallback[PRISMS[family].name]=1;if(element)fallback[GEMS[element]]=1;
  return costFrom(db,prefix,fallback);
 };
 return ctx;
}
function regular(s){return !['unique','mythic'].includes(s.rarity);}
function scoreCost(cost){return (cost['Raw Primordial Dust']||0)+15*(cost['Refined Primordial Dust']||0)+5*(cost['Coarse Primordial Dust']||0)+1;}
function buildCandidate(ctx,s,kind,family,target,sourceFamily=family){
 const g=ctx.byKey.get(target.key),element=family==='resistance'&&g.element?g.element:null;
 let indices=kind==='add'?[-1]:s.rows.map((r,i)=>!r.enchanted&&(sourceFamily==='any'||ctx.byKey.get(r.key).prisms.includes(sourceFamily))?i:-1).filter(i=>i>=0);
 if(kind==='enchant')indices=s.rows.map((r,i)=>!ctx.goalSet.has(r.key)?i:-1).filter(i=>i>=0);
 if(kind==='enchant'){const marked=s.rows.findIndex(r=>r.enchanted);if(marked>=0)indices=indices.filter(i=>i===marked);}
 if(!indices.length)return null;
 if(indices.some(i=>i>=0&&s.rows[i].ga&&ctx.gaSet.has(s.rows[i].key)))return null;
 let profiles=indices.map(index=>({index,pool:ctx.pool(s,index,kind==='focused'||kind==='add'||kind==='removeAdd'?family:'any',element&&(kind==='focused'||kind==='add'||kind==='removeAdd')?g.key:null).map(x=>x.key)}));
 // The player chooses the Occultist row; it is not a random source selection.
 if(kind==='enchant')profiles=profiles.filter(p=>p.pool.includes(g.key)).sort((a,b)=>a.pool.length-b.pool.length).slice(0,1);
 if(!profiles.length)return null;
 if(profiles.some(p=>!p.pool.length))return null;
 const probability=profiles.reduce((sum,p)=>sum+(p.pool.includes(g.key)?(kind==='enchant'?1-(1-1/p.pool.length)**2:1/p.pool.length):0),0)/profiles.length;
 if(!probability)return null;
 const risk=kind==='enchant'||kind==='add'?0:profiles.reduce((sum,p)=>sum+(ctx.goalSet.has(s.rows[p.index].key)?1-(kind==='removeAdd'?0:Number(p.pool.includes(s.rows[p.index].key))/p.pool.length):0),0)/profiles.length;
 const safeProbability=profiles.reduce((sum,p)=>sum+((p.index<0||!ctx.goalSet.has(s.rows[p.index].key))&&p.pool.includes(g.key)?(kind==='enchant'?1-(1-1/p.pool.length)**2:1/p.pool.length):0),0)/profiles.length;
 let cost=kind==='enchant'?{'Incanti NPC':1}:ctx.cost(kind==='removeAdd'?'add':kind,family,element);
 if(kind==='removeAdd')cost=merge({...cost},ctx.cost('remove',sourceFamily));
 return {kind,family,sourceFamily,target:g.key,element,profiles,probability,safeProbability,risk,cost,operations:kind==='removeAdd'?2:1};
}
export function nextMove(ctx,s,preferred=null,allowProtection=true){
 const missing=ctx.missing(s);if(!missing.length)return null;
 const cacheKey=(preferred||'')+'|'+Number(allowProtection)+'|'+s.rarity+'|'+s.rows.map(r=>r.key+Number(r.ga)+Number(r.enchanted)).join(',');
 if(ctx.cache.has(cacheKey))return ctx.cache.get(cacheKey);
 const remember=x=>{if(ctx.cache.size<20000)ctx.cache.set(cacheKey,x);return x;};
 const wants=preferred&&missing.some(t=>t.key===preferred)?missing.filter(t=>t.key===preferred):missing;
 const marked=s.rows.findIndex(r=>r.enchanted);
 const enchantPossible=marked<0||!ctx.goalSet.has(s.rows[marked].key);
 if(s.rows.length===4&&missing.length===1&&enchantPossible){const x=buildCandidate(ctx,s,'enchant','any',missing[0]);if(x)return remember(x);}
 if(marked>=0&&!ctx.goalSet.has(s.rows[marked].key)&&enchantPossible){const x=buildCandidate(ctx,s,'enchant','any',wants[0]);if(x)return remember(x);}
 const candidates=[];
 if(regular(s))for(const t of wants){
  const g=ctx.byKey.get(t.key),families=[...g.prisms,'any'];
  if(s.rows.length<4)for(const f of families){const x=buildCandidate(ctx,s,'add',f,t);if(x)candidates.push(x);}
  for(const f of Object.keys(PRISMS)){
   if(f!=='any'&&g.prisms.includes(f)){const x=buildCandidate(ctx,s,'focused',f,t);if(x)candidates.push(x);}
   const c=buildCandidate(ctx,s,'chaotic',f,t);if(c)candidates.push(c);
   if(['magic','rare'].includes(s.rarity))for(const out of families){const x=buildCandidate(ctx,s,'removeAdd',out,t,f);if(x)candidates.push(x);}
  }
 }
 // A free slot is filled first. Otherwise prefer progress without risking a desired row.
 const adds=candidates.filter(c=>c.kind==='add');const safe=candidates.filter(c=>c.risk===0);
 const choices=adds.length?adds:safe.length?safe:candidates;
 choices.sort((a,b)=>((b.safeProbability-2*b.risk)/scoreCost(b.cost))-((a.safeProbability-2*a.risk)/scoreCost(a.cost)));
 if(choices.length)return remember(choices[0]);
 if(allowProtection&&marked<0)for(let i=0;i<s.rows.length;i++){
  const r=s.rows[i];if(!r.ga||!ctx.gaSet.has(r.key))continue;const protectedState=cloneState(s);protectedState.rows[i].enchanted=true;
  if(nextMove(ctx,protectedState,preferred,false))return remember({kind:'protect',target:r.key,profiles:[{index:i,pool:[]}],probability:1,safeProbability:1,risk:0,cost:{'Incanti NPC':1},operations:1});
 }
 // Enchanting is still useful for subset goals, or where the Cube has no viable move.
 if(enchantPossible&&s.rows.length)for(const t of wants){const x=buildCandidate(ctx,s,'enchant','any',t);if(x)return remember(x);}
 return remember(null);
}
export function advance(ctx,input,move,rng,{forceSuccess=false}={}){
 const s=cloneState(input);let profiles=move.profiles;
 if(forceSuccess&&move.kind!=='protect')profiles=profiles.filter(p=>p.pool.includes(move.target)&&(p.index<0||!ctx.goalSet.has(s.rows[p.index].key)));
 if(!profiles.length)throw new Error('La mossa non può conservare gli affissi già desiderati.');
 const profile=profiles[Math.floor(rng()*profiles.length)],i=profile.index;
 if(move.kind==='protect'){s.rows[i].enchanted=true;return s;}
 if(move.kind==='enchant'){
  const found=forceSuccess||Array.from({length:2},()=>profile.pool[Math.floor(rng()*profile.pool.length)]).includes(move.target);
  if(found)s.rows[i]={key:move.target,ga:false,enchanted:true};else s.rows[i].enchanted=true;
 }else{
  const key=forceSuccess?move.target:profile.pool[Math.floor(rng()*profile.pool.length)];const row={key,ga:false,enchanted:false};
  if(move.kind==='add')s.rows.push(row);else s.rows[i]=row;
  if(regular(s)&&s.rarity!=='legendary')s.rarity=s.rows.length<=0?'common':s.rows.length<=2?'magic':'rare';
 }
 return s;
}
export function summarize(samples,maxOps=500){
 const finished=samples.filter(x=>x.success),operations=samples.map(x=>x.success?x.operations:Infinity).sort((a,b)=>a-b);
 const q=p=>{const v=operations[Math.ceil(samples.length*p)-1];return Number.isFinite(v)?v:null;};
 const mean=finished.length===samples.length?samples.reduce((a,x)=>a+x.operations,0)/samples.length:null;
 const costs={};for(const sample of samples)for(const key of Object.keys(sample.cost))costs[key]=0;
 for(const key of Object.keys(costs))costs[key]=samples.reduce((sum,x)=>sum+(x.cost[key]||0),0)/samples.length;
 return {mean,median:q(.5),p90:q(.9),success:finished.length/samples.length,costs,maxOps,samples:samples.map(x=>({operations:x.operations,success:x.success,cost:x.cost}))};
}
export function trial(ctx,start,stopGoals,rng,preferred=null,maxOps=500){
 let s=cloneState(start),operations=0,cost={};
 while(!ctx.met(s,stopGoals)&&operations<maxOps){const m=nextMove(ctx,s,preferred);if(!m||operations+m.operations>maxOps)return {success:false,operations,cost};s=advance(ctx,s,m,rng);merge(cost,m.cost);operations+=m.operations;}
 return {success:ctx.met(s,stopGoals),operations,cost,rowCount:s.rows.length};
}
export function geometric(p){if(p<=0)return {mean:null,p90:null};return {mean:1/p,p90:p===1?1:Math.ceil(Math.log(.1)/Math.log1p(-p))};}
function qualityStats(start){
 const mean=Array(26).fill(0);for(let q=24;q>=0;q--)mean[q]=1+[2,3,4,5].reduce((s,d)=>s+mean[Math.min(25,q+d)],0)/4;
 let distribution=new Map([[start,1]]),steps=0;while((distribution.get(25)||0)<.9&&steps<20){const next=new Map();for(const [q,p] of distribution)for(const d of [2,3,4,5]){const n=Math.min(25,q+d);next.set(n,(next.get(n)||0)+p/4);}distribution=next;steps++;}
 return {mean:mean[start],p90:steps};
}
export function finishing(ctx,s){
 const extra=[],f=ctx.input.finish||{};const needsLegendary=regular(s)&&(f.aspect||f.temper||f.quality||f.capstone);
 if(f.aspect&&!ctx.db.powers.some(p=>p.id===f.aspect&&p.candidateAspect&&p.classes.includes(ctx.base.classId)&&p.labels.some(l=>ctx.db.types.find(t=>t.id===ctx.base.type).labels.includes(l))))throw new Error('Aspetto incompatibile con questo oggetto.');
 if(needsLegendary&&s.rows.length<4)extra.push({kind:'fill',probability:1,stats:{mean:4-s.rows.length,p90:4-s.rows.length},cost:ctx.cost('add'),instruction:'Nel Cubo usa Add Affix senza prisma per riempire i posti base rimasti, fino a quattro. Questi affissi sono riempitivi: gli obiettivi sono già conservati. Dopo puoi promuovere la base a leggendario.'});
 if(needsLegendary&&s.rarity!=='legendary')extra.push({kind:'aspect',target:f.aspect||null,probability:1,stats:{mean:1,p90:1},cost:{'Impronte NPC':1},instruction:'Completa gli affissi prima di promuovere la base. All’Occultista imprimi un Aspetto compatibile del Codex: il raro diventa leggendario.'});
 else if(f.aspect&&regular(s)&&ctx.base.aspect!==f.aspect)extra.push({kind:'aspect',target:f.aspect,probability:1,stats:{mean:1,p90:1},cost:{'Impronte NPC':1},instruction:'All’Occultista apri Impronta, inserisci il pezzo e scegli questo Aspetto dal Codex. Devi averlo già sbloccato.'});
 if(f.temper&&ctx.base.tempered?.key!==f.temper){
  const temp=catalogFor(ctx.db,ctx.base,{tempered:true}).find(a=>a.key===f.temper);if(!temp)throw new Error('La Tempra scelta non è compatibile.');
  const cost={'Tempre NPC':1};if((ctx.base.temperAttempts??f.temperAttempts??3)===0)cost['Scroll of Restoration']=1;
  if(regular(s))Object.assign(cost,ctx.base.ancestral?{'Materiali leggendari di recupero':25,'Forgotten Soul':25}:{'Veiled Crystal':15,'Materiali leggendari di recupero':5});
  extra.push({kind:'temper',target:temp.key,group:temp,probability:1,stats:{mean:1,p90:1},cost,instruction:'Dal Fabbro apri Tempra, inserisci il pezzo e seleziona direttamente l’affisso dal manuale sbloccato. Il tipo è scelto da te; il valore resta casuale.'});
 }
 const quality=Math.max(0,Math.min(25,Math.floor(ctx.base.quality||0)));
 if((f.quality||f.capstone)&&quality<25)extra.push({kind:'quality',probability:1,stats:qualityStats(quality),cost:{'Rifiniture NPC':1},start:quality,instruction:'Dal Fabbro usa Rifinitura finché raggiungi qualità 25. Ogni operazione aumenta la qualità di 2–5; non azzerarla per cercare il capstone.'});
 if(f.capstone){
  if(!ctx.goalSet.has(f.capstone)&&f.capstone!=='temper')throw new Error('Scegli per il capstone una riga del risultato finale.');
  if(f.capstone==='temper'&&!f.temper&&!ctx.base.tempered)throw new Error('Scegli prima una Tempra.');
  const existing=ctx.base.capstone===f.capstone&&(f.capstone!=='temper'||!f.temper||ctx.base.tempered?.key===f.temper)&&s.rows.some(r=>r.key===f.capstone||f.capstone==='temper');
  if(existing)return extra;
  const count=(needsLegendary?4:s.rows.length)+(f.temper||ctx.base.tempered?1:0),p=1/count;
  extra.push({kind:'capstone',target:f.capstone,probability:p,stats:geometric(p),cost:{'Capstone NPC':1},instruction:'A qualità 25, dal Fabbro rilancia soltanto il capstone finché il +50% finisce sulla riga indicata. La qualità resta a 25.'});
 }
 return extra;
}
function appendFinishing(sample,extras,rng){
 const out={...sample,cost:{...sample.cost}};if(!out.success)return out;
 for(const x of extras){let n=1;
  if(x.kind==='fill'){n=Math.max(0,4-(sample.rowCount??4));}
  else if(x.kind==='quality'){n=0;let q=x.start;while(q<25){q=Math.min(25,q+2+Math.floor(rng()*4));n++;}}
  else if(x.kind==='capstone'){n=1;while(rng()>=x.probability&&n<10000)n++;}
  out.operations+=n;for(const [k,v] of Object.entries(x.cost))out.cost[k]=(out.cost[k]||0)+v*n;
 }
 return out;
}
function failureBranches(ctx,s,move){
 if(['enchant','protect'].includes(move.kind))return [];
 const grouped=new Map();
 for(const profile of move.profiles)for(const key of profile.pool){
  if(key===move.target)continue;
  const after=cloneState(s),row={key,ga:false,enchanted:false};
  if(move.kind==='add')after.rows.push(row);else after.rows[profile.index]=row;
  if(regular(after)&&after.rarity!=='legendary')after.rarity=after.rows.length<=2?'magic':'rare';
  const next=nextMove(ctx,after,move.target),id=next?[next.kind,next.family,next.sourceFamily,next.target,...next.profiles.map(p=>p.index)].join('|'):'blocked';
  if(!grouped.has(id))grouped.set(id,{names:[],next:next?{kind:next.kind,family:next.family,sourceFamily:next.sourceFamily,target:next.target,element:next.element,cost:next.cost,sourceRows:next.profiles.map(p=>p.index<0?'Posto vuoto':ctx.byKey.get(after.rows[p.index].key).name)}:null});
  const name=ctx.byKey.get(key).name;if(!grouped.get(id).names.includes(name))grouped.get(id).names.push(name);
 }
 return [...grouped.values()];
}
export function buildPlan(db,input,{runs=700,stageRuns=250,maxOps=500,seed=4279}={}){
 const ctx=createContext(db,input),rng=seeded(seed);
 const missingGa=ctx.targets.filter(t=>t.ga&&!has(ctx.state,t.key,true));
 if(missingGa.length)return {blocked:'I GA richiesti devono essere già presenti sul drop. Cubo e incantamento non trasformano un affisso base normale in GA.',needsDrop:missingGa.map(t=>ctx.byKey.get(t.key).name),stages:[]};
 if(ctx.base.unmodifiable){if(ctx.met(ctx.state)&&!finishing(ctx,ctx.state).length)return {complete:true,locked:true,stages:[],extras:[]};return {blocked:'Questo oggetto è Unmodifiable: cerca una nuova base modificabile. Le lavorazioni richieste non possono essere eseguite.',stages:[]};}
 let s=cloneState(ctx.state),stages=[];
 for(let n=0;!ctx.met(s)&&n<8;n++){
  const move=nextMove(ctx,s);if(!move)return {blocked:!regular(s)?'Su Unici e Mitici non si usano Focused e Chaotic. Con lo slot d’incantamento disponibile puoi correggere una riga; per questo obiettivo serve un altro drop con più affissi già giusti.':'Il percorso non può conservare i GA richiesti con i prismi e lo slot d’incantamento di questa base. Cerca una base con più affissi corretti oppure rinuncia esplicitamente a conservare uno dei GA.',stages};
  const before=cloneState(s),after=advance(ctx,s,move,()=>0,{forceSuccess:true});
  let stats;
  if(move.kind==='protect')stats={mean:1,p90:1,success:1,costs:move.cost,samples:[{operations:1,success:true,cost:move.cost}]};
  else{const attained=ctx.targets.filter(t=>has(after,t.key,t.ga));const trials=Array.from({length:stageRuns},()=>trial(ctx,before,attained,rng,move.target,maxOps));stats=summarize(trials,maxOps);}
  stages.push({move,before,after,stats,group:ctx.byKey.get(move.target),branches:failureBranches(ctx,before,move),sourceRows:move.profiles.map(p=>p.index<0?'Posto vuoto':ctx.byKey.get(before.rows[p.index].key).name),poolNames:[...new Set(move.profiles.flatMap(p=>p.pool))].map(k=>ctx.byKey.get(k).name)});s=after;
 }
 if(!ctx.met(s))return {blocked:'Il percorso non è risolto per questa combinazione. Aggiorna la base o scegli meno obiettivi.',stages};
 const extras=finishing(ctx,s);
 const samples=Array.from({length:runs},()=>appendFinishing(trial(ctx,ctx.state,ctx.targets,rng,null,maxOps),extras,rng));
 return {complete:stages.length===0&&extras.length===0,stages,extras,summary:summarize(samples,maxOps),final:s,already:ctx.targets.filter(t=>has(ctx.state,t.key,t.ga)).length,total:ctx.targets.length,usesProtection:stages.some(x=>x.move.kind==='protect')||ctx.state.rows.some(r=>r.enchanted),warnings:ctx.targets.filter(t=>ctx.byKey.get(t.key).rangeAmbiguous||!ctx.byKey.get(t.key).range).map(t=>ctx.byKey.get(t.key).name)};
}
