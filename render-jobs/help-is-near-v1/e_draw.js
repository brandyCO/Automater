// ===================== drawing =====================
let cam={x:560,y:1331,z:2.5,rot:0};
const zOf=p=>1+(cam.z-1)*p;
const toS=(wx,wy,p=1)=>{const z=zOf(p); return [540+(wx-cam.x*p-(1-p)*540)*z, 960+(wy-cam.y*p-(1-p)*1100)*z];};
const worldT=()=>{ctx.translate(540,960); ctx.scale(cam.z,cam.z); ctx.translate(-cam.x,-cam.y);};
// the earth trembling with ten thousand hooves (only the near ground; the far hills never move)
const quake=t=>{ const u=t-T.b2; if(u<-.25||u>5) return 0; const pre=u<0?ss(-.25,0,u)*.5:1;
  return pre*(3.2*Math.sin(u*63)*Math.exp(-Math.max(0,u)*2.4)+.9*Math.sin(u*41+1)*(1-ss(2.5,4.8,u)))*(u<0?.35:1); };
function fireI(f,t){ if(t<f.ign) return 0; const on=ss(f.ign,f.ign+.32,t)*(1+.7*Math.exp(-Math.max(0,t-f.ign-.1)*5)); return on*(1-ss(f.out,f.out+.2,t)); }
function litFrac(t,lay){ let n=0,s=0; for(const f of FIRES){ if(lay&&f.lay!==lay) continue; n++; s+=Math.min(1,fireI(f,t)); } return s/Math.max(1,n); }
const clearSky=t=>ss(25.5,28.5,t);

// ---------------- sky ----------------
function skyCols(t){ const pd=preDawn(t), dn=dawn(t);
  return {top:mixc(mixc(hex('#070a14'),hex('#0e1c3c'),pd),hex('#183358'),dn), mid:mixc(mixc(hex('#111a2e'),hex('#22365e'),pd),hex('#5a7a98'),dn), hor:mixc(mixc(hex('#28324c'),hex('#465a82'),pd),hex('#ffbe84'),dn)}; }
