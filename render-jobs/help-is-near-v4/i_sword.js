// ===================== his sword (the ending) =====================
// Lying sheathed on the crest all night. He takes it by the hilt (it swings up off the ground and hangs from his hand),
// draws it up out of the scabbard toward the sky, and drives it into the earth: "and Allah sufficed the believers in fighting" (33:25).
// The fighting never came. The moment it goes in, the morning floods the land.
const flood=t=>ss(T.plant-.05,T.plant+1.8,t);
const plantU=t=>t-T.plant;
const swAt=t=>simAt(SIM.sword,t);
function swordPose(t){ const q=swAt(t); if(!q) return null; let G=[q[0],q[1]], d=[q[2],q[3]]; const ph=q[8];
  if(ph===4){ // planted: it shivers from the blow, then stands still
    const u=plantU(t), a=2.6*D*Math.exp(-u*5.5)*Math.sin(2*Math.PI*8*u)*(1-.5*ss(T.plant+.15,T.bow,t)); const E=[G[0]+d[0]*(SWB-16),G[1]+d[1]*(SWB-16)];
    const c=Math.cos(a), s=Math.sin(a); const r=[G[0]-E[0],G[1]-E[1]]; G=[E[0]+r[0]*c-r[1]*s, E[1]+r[0]*s+r[1]*c]; d=[d[0]*c-d[1]*s, d[0]*s+d[1]*c]; }
  return {G,d,M:[q[4],q[5]],md:[q[6],q[7]],ph,ext:q[9]}; }
function drawBlade(G,d,dn,a=1){ const n=[-d[1],d[0]]; const P=(u,w)=>[G[0]+d[0]*u+n[0]*w, G[1]+d[1]*u+n[1]*w];
  ctx.globalAlpha=a;
  // the blade: dark steel against the bright morning, a straight blade tapering to the point, with a fuller
  const sd=n[0]>=0?1:-1;                                   // the side of the blade that faces the sunrise (right)
  const c=mixc([58,62,78],[92,80,88],dn);
  const g=ctx.createLinearGradient(...P(SWG,-2.6*sd),...P(SWG,2.6*sd)); g.addColorStop(0,rgba(mixc(c,[20,20,28],.4))); g.addColorStop(.55,rgba(c)); g.addColorStop(1,rgba(mixc(c,[200,170,150],.35)));
  ctx.fillStyle=g; ctx.beginPath(); const a0=P(SWG,-2.7),a1=P(SWB-11,-2.2),tp=P(SWB,0),b1=P(SWB-11,2.2),b0=P(SWG,2.7); ctx.moveTo(...a0); ctx.lineTo(...a1); ctx.quadraticCurveTo(...P(SWB-4,-1.4),...tp); ctx.quadraticCurveTo(...P(SWB-4,1.4),...b1); ctx.lineTo(...b0); ctx.closePath(); ctx.fill();
  // the fuller, a dark groove down the middle
  ctx.strokeStyle=rgba(mixc(c,[14,14,20],.55),.7*a); ctx.lineWidth=.9; ctx.beginPath(); ctx.moveTo(...P(SWG+3,-.2*sd)); ctx.lineTo(...P(SWB-18,-.2*sd)); ctx.stroke();
  // the sun along the edge that faces it: a thin bright line that warms with the morning
  ctx.strokeStyle=rgba(mixc([214,222,240],[255,226,180],dn),(.5+.45*dn)*a); ctx.lineWidth=.9; ctx.beginPath(); ctx.moveTo(...P(SWG+1,2.35*sd)); ctx.lineTo(...P(SWB-11,1.9*sd)); ctx.quadraticCurveTo(...P(SWB-4,1.15*sd),...P(SWB-.6,.1*sd)); ctx.stroke();
  ctx.globalAlpha=1; }
