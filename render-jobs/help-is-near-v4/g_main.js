// ===================== camera feel, frame assembly, loop, sound events =====================
function camFinal(t){
  const c=simAt(SIM.cam,t); let ox=0,oy=0,rot=0,zk=0;
  const struggle=1-answerW(t);
  // a barely-there handheld breath in the struggle; dead still at sujood; steady after the answer
  const h=struggle*(1-ss(T.sujood[0],T.sujood[1],t)*.85);
  ox+=(Math.sin(t*.53)*2.4+Math.sin(t*1.31+1)*1.1)*h; oy+=(Math.sin(t*.41+2)*2.0+Math.sin(t*1.07)*.9)*h; rot+=(Math.sin(t*.37)*.1+Math.sin(t*.9)*.05)*h;
  // the camera feels his body: hard drops that do not bounce back
  const drop=(t0,A,dec)=>{const u=t-t0; return u>0?A*(1-Math.exp(-u*32))*Math.exp(-u*dec):0;};
  oy+=drop(T.imp0,5,3)+drop(T.imp2,3.5,3)+drop(T.b1,38,1.1)+drop(T.wall1,10,2.4)+drop(T.knee1,9,2)+drop(T.b2,66,.95)+drop(T.sit2,26,1.5)+drop(SLAB_LAND,9,2.4)+drop(T.kneel[1],11,1.7)+drop(T.plant,15,2.1);
  oy+=(7*ss(T.b1,T.b1+.4,t)+12*ss(T.b2,T.b2+.4,t))*(1-ss(T.sujood[0],T.beats[0],t));   // the frame sinks a little lower with each blow
  // shaken: the world tilts, then slowly rights itself
  { const u=t-T.b2; if(u>0){ rot+=3.2*(1-Math.exp(-u*14))*Math.exp(-u*.5); zk+=.03*Math.sin(u*9)*Math.exp(-u*4); } }
  { const u=t-T.b1; if(u>0) rot+=-1.2*(1-Math.exp(-u*14))*Math.exp(-u*1.1); }
  { const u=t-T.plant; if(u>0) zk+=.022*Math.exp(-u*4.5)*(1-Math.exp(-u*40)); }   // the blow lands: the frame punches in a touch
  { const u=t-T.tear; if(u>0) oy+=6*(1-Math.exp(-u*30))*Math.exp(-u*2); }
  // relief: the camera lifts and floats
  const fl=ss(27.6,31,t)*(1-ss(T.glide[0]-.2,T.glide[1],t)); oy-=10*fl; ox+=Math.sin(t*.21)*3*fl; oy+=Math.sin(t*.27+1)*2.4*fl;
  return {x:c[0]+ox/c[2], y:c[1]+oy/c[2], z:c[2]*(1+zk), rot:rot*D};
}
const bl=document.createElement('canvas'); bl.width=270; bl.height=480; const blx=bl.getContext('2d');
function bloomPass(t){ blx.filter='blur(5px)'; blx.clearRect(0,0,270,480); blx.drawImage(cv,0,0,270,480); blx.filter='none';
  ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=.2+.12*dawn(t)+.06*answerW(t)+.07*flood(t); ctx.drawImage(bl,0,0,W,H); ctx.restore(); }