function drawSky(t){
  const dn=dawn(t); const lit=litFrac(t,'L1'); const S=skyCols(t);
  const [,hy]=toS(0,1010,.22);
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,rgba(S.top)); g.addColorStop(clamp(hy/H-.25,.05,.9),rgba(S.mid)); g.addColorStop(clamp(hy/H,.1,.98),rgba(S.hor)); g.addColorStop(1,rgba(mixc(S.hor,[10,8,12],.5)));
  ctx.fillStyle=g; ctx.fillRect(-60,-60,W+120,H+120);
  // the glow of ten thousand fires on the night sky
  if(lit>.002){ ctx.save(); ctx.globalCompositeOperation='lighter'; const gg=ctx.createLinearGradient(0,hy-520,0,hy+60); gg.addColorStop(0,'rgba(255,90,40,0)'); gg.addColorStop(.65,`rgba(255,92,42,${.14*lit})`); gg.addColorStop(1,`rgba(255,118,58,${.3*lit})`); ctx.fillStyle=gg; ctx.fillRect(-60,hy-520,W+120,H); ctx.restore(); }
  // stars: clearer once the gale has swept the sky, gone with the dawn
  const sa=(.55+.75*clearSky(t))*(1-ss(31,38,t))*(1-.6*lit);
  if(sa>.01) for(const s of STARS){ const a=sa*(.35+.35*Math.sin(t*1.3+s.p*3))*(.4+.6*s.b); if(a<=.01) continue; const [sx,sy]=toS(s.x*1.2+200,s.y+250,.03); ctx.fillStyle=`rgba(225,232,255,${a})`; ctx.beginPath(); ctx.arc(sx,sy,s.s*(.8+.5*clearSky(t)),0,7); ctx.fill(); }
  // dawn: soft rose and gold behind the right hills (no sun disc, no rays)
  if(dn>0){ ctx.save(); ctx.globalCompositeOperation='lighter';
    // the sun comes up behind the hills he looks at, slowly, all through the held frame
    const rise=ss(29,44,t); const [sx,sy]=toS(830,1004-40*rise-36*ss(36,46,t),.12);
    const rg=ctx.createRadialGradient(sx,sy,0,sx,sy,1250); rg.addColorStop(0,`rgba(255,226,170,${.62*dn})`); rg.addColorStop(.16,`rgba(255,184,120,${.26*dn})`); rg.addColorStop(.5,`rgba(255,150,110,${.07*dn})`); rg.addColorStop(1,'rgba(255,140,110,0)'); ctx.fillStyle=rg; ctx.fillRect(-60,-60,W+120,H+120);
    const sa=ss(.35,.9,dn); if(sa>0){ const r=52*zOf(.12); const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,r*2.6); sg.addColorStop(0,`rgba(255,250,236,${sa})`); sg.addColorStop(.36,`rgba(255,240,210,${.95*sa})`); sg.addColorStop(.42,`rgba(255,214,160,${.35*sa})`); sg.addColorStop(1,'rgba(255,190,130,0)'); ctx.fillStyle=sg; ctx.fillRect(sx-r*2.6,sy-r*2.6,r*5.2,r*5.2); }
    ctx.restore(); }
}
// ---------------- far layers ----------------
function drawLayer(Lr,t,blur){
  const dn=dawn(t), pd=preDawn(t); const S=skyCols(t); const lit=litFrac(t,'L1');
  let col=mixc(mixc(hex(Lr.c0),mixc(hex(Lr.c0),hex(Lr.c1),.25),pd),hex(Lr.c1),dn); col=mixc(col,S.hor,Lr.haze*(1-.75*dn));
  const z=zOf(Lr.p); const pts=[];
  for(let sx=-60;sx<=W+60;sx+=12){ const wx=(sx-540)/z+cam.x*Lr.p+(1-Lr.p)*540; const [,yy]=toS(wx,layTop(Lr,wx),Lr.p); pts.push([sx,yy]); }
  ctx.save(); if(blur>.2) ctx.filter=`blur(${blur.toFixed(1)}px)`;
  ctx.beginPath(); ctx.moveTo(-60,H+60); for(const p of pts) ctx.lineTo(p[0],p[1]); ctx.lineTo(W+60,H+60); ctx.closePath(); ctx.fillStyle=rgba(col); ctx.fill(); ctx.filter='none';
  // mist pooled at its foot (fire-tinted while the camps burn), so each range stands apart from the next
  ctx.clip(); const [,by]=toS(0,Lr.base,Lr.p); const mc=mixc(mixc(S.hor,[255,112,56],.45*lit),[255,206,190],dn*.6);
  const fg=ctx.createLinearGradient(0,by-70*z,0,by+190*z); fg.addColorStop(0,rgba(mc,0)); fg.addColorStop(1,rgba(mc,.2+.04*dn)); ctx.fillStyle=fg; ctx.fillRect(-60,by-70*z,W+120,H);
  ctx.restore();
  // ridge rim: moonlight, then the dawn
  ctx.strokeStyle=rgba(mixc([120,140,190],[255,200,160],dn),.1+.14*dn); ctx.lineWidth=1.4; ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
  // valley mist at dawn
  if(dn>.02){ const [,fy]=toS(0,Lr.base+30,Lr.p); const fg2=ctx.createLinearGradient(0,fy-120,0,fy+60); const fc=[255,206,190]; const drift=(.13+.05*Math.sin(t*.3+Lr.seed))*dn;
    fg2.addColorStop(0,rgba(fc,0)); fg2.addColorStop(.65,rgba(fc,drift)); fg2.addColorStop(1,rgba(fc,0)); ctx.fillStyle=fg2; ctx.fillRect(-60,fy-120,W+120,180); }
}
// ---------------- the fires, tents, smoke ----------------
function drawFires(t,lay){
  const dn=dawn(t); const z=zOf(LAY[lay].p);
  ctx.save();
  for(const f of FIRES){ if(f.lay!==lay) continue; const [sx,sy]=toS(f.x,f.y,f.p); if(sx<-80||sx>W+80) continue;
    const I=fireI(f,t), s=f.size*z;
    const wl=windAt(f.x,t), app=ss(f.out-.55,f.out,t)*(t<f.out+.25?1:0);
    // tent (lit by its fire), torn loose by the gale
    if(f.tent){ const tau=t-(f.out+f.tdel); const ta=tau>0?1-ss(.35,1.5,tau):1; if(ta>.01){
      let dx=f.tside*8*s, dy=0, rot=0; if(tau>0){ dx+=-(tau*tau*190+tau*70)*z; dy=(-Math.sin(Math.min(tau,1.2)*2.8)*26+tau*tau*14)*z; rot=-tau*6.5; }
      ctx.save(); ctx.translate(sx+dx,sy+dy); ctx.rotate(rot); ctx.globalAlpha=ta; const tw=9*s, th=7.5*s;
      ctx.fillStyle=rgba(mixc([24,20,22],[70,62,70],dn)); ctx.beginPath(); ctx.moveTo(-tw/2,0); ctx.lineTo(0,-th); ctx.lineTo(tw/2,0); ctx.closePath(); ctx.fill();
      if(I>0){ ctx.fillStyle=`rgba(255,140,70,${.55*Math.min(1,I)})`; ctx.beginPath(); ctx.moveTo(-f.tside*tw/2,0); ctx.lineTo(0,-th); ctx.lineTo(-f.tside*tw*.1,0); ctx.closePath(); ctx.fill(); }
      ctx.restore(); } }
    if(I<=.004) continue;
    const fl=.72+.28*fbm(t*6.5+f.seed,f.seed)+.1*Math.sin(t*21+f.seed*3);
    // the gale fans it flat, then it is gone
    const fan=1+1.3*app; const lean=clamp(wl*.32,0,1.2)+1.6*app;
    ctx.globalCompositeOperation='lighter';
    const gr=24*s*(.85+.18*fl)*(1+.4*app); ctx.globalAlpha=Math.min(1,.5*I); ctx.drawImage(GLOW,sx-gr-lean*gr*.25,sy-gr*.86,gr*2,gr*2);
    const fh=(5.5+4*f.size)*z*fl*Math.min(1.3,I)*fan*(1-.35*app), fw=fh*.36/fan;
    const tip=[sx-fh*lean*.9, sy-fh*(1-.55*clamp(lean/2))];
    ctx.globalAlpha=Math.min(1,I); ctx.fillStyle='rgba(255,128,48,.95)'; ctx.beginPath(); ctx.moveTo(sx-fw,sy); ctx.quadraticCurveTo(sx-fw*.9,sy-fh*.45,tip[0],tip[1]); ctx.quadraticCurveTo(sx+fw*1.1,sy-fh*.4,sx+fw,sy); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,226,150,.95)'; const c=.5; ctx.beginPath(); ctx.moveTo(sx-fw*c,sy); ctx.quadraticCurveTo(sx-fw*c,sy-fh*.3,lerp(sx,tip[0],.55),lerp(sy,tip[1],.55)); ctx.quadraticCurveTo(sx+fw*c,sy-fh*.25,sx+fw*c,sy); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
  }
  ctx.restore();
}
function drawSmokeEmbers(t,lay){
  const dn=dawn(t); const z=zOf(LAY[lay].p); const wnd=windG(t);
  ctx.save(); ctx.lineCap='round';
  for(const f of FIRES){ if(f.lay!==lay) continue; const a=t-f.out; if(a<0) continue; const [sx,sy]=toS(f.x,f.y,f.p); if(sx<-120||sx>W+160) continue;
    // embers stripped off by the gale
    if(a<.9){ ctx.globalCompositeOperation='lighter'; for(let k=0;k<4;k++){ const q=a/(.5+hs(f.seed+k,3)*.4); if(q>1) continue; const ex=sx-(q*q*90+q*30)*z*(1+hs(f.seed,k)), ey=sy-(Math.sin(q*3)*14+hs(f.seed+k,5)*10*q)*z; ctx.fillStyle=`rgba(255,${170+(k*20)},90,${(1-q)*.9})`; ctx.fillRect(ex,ey,1.6*z,1.6*z); } ctx.globalCompositeOperation='source-over'; }
    // a thread of smoke: dragged flat by the gale, then rising straight into the still dawn
    if(hs(f.seed,11)>.45) continue; const life=1-ss(7,15,a); if(life<=0) continue; const hgt=Math.min(1,a/5)*(60+50*hs(f.seed,2))*z; const bend=clamp(wnd*.45,0,1.4);
    ctx.beginPath(); const n=9; for(let k=0;k<=n;k++){ const u=k/n, h=u*hgt; const x=sx-bend*Math.pow(u,.7)*hgt*1.6+Math.sin(u*5+t*.9+f.seed)*(1.2+u*6)*z, y=sy-h*(1-bend*.55);
      k?ctx.lineTo(x,y):ctx.moveTo(x,y); }
    const col=mixc([70,74,86],[255,214,196],ss(.1,.9,dn+preDawn(t)*.3)); ctx.strokeStyle=rgba(col,(.13+.06*dn)*life*Math.min(1,a*1.5)); ctx.lineWidth=(.7+.7*f.size)*z*.7; ctx.stroke();
  }
  ctx.restore();
}
function drawCity(t){ const dn=dawn(t); const z=zOf(LAY.L3.p);
  for(const c of CITY){ const [sx,sy]=toS(c.x,c.y,LAY.L3.p); if(sx<-40||sx>W+40) continue; ctx.fillStyle=rgba(mixc([10,12,18],[64,60,78],dn)); ctx.fillRect(sx-c.w*z/2,sy-c.h*z,c.w*z,c.h*z);
    if(c.lit){ const a=(.55+.15*Math.sin(t*.7+c.s))*(1-ss(33,38,t)); ctx.fillStyle=`rgba(255,196,120,${a})`; ctx.fillRect(sx-1*z,sy-c.h*z*.6,1.6*z,1.4*z); } } }