function drawHilt(G,d,dn){ const n=[-d[1],d[0]]; const P=(u,w)=>[G[0]+d[0]*u+n[0]*w, G[1]+d[1]*u+n[1]*w];
  const brass=mixc([96,80,58],[214,170,110],dn), grip=mixc([30,22,20],[70,46,36],dn), hl=mixc([180,160,130],[255,224,170],dn);
  ctx.lineCap='round'; ctx.strokeStyle=rgba(grip); ctx.lineWidth=4.4; ctx.beginPath(); ctx.moveTo(...P(-SWP+2,0)); ctx.lineTo(...P(SWG-.5,0)); ctx.stroke();
  // the crossguard: a heavy bar, slightly swept toward the blade
  ctx.strokeStyle=rgba(brass); ctx.lineWidth=3.3; ctx.beginPath(); ctx.moveTo(...P(SWG+1.8,-9.2)); ctx.quadraticCurveTo(...P(SWG-.8,0),...P(SWG+1.8,9.2)); ctx.stroke();
  ctx.strokeStyle=rgba(hl,.35+.4*dn); ctx.lineWidth=.9; ctx.beginPath(); ctx.moveTo(...P(SWG+.6,-8.6)); ctx.quadraticCurveTo(...P(SWG-1.9,0),...P(SWG+.6,8.6)); ctx.stroke();
  ctx.fillStyle=rgba(brass); ctx.beginPath(); ctx.arc(...P(-SWP,0),3.4,0,7); ctx.fill();
  ctx.fillStyle=rgba(hl,.4+.4*dn); ctx.beginPath(); ctx.arc(...P(-SWP+.6,-.9),1.1,0,7); ctx.fill(); }
function drawScabbard(M,md,dn){ const n=[-md[1],md[0]]; const P=(u,w)=>[M[0]+md[0]*u+n[0]*w, M[1]+md[1]*u+n[1]*w];
  const lea=mixc([34,26,24],[92,64,50],dn), brass=mixc([110,96,72],[226,190,136],dn);
  ctx.fillStyle=rgba(lea); ctx.beginPath(); ctx.moveTo(...P(0,-2.6)); ctx.lineTo(...P(SCL-6,-2.0)); ctx.lineTo(...P(SCL-6,2.0)); ctx.lineTo(...P(0,2.6)); ctx.closePath(); ctx.fill();
  ctx.fillStyle=rgba(brass); ctx.beginPath(); ctx.moveTo(...P(0,-2.9)); ctx.lineTo(...P(4,-2.8)); ctx.lineTo(...P(4,2.8)); ctx.lineTo(...P(0,2.9)); ctx.closePath(); ctx.fill();   // the locket at the mouth
  ctx.beginPath(); ctx.moveTo(...P(SCL-7,-2.3)); ctx.lineTo(...P(SCL,0)); ctx.lineTo(...P(SCL-7,2.3)); ctx.closePath(); ctx.fill();                                       // the chape
  ctx.strokeStyle=rgba(mixc([200,206,230],[255,214,170],dn),.25+.3*dn); ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(...P(1,-2.5)); ctx.lineTo(...P(SCL-7,-1.9)); ctx.stroke(); }
// a four-point star of sunlight on the steel
function glint(x,y,a,r){ if(a<=.01) return; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.min(1,a); ctx.drawImage(SOFT,x-r*.9,y-r*.9,r*1.8,r*1.8);
  ctx.fillStyle='rgba(255,246,224,1)'; for(const [ax,ay] of [[1,0],[0,1]]){ ctx.beginPath(); ctx.moveTo(x-ax*r*2.2,y-ay*r*2.2); ctx.quadraticCurveTo(x+ay*r*.12,y+ax*r*.12,x+ax*r*2.2,y+ay*r*2.2); ctx.quadraticCurveTo(x-ay*r*.12,y-ax*r*.12,x-ax*r*2.2,y-ay*r*2.2); ctx.fill(); }
  ctx.restore(); }