function vignette(t,k){
  // tunnel vision when fear peaks: the frame closes in around him
  const tv=tunnel(t); const [hx,hy]=toS(k.head[0],k.head[1]+30); const cx=lerp(540,hx,.6*tv), cy=lerp(900,hy,.5*tv);
  const r0=lerp(520,190,tv), r1=lerp(1250,780,tv); const a=lerp(.5,.86,tv)*(1-.35*dawn(t));
  const vg=ctx.createRadialGradient(cx,cy,r0,cx,cy,r1); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,`rgba(2,3,8,${a})`); ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
}
function bgBlur(t){ return 1.2+1.4*ss(1,2,t)*(1-answerW(t))*(1-ss(9.2,9.8,t)*(1-ss(10.6,11.4,t)))-.9*dawn(t); }
const lcv=document.createElement('canvas'); lcv.width=W; lcv.height=H; const lctx=lcv.getContext('2d');
function draw(tr){
  const w=XF>0?ss(REAL_END-XF,REAL_END,tr):0;
  if(w>0){ drawFrame(tr-REAL_END); lctx.clearRect(0,0,W,H); lctx.drawImage(cv,0,0); drawFrame(tr); ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=w; ctx.globalCompositeOperation='source-over'; ctx.filter='none'; ctx.drawImage(lcv,0,0); ctx.restore(); return; }
  drawFrame(tr);
}
function drawFrame(tr){
  const t=tauAt(tr); cam=camFinal(t);
  ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; ctx.filter='none';
  ctx.fillStyle='#05070c'; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.translate(540,960); ctx.rotate(cam.rot); ctx.translate(-540,-960);
  const bb=Math.max(0,bgBlur(t));
  drawSky(t);
  drawLayer(LAY.L1,t,bb*1.4); drawSmokeEmbers(t,'L1'); drawFires(t,'L1');
  drawLayer(LAY.L3,t,bb); drawSmokeEmbers(t,'L3'); drawFires(t,'L3');
  drawLayer(LAY.L2,t,bb*.7); drawSmokeEmbers(t,'L2'); drawFires(t,'L2');
  const s=figureState(t), k=skeleton(s);
  drawBackWall(t);
  drawCloak(t,false);
  drawSwordBack(t);
  drawShadow(k,t);
  drawFigure(k,s,t);
  drawFrost(k,t);
  drawCloak(t,true);
  drawPick(t);
  drawSword(t);
  drawHeart(k,t);
  drawSlab(t);
  drawArrows(t);
  drawFrontEarth(t);
  drawClods(t); drawDust(t);
  drawArrowFire(t);
  drawPlantFX(t);
  drawBreath(t);
  drawWind(t);
  drawMotes(t);
  ctx.restore();
  drawFG(t);
  bloomPass(t);
  vignette(t,k);
  drawText(t);
  const wm=ss(T.held[0]+1,T.held[0]+2,t)*(1-ss(T.held[1]-.5,T.held[1]+.5,t)); if(wm>0){ ctx.save(); ctx.font='28px Corm'; ctx.letterSpacing='10px'; ctx.textAlign='center'; ctx.fillStyle=`rgba(245,232,210,${.5*wm})`; ctx.fillText('AYAH STUDIO',505,1400); ctx.restore(); }
  if(window.SAFE){ ctx.save(); ctx.strokeStyle='rgba(255,0,0,.8)'; ctx.lineWidth=3; ctx.strokeRect(0,270,940,980); ctx.restore(); }
}
// ---------------- sound events (story time -> real time) ----------------
function events(){
  const ev=[]; const E=(t,type,o={})=>ev.push({t,type,...o});
  const panAt=(t,wx,wy,p=1)=>{ const c=camFinal(t); const z=1+(c.z-1)*p; const sx=540+(wx-c.x*p-(1-p)*540)*z; return clamp((sx-540)/620,-1,1); };
  E(-1.55,'lever'); E(T.imp0,'bite',{big:1}); E(.9,'lever'); E(T.imp2,'bite',{big:0});
  for(const c of CLODS) if(c.land) E(c.land.t,'clod',{s:c.r,pan:panAt(c.land.t,c.land.x,c.land.y)});
  E(T.b1,'gust1'); E(T.wall1,'wallhit'); E(T.knee1,'knee'); E(T.knee1-.25,'slide',{d:.3});
  E(T.up1[0]+.35,'strain',{d:.9}); E(3.3,'rustle',{d:.6});
  E(T.b2-.7,'hooves',{d:4.6}); E(T.b2,'crack'); E(SLAB_LAND,'slabland'); E(T.b2+.02,'rustle',{d:.5}); E(T.sit2,'sitthud',{big:1});
  for(const e of EV) if(e.type==='pickland'&&e.t>T.b2) E(e.t,'pickland',{v:e.v,head:e.head,pan:panAt(e.t,TX+20,FL)});
  { const seen=new Set(); for(const e of EV) if(e.type==='scabland'){ const k=Math.round(e.t*50); if(seen.has(k)) continue; seen.add(k); E(e.t,'scabland',{v:e.v,pan:panAt(e.t,e.x,G)}); } }
  // fire arrows: each one hisses in, bites the earth, burns, is snuffed by the gale and torn out
  E(9.2,'volley',{d:1.3});
  for(const a of ARROWS){ const pl=panAt(a.tl,a.x,a.y); E(a.tl-.34,'arrowby',{pan:clamp(pl+.35,-1,1),pan2:pl,s:a.s}); E(a.tl,'arrowhit',{pan:pl,q:a.qf});
    E(a.out,'arrowsnuff',{pan:panAt(a.out,a.x,a.y)}); E(a.rip,'arrowrip',{pan:panAt(a.rip,a.x,a.y)}); }
  E(T.b2+.05,'ignite',{d:1.6,pan:.2}); E(T.b2+.7,'ignite',{d:1.0,pan:.55}); E(T.whirl[0]+.2,'ignite',{d:.9,pan:-.6});
  T.looks.forEach(x=>E(x-.08,'rustle',{d:.25,g:.5})); E(T.whirl[0],'rustle',{d:.35}); E(T.whirlBack[0],'rustle',{d:.35});
  E(7.9,'scrape',{d:1.2}); E(8.1,'strain',{d:1.0});
  E(T.grab-.05,'grab'); E(T.lift[0],'strain',{d:.5,g:.6});
  E(12.5,'blow',{d:.45}); E(13.15,'blow',{d:.35,g:.6}); E(13.0,'rustle',{d:.4});
  E(13.6,'cloth',{d:.6}); E(T.wrap[1]-.2,'cloth',{d:.5}); E(T.tear,'tear'); E(T.kneel[1],'knee',{g:.8});
  E(T.look[0]+.2,'rustle',{d:.8,g:.4}); E(17.9,'hands'); E(T.sujood[0]+.1,'rustle',{d:1.0,g:.5}); E(T.sujood[1]-.05,'forehead');
  T.beats.forEach(b=>E(b,'beat'));
  E(T.gale,'gale');
  for(const f of FIRES){ const ps=panAt(f.out,f.x,f.y,f.p); E(f.out,'snuff',{p:f.p,s:f.size,pan:ps}); if(f.tent) E(f.out+f.tdel+.05,'tent',{p:f.p,pan:ps}); }
  E(T.gpass-.3,'gpass',{d:1.4});
  E(T.rise[0],'rustle',{d:1.0,g:.5}); E(T.melt[0],'melt',{d:3.4}); E(T.chest[0]+.3,'cloth',{d:.5,g:.5});
  E(31.4,'rustle',{d:.8,g:.6}); E(31.9,'step',{g:.6}); E(T.stand[1]-.05,'step',{g:.5});
  E(33.05,'hands'); E(33.45,'scrape',{d:.4,g:.7}); E(33.7,'strain',{d:.7,g:.6}); E(34.0,'crumble'); E(34.35,'knee',{g:.6}); E(T.climb[1]-.3,'step',{g:.8}); E(T.climb[1]-.05,'step',{g:.6}); E(T.arr+.1,'cloth',{d:.4,g:.4});
  E(T.breeze,'breeze');
  // the sword: he takes it up, draws it, raises it and drives it into the earth; the land answers
  E(T.grab2,'grab'); E(T.grab2+.05,'leather',{d:.3}); E(T.lift2-.12,'swish',{d:.3,g:.5,pan:.1}); E(T.hold2-.02,'leather',{d:.18,g:.7});
  E(T.hold2+.01,'draw',{d:Math.max(.12,(SWEV.clear||T.drawEnd)-T.hold2)}); E(SWEV.clear||T.drawEnd,'clear');
  E(T.drawEnd-.12,'inhale',{amp:3.2,per:.9,force:1}); E(T.top+.06,'swish',{d:.2,g:1.3,pan:.1}); E(T.plant,'plant'); E(T.plant+.02,'knee',{g:1.1});
  E(T.plant+.03,'swell',{d:3.4}); BIRDS.forEach((b,i)=>E(b.t0,'wings',{d:1.4,pan:clamp(.3+i*.08,-1,1),g:.6+.08*i}));
  E(T.bow+.05,'exhale',{amp:2.0,per:1.4,force:1}); E(T.risen-.3,'inhale',{amp:2.6,per:1.6,force:1}); E(T.exhale[0]+.05,'exhale',{amp:3.0,per:2.2,force:1}); E(T.risen-.4,'cloth',{d:.5,g:.6});
  // footsteps as he walks up the rise
  let prev=null; for(let t=T.walk;t<-1;t+=1/240){ const w=walkState(t); const pl=w.feet.map(f=>f.lift===0); if(prev) pl.forEach((p,i)=>{ if(p&&!prev[i]) E(t,'step',{g:.55,pan:panAt(t,w.x,G)}); }); prev=pl; }
  // breaths: inhale at the trough, exhale at the crest
  let pk=null; for(let t=-2.5;t<T.END;t+=1/240){ const ph=breathPh(t); const k=Math.floor(ph/Math.PI); if(pk!==null&&k!==pk&&reliefQ(t)<.5&&!(t>T.grab2-.2&&t<T.exhale[1]+.3)) E(t,k%2===0?'inhale':'exhale',{amp:breathAmp(t),per:breathPeriod(t)}); pk=k; }
  return ev.filter(e=>e.t>-XF-.6).map(e=>({...e,t:realOf(e.t),st:e.t}));
}
function curves(){ // per 1/100 s: wind near him, gale, global wind, shelter, dawn (for the sound beds)
  const o=[]; for(let t=-3;t<=T.END+.5;t+=.01){ const s=figureState(t); o.push([realOf(t),+windS(t).toFixed(3),+galeA(t).toFixed(3),+windG(t).toFixed(3),+windAt(TX,t).toFixed(3),+dawn(t).toFixed(3),+breeze(t).toFixed(3),+heartUp(t).toFixed(3),+litFrac(t).toFixed(3),s.hy>G+40?1:0,+heartRate(t).toFixed(3),+shiverA(t).toFixed(3),+frost(t).toFixed(3),+t.toFixed(3),+fr(heartPh(t)).toFixed(4),+arrowHeat(t).toFixed(3)]); } return o; }
