// ===================== fire arrows (the siege by night) =====================
// Loosed from the enemy lines on the right. They fall before him and behind him, never into his trench.
// Each one flies a true ballistic arc (gravity 908 u/s^2), sticks quivering in the earth and burns there
// until the gale reaches it: the flame is torn flat and out, the shaft leans over, and the wind rips it from the ground.
const AR_L=66, AR_B=13;   // shaft length; the burning bundle sits this far behind the point
const ARROWS=(()=>{
  const L=[[5.47,268],[5.55,-170],[5.64,340],[5.76,-235],[5.90,300],[6.02,112],[6.24,410],[6.70,-122],[6.88,-300],[7.02,-380],[8.05,375],[8.40,-290],
    [9.40,500],[9.48,-360],[9.58,540],[9.66,-270],[9.80,-470],[9.92,585],[10.06,-330],[10.26,-420]];
  const r=rng(2214), o=[];
  for(const [tl,dx] of L){ const x=TX+dx, y=groundY(x); const sp=2100+r()*300, th=(50+r()*14)*D;
    const a={tl,x,y,dx,vx:-sp*Math.cos(th),vy:sp*Math.sin(th),th,dp:9+r()*5,seed:r()*100,qa:3.5+r()*2.5,qf:11+r()*4,s:.9+r()*.2};
    let lo=20.6,hi=27; for(let k=0;k<40;k++){const m=(lo+hi)/2; if(galeX(m)>x+30) lo=m; else hi=m;}   // when the gale reaches it
    a.out=hi; a.rip=a.out+.17+r()*.2; a.spin=-(7+r()*6); a.lift=110+r()*130; a.drift=.8+r()*.4;
    a.sparks=[...Array(12)].map((_,j)=>({te:tl-.5+j*.04+r()*.02,vx:(r()-.5)*120,vy:-(20+r()*90),life:.22+r()*.2}));
    a.burst=[...Array(9)].map(()=>{const an=-Math.PI*(.1+.8*r()); return {vx:Math.cos(an)*(80+r()*200),vy:Math.sin(an)*(90+r()*170),life:.3+r()*.35};});
    o.push(a);
    DUSTS.push({t:tl,x,y:y-1,n:7,s:.6}); }
  return o; })();