// ---------------- the near ground and the trench ----------------
const STRATA=(()=>{const r=rng(31),o=[]; for(let i=0;i<46;i++) o.push({x:-300+r()*1600,y:G+14+r()*360,w:30+r()*140,a:.05+r()*.07}); return o;})();
const PEBS=(()=>{const r=rng(32),o=[]; for(let i=0;i<120;i++) o.push({x:-300+r()*1600,y:G+8+r()*380,r:1+r()*3.2,a:.1+r()*.16}); return o;})();
function earthCols(t){ const dn=dawn(t), pd=preDawn(t); const lit=litFrac(t,'L1')*(1-answerW(t)); return {face:mixc(mixc([14,14,19],[17,18,26],pd),[30,28,36],dn), back:mixc(mixc([22,22,31],[27,29,41],pd),[84,70,72],dn), rim:mixc(mixc([112,130,172],[255,146,90],.55*lit),[255,200,160],dn)}; }
function drawBackWall(t){
  const C=earthCols(t); const out=trenchOutline(t>=T.b2); const q=quake(t); const dn=dawn(t);
  ctx.save(); worldT(); ctx.translate(0,q);
  ctx.beginPath(); ctx.moveTo(out[0][0],G-1); for(const p of out) ctx.lineTo(p[0],p[1]); ctx.lineTo(out[out.length-1][0],G-1); ctx.closePath();
  // the far wall of the trench: sky light falls in at the top, the floor is in shadow
  const g=ctx.createLinearGradient(0,G,0,FL); g.addColorStop(0,rgba(mixc(C.back,C.rim,.16))); g.addColorStop(.3,rgba(C.back)); g.addColorStop(1,rgba(C.back.map(v=>v*.45))); ctx.fillStyle=g; ctx.fill();
  ctx.save(); ctx.clip(); const R=rng(41);
  for(let i=0;i<6;i++){ ctx.strokeStyle=`rgba(0,0,0,${.12+R()*.08})`; ctx.lineWidth=1.3; ctx.beginPath(); const y=G+12+i*16+R()*6; ctx.moveTo(TX-80,y); ctx.quadraticCurveTo(TX,y+R()*8-4,TX+80,y+R()*4); ctx.stroke(); }
  // the marks of his pick in the wall in front of him
  for(let i=0;i<14;i++){ const x=TX+22+R()*36, y=FL-8-R()*70; ctx.strokeStyle=`rgba(0,0,0,${.16+R()*.1})`; ctx.lineWidth=1.6+R(); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+5+R()*5,y+7+R()*7); ctx.stroke(); }
  // loose earth on the floor
  ctx.fillStyle=rgba(mixc(C.back,C.rim,.12)); ctx.beginPath(); ctx.moveTo(TX-70,FL+2); for(let x=TX-70;x<=TX+70;x+=6) ctx.lineTo(x,FL-2-2.2*Math.abs(Math.sin(x*.21))-(x>TX+20?5*ss(TX+20,TX+56,x):0)); ctx.lineTo(TX+70,FL+2); ctx.fill();
  // he is the only light down here: cool and faint in the struggle, warm after the answer
  const k=skeleton(figureState(t)); const cx=(k.hip[0]+k.sh[0])/2, cy=(k.hip[1]+k.sh[1])/2; const aw=answerW(t);
  ctx.globalCompositeOperation='lighter'; const lc=mixc([150,175,230],[255,196,130],aw); const la=(.1+.1*aw)*(1-.4*dn); const rr=96+30*aw;
  const lg=ctx.createRadialGradient(cx,cy,0,cx,cy,rr); lg.addColorStop(0,rgba(lc,la)); lg.addColorStop(1,rgba(lc,0)); ctx.fillStyle=lg; ctx.fillRect(cx-rr,cy-rr,rr*2,rr*2);
  const hw=aw*(1-.3*dn); if(hw>0){ const hp=heartPos(k,t); const rg=ctx.createRadialGradient(hp[0],hp[1],0,hp[0],hp[1],130); rg.addColorStop(0,`rgba(255,190,120,${.22*hw})`); rg.addColorStop(1,'rgba(255,170,100,0)'); ctx.fillStyle=rg; ctx.fillRect(hp[0]-130,hp[1]-130,260,260); }
  ctx.restore(); ctx.restore();
}
function drawFrontEarth(t){
  const C=earthCols(t); const out=trenchOutline(t>=T.b2); const q=quake(t);
  ctx.save(); worldT(); ctx.translate(0,q);
  const path=()=>{ ctx.beginPath(); ctx.moveTo(-500,G+700); for(let x=-500;x<out[0][0];x+=10) ctx.lineTo(x,groundY(x)); for(const p of out) ctx.lineTo(p[0],p[1]); const xr=out[out.length-1][0]; for(let x=xr;x<=1900;x+=10) ctx.lineTo(x,groundY(x)); ctx.lineTo(1900,G+700); ctx.closePath(); };
  path(); const g=ctx.createLinearGradient(0,G-30,0,G+300); g.addColorStop(0,rgba(C.face.map(v=>v*1.5))); g.addColorStop(.12,rgba(C.face)); g.addColorStop(1,rgba(C.face.map(v=>v*.55))); ctx.fillStyle=g; ctx.fill();
  ctx.save(); ctx.clip(); for(const s of STRATA){ ctx.fillStyle=`rgba(200,210,240,${s.a*.18})`; ctx.fillRect(s.x,s.y,s.w,1.2); } ctx.restore();
  // the ground's edge catches the light (moon, the fires, then the dawn)
  ctx.strokeStyle=rgba(C.rim,.34+.3*dawn(t)); ctx.lineWidth=1.8; ctx.beginPath(); for(let x=-500;x<out[0][0];x+=10) x===-500?ctx.moveTo(x,groundY(x)):ctx.lineTo(x,groundY(x)); ctx.stroke();
  ctx.beginPath(); const xr=out[out.length-1][0]; for(let x=xr;x<=1900;x+=10) x===xr?ctx.moveTo(x,groundY(x)):ctx.lineTo(x,groundY(x)); ctx.stroke();
  ctx.strokeStyle=rgba(C.rim,.14); ctx.lineWidth=1.3; ctx.beginPath(); out.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
  // dry tufts along the lip, combed by the wind
  const wl=windG(t); ctx.strokeStyle=rgba(C.face.map(v=>v*1.3)); ctx.lineWidth=1.4; ctx.lineCap='round'; const R=rng(77);
  for(let i=0;i<70;i++){ const x=-300+R()*1700; if(x>TX-TWL-6&&x<TX+TWL+6) { R();R(); continue; } const h=4+R()*9, ph=R()*6; const y=groundY(x); const bend=-clamp(wl*.45,0,1.5)*h*.8+Math.sin(t*(2+wl*2)+ph)*(1+wl);
    ctx.beginPath(); ctx.moveTo(x,y+1); ctx.quadraticCurveTo(x+bend*.3,y-h*.6,x+bend,y-h); ctx.stroke(); }
  ctx.restore();
}
function drawSlab(t){
  if(t>=T.b2-.2&&t<SLAB_LAND){ const tau=Math.max(0,t-T.b2); const c0=SLAB_C, c1=[TX+30,FL-12]; const u=clamp(tau/(SLAB_LAND-T.b2));
    const cx=lerp(c0[0],c1[0],u*u*(1.4-.4*u)), cy=c0[1]+.5*GRAV*tau*tau; const rot=-.9*u*u; const pre=t<T.b2?Math.sin(t*90)*.6*ss(T.b2-.2,T.b2,t):0;
    const C=earthCols(t); ctx.save(); worldT(); ctx.translate(cx+pre,Math.min(cy,c1[1])+quake(t)); ctx.rotate(rot); ctx.fillStyle=rgba(C.face.map(v=>v*1.2)); ctx.strokeStyle=rgba(C.rim,.35); ctx.lineWidth=1.4;
    ctx.beginPath(); SLAB.forEach((p,i)=>{const x=p[0]-c0[0],y=p[1]-c0[1]; i?ctx.lineTo(x,y):ctx.moveTo(x,y);}); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  if(t>=SLAB_LAND){ const C=earthCols(t); ctx.save(); worldT(); ctx.translate(0,quake(t)); for(const r of RUBBLE){ const u=t-SLAB_LAND-r.del; if(u<0) continue; const e=eout(clamp(u/.35)); const bx=r.x+r.dx*e, by=r.y-Math.sin(Math.PI*clamp(u/.3))*8*(1-clamp(u/.3));
      ctx.save(); ctx.translate(bx,by); ctx.rotate(r.rot+e*.8); ctx.fillStyle=rgba(C.face.map(v=>v*1.35)); ctx.strokeStyle=rgba(C.rim,.25); ctx.lineWidth=1; ctx.beginPath(); r.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } ctx.restore(); }
}
function drawClods(t){
  const C=earthCols(t); ctx.save(); worldT(); ctx.translate(0,quake(t)*.5);
  for(const c of CLODS){ const tau=t-c.t0; if(tau<0) continue; let x,y,rot;
    if(!c.land||t<c.land.t){ x=c.x0+c.vx*tau; y=c.y0+c.vy*tau+.5*GRAV*tau*tau; rot=c.rot+c.vr*tau; } else { x=c.land.x; y=c.land.y; rot=c.rot+c.vr*(c.land.t-c.t0); }
    if(t>c.t0+9) continue;
    ctx.fillStyle=rgba(C.face.map(v=>v*1.8)); ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0,0,c.r,c.r*.72,0,0,7); ctx.fill(); ctx.fillStyle=rgba(C.rim,.25); ctx.fillRect(-c.r*.5,-c.r*.6,c.r*.6,c.r*.35); ctx.restore(); }
  // grit falling off the rims while the ground shakes
  const R=rng(61); for(let i=0;i<34;i++){ const t0=T.b2-.1+R()*2.6, side=R()<.5?-1:1, x0=TX+side*(TWL+2-R()*6), sz=.8+R()*1.6, vx=-side*(8+R()*24); const u=t-t0; if(u<0||u>1.6) continue; const y=G+.5*GRAV*u*u; if(y>FL) continue; ctx.fillStyle=rgba(C.rim,.5*(1-u/1.6)); ctx.fillRect(x0+vx*u,y,sz,sz); }
  ctx.restore();
}
// ---------------- dust bursts (impacts, his falls) ----------------
const DUSTS=[{t:T.imp0,x:TX+66,y:FL-3,n:14,s:.9},{t:T.wall1,x:TX-56,y:FL-60,n:12,s:.8},{t:T.knee1,x:TX-46,y:FL-2,n:10,s:.7},{t:T.imp2,x:TX+62,y:FL-3,n:10,s:.7},{t:T.sit2,x:TX-36,y:FL-2,n:24,s:1.3},{t:SLAB_LAND,x:TX+30,y:FL-4,n:26,s:1.3},{t:T.kneel[1],x:TX-30,y:FL-2,n:12,s:.8},{t:T.slip+.2,x:TX+30,y:FL-2,n:10,s:.7}];
function drawDust(t){ ctx.save(); worldT();
  for(const s of DUSTS){ const a=(t-s.t)/1.7; if(a<0||a>1) continue; const R=rng(31+Math.round(s.t*100));
    for(let k=0;k<s.n;k++){ const dir=R()<.5?-1:1, vx=dir*(14+R()*60)*s.s, vy=-(R()*30+6)*s.s, sz=1.3+R()*2.6; const e=eout(a); const wl=windNear(t)*(s.y<G?1:.2);
      const x=s.x+(R()-.5)*24+vx*e-wl*40*a*a, y=s.y+vy*e*(1-a*.5)+8*a*a; ctx.fillStyle=`rgba(150,152,166,${.3*(1-a)*(1-a)})`; ctx.beginPath(); ctx.arc(x,y,sz*(1+1.5*a),0,7); ctx.fill(); } }
  ctx.restore(); }
