// ===================== the man: key poses, real timing, exaggerated acting =====================
// Coordinates are relative to the trench floor centre (TX, FL), facing right; y is negative upward.
// hN/hF: near/far hand. ['r',dx,dy] = from his shoulder, ['a',x,y] = fixed in the world.
// ph: pick head (['r'|'a',x,y]) and pa: handle angle (grip -> head), when he holds the pick.
const D0={hx:0,hy:-66,tor:20,curl:.1,hd:10,fF:[24,0],fB:[-26,0],hN:['r',20,40],hF:['r',14,42],ph:null,pa:0,tw:0,sa:90};   // sa: his sword's blade angle once drawn
const KEYS=[]; let _cur={...D0};
const gyr=x=>groundY(TX+x)-FL;   // the ground's height at TX+x, relative to the trench floor
function K(t,over,e='io'){ const {sw,...o}=over; _cur={..._cur,...o}; KEYS.push({t,p:_cur,e,sw}); }   // sw: force the pick's swing direction (+1 forward over the top, -1 back)
const EASE={io:sm,o:eout,i:ein2,ii:ein,b:t=>eback(t*t*(3-2*t)),l:t=>t,so:t=>1-Math.pow(1-t,2)};
// ---- digging: real progress (pre-roll from -2.2 so the loop dissolve has motion) ----
K(-2.2,{hx:4,hy:-57,tor:46,curl:.32,hd:8,ph:['a',66,-5],pa:60});
K(-1.55,{hx:-2,hy:-61,tor:33,curl:.2,hd:10,ph:['a',63,-11],pa:34},'io');       // levers the earth loose
K(-1.0,{hx:-3,hy:-62,tor:22,curl:.08,hd:12,ph:['r',16,-40],pa:-80},'io');      // starts to lift
K(-.08,{hx:-5,hy:-64,tor:3,curl:-.24,hd:17,ph:['r',-42,-84],pa:-140},'o');     // top of the swing (frame 0: the cover)
K(.08,{hx:-7,hy:-61,tor:-1,curl:-.3,hd:13,ph:['r',-46,-80],pa:-147},'io');     // a last wind-up, sinking into his knees
K(T.imp0,{hx:7,hy:-55,tor:50,curl:.36,hd:5,ph:['a',66,-4],pa:62,sw:1},'i');         // the strike, accelerating like a falling weight
K(.34,{hx:8,hy:-52,tor:56,curl:.44,hd:14},'o');                                  // impact: his whole body compresses, head follows through
K(.6,{hx:5,hy:-56,tor:47,curl:.32,hd:9},'io');
K(.9,{hx:-2,hy:-61,tor:32,curl:.18,hd:10,ph:['a',63,-11],pa:34},'io');          // levers back
K(T.b1,{hx:-3,hy:-63,tor:19,curl:.04,hd:12,ph:['r',12,-46],pa:-86},'io');       // begins to raise again...
// ---- blow 1: a freezing gust slams into him ("suffering and hardship touched them") ----
K(1.17,{hx:-17,hy:-66,tor:-22,curl:-.5,hd:-24,fF:[20,0],ph:['r',-28,-56],pa:-162},'so');   // thrown back, head snaps
K(T.wall1,{hx:-33,hy:-63,tor:-9,curl:-.12,hd:-8,fF:[12,0],fB:[-40,0],ph:['r',-4,-32],pa:-118},'i'); // stumbles a step back, slams into the wall
K(1.36,{hx:-32,hy:-62,tor:-3,curl:.06,hd:16},'o');                               // rebound off the wall, head whips forward
K(T.knee1,{hx:-27,hy:-38,tor:27,curl:.52,hd:30,fF:[18,0],fB:[-46,-1],ph:['a',30,-4],pa:100,sw:1},'i');   // slides down onto one knee, onto the handle
K(1.76,{hy:-36,tor:31,curl:.57,hd:36},'o');
K(T.up1[0],{hy:-35,tor:34,curl:.62,hd:40},'io');                                 // stays down, curled around the handle, shaking
K(3.28,{hx:-21,hy:-40,tor:46,curl:.52,hd:24},'io');                              // wind-up: weight forward onto the handle
K(T.up1[1],{hx:-12,hy:-61,tor:27,curl:.32,hd:16,fF:[20,0],fB:[-30,0],ph:['a',36,-4],pa:100},'io'); // heaves himself up (slower than before)
K(4.33,{hx:-8,hy:-62,tor:9,curl:-.04,hd:18,ph:['r',-30,-70],pa:-128},'io');      // a weak, lower raise
K(T.imp2,{hx:4,hy:-56,tor:46,curl:.3,hd:9,ph:['a',62,-5],pa:60,sw:1},'i');           // weaker strike
K(4.64,{hx:5,hy:-54,tor:49,curl:.36,hd:15},'o');
K(4.97,{hx:2,hy:-57,tor:45,curl:.36,hd:17});                                      // panting over the handle
// ---- blow 2: the ground shakes with the armies ("and they were shaken") ----
K(5.07,{hx:-8,hy:-60,tor:8,curl:-.22,hd:-16,ph:null,hN:['r',28,-34],hF:['r',8,-46]},'o');   // jolted upright, the pick torn away
K(T.sit2,{hx:-36,hy:-11,tor:-7,curl:.1,hd:-12,fF:[42,-1],fB:[24,-1],hN:['a',-28,-12],hF:['a',-46,-34]},'i'); // drops like a dead weight against the wall
K(5.43,{tor:24,curl:.48,hd:36},'o');                                              // the jolt folds him forward
K(5.62,{tor:14,curl:.3,hd:10},'io');
K(T.looks[0],{tor:6,curl:.18,hd:-40},'b');       // eyes grew wild: snaps up to the hills
K(5.98,{});
K(T.looks[1],{tor:20,hd:24},'b');                 // down to the plain
K(6.3,{});
K(T.looks[2],{tor:6,hd:-26},'b');                 // up again
K(T.whirl[0],{tor:8,hd:-14});
K(T.whirl[1],{tw:1,tor:-2,hd:-30,hN:['r',-26,40],hF:['r',12,22]},'b');   // twists round: fires behind him too
K(T.whirlBack[0],{hd:-26});
K(T.whirlBack[1],{tw:0,tor:12,hd:-4,hN:['a',-28,-12],hF:['a',-46,-34]},'b');
// he scrambles up the wall, only half way (he can barely stand now)
K(8.2,{hx:-28,hy:-24,tor:42,curl:.42,hd:20,fF:[30,0],fB:[-6,0],hN:['a',2,-10],hF:['r',-40,30]},'io');
K(9.15,{hx:-24,hy:-52,tor:35,curl:.5,hd:24,fF:[18,0],fB:[-27,0],hN:['r',8,30],hF:['r',-46,22]},'io');
K(10.0,{hx:-22,hy:-53,tor:38,curl:.56,hd:28,hN:['r',16,22],hF:['r',10,22]},'io');   // arms clutched to his chest (wide shot)
// ---- effort 1: the pick slides out of his frozen arm ----
K(10.6,{hx:-30,hy:-34,tor:62,curl:.4,hd:22,fF:[8,0],fB:[-40,0],hN:['k',.78,0],hF:['k',.68,0]},'io');   // crouches over it
K(T.grab,{hy:-33,tor:64,hd:24});
K(T.lift[1],{hx:-30,hy:-48,tor:44,curl:.45,hd:16,hN:['r',8,44],hF:['r',-2,46]},'so');   // lifts it a little, the whole arm shaking
K(T.slip+.12,{hN:['r',20,30],hF:['r',10,34],hd:30,tor:40},'o');                        // it slips; his arms jerk up empty
K(12.0,{hx:-12,hy:-56,tor:30,curl:.5,hd:44,hN:['r',28,6],hF:['r',22,12]},'io');    // stares at his hands
// ---- effort 2: blows into his hands ----
K(12.35,{tor:26,curl:.55,hd:18,hN:['r',20,-15],hF:['r',16,-11]},'io');
K(12.75,{hd:13,tor:23});
K(13.05,{tor:35,curl:.68,hd:26,hN:['r',17,-4],hF:['r',13,0]},'io');              // a violent shiver
K(13.3,{tor:30,hd:18,hN:['r',20,-15],hF:['r',16,-11]},'io');                      // blows again, weaker
K(13.44,{tor:28,hd:14,hN:['r',8,30],hF:['r',4,32]},'i');
// ---- effort 3: pulls the cloak around him; the wind tears it away ----
K(13.6,{tor:24,curl:.36,hd:8,hN:['r',-24,16],hF:['r',-18,24]},'o');                // reaches back for the cloak
K(T.wrap[1],{tor:31,curl:.62,hd:22,hN:['r',14,22],hF:['r',10,26]},'io');          // wraps it round, hugs himself
K(14.6,{tor:34,curl:.7,hd:28});
K(14.88,{hx:-19,tor:10,curl:-.14,hd:-12,hN:['r',38,-12],hF:['r',-30,-22]},'o');   // the gust rips it open, arms flung
K(15.1,{hx:-20,hy:-52,tor:24,curl:.32,hd:14},'io');                               // staggers
K(T.kneel[1],{hx:-8,hy:-43,tor:20,curl:.45,hd:36,fF:[-30,-2],fB:[-38,-2],hN:['r',16,46],hF:['r',10,46]},'i');   // knees give, he drops to his knees
K(15.64,{hy:-41,tor:24,curl:.52,hd:40},'o');
K(T.look[0],{tor:30,curl:.62,hd:46},'io');            // still. he truly can't.
// ---- "when is the help of Allah?" ----
K(T.look[1],{tor:-3,curl:-.18,hd:-50,hN:['r',8,48],hF:['r',4,48]},'io');
K(17.5,{tor:-1,hd:-54});
// ---- sujood, in the freezing wind, fires all around ----
K(17.9,{tor:42,curl:.3,hd:10,hN:['a',30,-2],hF:['a',24,-2]},'io');
K(T.sujood[1],{hx:-14,hy:-35,tor:101,curl:.16,hd:24},'io');
K(28.6,{hy:-34});
// ---- after the gale: he lifts his head, the frost melts, he stands ----
K(T.rise[1],{hx:-22,hy:-31,tor:6,curl:.02,hd:2,hN:['a',4,-33],hF:['a',-2,-33]},'io');   // sits back on his heels
K(T.chest[1],{hN:['r',13,27],hd:10},'io');                                          // hand on his chest
K(31.7,{hx:-10,hy:-37,tor:42,curl:.2,hd:8,fF:[8,0],fB:[-36,-2],hN:['r',16,40]},'io'); // one foot forward, gathers himself
K(T.stand[1],{hx:0,hy:-68,tor:6,curl:0,hd:-4,fF:[10,0],fB:[-22,0],hN:['r',10,44],hF:['r',4,44]},'io');
// ---- climbs out onto the parapet ----
K(33.05,{hx:12,hy:-64,tor:16,hd:-14,hN:['a',74,-101],hF:['a',66,-101]},'io');      // hands on the rim
K(33.45,{fF:[52,-44]},'io');                                                         // a foot up into the wall
K(33.95,{hx:42,hy:-104,tor:32,curl:.22,hd:6,fB:[28,-40]},'io');                      // pushes up
K(34.35,{hx:70,hy:-130,tor:36,fF:[88,-104],fB:[50,-46],hN:['a',92,-120],hF:['a',86,-117]},'io');                       // a knee onto the rim
K(T.climb[1],{hx:94,hy:-190,tor:9,curl:0,hd:-6,fF:[117,gyr(117)],fB:[75,gyr(75)],hN:['r',8,44],hF:['r',2,44]},'io'); // stands on the rim
K(T.walk+.5,{});   // (the walk takes over his legs here; the ending keys continue after walkState below)
// key lookup
function keySeg(t){ let i=0; if(t<=KEYS[0].t) return [KEYS[0],KEYS[0],0]; while(i<KEYS.length-1&&t>=KEYS[i+1].t) i++; if(i>=KEYS.length-1) return [KEYS[i],KEYS[i],0];
  const a=KEYS[i],b=KEYS[i+1]; const u=(t-a.t)/(b.t-a.t); return [a,b,(EASE[b.e]||sm)(u),u]; }