const SMOKE=document.createElement('canvas'); SMOKE.width=SMOKE.height=64; {const g=SMOKE.getContext('2d'); const rg=g.createRadialGradient(32,32,0,32,32,32); rg.addColorStop(0,'rgba(58,52,54,1)'); rg.addColorStop(.6,'rgba(48,44,46,.45)'); rg.addColorStop(1,'rgba(40,38,40,0)'); g.fillStyle=rg; g.fillRect(0,0,64,64);}
const rot2=(v,a)=>{const c=Math.cos(a),s=Math.sin(a); return [v[0]*c-v[1]*s, v[0]*s+v[1]*c];};
// in flight: position of the point and its velocity, u seconds before it lands
function arFly(a,t){ const u=a.tl-t; return {x:a.x-a.vx*u, y:a.y-a.vy*u+.5*GRAV*u*u, vx:a.vx, vy:a.vy-GRAV*u}; }
// the pose at time t: point, unit direction (tail to point), shaft bend, phase
function arPose(a,t){
  if(t<a.tl){ const f=arFly(a,t), v=Math.hypot(f.vx,f.vy); return {tip:[f.x,f.y],d:[f.vx/v,f.vy/v],bend:0,ph:0}; }
  const u=t-a.tl, v0=Math.hypot(a.vx,a.vy); let d=[a.vx/v0,a.vy/v0];
  // it bites in, then shivers from the blow
  let ang=a.qa*D*Math.exp(-u*7)*Math.sin(2*Math.PI*a.qf*u);
  // the gale: it shudders, then is pushed over toward the left
  const g=ss(a.out-.12,a.out,t); ang+=g*3*D*Math.sin(t*41+a.seed)-ss(a.out,a.rip,t)*(20+a.seed%9)*D;
  if(t<a.rip){ d=rot2(d,ang); const pen=a.dp*ss(0,.016,u); const tip=[a.x+d[0]*pen,a.y+d[1]*pen]; return {tip,d,bend:2.6*Math.exp(-u*9)*Math.sin(2*Math.PI*a.qf*u+1.3)+g*1.6*Math.sin(t*37),ph:1}; }
  // ripped out and thrown along on the wind, tumbling
  const dr=rot2(d,ang), v=t-a.rip; const C0=[a.x+dr[0]*(a.dp-AR_L/2), a.y+dr[1]*(a.dp-AR_L/2)];
  const pull=(a.dp+3)*ss(0,.06,v), w=Math.max(0,v-.03);
  const C=[C0[0]-dr[0]*pull-(220*w+1200*a.drift*w*w), C0[1]-dr[1]*pull-a.lift*w+260*w*w];
  const ps=Math.atan2(dr[1],dr[0])+a.spin*w*(1-Math.exp(-w*4)); const dd=[Math.cos(ps),Math.sin(ps)];
  return {tip:[C[0]+dd[0]*AR_L/2,C[1]+dd[1]*AR_L/2],d:dd,bend:3*Math.sin(v*30)*Math.exp(-v*3),ph:2};
}
const arFire=(a,t)=>{ if(t<a.tl) return 1; const u=t-a.tl; return (1+.9*Math.exp(-u*6)*(1-Math.exp(-u*60)))*(1-ss(a.out-.02,a.out+.12,t)); };
function arShaft(p,dn,al,lit){ const {tip,d}=p; const n=[-d[1],d[0]]; const tail=[tip[0]-d[0]*AR_L,tip[1]-d[1]*AR_L];
  const m=[(tip[0]+tail[0])/2+n[0]*p.bend,(tip[1]+tail[1])/2+n[1]*p.bend];
  ctx.lineCap='round'; ctx.strokeStyle=rgba(mixc([40,30,26],[86,66,54],dn),al); ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(...tail); ctx.quadraticCurveTo(...m,...tip); ctx.stroke();
  // the fire lights its own shaft
  if(lit>.02){ const b=[tip[0]-d[0]*AR_B,tip[1]-d[1]*AR_B], e=[tip[0]-d[0]*34+n[0]*p.bend*.5,tip[1]-d[1]*34+n[1]*p.bend*.5]; const g=ctx.createLinearGradient(...b,...e); g.addColorStop(0,`rgba(255,170,90,${.75*Math.min(1,lit)*al})`); g.addColorStop(1,'rgba(255,150,80,0)'); ctx.strokeStyle=g; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(...b); ctx.lineTo(...e); ctx.stroke(); }
  // fletching: two small vanes at the tail
  const f0=[tail[0]+d[0]*1.5,tail[1]+d[1]*1.5], f1=[tail[0]+d[0]*11,tail[1]+d[1]*11]; ctx.fillStyle=rgba(mixc([92,84,80],[190,170,150],dn),al*.85);
  for(const sg of [1,-1]){ ctx.beginPath(); ctx.moveTo(...f1); ctx.quadraticCurveTo(f0[0]+d[0]*4+n[0]*sg*3.6,f0[1]+d[1]*4+n[1]*sg*3.6,f0[0]-d[0]*1.2+n[0]*sg*3.2,f0[1]-d[1]*1.2+n[1]*sg*3.2); ctx.lineTo(...f0); ctx.closePath(); ctx.fill(); }
  // the iron head and, behind it, the bundle of pitch-soaked rag
  ctx.fillStyle=rgba(mixc([24,24,30],[66,66,76],dn),al); ctx.beginPath(); ctx.moveTo(tip[0]+d[0]*1.5,tip[1]+d[1]*1.5); ctx.lineTo(tip[0]-d[0]*6+n[0]*2.3,tip[1]-d[1]*6+n[1]*2.3); ctx.lineTo(tip[0]-d[0]*4.5,tip[1]-d[1]*4.5); ctx.lineTo(tip[0]-d[0]*6-n[0]*2.3,tip[1]-d[1]*6-n[1]*2.3); ctx.closePath(); ctx.fill();
  const b=[tip[0]-d[0]*AR_B,tip[1]-d[1]*AR_B]; ctx.fillStyle=rgba(mixc([26,20,18],[60,46,40],dn),al); ctx.beginPath(); ctx.ellipse(b[0],b[1],5.2,2.5,Math.atan2(d[1],d[0]),0,7); ctx.fill(); }