// how much arrow fire is burning close to the camera (for the crackle bed)
function arrowHeat(t){ const c=camFinal(t); let h=0; for(const a of ARROWS){ if(t<a.tl) continue; const I=Math.min(1.4,arFire(a,t)); if(I<=0) continue; const sx=(a.x-c.x)*c.z; h+=I*Math.exp(-Math.pow(sx/700,2))*(.4+.6*clamp(c.z/2.4)); } return h; }
window.draw=draw; window.events=events; window.curves=curves; window.REAL_END=()=>REAL_END; window.T=T;
window.probe=(t)=>{ const s=figureState(t), k=skeleton(s); return {k,s:{hx:s.hx,hy:s.hy,tor:s.tor}}; };
window.ready=(async()=>{ await document.fonts.load('100px AmiriQ'); await document.fonts.load('italic 52px CormI'); await document.fonts.load('30px Corm');
  // the pick tumbles into the trench (physics), then his hands know where it lies
  addClods(T.imp0,TX+66,FL-6,16,1,11); addClods(T.imp2,TX+62,FL-6,8,.8,12); addClods(SLAB_LAND,TX+30,FL-8,10,.45,13); addClods(-2.2,TX+66,FL-6,6,.6,14);
  simulate(false); simulate(true);
  for(const ph of PH) prepPhrase(ph);
  return true; })();
