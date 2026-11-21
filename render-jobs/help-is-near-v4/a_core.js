// ===================== Help is near (2:214) : core =====================
// One night at the Trench, one continuous take. Deterministic: draw(t) depends only on t.
const W=1080,H=1920;
const cv=document.getElementById('c'); let ctx=cv.getContext('2d');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const inv=(a,b,x)=>clamp((x-a)/(b-a));
const ss=(a,b,x)=>{const t=inv(a,b,x);return t*t*(3-2*t);};
const sm=t=>t*t*t*(t*(t*6-15)+10);
const eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const eout=t=>1-Math.pow(1-t,3);
const ein=t=>t*t*t;
const ein2=t=>t*t;
const eback=t=>{const c1=1.6,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);};
const D=Math.PI/180;
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const mixc=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const rgba=(c,a=1)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${clamp(a)})`;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const fr=x=>x-Math.floor(x);
const hs=(i,s=0)=>fr(Math.sin(i*127.1+s*311.7)*43758.5453);
function vnoise(x,s=0){const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(hs(i,s),hs(i+1,s),u)*2-1;}
function fbm(x,s=0){return vnoise(x,s)*.6+vnoise(x*2.13,s+3)*.28+vnoise(x*4.37,s+7)*.12;}
// a smooth curve through [t,value] keys
function crv(K,ease=sm){ return t=>{ if(t<=K[0][0]) return K[0][1]; for(let i=0;i<K.length-1;i++){ if(t<K[i+1][0]){ const u=(t-K[i][0])/(K[i+1][0]-K[i][0]); return lerp(K[i][1],K[i+1][1],ease(u)); } } return K[K.length-1][1]; }; }

// ===================== world scale =====================
// He is 1.75 m tall = 162 units, so 1 m = 92.6 units and gravity is 908 units/s^2.
const G=1340, TD=100, FL=G+TD, TX=540, TWL=62, TWB=56;
const GRAV=908;
const L={th:37,sh:36,torso:52,neck:7,hr:15,ua:28,fa:27,ft:9};
const PL=74, HS=22;   // pick: handle length, gap between his two hands on it

// ===================== the story clock (story seconds) =====================
const T={
  imp0:.26, b1:1.05, wall1:1.27, knee1:1.62, up1:[2.95,3.8], imp2:4.56,
  b2:5.0, sit2:5.32, looks:[5.75,6.1,6.45], whirl:[6.78,7.06], whirlBack:[7.5,7.8],
  wide:[9.7,10.35], grab:10.8, lift:[10.95,11.35], slip:11.42, e2:[11.8,13.3], wrap:[13.55,14.15], tear:14.72,
  kneel:[15.1,15.5], look:[16.15,17.15], sujood:[17.55,18.55], hush:[18.6,19.5], beats:[19.55,20.08,20.62],
  gale:20.7, gpass:24.35, galeEnd:[26.5,27.7],
  rise:[28.6,29.8], melt:[29.0,32.6], chest:[30.0,31.0], stand:[31.3,32.4], climb:[32.7,34.85], 
  // the ending: he climbs out and stands; his sword lies at his feet; he draws it toward the sunrise and drives it into the earth
  // (33:25 "and Allah sufficed the believers in fighting"), then stands tall beside it and breathes out
  breeze:35.6, walk:99, arr:35.1, grab2:35.4, lift2:35.7, hold2:35.83, drawEnd:36.1, top:36.33, plant:36.55,
  bow:36.95, risen:37.7, exhale:[37.8,38.35], held:[34.9,41.5], glide:[99,100], END:40.2 };
// native slow motion while the first hills go dark (animated slower, never a speed ramp of footage)
const SLOW=[21.25,23.95], SLOWK=.5;
const warp=[]; {let tau=-3; for(let i=0;i<=73*480;i++){warp.push(tau); const b=Math.sin(Math.PI*inv(SLOW[0],SLOW[1],tau)); tau+=(1-SLOWK*b*b)/480;}}
const tauAt=tr=>{ const i=(tr+3)*480, a=Math.floor(i); if(a<0) return tr; if(a+1>=warp.length) return warp[warp.length-1]; return lerp(warp[a],warp[a+1],i-a); };
const realOf=tau=>{ let lo=0,hi=warp.length-1; while(hi-lo>1){const m=(lo+hi)>>1; if(warp[m]<tau) lo=m; else hi=m;} return lo/480-3; };
const REAL_END=realOf(T.END), XF=0;   // v3: no loop dissolve (he stays in the last frame); the reel simply ends on him

// ===================== the wind (his burden) =====================
// struggle wind, blowing from the enemy side (right) into his face
const windS=crv([[-3,.6],[1.0,.6],[1.07,2.0],[1.5,1.25],[2.7,.84],[4.9,.86],[5.25,1.0],[9.5,1.12],[12.0,1.0],[14.55,1.05],[14.72,2.05],[15.2,1.05],[18.4,.92],[18.95,.34],[19.6,.3],[20.7,.36],[21.3,.3]]);
// the gale: the same wind, sent against the camps
const galeA=crv([[20.6,0],[21.5,1],[26.2,1],[27.4,.22],[28.2,0]]);
// gale front (x, moving right to left across every layer)
const galeX=crv([[20.6,2700],[21.3,2150],[23.9,760],[24.6,520],[25.6,60],[26.8,-1500]],t=>t);
const breeze=crv([[35.2,0],[36.0,.3],[37.6,.2],[41,.13],[50,.12]]);
// local wind at world x (layer x), 0..3.3
function windAt(x,t){ const g=galeA(t); const front=ss(galeX(t)-160,galeX(t)+140,x);
  return Math.max(windS(t)*(1-ss(20.6,21.4,t)), 3.2*g*front) + breeze(t); }
const windNear=t=>windAt(TX,t);
// emotion curves
const frost=crv([[-3,0],[1.05,0],[1.6,.36],[4.9,.46],[5.4,.56],[9,.7],[15,.9],[17.6,1],[29.0,1],[32.4,0]]);
const shiverA=crv([[-3,.18],[1.05,.18],[1.35,1],[2.9,.95],[4.9,.65],[5.4,.85],[10,1],[11.4,1.15],[12.9,1.25],[13.05,1.9],[13.35,1.1],[15.5,1.0],[17.6,.7],[18.6,.32],[21,.22],[28,.14],[30.5,0]]);
const tunnel=crv([[-3,0],[4.95,0],[5.2,.6],[7.3,1],[8.6,.55],[9.4,.12],[10.6,.25],[16.1,.5],[17.6,.3],[19.5,0]]);
// heart: 0 in his chest, 1 in his throat ("the hearts reached the throats", 33:10)
const heartUp=crv([[-3,.1],[1.05,.1],[1.4,.3],[4.95,.3],[5.08,.42],[5.38,.95],[5.6,.86],[7.0,.9],[7.35,1.0],[15.5,.96],[17.8,.92],[18.3,.8],[19.45,.08],[40,.06]]);
const heartRate=crv([[-3,1.25],[1.05,1.25],[1.35,2.15],[4.9,1.8],[5.05,2.0],[5.35,3.1],[7.4,3.4],[10,2.7],[15,2.5],[17.6,2.0],[19.2,1.05],[19.5,1.0],[22,.95],[50,.9]]);
const answerW=t=>ss(T.beats[0]-.1,T.beats[0]+.25,t);
// dawn: a cold clear sky after the gale, then rose and gold
const preDawn=t=>ss(20.7,28.5,t);
const dawn=t=>clamp(.55*ss(26.2,38.5,t)+.45*inv(26.2,38.5,t));
// how bright the whole picture should be (rule 5: climbs nonstop from the answer)