// one tongue of flame: base b, axis ax (unit), height h, half-width w, bend curls the tip sideways
function tongue(b,ax,h,w,bend,al){ const n=[-ax[1],ax[0]]; const P=(u,v)=>[b[0]+ax[0]*u*h+n[0]*(v*w+bend*u*u*h), b[1]+ax[1]*u*h+n[1]*(v*w+bend*u*u*h)];
  ctx.globalAlpha=clamp(al); ctx.beginPath(); ctx.moveTo(...P(0,-1)); ctx.bezierCurveTo(...P(.35,-1.15),...P(.7,-.45),...P(1,0)); ctx.bezierCurveTo(...P(.72,.4),...P(.35,1.1),...P(0,1)); ctx.quadraticCurveTo(...P(-.14,0),...P(0,-1)); ctx.fill(); }
// a living fire: three flickering tongues, each deep orange around a hotter heart, over one white-hot core
function fireTuft(b,ax,h,w,bend,I,t,sd){ if(I<=.004) return; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.shadowColor='rgba(255,110,40,.85)'; ctx.shadowBlur=9;
  const n=[-ax[1],ax[0]];
  for(const [o,hk,ph] of [[-.4,.62,1.7],[0,1,0],[.38,.54,3.1]]){ const f=.8+.2*Math.sin(t*(17+ph*3)+sd+ph)+.14*vnoise(t*9+ph*5,sd); const bb=[b[0]+n[0]*o*w*1.5,b[1]+n[1]*o*w*1.5]; const hh=h*hk*f, ww=w*(.5+.5*hk); const bd=bend+Math.sin(t*11+ph+sd)*.12;
    ctx.fillStyle='rgba(255,92,30,1)'; tongue(bb,ax,hh,ww,bd,.6*I);
    ctx.fillStyle='rgba(255,166,64,1)'; tongue(bb,ax,hh*.72,ww*.62,bd,.55*I); }
  ctx.shadowBlur=0; ctx.fillStyle='rgba(255,236,190,1)'; tongue(b,ax,h*.4,w*.45,bend*.6,.85*Math.min(1,I));
  ctx.restore(); }
// shafts: drawn before the near earth, so the buried point is hidden by the ground itself
function drawArrows(t){ const dn=dawn(t); ctx.save(); worldT();
  for(const a of ARROWS){ if(t<a.tl-1.1) continue; const p=arPose(a,t); if(p.ph===2&&t-a.rip>1.6) continue;
    const q=p.ph===1?quake(t):0; ctx.save(); ctx.translate(0,q);
    // in flight: a short smear of the shaft behind it (motion blur)
    if(p.ph===0){ for(let k=3;k>=1;k--){ const pp=arPose(a,t-k/240); arShaft(pp,dn,.18,0); } }
    arShaft(p,dn,1,p.ph<2?arFire(a,t):0); ctx.restore(); }
  ctx.restore(); }
