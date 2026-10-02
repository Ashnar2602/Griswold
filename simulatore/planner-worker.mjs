import {buildPlan} from './planner.mjs';
let db;
self.onmessage=event=>{
 const {type,id,input}=event.data;
 if(type==='init'){db=event.data.db;self.postMessage({type:'ready'});return;}
 if(type==='plan')try{self.postMessage({type:'result',id,result:buildPlan(db,input)});}catch(e){self.postMessage({type:'error',id,message:e.message});}
};