// ---------------- the wind made visible ----------------
const STRANDS=(()=>{const r=rng(91),o=[]; for(let i=0;i<60;i++) o.push({x:r()*2000,y:r(),d:.4+r()*1.2,len:.55+r()*.9,sp:.8+r()*.45,ph:r()*6,f:.6+r()*1.1,amp:5+r()*15}); return o;})();
const GRIT=(()=>{const r=rng(93),o=[]; for(let i=0;i<200;i++) o.push({x:r()*2000,y:r(),d:.5+r()*1.2,sp:.8+r()*.6,ph:r()*6,s:.6+r()*1.4}); return o;})();
function drawWind(t){
  const wint=simAt(SIM.wint,t); const dn=dawn(t);
  const gS=sx=>{ const wx=cam.x+(sx-540)/cam.z; const inT=wx>TX-TWL+3&&wx<TX+TWL-3; return [960+((inT?FL:groundY(wx))-cam.y)*cam.z, inT]; };
  ctx.save(); ctx.lineCap='round';
  // long soft strands of wind, more of them the harder it blows
  for(let i=0;i<STRANDS.length;i++){ const s=STRANDS[i]; const zz=.75+.35*s.d*(cam.z/2.5);
    const x=((s.x-wint*560*s.sp*zz)%2000+2000)%2000-420; const y0=430+s.y*820;
    const wx=cam.x+(x-540)/cam.z; const wl=windAt(wx,t); if(hs(i,4)>clamp((wl-.25)/2.2)+.12) continue;
    const A=clamp((wl-.3)/1.6)*(.05+.06*s.d)*(1-.7*dn)*(1+1.3*galeA(t)); if(A<.004) continue;
    const len=(70+120*Math.min(wl,3.4)+180*galeA(t))*s.len*zz; const n=10; let px=x, py=y0;
    for(let j=1;j<=n;j++){ const u=j/n; const nx=x+u*len, ny=y0+s.amp*zz*Math.sin(u*s.f*3+t*2.4+s.ph)*(.35+.65*u);
      const [gy,inT]=gS((px+nx)/2); let a=A*Math.pow(Math.sin(Math.PI*(u-.5/n)),.8); if((py+ny)/2>gy-2) a=0; else if(inT&&(py+ny)/2>960+(G-cam.y)*cam.z) a*=.25;
      if(a>.003){ ctx.strokeStyle=`rgba(205,218,245,${a})`; ctx.lineWidth=(.9+.9*s.d)*zz; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(nx,ny); ctx.stroke(); }
      px=nx; py=ny; } }
  // ice grit carried in the wind
  ctx.globalCompositeOperation='lighter';
  for(const g of GRIT){ const z=.7+.5*g.d; const x=((g.x-wint*640*g.sp*z)%2000+2000)%2000-420; const y=380+g.y*960+Math.sin(t*4+g.ph)*14*z;
    const wx=cam.x+(x-540)/cam.z; const wl=windAt(wx,t); let a=clamp((wl-.35)/1.2)*.42*(1-dn); const [gy,inT]=gS(x); if(y>gy-1) continue; if(inT&&y>960+(G-cam.y)*cam.z) a*=.15; if(a<.01) continue;
    const ln=Math.min(16,2+wl*4.5)*z; ctx.strokeStyle=`rgba(230,238,255,${a})`; ctx.lineWidth=g.s*z*.6; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+ln,y-ln*.08); ctx.stroke(); }
  ctx.restore();
}
// ---------------- dawn air: slow motes of light drifting on the breeze ----------------
const MOTES=(()=>{const r=rng(515),o=[]; for(let i=0;i<36;i++) o.push({x:r()*1300,y:r()*1500,vx:6+r()*16,vy:5+r()*12,s:1+r()*2.4,f:.4+r()*.9,ph:r()*6,d:.4+r()}); return o;})();
function drawMotes(t){ const a0=ss(29.5,34,t); if(a0<=0) return; ctx.save(); ctx.globalCompositeOperation='lighter';
  for(const m of MOTES){ const u=t-29.5; const x=((m.x+u*m.vx*(1+breeze(t)*2)+Math.sin(u*m.f+m.ph)*14-cam.x*.3*m.d)%1300+1300)%1300-110, y=((m.y-u*m.vy+Math.sin(u*m.f*.7+m.ph)*10)%1500+1500)%1500+250;
    const a=a0*(.2+.22*Math.sin(u*m.f*1.3+m.ph*2))*(y<1300?1:0); if(a<=.01) continue; const r=m.s*(.8+.4*m.d)*2.4; ctx.globalAlpha=a*.6; ctx.drawImage(SOFT,x-r,y-r,r*2,r*2); ctx.globalAlpha=Math.min(1,a*1.5); ctx.fillStyle='rgba(255,214,150,1)'; ctx.beginPath(); ctx.arc(x,y,m.s*.42,0,7); ctx.fill(); }
  ctx.restore(); }
