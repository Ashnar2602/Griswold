import {createContext,nextMove,finishing} from './planner.mjs';

// Records what the player observed. It never rolls an item or spends an estimated budget.
export function applyStepResult(db,input,action,outcome={}){
 const value=structuredClone(input),ctx=createContext(db,value),base=value.base;
 if(base.unmodifiable)throw new Error('Il pezzo è Unmodifiable: non puoi registrare una nuova lavorazione.');
 base.affixes=[...base.affixes,...Array(4-base.affixes.length).fill(null)];
 const occupied=base.affixes.map((r,index)=>r?index:-1).filter(i=>i>=0);
 let changed=false;
 if(action.move){
  const m=nextMove(ctx,ctx.state);
  if(!m||m.kind!==action.move.kind||m.target!==action.move.target||m.family!==action.move.family||m.sourceFamily!==action.move.sourceFamily||JSON.stringify(action.before)!==JSON.stringify(ctx.state))throw new Error('Il passo non corrisponde più al tuo oggetto. Ricalcola il piano.');
  const candidates=m.profiles.filter(p=>m.kind==='protect'||outcome.keepOriginal||p.pool.includes(outcome.key||m.target));
  if(candidates.length>1&&outcome.sourceIndex===undefined)throw new Error('Indica quale riga è stata modificata dal Cubo.');
  const profile=candidates.find(p=>p.index===(outcome.sourceIndex??candidates[0]?.index));
  if(!profile)throw new Error('Questa riga non può essere modificata dalla ricetta indicata.');
  const index=profile.index<0?base.affixes.findIndex(r=>!r):occupied[profile.index];
  if(m.kind==='protect'){
   if(!outcome.protectionVerified)throw new Error('Conferma nel tooltip che il GA e il marcatore Incantato siano rimasti.');
   base.affixes[index].enchanted=true;
  }else if(outcome.keepOriginal){
   if(m.kind!=='enchant')throw new Error('Nessuna modifica è disponibile solo all’Occultista.');
   // Even a failed first enchant permanently chooses this slot.
   base.affixes[index].enchanted=true;
  }else{
   const key=outcome.key||m.target;
   if(!profile.pool.includes(key))throw new Error('Questo esito non appartiene al pool della ricetta e della riga.');
   base.affixes[index]={key,ga:false,enchanted:m.kind==='enchant'};changed=true;
   if(!['legendary','unique','mythic'].includes(base.rarity))base.rarity=base.affixes.filter(Boolean).length>2?'rare':'magic';
  }
 }else{
  if(!ctx.met(ctx.state))throw new Error('Prima della finitura completa gli affissi base.');
  const extra=finishing(ctx,ctx.state)[0];
  if(!extra||extra.kind!==action.kind||extra.target!==action.target)throw new Error('Completa il passo precedente prima di questa lavorazione.');
  if(extra.kind==='fill'){
   const keys=outcome.fillKeys||[],blanks=base.affixes.map((r,i)=>r?-1:i).filter(i=>i>=0);
   if(keys.length!==blanks.length)throw new Error('Indica gli affissi aggiunti in tutti i posti vuoti.');
   keys.forEach((key,i)=>{if(!ctx.normal.some(g=>g.key===key))throw new Error('Affisso riempitivo incompatibile.');base.affixes[blanks[i]]={key,ga:false,enchanted:false};});
   base.rarity='rare';changed=true;
  }else if(extra.kind==='aspect'){
   const aspect=extra.target||outcome.aspect;
   const type=db.types.find(t=>t.id===base.type);
   if(!db.powers.some(p=>p.id===aspect&&p.candidateAspect&&p.classes.includes(base.classId)&&p.labels.some(l=>type.labels.includes(l))))throw new Error('Indica l’Aspetto compatibile che hai impresso.');
   base.aspect=aspect;base.rarity='legendary';
  }else if(extra.kind==='temper'){
   const available=base.temperAttempts??value.finish?.temperAttempts??3;
   const maximum=available===0?0:available-1;
   const remaining=outcome.temperAttempts??maximum;
   if(!Number.isInteger(remaining)||remaining<0||remaining>maximum)throw new Error('Indica i tentativi rimasti dopo la Tempra. Se hai usato altre pergamene, correggi il contatore nella base.');
   base.tempered={key:extra.target,ga:!!outcome.ga};base.temperAttempts=remaining;
   value.finish.temperAttempts=remaining;changed=true;
  }else if(extra.kind==='quality'){
   const quality=outcome.quality??25;
   if(!Number.isInteger(quality)||quality<Math.min(25,(base.quality||0)+2)||quality>25)throw new Error('Indica la qualità raggiunta: ogni lavorazione aggiunge almeno 2 punti, fino al limite di 25.');
   base.quality=quality;
  }else if(extra.kind==='capstone'){
   if(base.quality!==25)throw new Error('Il capstone richiede qualità 25.');
   base.capstone=outcome.capstone||extra.target;
  }
 }
 // When changing an already finished piece, use the observed tooltip, not a guessed transfer.
 if(changed&&input.base.capstone){
  if(outcome.capstone===undefined)throw new Error('Indica su quale riga si trova ora il capstone, oppure che non è presente.');
  base.capstone=outcome.capstone||null;
 }
 createContext(db,value);return value;
}
