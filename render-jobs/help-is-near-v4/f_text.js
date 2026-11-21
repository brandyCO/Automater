// ===================== the ayah, written in sync with what happens =====================
// A: frosts over as the wind bites. B: slams in with the tremor and keeps shaking.
// C: rises from his breath as he looks up. D: carried in on the gale that puts the fires out.
const PH=[
 {id:'A',words:['مَسَّتْهُمُ','ٱلْبَأْسَآءُ','وَٱلضَّرَّآءُ'],size:96,cy:330,t0:.3,dur:1.5,mode:'scatter',out:[11.4,12.4]},
 {id:'B',words:['وَزُلْزِلُوا۟'],size:120,cy:592,t0:T.b2,mode:'slam',out:[11.5,12.5]},
 {id:'C',words:['مَتَىٰ','نَصْرُ','ٱللَّهِ'],size:104,cy:330,t0:16.55,dur:1.25,mode:'breath'},
 {id:'D',words:['أَلَآ','إِنَّ','نَصْرَ','ٱللَّهِ','قَرِيبٌ'],size:100,cy:592,t0:21.3,dur:2.1,mode:'stream'},
 // E (v4): the rest of the ayah, gathering out of the dark as he is at his weakest; it gives way to C (their cry)
 {id:'E',words:['حَتَّىٰ','يَقُولَ','ٱلرَّسُولُ','وَٱلَّذِينَ','ءَامَنُوا۟','مَعَهُۥ'],size:92,cy:330,t0:11.2,dur:1.1,mode:'scatter',out:[15.95,16.95]}];
const EN=[
 {text:'Suffering and hardship touched them',cy:432,t0:1.55,out:[11.4,12.4],size:50},
 {text:'and they were shaken',cy:700,t0:5.5,out:[11.5,12.5],size:52},
 {text:'until the Messenger and those who believed with him said,',cy:432,t0:12.6,out:[15.95,16.95],size:41},
 {text:'When is the help of Allah?',cy:432,t0:17.45,size:52},
 {text:'Indeed, the help of Allah is near.',cy:700,t0:23.35,size:56}];