// fire, smoke, sparks and light: drawn over the earth
function drawArrowFire(t){ const dn=dawn(t); ctx.save(); worldT();
  for(const a of ARROWS){ if(t<a.tl-1.1||t>a.rip+1.6) continue; const p=arPose(a,t); const I=p.ph<2?arFire(a,t):0; const sd=a.seed;
    const q=p.ph===1?quake(t):0; ctx.save(); ctx.translate(0,q);
    const B=[p.tip[0]-p.d[0]*AR_B,p.tip[1]-p.d[1]*AR_B]; const fl=.75+.25*fbm(t*7+sd,sd)+.08*Math.sin(t*23+sd*3);
    if(p.ph===0){
      // smoke left hanging along its path
      ctx.globalCompositeOperation='source-over';
      for(let k=12;k>=1;k--){ const age=k*.028, tb=t-age; if(tb<a.tl-1.1) continue; const pp=arPose(a,tb); const bx=pp.tip[0]-pp.d[0]*AR_B-age*(30+40*windAt(pp.tip[0],t)), by=pp.tip[1]-pp.d[1]*AR_B-age*14; const r=3+age*40;
        ctx.globalAlpha=.2*(1-k/13); ctx.drawImage(SMOKE,bx-r,by-r,r*2,r*2); }
      ctx.globalAlpha=1; ctx.globalCompositeOperation='lighter';
      // a tapered ribbon of fire streaming behind it
      { const pts=[B]; for(let k=1;k<=10;k++){ const pp=arPose(a,t-k*.011); pts.push([pp.tip[0]-pp.d[0]*AR_B,pp.tip[1]-pp.d[1]*AR_B]); }
        const L=[],R=[]; for(let k=0;k<pts.length;k++){ const p0=pts[Math.max(0,k-1)], p1=pts[Math.min(pts.length-1,k+1)]; let dx=p1[0]-p0[0], dy=p1[1]-p0[1]; const l=Math.hypot(dx,dy)||1; const w=4.2*(1-k/pts.length)+.3; L.push([pts[k][0]-dy/l*w,pts[k][1]+dx/l*w]); R.push([pts[k][0]+dy/l*w,pts[k][1]-dx/l*w]); }
        const e=pts[pts.length-1]; const g=ctx.createLinearGradient(B[0],B[1],e[0],e[1]); g.addColorStop(0,'rgba(255,170,80,.7)'); g.addColorStop(.4,'rgba(255,120,50,.32)'); g.addColorStop(1,'rgba(255,90,40,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(...L[0]); for(const q of L.slice(1)) ctx.lineTo(...q); for(const q of R.reverse()) ctx.lineTo(...q); ctx.closePath(); ctx.fill(); }
      ctx.globalAlpha=.85; const gr=30*fl; ctx.drawImage(GLOW,B[0]-gr,B[1]-gr,gr*2,gr*2); ctx.globalAlpha=1;
      // the flame is dragged back by its own speed
      fireTuft([B[0]+p.d[0]*3,B[1]+p.d[1]*3],[-p.d[0],-p.d[1]],(24+8*fl)*a.s,4.4*a.s,Math.sin(t*29+sd)*.1,1,t,sd);
    } else if(I>.004){
      ctx.globalCompositeOperation='source-over';
      // smoke rising off it, bent by the wind
      const wl=windAt(a.x,t); for(let k=0;k<7;k++){ const ph=fr(t*.42+k/7+sd*.13), age=ph*2.6; const x=B[0]-age*(16+wl*30)+Math.sin(age*2+k)*4, y=B[1]-6-age*(34-wl*6); const r=3+age*10;
        ctx.globalAlpha=.2*Math.sin(Math.PI*ph)*Math.min(1,I); ctx.drawImage(SMOKE,x-r,y-r,r*2,r*2); }
      ctx.globalAlpha=1; ctx.globalCompositeOperation='lighter';
      // the earth around it lit orange
      const gl=ctx.createRadialGradient(B[0],a.y,0,B[0],a.y,70); gl.addColorStop(0,`rgba(255,140,70,${.3*Math.min(1.4,I)})`); gl.addColorStop(1,'rgba(255,120,60,0)'); ctx.save(); ctx.translate(B[0],a.y); ctx.scale(1,.22); ctx.translate(-B[0],-a.y); ctx.fillStyle=gl; ctx.fillRect(B[0]-70,a.y-70,140,140); ctx.restore();
      const gr=34*fl*Math.min(1.5,I); ctx.globalAlpha=Math.min(1,.8*I); ctx.drawImage(GLOW,B[0]-gr,B[1]-gr*1.1,gr*2,gr*2); ctx.globalAlpha=1;
      // the flame stands up off the rag, leaning with the wind; the gale lays it flat
      const app=ss(a.out-.4,a.out,t); const lean=clamp(wl*.3,0,1.1)+1.5*app; const fh=(15+5*fl)*a.s*Math.min(1.6,I)*(1+.5*app), fw=5.4*a.s*(1-.3*app);
      { const ax=[-lean*.9,-(1-.55*clamp(lean/2))]; const l=Math.hypot(ax[0],ax[1]); fireTuft([B[0],B[1]+2],[ax[0]/l,ax[1]/l],fh*1.15,fw,-.12-.18*lean,I,t,sd); }
      // embers lifting off it
      ctx.fillStyle='rgba(255,196,120,1)'; for(let k=0;k<4;k++){ const ph=fr(t*.75+k/4+sd*.31), age=ph*1.5; const x=B[0]-age*(22+wl*34)+Math.sin(age*6+k*2)*5, y=B[1]-8-age*60+age*age*8;
        ctx.globalAlpha=(1-ph)*Math.min(1,I); ctx.beginPath(); ctx.arc(x,y,.9,0,7); ctx.fill(); }
      ctx.globalAlpha=1;
    }
    ctx.globalCompositeOperation='lighter';
    // sparks shed in flight keep falling on their own
    ctx.fillStyle='rgba(255,206,130,1)'; for(const s of a.sparks){ const v=t-s.te; if(v<0||v>s.life) continue; const f=arFly(a,s.te); const sb=[f.x-a.vx/Math.hypot(a.vx,a.vy)*AR_B,f.y]; const vv=[f.vx*.12+s.vx,f.vy*.12+s.vy];
      const x=sb[0]+vv[0]*v, y=sb[1]+vv[1]*v+.5*GRAV*v*v; if(y>groundY(x)) continue; ctx.globalAlpha=1-v/s.life; ctx.beginPath(); ctx.arc(x,y,.9,0,7); ctx.fill(); }
    // the blow as it lands: a spray of sparks and a flash
    const u=t-a.tl; if(u>=0&&u<.7){ for(const s of a.burst){ if(u>s.life) continue; const x=a.x+s.vx*u-u*u*30, y=a.y-2+s.vy*u+.5*GRAV*u*u; if(y>a.y+2) continue; ctx.globalAlpha=1-u/s.life; ctx.beginPath(); ctx.arc(x,y,1,0,7); ctx.fill(); }
      const fa=Math.exp(-u*14); if(fa>.02){ ctx.globalAlpha=fa*.9; ctx.drawImage(GLOW,a.x-46,a.y-46,92,92); } }
    // the gale snuffs it: a gust of smoke and a streak of embers thrown off to the left
    const w=t-a.out; if(w>0&&w<1.3){ ctx.globalCompositeOperation='source-over'; for(let k=0;k<6;k++){ const x=B[0]-w*(150+k*45)*(1-.25*w), y=B[1]-6-w*(26+k*9); const r=4+w*24; ctx.globalAlpha=.3*Math.pow(1-w/1.3,1.4); ctx.drawImage(SMOKE,x-r,y-r,r*2,r*2); }
      ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='rgba(255,180,100,1)'; ctx.lineWidth=1.1; ctx.lineCap='round';
      for(let k=0;k<7;k++){ const wv=w-k*.02; if(wv<0||wv>.6) continue; const vx=-(320+k*70), vy=-(50+k*14); const x=B[0]+vx*wv, y=B[1]-4+vy*wv+60*wv*wv; ctx.globalAlpha=1-wv/.6; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-vx*.02,y-vy*.02); ctx.stroke(); } }
    ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; ctx.restore(); }
  ctx.restore(); }
