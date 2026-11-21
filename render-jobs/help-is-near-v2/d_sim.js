// ===================== physics pass (deterministic, 240 Hz, from -3 s) =====================
const SIM_DT=1/240, SIM_T0=-3;
const SIM={cam:[],cloak:[],pick:[],wint:[],sword:[]};
const SWEV={};   // moments the sword sim finds (the blade clears the scabbard, the scabbard lands)
const simIdx=t=>clamp(Math.round((t-SIM_T0)/SIM_DT),0,SIM.cam.length-1);
const simAt=(arr,t)=>arr[clamp(Math.round((t-SIM_T0)/SIM_DT),0,arr.length-1)];
const EV=[]; // sound events found by the physics (pick landings)
// ---------- the camera (2D choreography; a spring rig so it never snaps) ----------
const CAMK=[
 [-3,560,1331,2.5],[0,560,1331,2.5],[1.0,561,1333,2.52],[4.8,566,1338,2.62],[5.5,566,1342,2.55],
 [5.85,575,1322,2.45],[6.25,640,1334,2.3],[6.6,600,1330,2.32],[7.05,430,1318,2.28],[7.5,436,1320,2.28],[7.95,540,1330,2.3],
 [8.45,546,1318,2.15],[9.55,560,1172,1.04],[10.15,560,1168,1.03],
 [10.95,540,1352,2.05],[11.7,538,1356,2.2],[13.1,544,1336,2.12],[14.9,544,1324,2.1],[15.6,540,1344,2.24],[16.2,538,1348,2.33],
 [17.25,530,1352,2.78],[17.65,528,1362,2.86],[18.6,522,1398,3.16],[20.7,522,1400,3.18],
 [21.8,640,1262,1.6],[22.9,760,1172,1.12],[23.7,700,1182,1.15],[24.5,560,1222,1.36],[25.5,440,1212,1.26],[26.7,410,1204,1.2],
 [27.8,480,1244,1.46],[28.8,520,1300,1.8],[30.3,530,1330,2.0],[32.1,560,1310,1.85],[33.4,592,1268,1.68],[34.6,622,1218,1.42],
 [35.7,664,1162,1.2],[36.8,742,1150,1.24],[37.6,812,1112,1.42],[38.5,826,1094,1.58],[39.15,830,1090,1.62],[40.0,832,1098,1.62],[40.7,834,1106,1.6],
 [42.2,560,1331,2.5],[60,560,1331,2.5]];
function camKey(t){
  const K=CAMK, n=K.length; if(t<=K[0][0]) return {x:K[0][1],y:K[0][2],z:K[0][3]}; if(t>=K[n-1][0]) return {x:K[n-1][1],y:K[n-1][2],z:K[n-1][3]};
  let i=0; while(t>K[i+1][0]) i++; const t0=K[i][0],t1=K[i+1][0],u=(t-t0)/(t1-t0),h=t1-t0;
  const tan=(j,c)=>{ if(j<=0||j>=n-1) return 0; if(K[j+1][1]===K[j][1]&&K[j+1][2]===K[j][2]&&K[j+1][3]===K[j][3]) return 0; return (K[j+1][c]-K[j-1][c])/(K[j+1][0]-K[j-1][0])*.85; };
  const Hm=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u; return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return {x:Hm(1),y:Hm(2),z:Hm(3)};
}
// global wind (drives the streaks, the grit and the sound)
const windG=t=>Math.max(windS(t)*(1-ss(20.6,21.4,t)),3.2*galeA(t))+breeze(t);
// ---------- the slab and its rubble ----------
const SLAB_LAND=T.b2+Math.sqrt(2*((FL-12)-SLAB_C[1])/GRAV);
const RUBBLE=(()=>{const r=rng(55),o=[]; for(let i=0;i<7;i++){ const n=6, rr=5+r()*7, pts=[]; for(let k=0;k<n;k++){const a=k/n*Math.PI*2; const q=rr*(.7+r()*.5); pts.push([Math.cos(a)*q,Math.sin(a)*q*.7]);}
  o.push({pts,x:TX+8+i*7+r()*6,y:FL-rr*.55,rot:r()*3,dx:(r()-.4)*30,del:r()*.06}); } return o;})();