// the scabbard once it has fallen: lies behind his feet
function drawSwordBack(t){ const p=swordPose(t); if(!p||p.ph<3) return; const dn=dawn(t); ctx.save(); worldT(); drawScabbard(p.M,p.md,dn); ctx.restore(); }
function drawSword(t){
  const p=swordPose(t); if(!p) return; const dn=dawn(t);
  ctx.save(); worldT(); ctx.lineJoin='round';
  if(p.ph<3){ drawBlade(p.G,p.d,dn); drawScabbard(p.M,p.md,dn); drawHilt(p.G,p.d,dn);
    // as the steel comes out it catches the light, a bright line running up the blade
    if(p.ph===2&&p.ext>2){ const u=SWG+p.ext; const x=p.G[0]+p.d[0]*(u-2), y=p.G[1]+p.d[1]*(u-2); glint(x,y,.55*ss(2,14,p.ext),3.2); } }
  else {
    // fast moves: a short blur of steel (the thrust)
    const p1=swordPose(t-1/120); const sp=p1?Math.hypot(p.G[0]-p1.G[0],p.G[1]-p1.G[1])+Math.hypot(p.d[0]-p1.d[0],p.d[1]-p1.d[1])*SWB:0;
    if(sp>4&&p.ph===3){ const K=6; for(let i=K-1;i>=1;i--){ const q=swordPose(t-i/(K-1)/120); if(q) drawBlade(q.G,q.d,dn,.22); } }
    drawBlade(p.G,p.d,dn); drawHilt(p.G,p.d,dn);
    // the sun on the steel: once as it clears the scabbard, once at the top of the coil, once as it goes in
    const tip=[p.G[0]+p.d[0]*(SWB-10),p.G[1]+p.d[1]*(SWB-10)], mid=[p.G[0]+p.d[0]*28,p.G[1]+p.d[1]*28];
    const gc=SWEV.clear||T.drawEnd; glint(tip[0],tip[1],1.1*Math.exp(-Math.pow((t-gc-.05)/.09,2)),4.6);
    glint(mid[0],mid[1],1.3*Math.exp(-Math.pow((t-T.top-.06)/.08,2)),6.4);
    const hg=[p.G[0]+p.d[0]*SWG,p.G[1]+p.d[1]*SWG]; glint(hg[0],hg[1],1.4*Math.exp(-Math.max(0,plantU(t))*5)*ss(T.plant-.02,T.plant,t),7.5);
    // a soft warm sheen on the planted blade, all through the end
    if(p.ph===4){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle=`rgba(255,214,160,${.22*flood(t)})`; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(p.G[0]+p.d[0]*SWG,p.G[1]+p.d[1]*SWG); ctx.lineTo(p.G[0]+p.d[0]*(SWB-16),p.G[1]+p.d[1]*(SWB-16)); ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
}
// ---------------- the blow: the land answers with light ----------------
const PLB=(()=>{const r=rng(3325),o=[]; for(let i=0;i<34;i++){ const a=-Math.PI*(.05+.9*r()); o.push({vx:Math.cos(a)*(90+r()*260),vy:Math.sin(a)*(60+r()*200),s:.8+r()*1.6,f:.6+r()*.8,ph:r()*6,life:2.2+r()*1.8}); } return o;})();
const BIRDS=(()=>{const r=rng(77001),o=[]; for(let i=0;i<7;i++) { const x0=TX+250+r()*150; o.push({x0,y0:groundY(x0)-5-r()*10,t0:T.plant+.12+r()*.45,vx:90+r()*70,vy:-(70+r()*50),f:5+r()*2.2,ph:r()*6,s:.8+r()*.35,drift:(r()-.5)*.5}); } return o;})();
function drawPlantFX(t){
  const u=plantU(t); if(u<-.05) return; const E=[SWPL.x,groundY(SWPL.x)]; const dn=dawn(t);
  ctx.save(); worldT(); ctx.globalCompositeOperation='lighter';
  // a wave of light running out along the ground: a soft flattened glow whose bright band travels outward
  if(u>0&&u<2.0){ const k=u/2.0, rx=40+1000*eout(k), a=.42*Math.pow(1-k,1.4);
    const g=ctx.createRadialGradient(E[0],E[1],rx*.55,E[0],E[1],rx); g.addColorStop(0,'rgba(255,200,130,0)'); g.addColorStop(.78,`rgba(255,214,150,${a})`); g.addColorStop(1,'rgba(255,200,130,0)');
    ctx.save(); ctx.translate(E[0],E[1]+2); ctx.scale(1,.07); ctx.translate(-E[0],-E[1]); ctx.fillStyle=g; ctx.fillRect(E[0]-rx,E[1]-rx,rx*2,rx*2); ctx.restore();
    const h=ctx.createRadialGradient(E[0],E[1],0,E[0],E[1],rx*.9); h.addColorStop(0,`rgba(255,206,140,${.2*(1-k)})`); h.addColorStop(1,'rgba(255,190,120,0)');
    ctx.save(); ctx.translate(E[0],E[1]); ctx.scale(1,.16); ctx.translate(-E[0],-E[1]); ctx.fillStyle=h; ctx.fillRect(E[0]-rx,E[1]-rx,rx*2,rx*2); ctx.restore(); }
  // the air itself warms: a soft swell of light around the blade, no edges
  if(u>0&&u<2.6){ const k=u/2.6, r=60+520*eout(k), a=.16*Math.pow(1-k,1.8)*ss(0,.08,u); ctx.globalAlpha=a; ctx.drawImage(SOFT,E[0]-r,E[1]-r*.8,r*2,r*1.6); ctx.globalAlpha=1; }
  // a shaft of light where it went in: soft at every edge, fading up into the sky
  if(u>-.03){ const a=.5*Math.exp(-Math.max(0,u)*2.0)*ss(-.03,0,u); if(a>.01){ ctx.globalAlpha=a; for(const [w,hh,al] of [[70,360,.5],[30,280,.75]]){ ctx.globalAlpha=a*al; ctx.drawImage(SOFT,0,0,64,32,E[0]-w/2,E[1]-hh,w,hh); }
      ctx.globalAlpha=Math.min(1,a*1.6); ctx.drawImage(GLOW,E[0]-46,E[1]-46,92,92); ctx.globalAlpha=1; } }
  // golden motes thrown up by the blow, drifting on the breeze
  if(u>0) for(const m of PLB){ const k=u/m.life; if(k>1) continue; const dr=1-Math.exp(-u*2.4); const x=E[0]+m.vx*dr/2.4+u*18*(1+breeze(t))+Math.sin(u*m.f+m.ph)*6, y=E[1]-4+m.vy*dr/2.4-u*14+Math.cos(u*m.f*.8+m.ph)*4;
    const a=Math.sin(Math.PI*Math.min(1,k*3))*(1-k)*.9; ctx.globalAlpha=a*.5; ctx.drawImage(SOFT,x-m.s*3,y-m.s*3,m.s*6,m.s*6); ctx.globalAlpha=a; ctx.fillStyle='rgba(255,220,160,1)'; ctx.beginPath(); ctx.arc(x,y,m.s*.6,0,7); ctx.fill(); }
  ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  // birds lift off from below the crest and fly into the morning
  for(const b of BIRDS){ const v=t-b.t0; if(v<0||v>7) continue; const sc=b.s*(1-.45*ss(0,6,v)); const x=b.x0+b.vx*v+Math.sin(v*1.3+b.ph)*8, y=b.y0+b.vy*v+18*v*v*.2*b.drift+Math.sin(v*2+b.ph)*5;
    const flap=Math.sin(2*Math.PI*b.f*v+b.ph)*(v<2.2?1:.55+.45*Math.sin(v*1.7+b.ph)); const wy=-4.2*flap*sc, wx=7.5*sc;
    ctx.strokeStyle=rgba(mixc([30,26,32],[70,52,50],dn),.9); ctx.lineWidth=1.6*sc+.4; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x-wx,y+wy); ctx.quadraticCurveTo(x-wx*.45,y-1.5*sc+wy*.3,x,y); ctx.quadraticCurveTo(x+wx*.45,y-1.5*sc+wy*.3,x+wx,y+wy); ctx.stroke(); }
  ctx.restore();
}
