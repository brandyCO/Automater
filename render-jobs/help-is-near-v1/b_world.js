// ===================== the world: trench, layers, fires =====================
function groundY(x){ // the near ground's surface
  if(x<TX-TWL+2) return G+Math.sin(x*.045)*1.1+Math.sin(x*.013+1)*1.8-Math.max(0,TX-430-x)*.05;
  let y=G; const a=TX+64, b=TX+178;
  if(x>a&&x<b){ const u=(x-a)/(b-a); y=G-26*Math.pow(Math.sin(Math.PI*u),.8); }   // the parapet of dug earth
  if(x>TX+150){ const d=x-(TX+150); y+=Math.min(d,260)*.5+Math.max(0,d-260)*.06; }
  return y+Math.sin(x*.05)*1.2;
}
// the trench walls (x at a given y), with the right wall's scar after the collapse
const wallL=y=>TX-lerp(TWL,TWB,clamp((y-G)/TD))+Math.sin(y*.21)*1.2;
const wallR=y=>TX+lerp(TWL,TWB,clamp((y-G)/TD))+Math.sin(y*.17+1)*1.2;
// the slab that breaks off the right wall at blow 2 (world polygon)
const SLAB=[[TX+61,G-1],[TX+88,G-2],[TX+94,G+17],[TX+80,G+43],[TX+59,G+43]];
const SLAB_C=SLAB.reduce((a,p)=>[a[0]+p[0]/SLAB.length,a[1]+p[1]/SLAB.length],[0,0]);
function trenchOutline(collapsed){ // left lip -> floor -> right lip (world points)
  const pts=[];
  for(let y=G;y<=FL;y+=5) pts.push([wallL(y),y]);
  for(let x=TX-TWB+4;x<=TX+TWB-4;x+=8) pts.push([x,FL+Math.sin(x*.3)*.8]);
  if(!collapsed){ for(let y=FL;y>=G;y-=5) pts.push([wallR(y),y]); }
  else { for(let y=FL;y>=G+44;y-=5) pts.push([wallR(y),y]); pts.push([TX+80,G+43],[TX+94,G+17],[TX+88,G-2]); }
  return pts;
}
// far layers. p = parallax (0 = sky, 1 = his ground)
function ridge(x,seed,amp){return Math.sin(x*.0021+seed)*amp+Math.sin(x*.0053+seed*2.1)*amp*.45+Math.sin(x*.013+seed*3.7)*amp*.18;}
const LAY={
  L1:{p:.22,base:1000,amp:62,seed:3.1,c0:'#161c2c',c1:'#4a5a78',haze:.3},   // the hills above (most of the armies)
  L3:{p:.42,base:1150,amp:34,seed:1.7,c0:'#10141f',c1:'#33405a',haze:.14},  // behind him: the city and the broken treaty
  L2:{p:.55,base:1290,amp:7, seed:5.3,c0:'#0c1019',c1:'#283044',haze:.08},  // the plain below, in front of him
};
const layTop=(Lr,x)=>Lr.base-ridge(x,Lr.seed,Lr.amp)+(Lr===LAY.L2?Math.max(0,620-x)*.6:0)+(Lr===LAY.L3?Math.max(0,x-470)*.55:0);
// ---------- fires (the armies are only ever fires, tents and sound) ----------
const FIRES=[];
{ const r=rng(2214);
  const add=(lay,x,ign,opt={})=>{ const Lr=LAY[lay]; const top=layTop(Lr,x); const y=top+(opt.dy!==undefined?opt.dy:4+Math.pow(r(),1.3)*(lay==='L1'?230:lay==='L3'?60:30));
    FIRES.push({lay,p:Lr.p,x,y,ign,size:.7+r()*.6,seed:r()*100,tent:r()<(opt.tent||.32),tside:r()<.5?-1:1,tdel:r()*.25,out:0}); };
  // a few campfires already burning far away (a hint of what is coming)
  for(let i=0;i<14;i++) add('L1',900+r()*700,-10,{});
  // blow 2: thousands of fires light up across the hills above...
  for(let i=0;i<380;i++){ const x=-600+r()*2300; add('L1',x,T.b2+.06+Math.abs(x-760)/1700*1.1+r()*.2); }
  // ...and in the plain below him
  for(let i=0;i<120;i++){ const x=660+r()*1250; add('L2',x,T.b2+.7+(x-660)/1250*.8+r()*.16,{tent:.4}); }
  // then behind him, by the city: the treaty is broken and the crisis deepens
  for(let i=0;i<95;i++){ const x=-700+r()*1170; add('L3',x,T.whirl[0]+.2+(470-x)/1170*.75+r()*.12,{tent:.25}); }
  // when the gale front reaches each fire
  for(const f of FIRES){ let lo=20.6,hi=27; for(let k=0;k<40;k++){const m=(lo+hi)/2; if(galeX(m)>f.x) lo=m; else hi=m;} f.out=hi+.04+(hs(f.seed,9)-.5)*.08; }
}
// city lights behind him (the believers' homes: they stay lit)
const CITY=(()=>{const r=rng(77),o=[]; for(let i=0;i<22;i++){const x=40+r()*420; o.push({x,y:layTop(LAY.L3,x)+10+r()*22,w:5+r()*7,h:4+r()*6,lit:r()<.6,s:r()*6});} return o;})();
const STARS=(()=>{const r=rng(7);return Array.from({length:170},()=>({x:r()*W,y:r()*1250,s:r()*1.7+.35,p:r()*6,b:r()}));})();
// glow sprite
const GLOW=document.createElement('canvas'); GLOW.width=GLOW.height=128; {const g=GLOW.getContext('2d'); const rg=g.createRadialGradient(64,64,0,64,64,64); rg.addColorStop(0,'rgba(255,220,160,1)'); rg.addColorStop(.18,'rgba(255,160,80,.55)'); rg.addColorStop(.5,'rgba(255,110,50,.14)'); rg.addColorStop(1,'rgba(255,90,40,0)'); g.fillStyle=rg; g.fillRect(0,0,128,128);}
const SOFT=document.createElement('canvas'); SOFT.width=SOFT.height=64; {const g=SOFT.getContext('2d'); const rg=g.createRadialGradient(32,32,0,32,32,32); rg.addColorStop(0,'rgba(255,255,255,1)'); rg.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=rg; g.fillRect(0,0,64,64);}