// ---------------- the man ----------------
function heartPos(k,t){ const u=heartUp(t); const chest=[k.hip[0]+(k.sh[0]-k.hip[0])*.66+(k.mid[0]-(k.hip[0]+k.sh[0])/2)*.6, k.hip[1]+(k.sh[1]-k.hip[1])*.66+(k.mid[1]-(k.hip[1]+k.sh[1])/2)*.6];
  const throat=[k.sh[0]+(k.head[0]-k.sh[0])*.3, k.sh[1]+(k.head[1]-k.sh[1])*.3]; return [lerp(chest[0],throat[0],u),lerp(chest[1],throat[1],u)]; }
const HPH=[]; {let ph=0; for(let t=-3;t<=T.END+2;t+=DT){HPH.push(ph); ph+=DT*heartRate(t);}}
const heartPh=t=>HPH[clamp(Math.round((t+3)/DT),0,HPH.length-1)];
function heartPulse(t){ const f=fr(heartPh(t)); return Math.exp(-Math.pow(f/.055,2))+Math.exp(-Math.pow((f-1)/.055,2))+.6*Math.exp(-Math.pow((f-.27)/.055,2)); }
const bigBeat=t=>T.beats.reduce((a,b)=>a+Math.exp(-Math.pow((t-b)/.085,2))+.5*Math.exp(-Math.pow((t-b-.24)/.08,2)),0);
function figCol(t){ const f=frost(t), w=answerW(t); return mixc(mixc([220,226,238],[190,210,244],f*.35),[255,244,228],ss(T.beats[0],T.beats[2]+1.5,t)); }
function drawFigure(k,s,t){
  ctx.save(); worldT(); ctx.translate(0,quake(t)*.8);
  const col=figCol(t); const dn=dawn(t); const fireL=litFrac(t,'L1')*(1-answerW(t));
  ctx.lineCap='round'; ctx.lineJoin='round';
  const near=k.m>=0?[1,.58]:[.58,1];
  // numbness made visible: ice creeping up each arm from where the hand would be (no fingers, so the whole arm tells it)
  const fz=frost(t), iq=clamp(fz*1.35), iq2=clamp((fz-.62)/.38)*.75;
  const sleeve=(i,aa)=>{ if(fz<.02) return; const a=k.arms[i], e=a.e, h=a.h; ctx.strokeStyle=rgba([118,182,255],.9*aa); ctx.lineWidth=9; ctx.beginPath(); ctx.moveTo(h[0],h[1]); ctx.lineTo(lerp(h[0],e[0],iq),lerp(h[1],e[1],iq)); if(iq>=1&&iq2>0) ctx.lineTo(lerp(e[0],k.sh[0],iq2),lerp(e[1],k.sh[1],iq2)); ctx.stroke();
    ctx.strokeStyle=rgba([236,248,255],.75*aa); ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(h[0]-1,h[1]-2); ctx.lineTo(lerp(h[0],e[0],iq*.9)-1,lerp(h[1],e[1],iq*.9)-2); ctx.stroke(); };
  const strokeAll=(c,a,off,wm,ice)=>{
    const line=(pts,w,aa)=>{ctx.strokeStyle=rgba(c,a*aa); ctx.lineWidth=w*wm; ctx.beginPath(); ctx.moveTo(pts[0][0]+off[0],pts[0][1]+off[1]); for(const p of pts.slice(1)) ctx.lineTo(p[0]+off[0],p[1]+off[1]); ctx.stroke();};
    line([k.sh,k.arms[1].e,k.arms[1].h],8,near[1]); if(ice) sleeve(1,near[1]); line([k.hip,k.legs[1].k,k.legs[1].f,k.toes[1]],9,.6);
    ctx.strokeStyle=rgba(c,a); ctx.lineWidth=11*wm; ctx.beginPath(); ctx.moveTo(k.hip[0]+off[0],k.hip[1]+off[1]); ctx.quadraticCurveTo(k.mid[0]+off[0],k.mid[1]+off[1],k.sh[0]+off[0],k.sh[1]+off[1]); ctx.stroke();
    line([k.hip,k.legs[0].k,k.legs[0].f,k.toes[0]],9,1); line([k.sh,k.arms[0].e,k.arms[0].h],8,near[0]); if(ice) sleeve(0,near[0]);
    ctx.fillStyle=rgba(c,a); ctx.beginPath(); ctx.arc(k.head[0]+off[0],k.head[1]+off[1],L.hr*wm,0,7); ctx.fill();
  };
  // fire-light from the hills on his right side, flickering; dawn light later from the same side
  const fl=.75+.25*fbm(t*5,2); if(fireL>.02) strokeAll([255,140,70],.7*fireL*fl,[2.2,-.6],1);
  if(dn>.02) strokeAll([255,196,140],.8*dn,[2.2,-1.4],1);
  ctx.shadowColor=rgba(mixc([150,180,240],[255,196,140],Math.max(dn,answerW(t)*.6)),.45+.3*dn); ctx.shadowBlur=8+10*dn;
  strokeAll(col,1,[0,0],1,true); ctx.shadowBlur=0;
  ctx.restore();
}
// ---------------- the cloak ----------------
function drawCloak(t,front){
  const pts=simAt(SIM.cloak,t); if(!pts) return; const wrapped=t>T.wrap[0]+.2&&t<T.tear+.05; if(front!==wrapped) return;
  const dn=dawn(t), f=frost(t); const base=mixc(mixc([92,78,74],[96,104,126],f*.6),[150,112,96],dn);
  ctx.save(); worldT(); ctx.translate(0,quake(t)*.8);
  const n=pts.length, Lft=[], Rgt=[];
  for(let i=0;i<n;i++){ const a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)]; let dx=b[0]-a[0], dy=b[1]-a[1]; const d=Math.hypot(dx,dy)||1; dx/=d; dy/=d; const w=(4.5+i*1.35)*(1-.25*(i===n-1)); Lft.push([pts[i][0]-dy*w,pts[i][1]+dx*w]); Rgt.push([pts[i][0]+dy*w,pts[i][1]-dx*w]); }
  ctx.beginPath(); ctx.moveTo(...Lft[0]); for(let i=1;i<n;i++){ const p=Lft[i-1], q=Lft[i]; ctx.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2); } ctx.lineTo(...Lft[n-1]); ctx.lineTo(...Rgt[n-1]); for(let i=n-2;i>=0;i--){ const p=Rgt[i+1], q=Rgt[i]; ctx.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2); } ctx.closePath();
  const g=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[n-1][0],pts[n-1][1]); g.addColorStop(0,rgba(base.map(v=>v*.85))); g.addColorStop(1,rgba(base.map(v=>v*1.1))); ctx.fillStyle=g; ctx.fill();
  ctx.strokeStyle=rgba(mixc([200,210,235],[255,206,160],dn),.32); ctx.lineWidth=1.3; ctx.stroke();
  // frost on the cloth
  if(f>.05){ const R=rng(808); ctx.fillStyle=`rgba(225,238,255,${.55*f})`; for(let i=0;i<26;i++){ const k=Math.floor(R()*(n-1)), u=R(); const p=[lerp(pts[k][0],pts[k+1][0],u),lerp(pts[k][1],pts[k+1][1],u)]; if(R()>f) continue; ctx.fillRect(p[0]+(R()-.5)*8,p[1]+(R()-.5)*6,1.2,1.2); } }
  ctx.restore();
}
// ---------------- frost crystals on his body, melting into light ----------------
const CRYST=(()=>{const r=rng(1717),o=[]; const segs=['faN','faF','faN','faF','uaN','uaF','head','torso','shN','thN']; for(let i=0;i<72;i++) o.push({seg:segs[Math.floor(Math.pow(r(),1.1)*segs.length)],u:r(),side:(r()-.3)*2,th:.05+r()*.9,sz:.9+r()*1.4,rot:r()*3}); return o;})();
function segPts(k,seg){ switch(seg){ case 'torso': return [k.hip,k.sh]; case 'uaN': return [k.sh,k.arms[0].e]; case 'faN': return [k.arms[0].e,k.arms[0].h]; case 'uaF': return [k.sh,k.arms[1].e]; case 'faF': return [k.arms[1].e,k.arms[1].h];
  case 'thN': return [k.hip,k.legs[0].k]; case 'shN': return [k.legs[0].k,k.legs[0].f]; case 'thF': return [k.hip,k.legs[1].k]; case 'shF': return [k.legs[1].k,k.legs[1].f]; default: return [k.head,[k.head[0]+.01,k.head[1]-1]]; } }