// ---- the pick lying in the trench (from the physics pass), so his hands find it ----
let PICK_REST=null; // {g:[x,y],h:[x,y]} grip and head, relative to (TX,FL)
function resolveHand(spec,sh,hip){
  if(spec[0]==='r') return [sh[0]+spec[1],sh[1]+spec[2]];
  if(spec[0]==='k'){ const pr=PICK_REST||{g:[10,-3],h:[80,-3]}; const g=pr.g, h=pr.h; const u=spec[1]; return [TX+lerp(g[0],h[0],u)+0, FL+lerp(g[1],h[1],u)-3]; }
  return [TX+spec[1],FL+spec[2]];
}
function shoulderOf(hx,hy,tor){ return [hx+Math.sin(tor*D)*L.torso, hy-Math.cos(tor*D)*L.torso]; }
function pickHands(ph,pa,sh){ const head=resolveHand(ph,sh); const d=[Math.cos(pa*D),Math.sin(pa*D)]; const rear=[head[0]-PL*d[0],head[1]-PL*d[1]]; return {head,rear,lead:[rear[0]+HS*d[0],rear[1]+HS*d[1]],ang:pa}; }
// breathing
const breathPeriod=crv([[-3,2.2],[1.05,2.2],[1.4,1.25],[4.9,1.55],[5.3,.95],[10,1.1],[15.5,1.2],[17.6,1.6],[19.5,3.6],[30,3.8],[50,4.2]]);
const DT=1/480; const BPH=[]; {let ph=0; for(let t=-3;t<=T.END+2;t+=DT){BPH.push(ph); ph+=2*Math.PI*DT/breathPeriod(t);}}
const breathPh=t=>BPH[clamp(Math.round((t+3)/DT),0,BPH.length-1)];
const breathAmp=crv([[-3,2.4],[1.05,2.4],[1.4,4.4],[4.9,3.2],[5.3,5],[10,3.8],[15.5,4.2],[17.6,2.6],[19.5,1.6],[30,1.2],[50,1.0]]);

