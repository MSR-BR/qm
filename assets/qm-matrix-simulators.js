(() => {
  const root=document.querySelector("[data-simulator-slug]"); if(!root)return;
  const slug=new URLSearchParams(location.search).get("sim")||"stern-gerlach-sequence";
  if(slug!=="stern-gerlach-sequence")return;
  const $=id=>document.getElementById(id);
  root.dataset.simulatorSlug=slug;
  const colors={green:"#2f6b4f",rust:"#a64b35",blue:"#376b8c",gold:"#d5b260",grid:"#dbe5dd",ink:"#26332c",muted:"#6b756f"};
  const axes={x:[1,0,0],z:[0,0,1]};
  const controls=[
    select("prepared","Incoming beam",[["unpolarized","Unpolarized"],["z+","Prepared |+⟩z"],["x+","Prepared |+⟩x"]],"unpolarized"),
    select("analyzer1","Analyzer 1",[["z","Measure Sz"],["x","Measure Sx"]],"z"),
    select("analyzer2","Analyzer 2",[["none","No analyzer"],["z","Measure Sz"],["x","Measure Sx"]],"x"),
    select("analyzer3","Analyzer 3",[["none","No analyzer"],["z","Measure Sz"],["x","Measure Sx"]],"z")
  ];
  function select(id,label,options,value){return{id,label,options,value}}
  $("simTitle").textContent="Stern–Gerlach and Sequential Measurements";
  $("simSubtitle").textContent="Follow one spin-½ particle through a clear sequence of analyzers. At every stage, the selected result becomes the state entering the next measurement.";
  $("plotTitle").textContent="One particle through sequential analyzers";
  document.title="Stern–Gerlach and Sequential Measurements | Quantum Mechanics";
  $("controlFields").innerHTML=controls.map(c=>`<div class="control-group"><label class="control-label" for="${c.id}">${c.label}</label><select id="${c.id}">${c.options.map(([v,l])=>`<option value="${v}"${v===c.value?" selected":""}>${l}</option>`).join("")}</select></div>`).join("");
  $("actionButtons").innerHTML=`<button class="sim-button" id="runOne" type="button"><i class="fa-solid fa-circle-play"></i> Send one</button><button class="sim-button secondary" id="runMany" type="button">Send 100</button><button class="sim-button secondary" id="resetButton" type="button"><i class="fa-solid fa-rotate-left"></i> Reset</button>`;
  [["Measurement record","record"],["Path probability","pathProbability"],["Final P(+)","plusFraction"],["Final P(−)","minusFraction"]].forEach(([label,id])=>$("metricPanel").insertAdjacentHTML("beforeend",`<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}Metric">—</div></div>`));
  $("equationBox").innerHTML=String.raw`\[P(\pm_{\mathbf n})=\left|\langle\pm_{\mathbf n}|\psi\rangle\right|^2=\frac{1\pm\mathbf r\cdot\mathbf n}{2}\]\[\text{After the result }\pm:\qquad |\psi\rangle\longrightarrow|\pm_{\mathbf n}\rangle\]\[S_z\rightarrow S_x\rightarrow S_z:\qquad P(+_z)=P(-_z)=\frac12\]`;
  window.MathJax?.typesetPromise?.([$("equationBox")]);
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const initialVector=value=>value==="z+"?[0,0,1]:value==="x+"?[1,0,0]:null;
  const probability=(vector,axis,outcome)=>vector?(1+outcome*dot(vector,axes[axis]))/2:.5;
  const activeAnalyzers=s=>[s.analyzer1,s.analyzer2,s.analyzer3].filter(axis=>axis!=="none");
  const state=()=>Object.fromEntries(controls.map(c=>[c.id,$(c.id).value]));
  const decimal=(value,digits=1)=>Number(value).toLocaleString("pt-BR",{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const set=(id,value)=>$(`${id}Metric`).textContent=value;
  function runSequence(s,random=true){
    let vector=initialVector(s.prepared),pathProbability=1;
    const results=activeAnalyzers(s).map(axis=>{
      const pPlus=probability(vector,axis,1);
      const outcome=random?(Math.random()<pPlus?1:-1):(pPlus>=.5?1:-1);
      const selectedProbability=outcome>0?pPlus:1-pPlus;
      pathProbability*=selectedProbability;
      vector=axes[axis].map(component=>component*outcome);
      return{axis,outcome,pPlus,pMinus:1-pPlus,selectedProbability};
    });
    return{results,pathProbability};
  }
  function enumerateFinal(s){
    let paths=[{vector:initialVector(s.prepared),probability:1,outcome:0}];
    activeAnalyzers(s).forEach(axis=>{
      paths=paths.flatMap(path=>[1,-1].map(outcome=>{const p=probability(path.vector,axis,outcome);return{vector:axes[axis].map(component=>component*outcome),probability:path.probability*p,outcome}})).filter(path=>path.probability>1e-12);
    });
    return{
      plus:paths.filter(path=>path.outcome>0).reduce((sum,path)=>sum+path.probability,0),
      minus:paths.filter(path=>path.outcome<0).reduce((sum,path)=>sum+path.probability,0)
    };
  }
  function fit(){
    const canvas=$("primaryCanvas"),ratio=Math.max(1,devicePixelRatio||1),rect=canvas.getBoundingClientRect(),width=Math.max(300,Math.round(rect.width)),height=Math.max(340,Math.round(rect.height));
    canvas.width=width*ratio;canvas.height=height*ratio;
    const ctx=canvas.getContext("2d");ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);ctx.font="12px Inter";
    return{ctx,width,height};
  }
  let displayedRun=null,ensemble=null;
  function draw(){
    const s=state(),run=displayedRun||runSequence(s,false),final=enumerateFinal(s),{ctx,width,height}=fit(),stages=run.results;
    const left=28,right=width-28,rowTop=45,rowGap=8,rowHeight=Math.min(82,(height-132)/Math.max(1,stages.length)),labelWidth=Math.min(245,width*.34),barX=left+labelWidth+28,barWidth=Math.max(100,right-barX);
    ctx.fillStyle=colors.muted;ctx.font="12px Inter";ctx.fillText(displayedRun?"Measured particle — each selected result prepares the next input":"Illustrative outcomes — press “Send one” for an actual measurement",left,25);
    let inputState=s.prepared==="unpolarized"?"mixed / unpolarized":s.prepared==="z+"?"|+⟩z":"|+⟩x";
    stages.forEach((stage,index)=>{
      const y=rowTop+index*(rowHeight+rowGap),plusSelected=stage.outcome>0;
      ctx.fillStyle=index%2?"rgba(55,107,140,.035)":"rgba(47,107,79,.045)";ctx.strokeStyle=colors.grid;ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(left,y,right-left,rowHeight,12);ctx.fill();ctx.stroke();
      ctx.fillStyle=colors.ink;ctx.font="700 13px Inter";ctx.fillText(`${index+1}. SG measures S${stage.axis}`,left+14,y+24);
      ctx.fillStyle=colors.muted;ctx.font="11px Inter";ctx.fillText(`input state: ${inputState}`,left+14,y+47);
      ctx.fillText(`selected: ${stage.outcome>0?"+":"−"}${stage.axis}`,left+14,y+66);
      [["+",stage.pPlus,colors.green,plusSelected],["−",stage.pMinus,colors.rust,!plusSelected]].forEach(([sign,p,color,selected],barIndex)=>{
        const by=y+18+barIndex*32;
        ctx.fillStyle="#edf1ed";ctx.beginPath();ctx.roundRect(barX,by,barWidth,20,6);ctx.fill();
        ctx.fillStyle=selected?color:"rgba(107,117,111,.34)";ctx.beginPath();ctx.roundRect(barX,by,Math.max(2,barWidth*p),20,6);ctx.fill();
        ctx.fillStyle=selected&&p>.28?"#fff":colors.ink;ctx.font=selected?"700 11px Inter":"11px Inter";ctx.fillText(`${sign}${stage.axis}  P = ${decimal(p*100)}%${selected?"  ← selected":""}`,barX+8,by+15);
      });
      inputState=`|${stage.outcome>0?"+":"−"}⟩${stage.axis}`;
      if(index<stages.length-1){ctx.strokeStyle=colors.gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(left+labelWidth*.52,y+rowHeight);ctx.lineTo(left+labelWidth*.52,y+rowHeight+rowGap);ctx.stroke()}
    });
    const recordY=height-45;
    ctx.fillStyle=colors.ink;ctx.font="700 12px Inter";ctx.fillText("Record:",left,recordY);
    run.results.forEach((stage,index)=>{
      const x=left+58+index*82;
      ctx.fillStyle=stage.outcome>0?colors.green:colors.rust;ctx.beginPath();ctx.roundRect(x,recordY-18,68,26,8);ctx.fill();
      ctx.fillStyle="#fff";ctx.fillText(`${stage.outcome>0?"+":"−"}${stage.axis}`,x+25,recordY);
    });
    ctx.fillStyle=colors.muted;ctx.font="12px Inter";ctx.fillText(`path probability: ${decimal(run.pathProbability*100,2)}%`,Math.min(width-185,left+320),recordY);
    const record=run.results.map(stage=>`${stage.outcome>0?"+":"−"}${stage.axis}`).join(" → ")||"—";
    set("record",record);set("pathProbability",`${decimal(run.pathProbability*100,2)}%`);
    if(ensemble){set("plusFraction",`${ensemble.plus}/100`);set("minusFraction",`${ensemble.minus}/100`)}else{set("plusFraction",`${decimal(final.plus*100)}%`);set("minusFraction",`${decimal(final.minus*100)}%`)}
    const sequence=activeAnalyzers(s).join(" → ");
    $("insightBox").textContent=sequence==="z → x → z"
      ?"The Sx measurement prepares either |+⟩x or |−⟩x. Both have equal projections on the final z basis, so the last Sz result is again 50/50."
      :"Only the selected branch continues. The result of each analyzer is the prepared input state for the next analyzer.";
  }
  controls.forEach(control=>$(control.id).addEventListener("input",()=>{displayedRun=null;ensemble=null;draw()}));
  $("runOne").addEventListener("click",()=>{displayedRun=runSequence(state(),true);ensemble=null;draw()});
  $("runMany").addEventListener("click",()=>{let plus=0,minus=0;for(let i=0;i<100;i++){const run=runSequence(state(),true),last=run.results.at(-1);if(last?.outcome>0)plus++;else minus++}ensemble={plus,minus};displayedRun=null;draw()});
  $("resetButton").addEventListener("click",()=>{controls.forEach(control=>$(control.id).value=control.value);displayedRun=null;ensemble=null;draw()});
  window.addEventListener("resize",draw);draw();
})();