// ---------- clods: real ballistic arcs ----------
const CLODS=[];
function addClods(t0,x0,y0,n,power,seed){ const r=rng(seed); for(let i=0;i<n;i++){ const ang=(-60-r()*70)*D; const sp=(260+r()*360)*power; const c={t0:t0+r()*.03,x0:x0+(r()-.5)*10,y0:y0-2,vx:Math.cos(ang)*sp*(r()<.3?-1:1)+60,vy:Math.sin(ang)*sp,r:1.6+r()*3.2,rot:r()*6,vr:(r()-.5)*14,land:null};
  let x=c.x0,y=c.y0,vx=c.vx,vy=c.vy; for(let k=0;k<1200;k++){ const tt=k/240; x=c.x0+vx*tt; y=c.y0+vy*tt+.5*GRAV*tt*tt; const inT=x>wallL(Math.min(y,FL))+2&&x<wallR(Math.min(y,FL))-2&&y>G; const gy=inT?FL:(y<G-40?1e9:groundY(x)); if(tt>.05&&y>=gy-c.r*.5&&vy+GRAV*tt>0){ c.land={t:c.t0+tt,x,y:gy-c.r*.5}; break; } }
  CLODS.push(c); } }
// ---------- the main pass ----------
function simulate(full){
  const N=11, SEG=8.6;
  let cl=null, clo=null;          // cloak points and previous points
  let pk=null, pko=null;          // pick: [grip, head] verlet
  let cx=null,cy,cz,vx=0,vy=0,vz=0; let wi=0; let flung=false, released=false;
  let svB=null, svBo=null, scP=null, scPo=null, tClear=null, plantG=null, prevMC=null, dClear=null, scLand=0;
  const pinPick=(s)=>{ const p=s.pick; return [[p.rear[0],p.rear[1]],[p.head[0],p.head[1]]]; };
  for(let t=SIM_T0;t<=T.END+2;t+=SIM_DT){
    const s=figureState(t);
    if(full){
      // camera spring
      const g=camKey(t); if(cx===null){cx=g.x;cy=g.y;cz=g.z;}
      const k=15, c=2*.94*Math.sqrt(k);
      vx+=(k*(g.x-cx)-c*vx)*SIM_DT; cx+=vx*SIM_DT; vy+=(k*(g.y-cy)-c*vy)*SIM_DT; cy+=vy*SIM_DT; vz+=(k*(g.z-cz)-c*vz)*SIM_DT; cz+=vz*SIM_DT;
      SIM.cam.push([cx,cy,cz]);
      wi+=windG(t)*SIM_DT; SIM.wint.push(wi);
    }
    // ---- the pick ----
    if(t<T.b2||!pk){ if(s.pick){ const P=pinPick(s); if(pk) pko=pk.map(p=>p.slice()); pk=P; if(!pko) pko=P.map(p=>p.slice()); } }
    else {
      if(!flung){ flung=true; // the jolt tears it out of his hands: it jumps, then clatters down
        pko=[[pk[0][0]+150*SIM_DT,pk[0][1]+250*SIM_DT],[pk[1][0]+50*SIM_DT,pk[1][1]+280*SIM_DT]]; }
      const pinned=t>=T.grab&&t<T.slip, PU=.78;   // held in his near hand, close to the head (balanced)
      if(t>=T.slip&&!released){ released=true; pko=pk.map(p=>[p[0],p[1]-.15]); }   // it slips: it drops, it does not fly
      const ms=[1,3];
      for(let i=0;i<2;i++){ const p=pk[i],o=pko[i]; const nx=p[0]+(p[0]-o[0])*.996, ny=p[1]+(p[1]-o[1])*.996+GRAV*SIM_DT*SIM_DT; pko[i]=[p[0],p[1]]; pk[i]=[nx,ny]; }
      const pin=()=>{ if(!pinned) return; const h=s.hN; const c=[lerp(pk[0][0],pk[1][0],PU),lerp(pk[0][1],pk[1][1],PU)]; const dx=h[0]-c[0], dy=h[1]-c[1]; for(const p of pk){ p[0]+=dx; p[1]+=dy; } };
      const hit=[false,false], vin=[0,0];
      for(let it=0;it<8;it++){
        pin();
        const a=pk[0],b=pk[1]; const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,df=(d-PL)/d; const wa=ms[1]/(ms[0]+ms[1]), wb=ms[0]/(ms[0]+ms[1]); a[0]+=dx*df*wa;a[1]+=dy*df*wa;b[0]-=dx*df*wb;b[1]-=dy*df*wb;
        for(let i=0;i<2;i++){ const p=pk[i],o=pko[i]; const rad=i?4:2;
          if(p[1]>G){ const xl=wallL(Math.min(p[1],FL))+rad, xr=wallR(Math.min(p[1],FL))-rad; if(p[0]<xl){ p[0]=xl; o[0]=p[0]; } if(p[0]>xr){ p[0]=xr; o[0]=p[0]; } }
          const fl=p[1]>G-1&&p[0]>TX-TWL&&p[0]<TX+TWL?FL-rad:groundY(p[0])-rad;
          if(p[1]>fl){ if(!hit[i]){ hit[i]=true; vin[i]=(p[1]-o[1])/SIM_DT; } p[1]=fl; } }
      }
      pin();
      for(let i=0;i<2;i++){ if(!hit[i]||pinned) continue; const p=pk[i],o=pko[i]; if(vin[i]>120&&full) EV.push({t,type:'pickland',v:vin[i],head:i});
        o[1]=p[1]+Math.max(0,vin[i]*SIM_DT)*.28; const vx=(p[0]-o[0])/SIM_DT; o[0]=Math.abs(vx)<6?p[0]:p[0]-(p[0]-o[0])*(vin[i]>60?.6:.975); }
    }
    if(!full&&t>10.5){ PICK_REST={g:[pk[0][0]-TX,pk[0][1]-FL],h:[pk[1][0]-TX,pk[1][1]-FL]}; return; }
    if(full) SIM.pick.push(pk?[pk[0][0],pk[0][1],pk[1][0],pk[1][1]]:null);
    // ---- the cloak: a cloth chain from his upper back, pushed by the wind ----
    if(full){
      const sk=skeleton(s); const anc=[sk.sh[0]+(sk.head[0]-sk.sh[0])*.16+sk.uy*3*sk.m, sk.sh[1]+(sk.head[1]-sk.sh[1])*.16-sk.ux*3];
      if(!cl){ cl=[];clo=[]; for(let k=0;k<N;k++){ cl.push([anc[0]-k*SEG*.8,anc[1]+k*SEG*.6]); clo.push([anc[0]-k*SEG*.8,anc[1]+k*SEG*.6]); } }
      const wl=windAt(TX,t);
      for(let k=1;k<N;k++){ const p=cl[k],o=clo[k]; const vxp=(p[0]-o[0])/SIM_DT, vyp=(p[1]-o[1])/SIM_DT;
        const inT=(p[1]>G-3&&p[0]>TX-TWL-6&&p[0]<TX+TWL+6); const ws_=windS(t)*(1-ss(20.6,21.4,t)), wg_=Math.max(0,wl-ws_);
        const sp=(ws_*(inT?.5:1)+wg_*(inT?.1:1))*560; const tu=fbm(t*2.6+k*.33,4)*.55, tv=fbm(t*3.1+k*.41,9)*.5;
        const wvx=-sp*(1+tu*.5), wvy=sp*tv*.55-sp*.06;
        const cd=(1.2+3.6*k/N);
        let ax=cd*(wvx-vxp), ay=cd*(wvy-vyp)+GRAV*.92;
        const nx=p[0]+(p[0]-o[0])*.985+ax*SIM_DT*SIM_DT, ny=p[1]+(p[1]-o[1])*.985+ay*SIM_DT*SIM_DT;
        clo[k]=[p[0],p[1]]; cl[k]=[nx,ny]; }
      cl[0]=anc; clo[0]=anc;
      // wrapped round him by his hand, until the gust tears it away
      const wrapW=ss(T.wrap[0]+.1,T.wrap[1],t)*(1-ss(T.tear,T.tear+.06,t));
      for(let it=0;it<5;it++){
        for(let k=1;k<N;k++){ const a=cl[k-1],b=cl[k]; const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,df=(d-SEG)/d; if(k>1){a[0]+=dx*df*.5;a[1]+=dy*df*.5;b[0]-=dx*df*.5;b[1]-=dy*df*.5;} else {b[0]-=dx*df;b[1]-=dy*df;} }
        if(wrapW>0){ const h=s.hN; const q=cl[6]; q[0]=lerp(q[0],h[0]+3,wrapW*.5); q[1]=lerp(q[1],h[1]+4,wrapW*.5); }
        for(let k=1;k<N;k++){ const p=cl[k]; if(p[1]>G-2&&p[0]>TX-TWL-4&&p[0]<TX+TWL+4){ p[1]=Math.min(p[1],FL-2); p[0]=clamp(p[0],wallL(Math.min(p[1],FL))+2,wallR(Math.min(p[1],FL))-2); } else { const gy=groundY(p[0])-2; if(p[1]>gy) p[1]=gy; } }
      }
      SIM.cloak.push(cl.map(p=>[p[0],p[1]]));
      // ---- his sword: lying sheathed on the crest; it swings from his hand as he lifts it; drawn up out of the scabbard; the scabbard falls ----
      { const hN=sk.arms[0].h, hF=sk.arms[1].h, L1=SWG+SCL; let G,d,M,md,ph=0,ext=0;
        const nrm=v=>{const l=Math.hypot(v[0],v[1])||1; return [v[0]/l,v[1]/l];};
        if(t<T.grab2){ G=SW0.slice(); d=[1,0]; }
        else if(tClear===null){
          if(!svB){ svB=[SW0[0]+L1,SW0[1]]; svBo=svB.slice(); }
          // his wrist steadies it toward hanging straight down (a spring on top of gravity), so it swings up and settles with one overshoot
          const wk=[(hN[0]-svB[0])*55, (hN[1]+L1-svB[1])*55];
          const nx=svB[0]+(svB[0]-svBo[0])*.985+wk[0]*SIM_DT*SIM_DT, ny=svB[1]+(svB[1]-svBo[1])*.985+(GRAV+wk[1])*SIM_DT*SIM_DT; svBo=svB.slice(); svB=[nx,ny];
          for(let it=0;it<4;it++){ const dv=nrm([svB[0]-hN[0],svB[1]-hN[1]]); svB=[hN[0]+dv[0]*L1,hN[1]+dv[1]*L1]; const gy=groundY(svB[0])-2.6; if(svB[1]>gy){ svB[1]=gy; svBo[0]=svB[0]-(svB[0]-svBo[0])*.6; svBo[1]=Math.max(svBo[1],svB[1]); } }
          G=hN.slice(); let dv=nrm([svB[0]-G[0],svB[1]-G[1]]);
          // his other hand takes the scabbard: the sword lines up between his hands
          const w=ss(T.hold2-.07,T.hold2+.03,t); const ax=nrm([hF[0]-hN[0],hF[1]-hN[1]]); d=nrm([lerp(dv[0],ax[0],w),lerp(dv[1],ax[1],w)]);
          if(w>0){ svB=[G[0]+d[0]*L1,G[1]+d[1]*L1]; svBo=svB.slice(); }
          if(t>=T.hold2){ ph=2; ext=Math.max(0,Math.hypot(hF[0]-hN[0],hF[1]-hN[1])-12); if(SWG+ext>=SWB){ tClear=t; dClear=d.slice(); SWEV.clear=t; } }
          else ph=1;
        }
        if(tClear!==null&&t>=tClear){
          ph=3; G=hN.slice(); const ka=[Math.cos(s.sa*D),Math.sin(s.sa*D)]; const w=ss(tClear,tClear+.07,t); d=nrm([lerp(dClear[0],ka[0],w),lerp(dClear[1],ka[1],w)]);
          if(t>=T.plant){ if(!plantG) plantG=G.slice(); G=plantG; d=[0,1]; ph=4; }
          // the scabbard: let go, it falls and topples onto the ground
          if(!scP){ scP=prevMC.map(p=>p.slice()); scPo=(SIM.sword.length>1?(()=>{const q=SIM.sword[SIM.sword.length-2]; return [[q[4],q[5]],[q[4]+q[6]*SCL,q[5]+q[7]*SCL]];})():scP.map(p=>p.slice()));
            scPo[0][0]-=60*SIM_DT; scPo[1][0]+=10*SIM_DT; }   // he lets it go with a flick: it tips forward as it falls
          for(let i=0;i<2;i++){ const p=scP[i],o=scPo[i]; const nx=p[0]+(p[0]-o[0])*.998, ny=p[1]+(p[1]-o[1])*.998+GRAV*SIM_DT*SIM_DT; scPo[i]=[p[0],p[1]]; scP[i]=[nx,ny]; }
          const hit=[0,0];
          for(let it=0;it<6;it++){ const a=scP[0],b=scP[1]; const dx=b[0]-a[0],dy=b[1]-a[1],dd=Math.hypot(dx,dy)||1,df=(dd-SCL)/dd*.5; a[0]+=dx*df;a[1]+=dy*df;b[0]-=dx*df;b[1]-=dy*df;
            for(let i=0;i<2;i++){ const p=scP[i]; const gy=groundY(p[0])-2.4; if(p[1]>gy){ if(!hit[i]) hit[i]=(p[1]-scPo[i][1])/SIM_DT; p[1]=gy; } } }
          for(let i=0;i<2;i++){ if(!hit[i]) continue; const p=scP[i],o=scPo[i]; if(hit[i]>90&&t-scLand>.08){ EV.push({t,type:'scabland',v:hit[i],x:p[0]}); scLand=t; } o[1]=p[1]+Math.max(0,hit[i]*SIM_DT)*.22; const vx=(p[0]-o[0]); o[0]=Math.abs(vx/SIM_DT)<5?p[0]:p[0]-vx*.55; }
          M=scP[0]; md=nrm([scP[1][0]-scP[0][0],scP[1][1]-scP[0][1]]);
        } else { M=[G[0]+d[0]*(SWG+ext),G[1]+d[1]*(SWG+ext)]; md=d; prevMC=[M.slice(),[M[0]+md[0]*SCL,M[1]+md[1]*SCL]]; }
        SIM.sword.push([G[0],G[1],d[0],d[1],M[0],M[1],md[0],md[1],ph,ext]);
      }
    }
  }
}
