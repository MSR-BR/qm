(() => {
  const $ = id => document.getElementById(id);
  const HBAR = 1.054571817e-34, ME = 9.1093837139e-31, EV = 1.602176634e-19;
  const C = { green:"#2f6b4f", rust:"#a64b35", blue:"#376b8c", gold:"#b88932", ink:"#26332c", grid:"#dbe5dd", muted:"#6b756f" };
  const key = new URLSearchParams(location.search).get("sim") || "qho";
  const labs = {
    qho: { slug:"qho-states-ladder", title:"QHO: stationary eigenfunctions and energy levels", subtitle:"Select a stationary state. The book variable \\(\\xi=\\alpha x\\) places the normalized wave function and probability density on their corresponding energy level.", sections:"4.1–4.4", show:["n"], main:"Normalized eigenfunction and density on the energy level", side:"", equation:"\\[\\xi=\\alpha x,\\qquad \\alpha=\\sqrt{\\frac{m\\omega}{\\hbar}},\\qquad E_n=\\hbar\\omega\\left(n+\\frac12\\right)\\]\\[\\phi_n(\\xi)=\\frac{1}{\\pi^{1/4}\\sqrt{2^n n!}}e^{-\\xi^2/2}H_n(\\xi),\\qquad \\int_{-\\infty}^{\\infty}|\\phi_n(\\xi)|^2d\\xi=1\\]" },
    finite: { slug:"finite-well-bound-states", title:"Finite well: bound states, parity and penetration", subtitle:"Change depth and width. The graphical boundary conditions select even and odd bound states and their exponentially decaying tails.", sections:"4.5–4.8", show:["n","m","v","a"], main:"Bound state in a finite well", side:"Graphical bound-state condition", equation:"\\[V(x)=\\begin{cases}0,&x<0\\ \\mathrm{or}\\ x>a\\\\-V_0,&0\\le x\\le a,\\end{cases}\\qquad E_n<0\\]\\[k\\tan(ka/2)=\\kappa\\quad(\\mathrm{even}),\\qquad-k\\cot(ka/2)=\\kappa\\quad(\\mathrm{odd})\\]" },
    scatter: { slug:"attractive-well-scattering", title:"Attractive finite well: scattering and resonant transmission", subtitle:"A positive-energy wave is partly reflected and partly transmitted. Vary energy, well depth, and width to find resonant transparency.", sections:"4.9–4.10", show:["m","v","a","e"], main:"Incident, reflected and transmitted waves", side:"Transmission versus energy", equation:"\\[\\bar k^2=k^2+k_0^2,\\qquad T=\\frac{1}{1+\\frac{k_0^4}{4k^2\\bar k^2}\\sin^2(\\bar k a)},\\qquad R=1-T\\]" },
    delta: { slug:"delta-well-scattering", title:"Delta well: transmission and reflection", subtitle:"For \\(V(x)=-|\\alpha|\\delta(x)\\), the ratio between incident energy and \\(\\mathcal E'\\) determines the transmission.", sections:"4.11", show:["m","e","alpha"], main:"Delta potential", side:"Transmission and reflection", equation:"\\[\\mathcal E'=\\frac{m|\\alpha|^2}{2\\hbar^2},\\qquad T=\\frac{1}{1+\\mathcal E'/|E|},\\qquad R=\\frac{1}{1+|E|/\\mathcal E'}\\]" },
    step: { slug:"step-tunneling", title:"Potential step: evanescent wave and penetration", subtitle:"For \\(E<V_0\\), the wave in the higher-potential region is evanescent. It has nonzero amplitude but no transmitted stationary current.", sections:"4.12", show:["m","v","e"], main:"Step potential with E < V₀", side:"Penetration depth", equation:"\\[\\kappa=\\frac{\\sqrt{2m(V_0-E)}}{\\hbar},\\qquad\\psi_{\\mathrm{II}}(x)\\propto e^{-\\kappa x},\\qquad R=1,\\ T=0\\]" },
    regimes: { slug:"bound-evanescent-scattering-map", title:"One-dimensional regimes: bound, evanescent and scattering", subtitle:"Compare the local wave forms used across the chapter: bound-state tails, propagating waves, and evanescent penetration.", sections:"4.1–4.12", show:["m","v","e"], main:"Three local solution types", side:"Energy relative to potential", equation:"\\[-\\frac{\\hbar^2}{2m}\\frac{d^2\\psi}{dx^2}+V\\psi=E\\psi,\\qquad E>V:\\ \\text{oscillatory};\\quad E<V:\\ \\text{evanescent}\\]" }
  };
  const lab = labs[key] || labs.qho;
  const controls = { n:$("n"), m:$("mass"), w:$("frequency"), v:$("depth"), a:$("width"), e:$("energy"), alpha:$("alpha") };
  const defaults = { n:0, m:1, w:2, v:25, a:1, e:12, alpha:2 };
  document.querySelector("main").dataset.simulatorSlug = lab.slug;
  $("kicker").textContent = "Chapter 4 · Sections " + lab.sections;
  $("title").textContent = lab.title;
  $("subtitle").textContent = lab.subtitle;
  $("mainHeading").textContent = lab.main;
  $("sideHeading").textContent = lab.side;
  $("equation").innerHTML = lab.equation;
  Object.values(controls).forEach(el => el.addEventListener("input", render));
  $("reset").addEventListener("click", () => { Object.keys(defaults).forEach(k => controls[k].value = defaults[k]); render(); });
  window.addEventListener("resize", render);

  function decimal(value, digits) { return Number(value).toLocaleString("pt-BR", { minimumFractionDigits:digits, maximumFractionDigits:digits }); }
  function fit(canvas) {
    const ratio = Math.max(1, window.devicePixelRatio || 1), box = canvas.getBoundingClientRect();
    const width = Math.max(300, Math.round(box.width)), height = Math.max(220, Math.round(box.height));
    canvas.width = width * ratio; canvas.height = height * ratio;
    const ctx = canvas.getContext("2d"); ctx.setTransform(ratio,0,0,ratio,0,0);
    return { ctx, width, height };
  }
  function axes(ctx,w,h,p,y) { ctx.strokeStyle=C.grid;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.moveTo(p.l,p.t);ctx.lineTo(p.l,h-p.b);ctx.stroke(); }
  function label(ctx,text,x,y,size,color) { ctx.fillStyle=color||C.muted;ctx.font=(size||11)+"px Inter, sans-serif";ctx.fillText(text,x,y); }
  function metric(l1,v1,l2,v2,l3,v3,l4,v4) {
    [[l1,v1,"l1","m1"],[l2,v2,"l2","m2"],[l3,v3,"l3","m3"],[l4,v4,"l4","m4"]].forEach(row => { $(row[2]).textContent=row[0]; $(row[3]).textContent=row[1]; });
  }
  function legend(items) { $("legend").innerHTML=items.map(item => '<span class="legend-item"><span class="legend-swatch" style="--swatch:'+item[0]+'"></span>'+item[1]+'</span>').join(""); }
  function state() { return { n:+controls.n.value, mr:+controls.m.value, m:+controls.m.value*ME, omega:+controls.w.value*1e15, V:+controls.v.value*EV, a:+controls.a.value*1e-9, E:+controls.e.value*EV, alpha:+controls.alpha.value*EV*1e-9 }; }
  function drawCurve(ctx, fn, samples, xmap, ymap, color, start, end) {
    ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();
    for(let i=0;i<=samples;i++){const z=start+(end-start)*i/samples, x=xmap(z), y=ymap(fn(z));if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
    ctx.stroke();
  }
  function drawMain(s, type) {
    const out=fit($("mainCanvas")),ctx=out.ctx,w=out.width,h=out.height,p={l:52,r:22,t:24,b:34},mid=h*.48;
    if(type!=="qho")axes(ctx,w,h,p,mid);
    if(type==="qho") {
      const poly=[z=>1,z=>2*z,z=>4*z*z-2,z=>8*z*z*z-12*z,z=>16*z**4-48*z*z+12,z=>32*z**5-160*z**3+120*z,z=>64*z**6-480*z**4+720*z*z-120][s.n];
      const xiMax=5, xm=z=>p.l+(z+xiMax)/(2*xiMax)*(w-p.l-p.r), ymax=13.2, ym=e=>h-p.b-e/ymax*(h-p.t-p.b);
      let factorial=1;for(let j=2;j<=s.n;j++)factorial*=j;
      const normalization=1/(Math.PI**.25*Math.sqrt(2**s.n*factorial));
      const phi=z=>normalization*Math.exp(-z*z/2)*poly(z);
      let maxPhi=0,maxDensity=0;for(let q=-xiMax;q<=xiMax;q+=.005){maxPhi=Math.max(maxPhi,Math.abs(phi(q)));maxDensity=Math.max(maxDensity,phi(q)**2);}
      axes(ctx,w,h,p,h-p.b);
      for(let n=0;n<7;n++){const e=n+.5,y=ym(e);ctx.strokeStyle=n===s.n?C.gold:C.grid;ctx.lineWidth=n===s.n?2.6:1;ctx.setLineDash(n===s.n?[]:[3,4]);ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();ctx.setLineDash([]);label(ctx,"n = "+n,p.l+4,y-5,10,n===s.n?C.gold:C.muted);}
      drawCurve(ctx,z=>z*z/2,600,xm,ym,C.ink,-xiMax,xiMax);
      const energy=s.n+.5;
      drawCurve(ctx,z=>energy+.30*phi(z)/maxPhi,600,xm,ym,C.green,-xiMax,xiMax);
      drawCurve(ctx,z=>energy+.46*phi(z)**2/maxDensity,600,xm,ym,C.rust,-xiMax,xiMax);
      label(ctx,"V / ħω = ξ²/2",w*.57,ym(10.3),11,C.ink);label(ctx,"φₙ(ξ)",w*.57,ym(energy-.48),11,C.green);label(ctx,"|φₙ(ξ)|²",w*.57,ym(energy+.68),11,C.rust);label(ctx,"ξ = αx",w*.47,h-8,11,C.muted);
      return;
    }
    if(type==="delta") {
      ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.l,mid);ctx.lineTo(w*.5-14,mid);ctx.lineTo(w*.5,mid+105);ctx.lineTo(w*.5+14,mid);ctx.lineTo(w-p.r,mid);ctx.stroke();
      label(ctx,"V(x) = −|α|δ(x)",w*.5-58,mid+126,12,C.ink);label(ctx,"incident",p.l+18,mid-20);label(ctx,"reflected",p.l+18,mid+36);label(ctx,"transmitted",w-110,mid-20);
      return;
    }
    if(type==="step") {
      const x0=w*.52;ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.l,mid);ctx.lineTo(x0,mid);ctx.lineTo(x0,mid-86);ctx.lineTo(w-p.r,mid-86);ctx.stroke();
      drawCurve(ctx,z=>Math.sin(10*Math.PI*z),400,z=>p.l+z*(x0-p.l),y=>mid-33-y*34,C.green,0,1);
      drawCurve(ctx,z=>Math.exp(-5*z),400,z=>x0+z*(w-p.r-x0),y=>mid-33-y*34,C.rust,0,1);
      label(ctx,"E",p.l+8,mid-40,11,C.gold);label(ctx,"V₀",x0+7,mid-92,11,C.ink);label(ctx,"oscillatory",p.l+15,mid+31,11,C.green);label(ctx,"evanescent",x0+15,mid+31,11,C.rust);
      return;
    }
    const x0=w*.33,x1=w*.67;
    if(type==="finite"||type==="scatter") {
      ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.l,mid);ctx.lineTo(x0,mid);ctx.lineTo(x0,mid+68);ctx.lineTo(x1,mid+68);ctx.lineTo(x1,mid);ctx.lineTo(w-p.r,mid);ctx.stroke();
      if(type==="finite") {
        const n=s.n+1;
        drawCurve(ctx,z=>z<.33?Math.exp((z-.33)*12):z>.67?Math.exp((.67-z)*12):Math.sin(n*Math.PI*(z-.33)/.34),600,z=>p.l+z*(w-p.l-p.r),y=>mid-y*42,C.green,0,1);
        drawCurve(ctx,z=>{const q=z<.33?Math.exp((z-.33)*12):z>.67?Math.exp((.67-z)*12):Math.sin(n*Math.PI*(z-.33)/.34);return q*q;},600,z=>p.l+z*(w-p.l-p.r),y=>h*.85-y*58,C.rust,0,1);
        label(ctx,"outside",p.l+20,mid-10);label(ctx,"well",w*.48,mid+58);label(ctx,"outside",w-82,mid-10);
      } else {
        drawCurve(ctx,z=>z<.33?Math.sin(12*Math.PI*z)+.35*Math.sin(-12*Math.PI*z):z<.67?Math.sin(20*Math.PI*z):.8*Math.sin(12*Math.PI*z),700,z=>p.l+z*(w-p.l-p.r),y=>mid-32-y*32,C.green,0,1);
        label(ctx,"incident + reflected",p.l+8,mid+29);label(ctx,"transmitted",w-105,mid+29);
      }
      return;
    }
    drawCurve(ctx,z=>Math.exp((z-1)*6),250,z=>p.l+z*(w*.30-p.l),y=>mid-y*32,C.rust,0,1);
    drawCurve(ctx,z=>Math.sin(6*Math.PI*z),350,z=>w*.30+z*(w*.35-w*.30),y=>mid-y*32,C.green,0,1);
    drawCurve(ctx,z=>(s.E<s.V?Math.exp(-5*z):Math.sin(6*Math.PI*z)),350,z=>w*.35+z*(w-p.r-w*.35),y=>mid-y*32,s.E<s.V?C.rust:C.green,0,1);
    label(ctx,"bound tail",p.l+5,h-9);label(ctx,"oscillatory",w*.30,h-9);label(ctx,s.E<s.V?"evanescent":"oscillatory",w*.67,h-9);
  }
  function drawSide(s,type) {
    const out=fit($("sideCanvas")),ctx=out.ctx,w=out.width,h=out.height,p={l:52,r:22,t:23,b:32},base=h-p.b;
    axes(ctx,w,h,p,base);
    if(type==="qho") {
      const cx=(p.l+w-p.r)/2,cy=(p.t+base)/2,radius=(h-p.t-p.b)*0.34,spread=Math.sqrt(s.n+.5),r=Math.min(radius,radius*spread/2.6);
      ctx.strokeStyle=C.grid;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.l,cy);ctx.lineTo(w-p.r,cy);ctx.moveTo(cx,p.t);ctx.lineTo(cx,base);ctx.stroke();
      ctx.fillStyle="rgba(47,107,79,.13)";ctx.strokeStyle=C.green;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(cx,cy,r,r,0,0,2*Math.PI);ctx.fill();ctx.stroke();
      ctx.strokeStyle=C.rust;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-r,cy-r-12);ctx.lineTo(cx+r,cy-r-12);ctx.moveTo(cx-r,cy-r-17);ctx.lineTo(cx-r,cy-r-7);ctx.moveTo(cx+r,cy-r-17);ctx.lineTo(cx+r,cy-r-7);ctx.moveTo(cx+r+12,cy-r);ctx.lineTo(cx+r+12,cy+r);ctx.moveTo(cx+r+7,cy-r);ctx.lineTo(cx+r+17,cy-r);ctx.moveTo(cx+r+7,cy+r);ctx.lineTo(cx+r+17,cy+r);ctx.stroke();
      label(ctx,"Δξ",cx-7,cy-r-21,12,C.rust);label(ctx,"Δπ",cx+r+18,cy+4,12,C.rust);label(ctx,"ξ = x/x₀",w-p.r-43,cy-7,11,C.muted);label(ctx,"π = p/p₀",cx+7,p.t+12,11,C.muted);label(ctx,"n = "+s.n,w-p.r-42,base-8,11,C.ink);return;
    }
    if(type==="finite") {
      const z0=Math.min(10,Math.max(1,s.a*Math.sqrt(2*s.m*s.V)/HBAR)),xm=z=>p.l+z/z0*(w-p.l-p.r),ym=v=>base-v/z0*(h-p.t-p.b);
      drawCurve(ctx,z=>Math.sqrt(Math.max(0,z0*z0-z*z)),500,xm,ym,C.ink,0,z0);
      [C.green,C.rust].forEach((color,index)=>{ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();let moved=false;for(let j=1;j<1000;j++){const z=j*z0/1000,v=index?-z/Math.tan(z):z*Math.tan(z);if(!isFinite(v)||Math.abs(v)>z0)continue;const X=xm(z),Y=ym(Math.max(0,v));if(moved)ctx.lineTo(X,Y);else{ctx.moveTo(X,Y);moved=true;}}ctx.stroke();});
      label(ctx,"ka",w*.49,h-8);label(ctx,"κa",8,16);label(ctx,"green: even · red: odd",w*.53,18,10);return;
    }
    if(type==="step") {
      const gap=Math.max(1e-25,s.V-s.E),maxL=HBAR/Math.sqrt(2*s.m*gap)*1e9*4;
      drawCurve(ctx,z=>HBAR/Math.sqrt(2*s.m*Math.max(1e-25,(s.V/EV*(1-z))*EV))*1e9,500,z=>p.l+z*.995*(w-p.l-p.r),y=>base-y/maxL*(h-p.t-p.b),C.rust,0,.995);
      label(ctx,"E (eV)",w*.46,h-8);label(ctx,"penetration depth",p.l+6,16);return;
    }
    if(type==="delta") {
      const Ep=s.m*s.alpha*s.alpha/(2*HBAR*HBAR),max=Math.max(8,8*Ep/EV),xm=z=>p.l+z*(w-p.l-p.r),ym=z=>base-z*(h-p.t-p.b);
      drawCurve(ctx,z=>1/(1+Ep/((.05+z*max)*EV)),600,xm,ym,C.green,0,1);
      drawCurve(ctx,z=>1-1/(1+Ep/((.05+z*max)*EV)),600,xm,ym,C.rust,0,1);
      label(ctx,"|E|",w*.5,h-8);label(ctx,"coefficient",p.l+6,16);return;
    }
    if(type==="scatter") {
      const max=Math.max(80,3*s.V/EV),xm=z=>p.l+z*(w-p.l-p.r),ym=z=>base-z*(h-p.t-p.b);
      drawCurve(ctx,z=>{const E=(.1+z*max)*EV,kb=Math.sqrt(2*s.m*(E+s.V))/HBAR,q=s.V*s.V/(4*E*(E+s.V));return 1/(1+q*Math.sin(kb*s.a)**2);},700,xm,ym,C.green,0,1);
      label(ctx,"E (eV)",w*.45,h-8);label(ctx,"T",p.l+6,16);return;
    }
    const y=base-(h-p.t-p.b)/2,ratio=Math.min(.98,s.E/s.V);ctx.strokeStyle=C.gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();ctx.fillStyle=C.rust;ctx.beginPath();ctx.arc(p.l+ratio*(w-p.l-p.r),y,6,0,2*Math.PI);ctx.fill();label(ctx,"E/V₀",w*.45,h-8);label(ctx,"E < V₀",p.l+4,17,11,C.rust);label(ctx,"E > V₀",w-66,17,11,C.green);
  }
  function render() {
    Object.keys(controls).forEach(k=>document.querySelector(".c-"+k).style.display=lab.show.includes(k)?"grid":"none");
    const s=state();
    const sidePanel=$("sideCanvas").closest(".sim-panel");
    sidePanel.style.display=key==="qho"?"none":"";
    $("nV").textContent=s.n;$("massV").textContent=decimal(s.mr,2)+" mₑ";$("frequencyV").textContent=decimal(s.omega/1e15,2)+"×10¹⁵";$("depthV").textContent=decimal(s.V/EV,1)+" eV";$("widthV").textContent=decimal(s.a*1e9,2)+" nm";$("energyV").textContent=decimal(s.E/EV,1)+" eV";$("alphaV").textContent=decimal(s.alpha/(EV*1e-9),2)+" eV nm";
    if(key==="qho") {
      metric("Energy Eₙ / ħω",decimal(s.n+.5,2),"Book variable ξ","αx","α","√(mω/ħ)","Normalization","∫|φₙ|²dξ = 1");
      $("insight").textContent="The book variable is ξ = αx, with α = √(mω/ħ). The functions φₙ(ξ) and |φₙ(ξ)|² are normalized so that ∫|φₙ|² dξ = 1. Their profiles are vertically magnified only for visibility and are offset to the corresponding energy Eₙ.";
      legend([[C.green,"normalized φₙ(ξ), vertically magnified"],[C.rust,"normalized |φₙ(ξ)|², vertically magnified"],[C.ink,"V/(ħω) = ξ²/2"]]);
    } else if(key==="finite") {
      const z0=s.a*Math.sqrt(2*s.m*s.V)/HBAR,count=Math.max(1,Math.floor(z0/Math.PI)+1),n=Math.min(s.n,count-1),L=s.a/Math.max(.2,z0-n*Math.PI/2);
      metric("Approx. bound states",String(count),"Selected parity",n%2?"odd":"even","Penetration depth",decimal(L*1e9,3)+" nm","Dimensionless depth",decimal(z0,3));
      $("insight").textContent="Intersections of the even or odd boundary branches with the circular curve select the bound states. Shallower states have longer tails.";
      legend([[C.ink,"potential"],[C.green,"wave function"],[C.rust,"probability density"]]);
    } else if(key==="scatter") {
      const k=Math.sqrt(2*s.m*s.E)/HBAR,kb=Math.sqrt(2*s.m*(s.E+s.V))/HBAR,T=1/(1+s.V*s.V/(4*s.E*(s.E+s.V))*Math.sin(kb*s.a)**2);
      metric("Transmission T",decimal(100*T,2)+"%","Reflection R",decimal(100*(1-T),2)+"%","ka",decimal(k*s.a,3),"k̄a",decimal(kb*s.a,3));
      $("insight").textContent=T>.97?"This is near resonant transparency: matching across the well gives almost perfect transmission.":"Changing E or a changes the phase accumulated in the well, and therefore transmission.";
      legend([[C.ink,"potential"],[C.green,"total wave (schematic)"],[C.rust,"resonant T curve"]]);
    } else if(key==="delta") {
      const Ep=s.m*s.alpha*s.alpha/(2*HBAR*HBAR),T=1/(1+Ep/s.E);
      metric("Energy scale ℰ′",decimal(Ep/EV,3)+" eV","Transmission T",decimal(100*T,2)+"%","Reflection R",decimal(100*(1-T),2)+"%","|E| / ℰ′",decimal(s.E/Ep,3));
      $("insight").textContent="The delta well has zero width. Its scattering is controlled by the comparison between incident energy and the scale ℰ′.";
      legend([[C.ink,"delta well"],[C.green,"transmission T"],[C.rust,"reflection R"]]);
    } else if(key==="step") {
      const gap=Math.max(1e-25,s.V-s.E),kap=Math.sqrt(2*s.m*gap)/HBAR;
      metric("V₀ − E",decimal(gap/EV,3)+" eV","κ",decimal(kap*1e-9,3)+" nm⁻¹","Penetration depth",decimal(1e9/kap,3)+" nm","Stationary T","0");
      $("insight").textContent="The tail beyond the step is evanescent. It describes penetration of probability density, not a transmitted stationary flux.";
      legend([[C.ink,"potential step"],[C.green,"oscillatory solution"],[C.rust,"evanescent solution"]]);
    } else {
      metric("Energy E",decimal(s.E/EV,2)+" eV","Potential V₀",decimal(s.V/EV,2)+" eV","E / V₀",decimal(s.E/s.V,3),"Local regime",s.E<s.V?"evanescent":"oscillatory");
      $("insight").textContent="The potential determines the local wave form. Boundary conditions then decide whether a global solution is a bound state or a scattering state.";
      legend([[C.green,"oscillatory"],[C.rust,"evanescent / bound tail"],[C.ink,"potential"]]);
    }
    drawMain(s,key);if(key!=="qho")drawSide(s,key);
    if(window.MathJax&&window.MathJax.typesetPromise)window.MathJax.typesetPromise([$("equation")]);
  }
  render();
})();
