(() => {
  const root=document.querySelector("[data-simulator-slug]"); if(!root)return;
  const slug=new URLSearchParams(location.search).get("sim")||"stern-gerlach-sequence", $=id=>document.getElementById(id);
  root.dataset.simulatorSlug=slug;
  const colors={green:"#2f6b4f",rust:"#a64b35",blue:"#376b8c",gold:"#d5b260",grid:"#dbe5dd",ink:"#26332c",muted:"#6b756f",paper:"#fffefb"};
  const axisVectors={x:[1,0,0],y:[0,1,0],z:[0,0,1]};
  const configs={
    "stern-gerlach-sequence":{
      title:"Stern–Gerlach and Sequential Measurements",
      subtitle:"Follow one spin-½ particle or an ensemble through successive analyzers. Each result is also a new state preparation.",
      plot:"Sequential Stern–Gerlach apparatus",
      controls:[
        select("prepared","Incoming beam",[["unpolarized","Unpolarized"],["z+","Prepared |+⟩z"],["x+","Prepared |+⟩x"]],"unpolarized"),
        select("analyzer1","Analyzer 1",[["z","Measure Sz"],["x","Measure Sx"]],"z"),
        select("analyzer2","Analyzer 2",[["none","No analyzer"],["z","Measure Sz"],["x","Measure Sx"]],"x"),
        select("analyzer3","Analyzer 3",[["none","No analyzer"],["z","Measure Sz"],["x","Measure Sx"]],"z")
      ],
      metrics:[["Most likely final result","finalResult"],["Probability of that path","pathProbability"],["Particles in + output","plusFraction"],["Particles in − output","minusFraction"]],
      equations:String.raw`\[P(\pm_{\mathbf n})=\left|\langle\pm_{\mathbf n}|\psi\rangle\right|^2=\frac{1\pm\mathbf r\cdot\mathbf n}{2}\]\[\text{After the result }\pm:\qquad |\psi\rangle\longrightarrow|\pm_{\mathbf n}\rangle\]\[S_z\rightarrow S_x\rightarrow S_z:\qquad P(+_z)=P(-_z)=\frac12\]`
    },
    "spin-born-rule":{
      title:"Spin State and Born Rule",
      subtitle:"Prepare a spin state on the Bloch sphere, select the measurement direction and read the two probabilities directly from the projections.",
      plot:"State vector, measurement axis and Born probabilities",
      controls:[
        range("stateTheta","State polar angle θ",0,180,1,55,"°"),
        range("statePhi","State azimuth φ",0,360,1,35,"°"),
        select("measureAxis","Measurement axis",[["z","z axis"],["x","x axis"],["y","y axis"]],"z")
      ],
      metrics:[["P(+)","probPlus"],["P(−)","probMinus"],["Normalization","normalization"],["Expectation ⟨σn⟩","expectation"]],
      equations:String.raw`\[|\psi\rangle=\cos\frac{\theta}{2}|+\rangle_z+e^{i\phi}\sin\frac{\theta}{2}|-\rangle_z\]\[P(\pm_{\mathbf n})=\left|\langle\pm_{\mathbf n}|\psi\rangle\right|^2=\frac{1\pm\mathbf r\cdot\mathbf n}{2}\]\[\langle\sigma_{\mathbf n}\rangle=P(+_{\mathbf n})-P(-_{\mathbf n})=\mathbf r\cdot\mathbf n\]`
    },
    "operator-time-evolution":{
      title:"Operators and Spin Time Evolution",
      subtitle:"Choose a Pauli Hamiltonian and watch a normalized spin state precess while the observable expectation values change.",
      plot:"Unitary evolution on the Bloch sphere",
      controls:[
        select("initialState","Initial state",[["z","|+⟩z"],["x","|+⟩x"],["y","|+⟩y"]],"x"),
        select("hamiltonianAxis","Hamiltonian H = ℏΩσn/2",[["z","n = z"],["x","n = x"],["y","n = y"]],"z"),
        range("phase","Evolution angle Ωt",0,360,1,90,"°"),
        select("observable","Displayed observable",[["z","σz"],["x","σx"],["y","σy"]],"z")
      ],
      metrics:[["⟨σx⟩","expectX"],["⟨σy⟩","expectY"],["⟨σz⟩","expectZ"],["Selected ⟨σn⟩","selectedExpectation"]],
      equations:String.raw`\[H=\frac{\hbar\Omega}{2}\sigma_{\mathbf n},\qquad U(t)=e^{-iHt/\hbar}\]\[|\psi(t)\rangle=U(t)|\psi(0)\rangle\]\[\langle\sigma_i\rangle_t=\langle\psi(t)|\sigma_i|\psi(t)\rangle,\qquad |\mathbf r(t)|=1\]`
    }
  };
  function range(id,label,min,max,step,value,unit){return{type:"range",id,label,min,max,step,value,unit}}
  function select(id,label,options,value){return{type:"select",id,label,options,value}}
  const cfg=configs[slug];if(!cfg)return;
  $("simTitle").textContent=cfg.title;$("simSubtitle").textContent=cfg.subtitle;$("plotTitle").textContent=cfg.plot;document.title=`${cfg.title} | Quantum Mechanics`;
  $("controlFields").innerHTML=cfg.controls.map(c=>c.type==="select"
    ?`<div class="control-group"><label class="control-label" for="${c.id}">${c.label}</label><select id="${c.id}">${c.options.map(([v,l])=>`<option value="${v}"${v===c.value?" selected":""}>${l}</option>`).join("")}</select></div>`
    :`<div class="control-group"><div class="control-row"><label class="control-label" for="${c.id}">${c.label}</label><output class="control-value" id="${c.id}Value"></output></div><input id="${c.id}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"></div>`).join("");
  $("metricPanel").insertAdjacentHTML("beforeend",cfg.metrics.map(([label,id])=>`<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}Metric">—</div></div>`).join(""));
  $("equationBox").innerHTML=cfg.equations;window.MathJax?.typesetPromise?.([$("equationBox")]);
  $("actionButtons").innerHTML=slug==="stern-gerlach-sequence"
    ?`<button class="sim-button" id="runOne" type="button"><i class="fa-solid fa-circle-play"></i> Send one</button><button class="sim-button secondary" id="runMany" type="button">Send 100</button><button class="sim-button secondary" id="resetButton" type="button"><i class="fa-solid fa-rotate-left"></i> Reset</button>`
    :slug==="operator-time-evolution"
      ?`<button class="sim-button" id="playButton" type="button"><i class="fa-solid fa-play"></i> Play</button><button class="sim-button secondary" id="resetButton" type="button"><i class="fa-solid fa-rotate-left"></i> Reset</button>`
      :`<button class="sim-button secondary" id="resetButton" type="button"><i class="fa-solid fa-rotate-left"></i> Reset</button>`;
  const state=()=>Object.fromEntries(cfg.controls.map(c=>[c.id,c.type==="range"?Number($(c.id).value):$(c.id).value]));
  const decimal=(v,d=2)=>Number(v).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
  const set=(id,v)=>$(`${id}Metric`).textContent=v;
  function updateOutputs(s){cfg.controls.filter(c=>c.type==="range").forEach(c=>$(`${c.id}Value`).textContent=`${decimal(s[c.id],0)}${c.unit?` ${c.unit}`:""}`)}
  function fit(){const canvas=$("primaryCanvas"),ratio=Math.max(1,devicePixelRatio||1),rect=canvas.getBoundingClientRect(),w=Math.max(300,Math.round(rect.width)),h=Math.max(320,Math.round(rect.height));canvas.width=w*ratio;canvas.height=h*ratio;const ctx=canvas.getContext("2d");ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);ctx.font="12px Inter";return{ctx,w,h}}
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const normalize=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n)};
  const vectorForPrepared=p=>p==="z+"?[0,0,1]:p==="x+"?[1,0,0]:null;
  function probability(vector,axis,outcome){if(!vector)return .5;return(1+outcome*dot(vector,axisVectors[axis]))/2}
  function drawAnalyzer(ctx,x,y,axis,index){ctx.fillStyle="rgba(47,107,79,.09)";ctx.strokeStyle=colors.green;ctx.lineWidth=2;ctx.fillRect(x-34,y-45,68,90);ctx.strokeRect(x-34,y-45,68,90);ctx.fillStyle=colors.ink;ctx.font="700 13px Inter";ctx.fillText(`SG${index}`,x-14,y-10);ctx.fillStyle=colors.muted;ctx.font="12px Inter";ctx.fillText(`S${axis}`,x-8,y+12);ctx.fillText("+",x+43,y-28);ctx.fillText("−",x+43,y+35)}
  let lastParticle=null,ensemble=null;
  function activeAnalyzers(s){return[s.analyzer1,s.analyzer2,s.analyzer3].filter(a=>a!=="none")}
  function sampleSequence(s){let vector=vectorForPrepared(s.prepared),p=1;const results=[];activeAnalyzers(s).forEach(axis=>{const pp=probability(vector,axis,1),outcome=Math.random()<pp?1:-1;p*=outcome===1?pp:1-pp;results.push({axis,outcome,probability:outcome===1?pp:1-pp});vector=axisVectors[axis].map(v=>v*outcome)});return{results,p}}
  function enumeratePaths(s){let paths=[{vector:vectorForPrepared(s.prepared),p:1,label:""}];activeAnalyzers(s).forEach(axis=>{paths=paths.flatMap(path=>[1,-1].map(outcome=>{const q=probability(path.vector,axis,outcome);return{vector:axisVectors[axis].map(v=>v*outcome),p:path.p*q,label:`${path.label}${outcome>0?"+":"−"}${axis} `}})).filter(path=>path.p>1e-9)});return paths}
  function drawStern(s){
    const{ctx,w,h}=fit(),axes=activeAnalyzers(s),mid=h*.51,left=48,right=w-45,spacing=(right-left)/(axes.length+1);
    ctx.strokeStyle=colors.grid;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(left,mid);ctx.lineTo(right,mid);ctx.stroke();ctx.fillStyle=colors.muted;ctx.fillText(s.prepared==="unpolarized"?"unpolarized beam":`prepared ${s.prepared}`,left-20,mid-18);
    let paths=[{y:mid,p:1,label:"",vector:vectorForPrepared(s.prepared)}];
    axes.forEach((axis,i)=>{const x=left+spacing*(i+1);drawAnalyzer(ctx,x,mid,axis,i+1);const next=[];paths.forEach(path=>{[1,-1].forEach(outcome=>{const q=probability(path.vector,axis,outcome);if(path.p*q<.015)return;const targetY=mid+outcome*(-1)*(52+18*i)+(path.y-mid)*.45;ctx.strokeStyle=outcome>0?colors.green:colors.rust;ctx.globalAlpha=.25+.75*path.p*q;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x+34,path.y);ctx.lineTo(Math.min(right,x+spacing-36),targetY);ctx.stroke();ctx.globalAlpha=1;next.push({y:targetY,p:path.p*q,label:`${path.label}${outcome>0?"+":"−"}${axis} `,vector:axisVectors[axis].map(v=>v*outcome)})})});paths=next});
    paths.sort((a,b)=>b.p-a.p);paths.slice(0,8).forEach((path,i)=>{ctx.fillStyle=colors.ink;ctx.fillText(`${path.label.trim()}  ${decimal(path.p*100,1)}%`,right-115,28+i*18)});
    if(lastParticle){ctx.fillStyle=colors.gold;ctx.beginPath();ctx.arc(right-8,mid,7,0,2*Math.PI);ctx.fill();ctx.fillStyle=colors.ink;ctx.fillText(`last particle: ${lastParticle.results.map(r=>(r.outcome>0?"+":"−")+r.axis).join(" → ")}`,left,h-24)}
    const final=paths[0]||{label:"—",p:0};set("finalResult",final.label.trim()||"—");set("pathProbability",`${decimal(final.p*100,1)}%`);
    if(ensemble){set("plusFraction",`${ensemble.plus}/100`);set("minusFraction",`${ensemble.minus}/100`)}else{const plus=paths.filter(p=>p.label.trim().split(" ").at(-1)?.startsWith("+")).reduce((a,p)=>a+p.p,0);set("plusFraction",`${decimal(plus*100,1)}%`);set("minusFraction",`${decimal((1-plus)*100,1)}%`)}
    $("insightBox").textContent=axes.join(" → ")==="z → x → z"?"The intermediate Sx measurement erases the certainty of the first Sz preparation. The final Sz analyzer again gives 50% for each result.":"Every analyzer both measures the incoming state and prepares the state that enters the next analyzer.";
  }
  function blochProjection(v){return{x:v[0]*.82+v[1]*.30,y:-v[2]*.88+v[1]*.18}}
  function arrow(ctx,cx,cy,v,r,color,label){const p=blochProjection(v),x=cx+p.x*r,y=cy+p.y*r;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();const a=Math.atan2(y-cy,x-cx);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-10*Math.cos(a-.42),y-10*Math.sin(a-.42));ctx.lineTo(x-10*Math.cos(a+.42),y-10*Math.sin(a+.42));ctx.closePath();ctx.fill();ctx.font="700 12px Inter";ctx.fillText(label,x+7,y-5)}
  function drawSphere(ctx,cx,cy,r){ctx.strokeStyle=colors.grid;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,r,r*.28,0,0,2*Math.PI);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,r*.28,r,0,0,2*Math.PI);ctx.stroke();ctx.fillStyle=colors.muted;ctx.fillText("+z",cx-7,cy-r-8);ctx.fillText("−z",cx-7,cy+r+18);ctx.fillText("+x",cx+r+8,cy+4);ctx.fillText("−x",cx-r-25,cy+4)}
  function bars(ctx,x,y,w,pPlus){[["+",pPlus,colors.green],["−",1-pPlus,colors.rust]].forEach(([label,p,c],i)=>{const yy=y+i*72;ctx.fillStyle=colors.grid;ctx.fillRect(x,yy,w,30);ctx.fillStyle=c;ctx.fillRect(x,yy,w*p,30);ctx.fillStyle=colors.ink;ctx.font="700 13px Inter";ctx.fillText(`${label}  ${decimal(p*100,1)}%`,x,yy-8)})}
  function drawBorn(s){
    const{ctx,w,h}=fit(),th=s.stateTheta*Math.PI/180,ph=s.statePhi*Math.PI/180,v=[Math.sin(th)*Math.cos(ph),Math.sin(th)*Math.sin(ph),Math.cos(th)],axis=axisVectors[s.measureAxis],projection=dot(v,axis),pPlus=(1+projection)/2,cx=w*.31,cy=h*.5,r=Math.min(145,h*.35);
    drawSphere(ctx,cx,cy,r);arrow(ctx,cx,cy,axis,r*.9,colors.blue,`measurement ${s.measureAxis}`);arrow(ctx,cx,cy,v,r*.9,colors.green,"state |ψ⟩");bars(ctx,w*.60,h*.34,Math.max(120,w*.31),pPlus);
    ctx.fillStyle=colors.muted;ctx.fillText(`θ = ${s.stateTheta}°`,w*.60,h*.72);ctx.fillText(`φ = ${s.statePhi}°`,w*.60,h*.72+20);
    set("probPlus",decimal(pPlus,4));set("probMinus",decimal(1-pPlus,4));set("normalization",decimal(pPlus+1-pPlus,4));set("expectation",decimal(projection,4));
    $("insightBox").textContent=Math.abs(projection)>.999?"The state is an eigenstate of the selected observable, so the measurement result is certain.":"The probabilities come from squared projection amplitudes, not from a classical division of the particle.";
  }
  function rotate(v,axis,angle){const n=axisVectors[axis],c=Math.cos(angle),s=Math.sin(angle),d=dot(n,v),cross=[n[1]*v[2]-n[2]*v[1],n[2]*v[0]-n[0]*v[2],n[0]*v[1]-n[1]*v[0]];return v.map((q,i)=>q*c+cross[i]*s+n[i]*d*(1-c))}
  let playing=false,lastTime=0,animation=0;
  function drawEvolution(s){
    const{ctx,w,h}=fit(),initial=axisVectors[s.initialState],angle=s.phase*Math.PI/180,v=normalize(rotate(initial,s.hamiltonianAxis,angle)),axis=axisVectors[s.hamiltonianAxis],cx=w*.33,cy=h*.51,r=Math.min(145,h*.35);
    drawSphere(ctx,cx,cy,r);arrow(ctx,cx,cy,axis,r*.92,colors.blue,"Hamiltonian axis");arrow(ctx,cx,cy,v,r*.92,colors.green,"|ψ(t)⟩");
    const matrix={x:["0","1","1","0"],y:["0","−i","i","0"],z:["1","0","0","−1"]}[s.observable],x=w*.63,y=h*.30;
    ctx.fillStyle=colors.ink;ctx.font="700 17px Inter";ctx.fillText(`σ${s.observable} =`,x,y);ctx.strokeStyle=colors.grid;ctx.strokeRect(x+55,y-30,112,84);ctx.font="17px ui-monospace";matrix.forEach((m,i)=>ctx.fillText(m,x+78+(i%2)*48,y-2+Math.floor(i/2)*38));
    ctx.fillStyle=colors.muted;ctx.font="12px Inter";ctx.fillText(`Ωt = ${s.phase}°`,x,y+115);ctx.fillText("|r(t)| = 1",x,y+138);
    set("expectX",decimal(v[0],4));set("expectY",decimal(v[1],4));set("expectZ",decimal(v[2],4));set("selectedExpectation",decimal(v[{x:0,y:1,z:2}[s.observable]],4));
    $("insightBox").textContent=dot(initial,axis)===1?"The initial state is an eigenstate of the Hamiltonian. Only its global phase changes, so the Bloch vector remains fixed.":"Unitary evolution rotates the state without changing its norm. The expectation values are the three components of the Bloch vector.";
  }
  const drawers={"stern-gerlach-sequence":drawStern,"spin-born-rule":drawBorn,"operator-time-evolution":drawEvolution};
  function render(){const s=state();updateOutputs(s);drawers[slug](s)}
  cfg.controls.forEach(c=>$(c.id).addEventListener("input",()=>{lastParticle=null;ensemble=null;render()}));
  $("resetButton").addEventListener("click",()=>{cfg.controls.forEach(c=>$(c.id).value=c.value);lastParticle=null;ensemble=null;playing=false;if($("playButton"))$("playButton").innerHTML='<i class="fa-solid fa-play"></i> Play';render()});
  if(slug==="stern-gerlach-sequence"){
    $("runOne").addEventListener("click",()=>{lastParticle=sampleSequence(state());ensemble=null;render()});
    $("runMany").addEventListener("click",()=>{let plus=0,minus=0;for(let i=0;i<100;i++){const run=sampleSequence(state()),last=run.results.at(-1);if(last?.outcome>0)plus++;else minus++}ensemble={plus,minus};lastParticle=null;render()});
  }
  if(slug==="operator-time-evolution"){
    $("playButton").addEventListener("click",()=>{playing=!playing;$("playButton").innerHTML=playing?'<i class="fa-solid fa-pause"></i> Pause':'<i class="fa-solid fa-play"></i> Play';if(playing){lastTime=performance.now();animation=requestAnimationFrame(tick)}else cancelAnimationFrame(animation)});
    const tick=now=>{if(!playing)return;const dt=now-lastTime;lastTime=now;$("phase").value=(Number($("phase").value)+dt*.04)%361;render();animation=requestAnimationFrame(tick)};
  }
  window.addEventListener("resize",render);render();
})();