function crystalPos(k,c){ const [a,b]=segPts(k,c.seg); if(c.seg==='head'){ const ang=-Math.PI*.15+c.side*1.4; return [k.head[0]+Math.cos(ang)*L.hr,k.head[1]+Math.sin(ang)*L.hr]; }
  const dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy)||1; const w=c.seg==='torso'?5.5:4.2; return [a[0]+dx*c.u-dy/d*c.side*w, a[1]+dy*c.u+dx/d*c.side*w]; }
const meltT=c=>{ let lo=T.melt[0]-.4,hi=T.melt[1]; for(let i=0;i<30;i++){const m=(lo+hi)/2; if(frost(m)>c.th) lo=m; else hi=m;} return hi; };
CRYST.forEach(c=>c.mt=meltT(c));
const meltCache={};
function drawFrost(k,t){
  const f=frost(t); ctx.save(); worldT(); ctx.translate(0,quake(t)*.8); ctx.globalCompositeOperation='lighter';
  if(f>.01) for(const c of CRYST){ if(f<c.th) continue; const g=clamp((f-c.th)/.25); const p=crystalPos(k,c); const s=c.sz*(.4+.6*g);
    ctx.strokeStyle=`rgba(215,234,255,${.7*g})`; ctx.lineWidth=.75; ctx.beginPath(); for(let j=0;j<3;j++){ const a=c.rot+j*Math.PI/3; ctx.moveTo(p[0]-Math.cos(a)*s,p[1]-Math.sin(a)*s); ctx.lineTo(p[0]+Math.cos(a)*s,p[1]+Math.sin(a)*s); } ctx.stroke(); }
  // melting: each crystal becomes a small drop of warm light drifting up
  if(t>T.melt[0]-.5&&t<T.melt[1]+4){ for(let i=0;i<CRYST.length;i++){ const c=CRYST[i]; const a=(t-c.mt)/2.6; if(a<0||a>1) continue;
      if(!meltCache[i]){ meltCache[i]=crystalPos(skeleton(figureState(c.mt)),c); } const p=meltCache[i];
      const x=p[0]+Math.sin(a*4+i)*5*a, y=p[1]-a*(48+i%5*12); const al=Math.sin(Math.PI*clamp(a*1.6))*(1-a)*.9;
      ctx.drawImage(SOFT,x-6,y-6,12,12); ctx.fillStyle=`rgba(255,${210+i%3*12},150,${al})`; ctx.beginPath(); ctx.arc(x,y,1.3+.6*(i%3),0,7); ctx.fill(); } }
  ctx.restore();
}
// ---------------- his heart ----------------
function drawHeart(k,t){
  const hp=heartPos(k,t); const p=heartPulse(t), bb=bigBeat(t), aw=answerW(t), dn=dawn(t);
  const col=mixc([255,92,48],[255,212,140],aw); const fearA=ss(T.b1,T.b1+.4,t)*(1-aw);
  ctx.save(); worldT(); ctx.translate(0,quake(t)*.8); ctx.globalCompositeOperation='lighter';
  const base=.32+.35*fearA+.5*aw;
  const R=(10+6*p*(.4+fearA)+34*bb+10*aw)*(1+.5*aw*ss(T.beats[2],T.rise[0],t));
  const rg=ctx.createRadialGradient(hp[0],hp[1],0,hp[0],hp[1],R*2.6); rg.addColorStop(0,rgba(col,clamp(base*.9+.4*p*fearA+.7*bb))); rg.addColorStop(.25,rgba(col,clamp(.25*base+.2*p+.3*bb))); rg.addColorStop(1,rgba(col,0));
  ctx.fillStyle=rg; ctx.fillRect(hp[0]-R*2.6,hp[1]-R*2.6,R*5.2,R*5.2);
  ctx.fillStyle=rgba(mixc(col,[255,250,235],.5),clamp(.55+.45*p+bb)); ctx.beginPath(); ctx.arc(hp[0],hp[1],2.4+1.6*p*fearA+2.5*bb+1.2*aw,0,7); ctx.fill();
  // each beat sends a ring out: you can see it pounding
  const f=fr(heartPh(t)); if(fearA>.05&&f<.5){ const rr=4+f*44; ctx.strokeStyle=rgba(col,(1-f*2)*.35*fearA); ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(hp[0],hp[1],rr,0,7); ctx.stroke(); }
  for(const b of T.beats){ const u=t-b; if(u<0||u>1.3) continue; const rr=8+u*150; ctx.strokeStyle=rgba([255,214,150],(1-u/1.3)*.5); ctx.lineWidth=2; ctx.beginPath(); ctx.arc(hp[0],hp[1],rr,0,7); ctx.stroke(); }
  ctx.restore();
}
// ---------------- the pick ----------------
function pickAt(t){ if(t<T.b2){ const s=figureState(t); if(s.pick) return {g:s.pick.rear,h:s.pick.head}; } const p=simAt(SIM.pick,t); return p?{g:[p[0],p[1]],h:[p[2],p[3]]}:null; }
function drawPickShape(g,h,a,dn){
  const dx=h[0]-g[0], dy=h[1]-g[1], d=Math.hypot(dx,dy)||1, ux=dx/d, uy=dy/d, px=-uy, py=ux;
  ctx.globalAlpha=a; ctx.lineCap='round'; ctx.strokeStyle=rgba(mixc([150,128,108],[200,160,120],dn)); ctx.lineWidth=4.2; ctx.beginPath(); ctx.moveTo(g[0],g[1]); ctx.lineTo(h[0]+ux*2,h[1]+uy*2); ctx.stroke();
  ctx.fillStyle=rgba(mixc([150,160,178],[210,190,170],dn)); ctx.beginPath(); ctx.moveTo(h[0]+px*17+ux*5,h[1]+py*17+uy*5); ctx.quadraticCurveTo(h[0]+ux*7,h[1]+uy*7,h[0]-px*15+ux*6,h[1]-py*15+uy*6); ctx.lineTo(h[0]-px*12-ux*2,h[1]-py*12-uy*2); ctx.quadraticCurveTo(h[0]-ux*3,h[1]-uy*3,h[0]+px*15-ux*1,h[1]+py*15-uy*1); ctx.closePath(); ctx.fill();
  ctx.globalAlpha=1; }
