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
  function drawMagnet(ctx,x,y,axis,index){
    ctx.fillStyle="rgba(55,107,140,.13)";ctx.strokeStyle=colors.blue;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x-24,y-55);ctx.lineTo(x+24,y-55);ctx.lineTo(x+16,y-14);ctx.lineTo(x-16,y-14);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-16,y+14);ctx.lineTo(x+16,y+14);ctx.lineTo(x+24,y+55);ctx.lineTo(x-24,y+55);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=colors.ink;ctx.font="700 11px Inter";ctx.fillText("N",x-4,y-31);ctx.fillText("S",x-4,y+39);
    ctx.fillStyle=colors.green;ctx.font="700 12px Inter";ctx.textAlign="center";ctx.fillText(`SG${index}  ·  S${axis}`,x,y-70);ctx.textAlign="left";
  }
  function drawStop(ctx,x,y){
    ctx.strokeStyle=colors.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y-13);ctx.lineTo(x,y+13);ctx.stroke();
  }
  function drawDetector(ctx,x,y,active){
    ctx.fillStyle=active?colors.gold:"#eef2ef";ctx.strokeStyle=active?colors.gold:colors.grid;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(x,y,8,0,2*Math.PI);ctx.fill();ctx.stroke();
  }
  function draw(){
    const s=state(),run=displayedRun||runSequence(s,false),final=enumerateFinal(s),{ctx,width,height}=fit(),stages=run.results;
    const left=30,right=width-28,beamY=Math.min(220,height*.53),sourceEnd=118,usable=right-sourceEnd-40,spacing=usable/Math.max(1,stages.length),stageXs=stages.map((_,index)=>sourceEnd+spacing*(index+.72));
    ctx.fillStyle="rgba(166,75,53,.12)";ctx.strokeStyle=colors.rust;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(left,beamY-25,50,50,9);ctx.fill();ctx.stroke();
    ctx.fillStyle=colors.ink;ctx.font="700 11px Inter";ctx.textAlign="center";ctx.fillText("Ag oven",left+25,beamY+4);ctx.textAlign="left";
    ctx.fillStyle=colors.ink;ctx.fillRect(left+62,beamY-15,6,30);ctx.fillRect(left+76,beamY-9,6,18);
    ctx.strokeStyle=colors.gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left+50,beamY);ctx.lineTo(stageXs[0]-24,beamY);ctx.stroke();
    let incomingY=beamY;
    stages.forEach((stage,index)=>{
      const x=stageXs[index],isLast=index===stages.length-1,selectedUp=stage.outcome>0,upY=incomingY-34,downY=incomingY+34,branchEnd=isLast?right:Math.min(x+76,stageXs[index+1]-58),selectedY=selectedUp?upY:downY,blockedY=selectedUp?downY:upY;
      drawMagnet(ctx,x,incomingY,stage.axis,index+1);
      ctx.strokeStyle=colors.grid;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+18,incomingY);ctx.lineTo(branchEnd,blockedY);ctx.stroke();
      ctx.strokeStyle=colors.gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+18,incomingY);ctx.lineTo(branchEnd,selectedY);ctx.stroke();
      if(isLast){
        drawDetector(ctx,branchEnd,selectedY,true);
        drawDetector(ctx,branchEnd,blockedY,false);
        ctx.fillStyle=colors.muted;ctx.font="10px Inter";ctx.textAlign="right";ctx.fillText(`+${stage.axis}`,branchEnd-13,upY-5);ctx.fillText(`−${stage.axis}`,branchEnd-13,downY+13);ctx.textAlign="left";
      }else{
        drawStop(ctx,branchEnd,blockedY);
        const nextX=stageXs[index+1]-24;
        ctx.strokeStyle=colors.gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(branchEnd,selectedY);ctx.lineTo(nextX,selectedY);ctx.stroke();
      }
      incomingY=selectedY;
    });
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