function figureState(t){
  const [a,b,w,uRaw]=keySeg(t);
  const pa_=a.p, pb=b.p;
  const n=k=>lerp(pa_[k],pb[k],w);
  let hx=TX+n('hx'), hy=FL+n('hy'), tor=n('tor'), curl=n('curl'), tw=n('tw');
  // the head follows a beat behind the body (overlapping action)
  const [ha,hb,hw]=keySeg(t-.07); let hd=lerp(ha.p.hd,hb.p.hd,hw);
  // feet: planted; when a foot moves it lifts and lands (no sliding)
  const foot=k=>{ const A=pa_[k],B=pb[k]; const d=Math.hypot(B[0]-A[0],B[1]-A[1]); const lift=d>3?Math.min(14,d*.45)*Math.sin(Math.PI*clamp(w)):0; return [TX+lerp(A[0],B[0],w),FL+lerp(A[1],B[1],w)-lift]; };
  let fF=foot('fF'), fB=foot('fB');
  // breathing and shivering on top of the acting
  const bph=breathPh(t), ba=breathAmp(t), sv=shiverA(t);
  const rq=1-reliefQ(t); tor+=Math.sin(bph)*ba*.55*rq; hd-=Math.sin(bph)*ba*.25*rq;
  const shv=k=>sv*(Math.sin(t*71+k*1.7)*.55+Math.sin(t*97+k*2.9)*.35+Math.sin(t*53+k)*.25);
  tor+=shv(1)*2.2; hd+=shv(2)*3.2; hx+=shv(3)*1.1; hy+=shv(4)*.6;
  const sh=shoulderOf(hx,hy,tor);
  // hands
  let hN,hF,pick=null;
  const handsOf=(p)=>{ if(p.ph){ const q=pickHands(p.ph,p.pa,sh); return [q.lead,q.rear,q]; } const n=resolveHand(p.hN,sh); const f=p.hF[0]==='g'?[n[0]+Math.cos(p.sa*D)*p.hF[1],n[1]+Math.sin(p.sa*D)*p.hF[1]]:resolveHand(p.hF,sh); return [n,f,null]; };   // 'g': on the sword's grip, beside the near hand
  const [aN,aF,aq]=handsOf(pa_), [bN,bF,bq]=handsOf(pb);
  if(aq&&bq){ // swing the pick on an arc around the shoulder
    const ra=[aq.head[0]-sh[0],aq.head[1]-sh[1]], rb=[bq.head[0]-sh[0],bq.head[1]-sh[1]];
    const la=Math.hypot(...ra), lb=Math.hypot(...rb); let ta=Math.atan2(ra[1],ra[0]), tb=Math.atan2(rb[1],rb[0]); let dth=tb-ta; while(dth>Math.PI) dth-=2*Math.PI; while(dth<-Math.PI) dth+=2*Math.PI; if(b.sw>0&&dth<0) dth+=2*Math.PI; if(b.sw<0&&dth>0) dth-=2*Math.PI;
    const th=ta+dth*w, lr=lerp(la,lb,w); const head=[sh[0]+Math.cos(th)*lr, sh[1]+Math.sin(th)*lr];
    let dpa=bq.ang-aq.ang; while(dpa>180) dpa-=360; while(dpa<-180) dpa+=360; if(b.sw>0&&dpa<0) dpa+=360; if(b.sw<0&&dpa>0) dpa-=360; const ang=aq.ang+dpa*w;
    const q=pickHands(['a',head[0]-TX,head[1]-FL],ang,sh); hN=q.lead; hF=q.rear; pick=q;
  } else { hN=[lerp(aN[0],bN[0],w),lerp(aN[1],bN[1],w)]; hF=[lerp(aF[0],bF[0],w),lerp(aF[1],bF[1],w)]; }
  // numb arm: the hands shake hard in the cold
  const hs2=sv*1.6; hN=[hN[0]+shv(5)*hs2,hN[1]+shv(6)*hs2]; hF=[hF[0]+shv(7)*hs2,hF[1]+shv(8)*hs2];
  // the strain of holding the pick with frozen arms: a big, slow tremor
  const ls=ss(T.grab+.05,T.lift[1],t)*(1-ss(T.slip,T.slip+.08,t)); if(ls>0){ const a=ls*4.2; hN=[hN[0]+Math.sin(t*47)*a*.5,hN[1]+Math.sin(t*59+1)*a]; hF=[hF[0]+Math.sin(t*43+2)*a*.5,hF[1]+Math.sin(t*61)*a]; }
  if(pick){ pick=pickHands(['a',pick.head[0]-TX+shv(5)*hs2,pick.head[1]-FL+shv(6)*hs2],pick.ang,sh); hN=pick.lead; hF=pick.rear; }
  // walking off at the very end (planted steps on the uneven ground)
  let walk=null; if(t>T.walk&&t<T.arr+.5){ walk=walkState(t); }
  return {t,hx,hy,tor,curl,hd,tw,fF,fB,hN,hF,pick,bph,ba,sv,walk,sh0:sh,sa:n('sa')};
}
// ---- the ending: five slow steps up the rise toward the sun ----
// Real gait: each foot is planted while the hip vaults over it (inverted pendulum), swings 40% of the cycle, lands on the slope.
const WSTEP=56, WS0=.95, WX0=TX+94, WD=224;      // starts and ends in double support, near foot in front
const WV=t=>ss(T.walk,T.walk+.55,t)*(1-ss(T.arr-.8,T.arr,t));
const WDIST=[]; let WVMAX=1; { let d=0; const raw=[]; for(let t=T.walk;t<=T.END+2;t+=DT){raw.push(d); d+=WV(t)*DT;} const k=WD/raw[Math.round((T.arr-T.walk)/DT)]; for(const v of raw) WDIST.push(Math.min(WD,v*k)); WVMAX=k; }
const walkD=t=>t<=T.walk?0:WDIST[clamp(Math.round((t-T.walk)/DT),0,WDIST.length-1)];
const walkSp=t=>clamp(WV(t));   // 0..1 of his cruising speed
const walkW=t=>ss(T.walk,T.walk+.5,t)*(1-ss(T.arr,T.arr+.2,t));
const reliefQ=t=>ss(T.arr-.3,T.arr,t)*(1-ss(T.exhale[1],T.exhale[1]+.8,t));   // his own breathing yields to the big keyed breaths
function walkState(t){
  const d=walkD(t), s=WS0+d/(2*WSTEP);
  const plant=(n,i)=>WX0+(n+.2+.5*i-WS0)*2*WSTEP+2;
  const feet=[0,1].map(i=>{ const u=s+.1-.5*i, n=Math.floor(u), f=u-n;
    if(f<.6) return {x:plant(n,i),lift:0}; const q=(f-.6)/.4, e=eio(q); return {x:lerp(plant(n,i),plant(n+1,i),e),lift:Math.sin(Math.PI*q)*9}; });
  return {d,s,x:WX0+d,feet};
}
const walkHip=wk=>{ const R=L.th+L.sh-3; const fw=wk.feet.map(f=>[f.x,groundY(f.x)-f.lift]); let hy=1e9; for(const f of fw){ const dx=wk.x-f[0]; hy=Math.min(hy,f[1]-Math.sqrt(Math.max(0,R*R-dx*dx))); } return {hy,fw}; };
// ---- where the walk ends: his sword, drawn and driven into the earth; then he stands tall and breathes out ----
const SWPL={};   // where the blade goes in
{ const wk=walkState(T.arr+.1), {hy,fw}=walkHip(wk); const hx=wk.x-TX, hyr=hy-FL; const fn=fw[0][0]-TX, ff=fw[1][0]-TX, gA=gyr(hx);
  const xs=hx+46, ys=gyr(xs)+16-SWB; SWPL.x=TX+xs; SWPL.g=[TX+xs,FL+ys];
  K(T.arr,{hx,hy:hyr,tor:8,curl:0,hd:-12,fF:[fn,gyr(fn)],fB:[ff,gyr(ff)],hN:['r',4,47],hF:['r',0,47]},'io');               // arrives: his sword lies at his feet
  K(T.grab2,{hx:hx+4,hy:gA-30,tor:82,curl:.36,hd:14,hN:['a',SW0[0]-TX,SW0[1]-FL],hF:['r',8,40]},'io');                    // squats and takes it by the hilt
  K(T.grab2+.07,{hy:gA-29});
  K(T.lift2,{hx:hx+2,hy:hyr-1,tor:6,curl:0,hd:-4,hN:['r',20,-6],hF:['r',12,30]},'io');                                    // stands: it swings up off the ground and hangs from his hand
  K(T.hold2,{hF:['r',20,6],hd:-6},'io');                                                                                   // the other hand takes the scabbard
  K(T.drawEnd,{hy:hyr-4,tor:-4,curl:-.12,hd:-14,hN:['r',16,-50],hF:['r',-6,38],sa:104},'io');                               // draws it up out of the scabbard toward the sky
  K(T.top,{hy:hyr-7,tor:-13,curl:-.28,hd:-17,hN:['r',27,-43],hF:['g',-7],sa:60},'io');                                       // both hands overhead, point down: the coil
  K(T.top+.09,{hy:hyr-5,tor:-14,hd:-12});
  K(T.plant,{hx:hx+4,hy:gA-50,tor:36,curl:.42,hd:30,hN:['a',xs,ys],hF:['g',-7],sa:90},'ii');                              // drives it into the earth with his whole weight
  K(T.plant+.1,{hy:gA-47,tor:40,curl:.46,hd:38},'o');                                                                       // the jolt runs through him
  K(T.bow,{hy:gA-49,tor:38,curl:.44,hd:42,hN:['a',xs,ys-SWP],hF:['a',xs-1,ys-SWP-3]},'io');                                // head bowed over the hilt
  K(T.risen,{hx:hx+2,hy:hyr-2,tor:2,curl:-.12,hd:-16,hN:['r',8,45],hF:['r',2,46]},'io');                                    // rises tall beside it, chest open to the morning
  K(T.exhale[0],{hy:hyr-2.5,hd:-18});
  K(T.exhale[1],{hy:hyr+1,tor:10,curl:.1,hd:-4},'so');                                                                     // and breathes out
  K(T.END+3,{hy:hyr+1.5});
}
// ---- IK ----
function ik2(sx,sy,tx,ty,l1,l2,bend){
  let dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy)||1e-3; const dd=Math.min(d,l1+l2-0.01);
  const a=Math.acos(clamp((l1*l1+dd*dd-l2*l2)/(2*l1*dd),-1,1)); const base=Math.atan2(dy,dx)+bend*a;
  return [[sx+Math.cos(base)*l1, sy+Math.sin(base)*l1],[sx+dx/d*dd, sy+dy/d*dd]];
}
function skeleton(s){
  let hip=[s.hx,s.hy], tor=s.tor, fF=s.fF, fB=s.fB;
  if(s.walk){ const w=walkW(s.t); const wk=s.walk; const {hy,fw}=walkHip(wk); const sp=walkSp(s.t);
    hip=[lerp(hip[0],wk.x,w),lerp(hip[1],hy,w)]; fF=[lerp(fF[0],fw[0][0],w),lerp(fF[1],fw[0][1],w)]; fB=[lerp(fB[0],fw[1][0],w),lerp(fB[1],fw[1][1],w)];
    tor=lerp(tor,tor+4*sp+Math.sin(4*Math.PI*wk.s+.6)*1.3*sp,w); }   // leans into the slope, a small bob with each step
  const ux=Math.sin(tor*D), uy=-Math.cos(tor*D);
  let sh=[hip[0]+ux*L.torso, hip[1]+uy*L.torso];
  const ha=(tor+s.hd)*D; let head=[sh[0]+Math.sin(ha)*(L.neck+L.hr), sh[1]-Math.cos(ha)*(L.neck+L.hr)];
  const legs=[fF,fB].map(f=>{ const [k,ff]=ik2(hip[0],hip[1],f[0],f[1],L.th,L.sh,-1); return {k,f:ff}; });
  let hT=[s.hN,s.hF];
  if(s.walk){ const w=walkW(s.t), sp=walkSp(s.t); const ph=2*Math.PI*s.walk.s-.4*Math.PI; // arms swing against his legs, relaxed
    hT=hT.map((h,i)=>{ const rel=[h[0]-s.sh0[0],h[1]-s.sh0[1]]; const sw=[(i?-1:1)*Math.sin(ph)*13*sp+(i?0:4), 47-Math.abs(Math.cos(ph))*2*sp]; return [sh[0]+lerp(rel[0],sw[0],w), sh[1]+lerp(rel[1],sw[1],w)]; }); }
  const arms=hT.map(h=>{ const [e,hh]=ik2(sh[0],sh[1],h[0],h[1],L.ua,L.fa,1); return {e,h:hh}; });
  // the twist: his upper body turns round to look behind him
  const m=Math.cos(Math.PI*clamp(s.tw));
  if(m<.999){ const X=p=>[hip[0]+(p[0]-hip[0])*m,p[1]]; sh=X(sh); head=X(head); for(const a of arms){a.e=X(a.e); a.h=X(a.h);} }
  const toes=legs.map(l=>{ const dx=l.f[0]-l.k[0], dy=l.f[1]-l.k[1], d=Math.hypot(dx,dy)||1; let tx=dy/d, ty=-dx/d; return [l.f[0]+tx*L.ft, Math.min(l.f[1]+ty*L.ft, l.f[1]+4)]; });
  // the torso bends: curl > 0 hunches the back
  const nx=uy, ny=-ux; const mid=[(hip[0]+sh[0])/2+nx*s.curl*13*m, (hip[1]+sh[1])/2+ny*s.curl*13];
  return {hip,sh,head,legs,arms,toes,mid,ux,uy,m,pick:s.pick};
}