const REF={text:'AL-BAQARAH  ·  2:214',cy:790,t0:24.7};
const wordCv={};
function prepPhrase(ph){
  // fit the line inside the safe width
  const m=document.createElement('canvas').getContext('2d'); let size=ph.size; m.font=`${size}px AmiriQ`; let tot=ph.words.reduce((a,w)=>a+m.measureText(w).width,0)+34*(ph.words.length-1); if(tot>860) size=Math.floor(size*860/tot); ph.fs=size;
  wordCv[ph.id]=ph.words.map((w,wi)=>{
    const c=document.createElement('canvas'); const x=c.getContext('2d'); x.font=`${size}px AmiriQ`; const mw=x.measureText(w).width; const pad=40;
    c.width=Math.ceil(mw)+pad*2; c.height=Math.ceil(size*2.2); x.font=`${size}px AmiriQ`; x.direction='rtl'; x.textAlign='right'; x.textBaseline='middle'; x.fillStyle='#fff7ea'; x.fillText(w,c.width-pad,c.height*.5);
    const Wc=c.width,Hc=c.height; const img=x.getImageData(0,0,Wc,Hc); const A=img.data; const lab=new Int32Array(Wc*Hc).fill(-1); const areas=[];
    for(let p0=0;p0<Wc*Hc;p0++){ if(lab[p0]>=0||A[p0*4+3]<=10) continue; const id=areas.length; let n=0; const st=[p0]; lab[p0]=id;
      while(st.length){ const p=st.pop(); n++; const xx0=p%Wc, yy0=(p/Wc)|0; for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ const xx=xx0+dx, yy=yy0+dy; if(xx<0||yy<0||xx>=Wc||yy>=Hc) continue; const q=yy*Wc+xx; if(lab[q]<0&&A[q*4+3]>10){lab[q]=id; st.push(q);} } } areas.push(n); }
    const small=areas.map(n=>n<size*size*.09);
    const bI=new ImageData(Wc,Hc), mI=new ImageData(Wc,Hc);
    for(let p=0;p<Wc*Hc;p++){ const l=lab[p]; const dst=(l>=0&&small[l])?mI.data:bI.data; dst[p*4]=A[p*4];dst[p*4+1]=A[p*4+1];dst[p*4+2]=A[p*4+2];dst[p*4+3]=A[p*4+3]; }
    const base=document.createElement('canvas'); base.width=Wc; base.height=Hc; base.getContext('2d').putImageData(bI,0,0);
    const marks=document.createElement('canvas'); marks.width=Wc; marks.height=Hc; marks.getContext('2d').putImageData(mI,0,0);
    const R=rng(900+wi*31+ph.id.charCodeAt(0)*7); const P=[]; const W0=Wc-pad*2;
    for(let y=0;y<Hc;y+=3) for(let xx=0;xx<Wc;xx+=3){ if(A[(y*Wc+xx)*4+3]>140&&R()<.9){ const xn=clamp((xx-pad)/W0);
      const ang=-Math.PI*.15+(R()-.5)*2.2+(R()<.5?0:Math.PI), rad=90+R()*230;
      P.push({tx:xx,ty:y,xn,ox:xx+Math.cos(ang)*rad*1.3,oy:y+Math.sin(ang)*rad*.8,sw:(R()<.5?-1:1)*(40+R()*90),j:R()*.14,sz:1.3+R()*1.5,tw:R()*6,r1:R(),r2:R(),r3:R()}); } }
    return {c,base,marks,w:mw,pad,P};
  });
}
const tmpT=document.createElement('canvas'); tmpT.width=1100; tmpT.height=320; const tx=tmpT.getContext('2d');
const pcv=document.createElement('canvas'); pcv.width=1080; pcv.height=520; const px_=pcv.getContext('2d');
let mouthC=null; // where his breath is (screen) when he asks "when?"
function mouthScreen(){ if(mouthC) return mouthC; const t=PH[2].t0; const c=camFinal(t); const k=skeleton(figureState(t)); const z=c.z; mouthC=[540+(k.head[0]+6-c.x)*z, 960+(k.head[1]+4-c.y)*z]; return mouthC; }
const FLY=1.15;
function drawPhrase(ph,t){
  const ws=wordCv[ph.id]; const gap=34; const total=ws.reduce((a,w)=>a+w.w,0)+gap*(ws.length-1);
  // fading out on the wind (A and B), or the loop
  let alpha=1, outU=0; if(ph.out){ outU=inv(ph.out[0],ph.out[1],t); alpha=1-ss(0,.3,outU); }
  if(t<ph.t0-.01||outU>=1) return;
  let xr=540+total/2; let anyP=false; px_.clearRect(0,0,pcv.width,pcv.height); const py0=ph.cy-pcv.height/2;
  const n=ws.length; const aw=answerW(t), dn=dawn(t);
  ws.forEach((w,i)=>{
    const st0=ph.mode==='slam'?0:(ph.dur||1)*i/n; const tau=t-ph.t0-st0; const spread=.5*((ph.dur||1)/n+.6);
    // the word's own life: frost, tremble, slam, glow
    let dx=0,dy=0,sc=1,frostW=0,glow=0,shk=0;
    if(ph.id==='A'){ frostW=ss(T.b1+.03+i*.12,T.b1+.55+i*.12,t); const sv=shiverA(t); dx+=Math.sin(t*61+i*2)*.9*sv*frostW; dy+=Math.sin(t*53+i)*.5*sv*frostW;
      for(const d of [T.b1]){ const u=t-d; if(u>0&&u<.8){ dx+=-9*Math.sin(u*40)*Math.exp(-u*7); } } }
    if(ph.id==='B'||ph.id==='A'){ const u=t-T.b2; if(u>0){ shk=(ph.id==='B'?8:5)*Math.exp(-u*3.2)+(ph.id==='B'?1.8:.9)*(1-ss(4,5.2,u)); dx+=Math.sin(t*57+i)*shk; dy+=Math.sin(t*43+1.3)*shk*.6; } }
    if(ph.mode==='slam'){ const u=t-ph.t0; sc=1+.5*Math.pow(1-clamp(u/.2),2); }
    if(ph.id==='C'){ glow=.25*(.5+.5*Math.sin(breathPh(t)))*(1-aw)+.35*aw; }
    if(ph.id==='D'&&i===n-1){ const arr=ph.t0+st0+FLY; glow=.9*Math.exp(-Math.max(0,t-arr-.1)*1.4)*ss(arr-.1,arr+.15,t)+.32*ss(arr,arr+1.5,t)+.18*heartPulse(t)*ss(arr,arr+2,t); }
    const x0=xr-w.w-w.pad+dx, y0=ph.cy-w.c.height/2+dy;
    if(tau>-.05){
      // 1) light gathers into the letters (from his breath, from the gale, or out of the air)
      const done=spread+FLY+.6;
      if(ph.mode!=='slam'&&tau<done+.2&&outU<=0){ anyP=true; px_.globalCompositeOperation='lighter';
        for(const p of w.P){ const st=(1-p.xn)*spread+p.j; const u=clamp((tau-st)/FLY); if(u<=0) continue; const e=1-Math.pow(1-u,3); const q=1-e;
          let ox=p.ox+x0, oy=p.oy+y0-py0, mx=(ox+p.tx+x0)/2+p.sw*.6, my=(oy+p.ty+y0-py0)/2-p.sw*.35;
          if(ph.mode==='breath'){ const m=mouthScreen(); ox=m[0]+(p.r1-.5)*30; oy=m[1]-py0+(p.r2-.5)*20; mx=lerp(ox,p.tx+x0,.3)+(p.r3-.5)*160; my=lerp(oy,p.ty+y0-py0,.75)+60; }
          if(ph.mode==='stream'){ ox=1120+p.r1*380; oy=p.ty+y0-py0+(p.r2-.5)*150; mx=lerp(ox,p.tx+x0,.55)+(p.r3-.5)*80; my=oy+Math.sin(p.r1*9)*70; }
          const X=q*q*ox+2*q*e*mx+e*e*(p.tx+x0), Y=q*q*oy+2*q*e*my+e*e*(p.ty+y0-py0);
          const arrive=tau-st-FLY; let al=Math.min(1,u*4)*(arrive>0?Math.exp(-arrive*4.5):1)*(.55+.45*Math.sin(t*9+p.tw)); if(arrive>0&&arrive<.12) al=Math.min(1.4,al+(1-arrive/.12)*.8);
          const sz=p.sz*(1.4-.5*e); const warm=ph.mode==='stream'?1:0;
          px_.fillStyle=ph.mode==='breath'?`rgba(225,235,255,${al})`:`rgba(255,${(214+30*e)|0},${(150+80*e)|0},${al})`;
          if(ph.mode==='stream'&&u<.85){ px_.fillRect(X-sz/2,Y-sz/2,sz*(1+5*(1-u)),sz); } else px_.fillRect(X-sz/2,Y-sz/2,sz,sz); } }
      // 2) the letters fill in right to left as the light lands (or slam in whole)
      let fillT=tau-FLY+.15, xe=1-fillT/spread; if(ph.mode==='slam'){ fillT=tau+1; xe=-1; }
      if(fillT>0&&alpha>0){
        const soft=.22, W0=w.c.width-w.pad*2;
        tx.setTransform(1,0,0,1,0,0); tx.clearRect(0,0,tmpT.width,tmpT.height); tx.globalCompositeOperation='source-over'; tx.globalAlpha=1; tx.drawImage(w.base,0,0);
        const m=ph.mode==='slam'?1:clamp((tau-(spread+FLY+.05))/.9); if(m>0){ const off=-16*Math.exp(-4.2*m)*Math.cos(8*m); tx.globalAlpha=ss(0,.35,m); tx.drawImage(w.marks,0,off); tx.globalAlpha=1; }
        if(xe>-soft){ tx.globalCompositeOperation='destination-in'; const ex=w.pad+W0*xe; const gr=tx.createLinearGradient(ex-W0*soft*.3,0,ex+W0*soft,0); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,1)'); tx.fillStyle=gr; tx.fillRect(0,0,tmpT.width,tmpT.height); tx.globalCompositeOperation='source-over'; }
        // frost creeping over the letters
        if(frostW>0){ tx.globalCompositeOperation='source-atop'; tx.fillStyle=`rgba(160,198,255,${.55*frostW})`; tx.fillRect(0,0,tmpT.width,tmpT.height); tx.globalCompositeOperation='source-over'; }
        const settle=ph.mode==='slam'?Math.exp(-Math.max(0,t-ph.t0)*2.5):Math.exp(-Math.max(0,fillT-spread)*.8);
        ctx.save();
        const gc=mixc(mixc([170,195,255],[255,196,120],clamp(dn+glow+.35*settle+aw*.4)),[150,190,255],frostW*.7);
        ctx.shadowColor=rgba(gc,clamp(.34+.38*settle+glow*.9)); ctx.shadowBlur=20+34*settle+50*glow; ctx.globalAlpha=alpha*(ph.mode==='slam'?ss(ph.t0,ph.t0+.05,t):1);
        const cx=x0+w.c.width/2, cy=y0+w.c.height/2; ctx.translate(cx,cy); ctx.scale(sc,sc); ctx.translate(-cx,-cy);
        ctx.drawImage(tmpT,0,0,w.c.width,w.c.height,x0,y0,w.c.width,w.c.height); ctx.shadowBlur=0; ctx.drawImage(tmpT,0,0,w.c.width,w.c.height,x0,y0,w.c.width,w.c.height);
        ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=alpha*clamp(glow*.6+.45*settle*settle); ctx.drawImage(tmpT,0,0,w.c.width,w.c.height,x0,y0,w.c.width,w.c.height);
        ctx.restore();
        // frost sparkles
        if(frostW>.05&&alpha>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let k=0;k<w.P.length;k+=37){ const p=w.P[k]; const tw=.5+.5*Math.sin(t*3.1+p.tw*5); const a=frostW*tw*tw*.9*alpha; if(a<.05) continue; const X=p.tx+x0, Y=p.ty+y0, s=1.5+2.5*tw;
          ctx.strokeStyle=`rgba(230,242,255,${a})`; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(X-s,Y); ctx.lineTo(X+s,Y); ctx.moveTo(X,Y-s); ctx.lineTo(X,Y+s); ctx.stroke(); } ctx.restore(); }
        // the slam: a burst of grit off the word
        if(ph.mode==='slam'){ const u=t-ph.t0; if(u>0&&u<1.4){ ctx.save(); const R=rng(4242); for(let k=0;k<60;k++){ const a=R()*Math.PI*2, sp=80+R()*260, X=cx+Math.cos(a)*sp*eout(clamp(u/1.4))*1.1, Y=cy+Math.sin(a)*sp*.45*eout(clamp(u/1.4))+120*u*u; ctx.fillStyle=`rgba(200,206,220,${(1-u/1.4)*.7})`; ctx.fillRect(X,Y,1.5+R()*2,1.5+R()*2); } ctx.restore(); } }
      }
    }
    // 3) blown away by the wind: the letters break into grit and fly off left
    if(outU>0&&outU<1){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let k=0;k<w.P.length;k+=2){ const p=w.P[k]; const d=clamp((outU-p.xn*.25)/.75); if(d<=0||d>=1) continue; const X=p.tx+x0-d*d*(500+p.r1*500)-d*60, Y=p.ty+y0+Math.sin(d*6+p.tw)*20*d-d*30*p.r2;
        ctx.fillStyle=`rgba(220,232,255,${(1-d)*.8})`; ctx.fillRect(X,Y,p.sz*(1+3*d),p.sz*.8); } ctx.restore(); }
    xr-=w.w+gap;
  });
  if(anyP){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.filter='blur(6px)'; ctx.globalAlpha=.9; ctx.drawImage(pcv,0,py0); ctx.filter='blur(2px)'; ctx.drawImage(pcv,0,py0); ctx.filter='none'; ctx.globalAlpha=1; ctx.drawImage(pcv,0,py0); ctx.restore(); }
}
function wrapEN(text,font,maxw){ ctx.font=font; const words=text.split(' '); const lines=[[]]; for(const w of words){const cur=lines[lines.length-1]; const test=[...cur,w].join(' '); if(ctx.measureText(test).width>maxw&&cur.length) lines.push([w]); else cur.push(w);} return lines; }
function drawEN(e,t){
  let alpha=1, outU=0; if(e.out){ outU=inv(e.out[0],e.out[1],t); alpha=1-ss(0,.45,outU); } if(t<e.t0||alpha<=0) return;
  const font=`italic ${e.size}px CormI`; const lines=wrapEN(e.text,font,880); ctx.save(); ctx.font=font; ctx.textBaseline='middle'; let idx=0;
  lines.forEach((ln,li)=>{ const full=ln.join(' '); let x=540-ctx.measureText(full).width/2; const y=e.cy+li*(e.size*1.15);
    ln.forEach(w=>{ const st=e.t0+idx*.11; const p=sm(inv(st,st+.9,t)); idx++; if(p>0){ ctx.globalAlpha=alpha*p; ctx.filter=`blur(${((1-p)*6+outU*4).toFixed(1)}px)`; ctx.fillStyle='#f7efe2'; ctx.shadowColor='rgba(0,0,0,.7)'; ctx.shadowBlur=16; ctx.fillText(w,x-outU*outU*160,y+(1-p)*12); } x+=ctx.measureText(w+' ').width; }); });
  ctx.filter='none'; ctx.restore(); }
function drawRef(t){ const p=sm(inv(REF.t0,REF.t0+1,t)); if(p<=0) return; ctx.save(); ctx.font='32px Corm'; ctx.letterSpacing='7px'; ctx.textAlign='center'; ctx.fillStyle=`rgba(244,230,206,${.78*p})`; ctx.shadowColor='rgba(0,0,0,.6)'; ctx.shadowBlur=10; ctx.fillText(REF.text,540,REF.cy); ctx.restore(); }
function drawText(t){
  // a soft dark veil behind the words so they read over the fires and the dawn
  const va=.28*ss(.2,1,t); if(va>0){ const g=ctx.createLinearGradient(0,220,0,820); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.3,`rgba(4,6,12,${va})`); g.addColorStop(.75,`rgba(4,6,12,${va})`); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,220,W,600); }
  for(const ph of PH) drawPhrase(ph,t); for(const e of EN) drawEN(e,t); drawRef(t);
}