function drawPick(t){ const dn=dawn(t); ctx.save(); worldT(); ctx.translate(0,quake(t)*.8);
  const p0=pickAt(t), p1=pickAt(t-1/120); if(!p0){ctx.restore(); return;} const sp=p1?Math.hypot(p0.h[0]-p1.h[0],p0.h[1]-p1.h[1]):0;
  if(sp>3){ const K=7; for(let i=0;i<K;i++){ const q=pickAt(t-i/(K-1)/120); if(q) drawPickShape(q.g,q.h,1/K*1.4,dn); } } else drawPickShape(p0.g,p0.h,1,dn);
  ctx.restore(); }
// ---------------- breath in the cold ----------------
const PUFFS=(()=>{const out=[]; let prev=null; for(let t=-2.5;t<T.END;t+=1/120){ const k=Math.floor((breathPh(t)+Math.PI/2)/(2*Math.PI)); if(prev!==null&&k!==prev) out.push(t); prev=k; } return out;})();
const puffCache={};
function drawBreath(t){ const dn=dawn(t); if(dn>.7) return; ctx.save(); worldT(); ctx.globalCompositeOperation='lighter';
  PUFFS.forEach((tk,i)=>{ const a=(t-tk)/1.6; if(a<0||a>1) return;
    if(!puffCache[i]){ const s=figureState(tk), k=skeleton(s); const ang=(s.tor+s.hd)*D; const dir=k.m<0?-1:1; puffCache[i]=[k.head[0]+dir*(Math.cos(ang)*12+3),k.head[1]+Math.sin(ang)*8+5,dir,s.ba]; }
    const [px,py,dir,amp]=puffCache[i]; const r=5+20*eout(a); const wl=windNear(tk)*(py<G?1:.25);
    const x=px+dir*(8+16*eout(a))-wl*a*a*70, y=py-10*a; const al=.11*(1-a)*(1-dn*1.4)*(.7+amp*.06);
    const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(215,225,245,${al})`); g.addColorStop(1,'rgba(215,225,245,0)'); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2); });
  ctx.restore(); }
function drawShadow(k,t){ ctx.save(); worldT(); const y=k.legs[0].f[1]>G+5?FL:groundY(k.hip[0]); const w=46; const g=ctx.createRadialGradient(k.hip[0],y,0,k.hip[0],y,w); g.addColorStop(0,'rgba(0,0,0,.45)'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.translate(0,y); ctx.scale(1,.18); ctx.translate(0,-y); ctx.fillStyle=g; ctx.fillRect(k.hip[0]-w,y-w,w*2,w*2); ctx.restore(); }
// ---------------- foreground: dry grass at the lens, bending in the wind ----------------
const FGG=(()=>{const r=rng(4242),o=[]; for(let i=0;i<46;i++) o.push({x:-400+r()*2400,h:60+r()*150,l:(r()-.5)*1.2,w:5+r()*6,p:r()*6}); return o;})();
function drawFG(t){ const dn=dawn(t); const P=1.9; const col=mixc([5,6,10],[26,20,24],dn); ctx.save(); ctx.filter='blur(9px)'; ctx.lineCap='round'; const wl=windG(t);
  for(const b of FGG){ const sx=((b.x-cam.x*P*.55)%1700+1700)%1700-300; const base=H+20; const bend=-clamp(wl*.5,0,1.6)*b.h*.45+Math.sin(t*(1.5+wl)+b.p)*(4+wl*5);
    ctx.strokeStyle=rgba(col,.96); ctx.lineWidth=b.w*2.2; ctx.beginPath(); ctx.moveTo(sx,base); ctx.quadraticCurveTo(sx+b.l*20,base-b.h*.6,sx+b.l*40+bend,base-b.h); ctx.stroke(); }
  ctx.restore(); }
