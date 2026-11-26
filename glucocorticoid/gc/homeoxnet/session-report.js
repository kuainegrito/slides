'use strict';

(function initHomeostasisSessionReporting(global){
  const DEFAULT_SAMPLE_INTERVAL_MS = 750;
  const DEFAULT_MAX_SAMPLES = 6000;
  const REPORT_VERSION = '2026.09.22-session-report-hidden-pools.1';

  function clone(value){
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function finite(value, fallback=null){
    const number=Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function uuid(){
    if(global.crypto?.randomUUID) return global.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,character=>{
      const random=Math.random()*16|0;
      return (character==='x'?random:(random&3|8)).toString(16);
    });
  }

  function browserSessionId(){
    const key='homeostasis.reportBrowserSessionId';
    try{
      let id=global.localStorage?.getItem(key);
      if(!id){
        id=uuid();
        global.localStorage?.setItem(key,id);
      }
      return id;
    }catch(_error){
      return uuid();
    }
  }

  function safeJsonForScript(value){
    return JSON.stringify(value)
      .replace(/</g,'\\u003c')
      .replace(/>/g,'\\u003e')
      .replace(/\u2028/g,'\\u2028')
      .replace(/\u2029/g,'\\u2029');
  }

  function parameterMap(snapshot, definitions){
    const bases=Object.fromEntries((definitions||[]).map(definition=>[definition.key,finite(definition.base,1)]));
    return Object.fromEntries((snapshot?.params||[]).map(parameter=>{
      const actual=finite(parameter.value);
      const baseline=bases[parameter.key];
      const normalized=actual != null && baseline ? actual/baseline : null;
      // The learner's input on this parameter, whenever there is one. A slider press moves the
      // control at once but the value only as the body responds, so an action's own before/after
      // values are nearly equal; without the control level the AI report saw every learner action
      // as "change 0" and could not tell a sustained input from a tap that was let go.
      const control=finite(parameter.control,0);
      return [parameter.key,Math.abs(control)>1e-3?{actual,normalized,control:Math.round(control*100)/100}:{actual,normalized}];
    }));
  }

  // The five internal states the solver integrates but never shows on a control (aqp2, kBody,
  // rbcMass, hco3Buffer, hco3Renal - see temporalModel.js's HIDDEN_STATES). Each is already a
  // dimensionless deviation from its own resting baseline (0), unlike a visible parameter's
  // actual/base ratio, so "normalized" here is just the value itself rather than a fraction.
  function hiddenStateMap(snapshot){
    const states=snapshot?.hiddenStates;
    if(!states||typeof states!=='object') return {};
    const entries=Object.entries(states)
      .map(([key,raw])=>[key,finite(raw)])
      .filter(([,value])=>value!=null);
    return Object.fromEntries(entries.map(([key,value])=>[key,{actual:value,normalized:value}]));
  }

  function reportRuntime(){
    const D=REPORT_DATA;
    const L=D.language==='zh'?{
      title:'HomeoXNet 模拟会话报告', generated:'生成时间', duration:'会话时长', interventions:'用户干预', scenario:'使用场景（大类 / 小类）', minStability:'最低稳定度',
      finalStability:'最终稳定度', strongest:'改变幅度最大的参数',
      deviations:'相对基线偏离最大的参数', chart:'交互式参数趋势', overlay:'叠加视图', separated:'分离视图',
      showAll:'显示全部', hideAll:'隐藏全部', showChanged:'仅显示有改变的参数', reset:'重置视图', zoomIn:'放大', zoomOut:'缩小', exportImage:'导出图像',
      elapsed:'累计模拟时间', wallElapsed:'实际经过时间', normalized:'归一化值', stability:'稳定度', actual:'实际值', simulationTime:'引擎时间戳',
      interventionLog:'干预时间线', parameterSummary:'参数起点、终点与极值', time:'时间', parameter:'参数', source:'来源',
      action:'阶段', before:'之前', after:'之后', change:'变化', initial:'初始值', final:'最终值', minimum:'最小值',
      maximum:'最大值', greatest:'最大偏离时间', noteTitle:'说明', noSelection:'请选择至少一个参数或稳定度。',
      note:'横坐标使用从首次干预起累计的模拟时间：调快或调慢模拟速度会正确反映为模拟进程的快慢，暂停和浏览器延迟不会拉长趋势。图表下方的色带标出当时所处的观察时间尺度；点击工具栏的“切换为真实时间轴”可改按学习者实际观看的秒数排列横轴（刻度最小 5 秒），用于核对某一段究竟看了多久真实时间。从头到尾未发生变化的参数默认隐藏，但仍可在图例中单击恢复或使用“显示全部”或“仅显示有改变的参数”。归一化值以模拟器配置的生理参考值为 1.0（100%），并非按本次会话的最小值和最大值缩放。稳定度使用右侧 0–100 轴；本报告仅描述模拟事件和生理趋势，不提供诊断或医学结论。',
      groups:'系统', all:'全部', isolateHint:'单击显示/隐藏；双击仅显示该参数', seconds:'秒', events:'项',
      timeScale:'观察时间尺度', timeScaleAuto:'自动', timeScaleManual:'手动',
      timeScaleHint:'色带 = 当时所处的观察时间尺度；虚线边框 = 手动选择，未跟随自动尺度',
      timeBasisToggleToReal:'切换为真实时间轴', timeBasisToggleToSimulated:'切换回模拟时间轴',
      timeBasisRealHint:'按学习者实际观看的秒数排列横轴，为节省空间刻度最小为 5 秒一格',
      hiddenTag:'内部隐藏状态', hiddenValue:'内部状态值（无量纲，非可观测量）',
      hiddenGroupHint:'这 5 项是模型内部积分的状态，用于重建它们所属的可见指标（如快速/肾性 HCO₃⁻ 池合成血中碳酸氢盐），界面上没有对应的控件或读数，仅供教学参考，不代表任何可测量的临床数值。',
      aiTitle:'AI 医学学习解读', aiGenerated:'解读生成', aiProvider:'模型',
      aiDisclaimer:'本部分由大语言模型基于模拟记录生成，仅用于生理学与病理生理学教学，不构成真实患者的诊断、治疗建议或临床决策。',
      started:'开始', updated:'更新', ended:'结束', running:'运行', paused:'暂停', unstable:'不稳定', zero:'稳定度为零', stopped:'已停止'
    }:{
      title:'HomeoXNet Simulation Session Report', generated:'Generated', duration:'Session duration', interventions:'User interventions', scenario:'Scenario used (major / minor)',
      minStability:'Minimum Stability Score', finalStability:'Final Stability Score',
      yes:'Yes', no:'No', strongest:'Most strongly altered parameters', deviations:'Largest normalized deviations',
      chart:'Interactive parameter trends', overlay:'Overlay', separated:'Separated', showAll:'Show all', hideAll:'Hide all', showChanged:'Show changed parameters only',
      reset:'Reset view', zoomIn:'Zoom in', zoomOut:'Zoom out', exportImage:'Export image', elapsed:'Accumulated simulation time',
      wallElapsed:'Wall-clock elapsed', normalized:'Normalized value', stability:'Stability Score', actual:'Actual value', simulationTime:'Engine timestamp',
      interventionLog:'Chronological intervention log', parameterSummary:'Initial, final, and extreme parameter values', time:'Time',
      parameter:'Parameter', source:'Source', action:'Phase', before:'Before', after:'After', change:'Change', initial:'Initial',
      final:'Final', minimum:'Minimum', maximum:'Maximum', greatest:'Greatest deviation', noteTitle:'Notes',
      noSelection:'Select at least one parameter or the Stability Score.',
      note:'The x-axis uses accumulated simulation time from the first intervention, so simulation speed changes are represented correctly while pauses and browser delays do not stretch the trend. The band under the chart marks which observation time scale was active at each point; the toolbar’s “Switch to real-time axis” button re-plots the x-axis by the seconds actually watched instead (ticks no finer than 5 seconds), to check how much real time a stretch actually took. Parameters that remained unchanged throughout the session are hidden by default, but can be restored from the legend or with “Show all” or “Show changed parameters only”. Normalized values use the simulator-configured physiological reference as 1.0 (100%); they are not rescaled to this session’s observed minimum and maximum. Stability Score uses the right-side 0–100 axis. This report describes simulation events and physiological trends only and does not provide diagnostic or medical conclusions.',
      groups:'Systems', all:'All', isolateHint:'Click to show/hide; double-click to isolate', seconds:'s', events:'events',
      timeScale:'Observation time scale', timeScaleAuto:'Auto', timeScaleManual:'Manual',
      timeScaleHint:'Band color = active observation time scale; dashed border = manually held, not following auto-scaling',
      timeBasisToggleToReal:'Switch to real-time axis', timeBasisToggleToSimulated:'Switch back to simulated-time axis',
      timeBasisRealHint:'Lays out the x-axis by the seconds actually watched; to save space, ticks never go finer than 5 seconds',
      hiddenTag:'hidden internal state', hiddenValue:'Internal state value (dimensionless, not directly observable)',
      hiddenGroupHint:'These 5 are states the model integrates internally to reconstruct the visible readout they belong to (e.g. the fast and renal HCO3- pools together make up blood bicarbonate). Nothing in the interface displays them directly - they are shown here for teaching only and are not a measurable clinical value.',
      aiTitle:'AI Medical Learning Interpretation', aiGenerated:'Generated', aiProvider:'Model',
      aiDisclaimer:'This section was generated by a large language model from the simulation record for physiology and pathophysiology education only. It is not diagnosis, treatment advice, or clinical decision support for a real patient.',
      started:'Started', updated:'Updated', ended:'Ended', running:'Running', paused:'Paused', unstable:'Unstable',
      zero:'Stability zero', stopped:'Stopped'
    };
    const svgNS='http://www.w3.org/2000/svg';
    const palette=['#49c6ff','#ff8c69','#8fe388','#c7a7ff','#ffd166','#4dd7c8','#ff6b9d','#90a8ff','#f6a955','#a8e063','#67d5ff','#e486ff'];
    const definitionByKey=Object.fromEntries(D.definitions.map(definition=>[definition.key,definition]));
    const colorByKey=Object.fromEntries(D.definitions.map((definition,index)=>[definition.key,palette[index%palette.length]]));
    const defaultVisibleKeys=Array.isArray(D.defaultVisibleParameterIds)
      ? D.defaultVisibleParameterIds
      : D.definitions.map(definition=>definition.key);
    const visible=new Set(defaultVisibleKeys);
    let stabilityVisible=true;
    let mode='overlay';
    // 'simulated' (default) plots accumulated simulation time, so speed changes are represented
    // correctly - see the note below the chart. 'real' plots wall-clock seconds instead: the same
    // lens switch that vanishes into a point at 2880x compression is still a full-width stretch of
    // real seconds here, which is what "how long did I actually watch this" needs.
    let timeBasis='simulated';
    const sampleTime=sample=>timeBasis==='real'
      ? (Number.isFinite(sample?.elapsed)?sample.elapsed:0)
      : (Number.isFinite(sample?.normalizedElapsed)?sample.normalizedElapsed:(sample?.elapsed||0));
    const eventTime=event=>timeBasis==='real'
      ? (Number.isFinite(event?.elapsed)?event.elapsed:0)
      : (Number.isFinite(event?.normalizedElapsed)?event.normalizedElapsed:(event?.elapsed||0));
    function fullDurationFor(){
      return timeBasis==='real'
        ? Math.max(.001,D.metadata.durationSeconds||0,sampleTime(D.samples.at(-1)))
        : Math.max(.001,D.metadata.normalizedSimulationDurationSeconds||0,sampleTime(D.samples.at(-1)));
    }
    let fullDuration=fullDurationFor();
    let viewStart=0;
    let viewEnd=fullDuration;
    let panAnchor=null;
    const svg=document.getElementById('chartSvg');
    const frame=document.getElementById('chartFrame');
    const tooltip=document.getElementById('tooltip');
    const legend=document.getElementById('traceLegend');

    const esc=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
    // Link text and URL both originate from model output, and this report is a standalone
    // HTML file the user opens from disk, so a permissive renderer would turn that output
    // into an execution vector. Only https URLs on these hosts become anchors; anything else
    // degrades to plain text so a problem stays visible instead of vanishing.
    const ALLOWED_LINK_HOSTS=new Set([
      'test.pmphai.com',
      'www.merckmanuals.com',
      'www.msdmanuals.cn',
      'my.clevelandclinic.org',
      'www.mayoclinic.org',
      'www.osmosis.org'
    ]);
    function safeLinkUrl(raw){
      try{
        const url=new URL(String(raw));
        if(url.protocol!=='https:') return null;
        return ALLOWED_LINK_HOSTS.has(url.hostname)?url.href:null;
      }catch{
        return null;
      }
    }
    function appendMarkdownInline(element, value){
      const text=String(value??'');
      const pattern=/(\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
      let cursor=0;
      let match;
      while((match=pattern.exec(text))){
        if(match.index>cursor) element.append(document.createTextNode(text.slice(cursor,match.index)));
        const token=match[0];
        let node;
        if(token.startsWith('[')){
          const parts=token.match(/^\[([^\]\n]+)\]\(([^)\s]+)\)$/);
          const href=parts?safeLinkUrl(parts[2]):null;
          if(href){
            node=document.createElement('a');
            node.href=href;
            node.target='_blank';
            node.rel='noopener noreferrer';
            node.textContent=parts[1];
          }else{
            node=document.createTextNode(token);
          }
        }else if(token.startsWith('**')||token.startsWith('__')){
          node=document.createElement('strong');
          node.textContent=token.slice(2,-2);
        }else if(token.startsWith('`')){
          node=document.createElement('code');
          node.textContent=token.slice(1,-1);
        }else{
          node=document.createElement('em');
          node.textContent=token.slice(1,-1);
        }
        element.append(node);
        cursor=match.index+token.length;
      }
      if(cursor<text.length) element.append(document.createTextNode(text.slice(cursor)));
    }
    function renderMarkdown(element, value){
      if(!element) return;
      element.replaceChildren();
      const lines=String(value??'').replace(/\r\n?/g,'\n').split('\n');
      for(let index=0;index<lines.length;){
        const line=lines[index];
        if(!line.trim()){ index+=1; continue; }
        const heading=line.match(/^(#{1,3})\s+(.+)$/);
        if(heading){
          const node=document.createElement(heading[1].length===1?'h3':'h4');
          appendMarkdownInline(node,heading[2]);
          element.append(node); index+=1; continue;
        }
        if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)){ element.append(document.createElement('hr')); index+=1; continue; }
        const unordered=line.match(/^\s*[-*+]\s+(.+)$/);
        const ordered=line.match(/^\s*\d+[.)]\s+(.+)$/);
        if(unordered||ordered){
          const list=document.createElement(unordered?'ul':'ol');
          const matcher=unordered?/^\s*[-*+]\s+(.+)$/:/^\s*\d+[.)]\s+(.+)$/;
          while(index<lines.length){
            const item=lines[index].match(matcher);
            if(!item) break;
            const li=document.createElement('li');
            appendMarkdownInline(li,item[1]);
            list.append(li); index+=1;
          }
          element.append(list); continue;
        }
        const quote=line.match(/^\s*>\s?(.+)$/);
        const node=document.createElement(quote?'blockquote':'p');
        appendMarkdownInline(node,quote?quote[1]:line);
        element.append(node); index+=1;
      }
    }
    const formatNumber=(value,digits=2)=>{
      const number=Number(value);
      if(!Number.isFinite(number)) return '—';
      const absolute=Math.abs(number);
      const places=absolute>=100?1:(absolute>=10?2:3);
      return number.toLocaleString(undefined,{maximumFractionDigits:digits==null?places:digits});
    };
    const formatDuration=seconds=>{
      const total=Math.max(0,Math.round(Number(seconds)||0));
      const hours=Math.floor(total/3600);
      const minutes=Math.floor((total%3600)/60);
      const remainder=total%60;
      return hours?`${hours}h ${minutes}m ${remainder}s`:(minutes?`${minutes}m ${remainder}s`:`${remainder}s`);
    };
    const sourceLabel=source=>({
      slider:D.language==='zh'?'滑条':'Slider',
      button:D.language==='zh'?'按钮':'Button',
      preset_event:D.language==='zh'?'预设事件':'Preset event',
      other:D.language==='zh'?'其他控件':'Other control'
    }[source]||source||'—');
    const phaseLabel=phase=>({started:L.started,updated:L.updated,ended:L.ended}[phase]||phase||'—');
    const statusLabel=status=>({running:L.running,paused:L.paused,unstable:L.unstable,'stability-zero':L.zero,stopped:L.stopped}[status]||status||'—');

    function setText(id,text){
      const element=document.getElementById(id);
      if(element) element.textContent=text;
    }

    function fillStaticText(){
      document.title=L.title;
      setText('reportTitle',L.title);
      setText('generatedLabel',L.generated);
      setText('durationLabel',L.duration);
      setText('interventionsLabel',L.interventions);
      setText('scenarioLabel',L.scenario);
      setText('minimumLabel',L.minStability);
      setText('finalLabel',L.finalStability);
      setText('strongestTitle',L.strongest);
      setText('deviationsTitle',L.deviations);
      setText('chartTitle',L.chart);
      setText('showAll',L.showAll);
      setText('hideAll',L.hideAll);
      setText('showChanged',L.showChanged);
      setText('zoomIn',L.zoomIn);
      setText('zoomOut',L.zoomOut);
      setText('resetView',L.reset);
      setText('exportImage',L.exportImage);
      syncTimeBasisButton();
      setText('interventionTitle',L.interventionLog);
      setText('parameterTitle',L.parameterSummary);
      setText('noteTitle',L.noteTitle);
      setText('noteText',L.note);
      const aiSection=document.getElementById('aiAnalysisSection');
      if(D.aiAnalysis?.status==='complete'&&D.aiAnalysis?.text&&aiSection){
        aiSection.hidden=false;
        setText('aiAnalysisTitle',L.aiTitle);
        renderMarkdown(document.getElementById('aiAnalysisText'),D.aiAnalysis.text);
        setText('aiAnalysisDisclaimer',L.aiDisclaimer);
        const generated=D.aiAnalysis.generatedAt?new Date(D.aiAnalysis.generatedAt).toLocaleString():'—';
        setText('aiAnalysisMeta',`${L.aiGenerated}: ${generated} · ${L.aiProvider}: ${D.aiAnalysis.provider||''} ${D.aiAnalysis.model||''}`.trim());
      }
      setText('generatedValue',new Date(D.metadata.generatedAt).toLocaleString());
      setText('durationValue',formatDuration(D.metadata.durationSeconds));
      setText('interventionsValue',String(D.metadata.totalInterventions));
      setText('scenarioValue',(D.scenariosUsed||[]).length
        ? D.scenariosUsed.map(item=>`${item.majorLabel||item.majorId||'—'} / ${item.minorLabel||item.minorId||'—'}`).join(' · ')
        : '—');
      setText('minimumValue',formatNumber(D.metadata.minimumStabilityScore,1));
      setText('finalValue',formatNumber(D.metadata.finalStabilityScore,1));
      document.getElementById('modeSelect').innerHTML=`<option value="overlay">${esc(L.overlay)}</option><option value="separated">${esc(L.separated)}</option>`;
      document.getElementById('strongestList').innerHTML=(D.summary.mostAltered.length?D.summary.mostAltered:['—']).map(item=>`<li>${esc(item)}</li>`).join('');
      document.getElementById('deviationsList').innerHTML=(D.summary.largestDeviations.length?D.summary.largestDeviations:['—']).map(item=>`<li>${esc(item)}</li>`).join('');
    }

    function buildGroupControls(){
      const box=document.getElementById('groupControls');
      // The "hidden" group only exists if this session actually recorded any hidden-pool
      // samples (2026-09-22+ clients); an older report's D.groups.hidden would otherwise show
      // an empty, dead button.
      const hasHidden=D.definitions.some(definition=>definition.group==='hidden');
      const groups=Object.entries(D.groups||{}).filter(([key])=>key!=='hidden'||hasHidden);
      box.innerHTML=`<span class="control-label">${esc(L.groups)}</span>`;
      groups.forEach(([key,label])=>{
        const button=document.createElement('button');
        button.type='button';
        button.textContent=label;
        if(key==='hidden') button.title=L.hiddenGroupHint;
        button.addEventListener('click',()=>{
          D.definitions.filter(definition=>definition.group===key).forEach(definition=>visible.add(definition.key));
          syncLegend();
          draw();
        });
        box.appendChild(button);
      });
    }

    function buildLegend(){
      legend.innerHTML='';
      D.definitions.forEach(definition=>{
        const button=document.createElement('button');
        button.type='button';
        button.className='trace-toggle';
        button.dataset.key=definition.key;
        button.title=L.isolateHint;
        const swatch=document.createElement('span');
        swatch.className='trace-swatch';
        swatch.style.background=colorByKey[definition.key];
        const label=document.createElement('span');
        label.textContent=definition.label;
        const remove=document.createElement('span');
        remove.className='trace-remove';
        remove.textContent='×';
        remove.setAttribute('aria-hidden','true');
        button.append(swatch,label,remove);
        button.addEventListener('click',()=>toggleTrace(definition.key));
        button.addEventListener('dblclick',event=>{
          event.preventDefault();
          visible.clear();
          visible.add(definition.key);
          stabilityVisible=false;
          syncLegend();
          draw();
        });
        legend.appendChild(button);
      });
      const stabilityButton=document.createElement('button');
      stabilityButton.type='button';
      stabilityButton.id='stabilityLegend';
      stabilityButton.className='trace-toggle stability-toggle';
      stabilityButton.title=L.isolateHint;
      stabilityButton.innerHTML='<span class="trace-swatch"></span><span></span><span class="trace-remove">×</span>';
      stabilityButton.querySelector('.trace-swatch').style.background='#ff3f68';
      stabilityButton.querySelector('span:nth-child(2)').textContent=L.stability;
      stabilityButton.addEventListener('click',()=>{
        stabilityVisible=!stabilityVisible;
        syncLegend();
        draw();
      });
      stabilityButton.addEventListener('dblclick',event=>{
        event.preventDefault();
        visible.clear();
        stabilityVisible=true;
        syncLegend();
        draw();
      });
      legend.appendChild(stabilityButton);
      syncLegend();
    }

    // Static, once-per-report legend for the time-scale rail drawn under the chart: one swatch per
    // lens actually used in this session, plus the auto/manual convention. Unlike the parameter
    // legend it isn't interactive - the rail itself has no per-lens show/hide, only the hover detail.
    function buildLensLegend(){
      const container=document.getElementById('lensLegend');
      if(!container) return;
      const segments=lensSegments();
      if(!segments.length){ container.hidden=true; return; }
      container.hidden=false;
      const seen=new Map();
      segments.forEach(segment=>{ if(!seen.has(segment.lensId)) seen.set(segment.lensId,segment.lensTitle); });
      const label=document.createElement('span');
      label.className='lens-legend-label';
      label.textContent=L.timeScale;
      container.replaceChildren(label);
      seen.forEach((title,id)=>{
        const chip=document.createElement('span');
        chip.className='lens-chip';
        const swatch=document.createElement('span');
        swatch.className='lens-swatch';
        swatch.style.background=lensColor(id);
        chip.append(swatch,document.createTextNode(title));
        container.appendChild(chip);
      });
      const hint=document.createElement('span');
      hint.className='lens-legend-hint';
      hint.textContent=L.timeScaleHint;
      container.appendChild(hint);
    }

    function toggleTrace(key){
      if(visible.has(key)) visible.delete(key); else visible.add(key);
      syncLegend();
      draw();
    }

    function syncLegend(){
      legend.querySelectorAll('[data-key]').forEach(button=>{
        const on=visible.has(button.dataset.key);
        button.classList.toggle('off',!on);
        button.setAttribute('aria-pressed',String(on));
      });
      const stability=document.getElementById('stabilityLegend');
      stability?.classList.toggle('off',!stabilityVisible);
      stability?.setAttribute('aria-pressed',String(stabilityVisible));
    }

    function syncTimeBasisButton(){
      const button=document.getElementById('timeBasisToggle');
      if(!button) return;
      const active=timeBasis==='real';
      button.textContent=active?L.timeBasisToggleToSimulated:L.timeBasisToggleToReal;
      button.title=active?'':L.timeBasisRealHint;
      button.classList.toggle('primary-tool',active);
      button.setAttribute('aria-pressed',String(active));
    }

    function svgElement(tag,attributes={}){
      const element=document.createElementNS(svgNS,tag);
      Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,String(value)));
      return element;
    }

    function addText(x,y,text,attributes={}){
      const element=svgElement('text',{x,y,...attributes});
      element.textContent=text;
      svg.appendChild(element);
      return element;
    }

    function samplesInView(){
      const selected=D.samples.filter(sample=>sampleTime(sample)>=viewStart-.001 && sampleTime(sample)<=viewEnd+.001);
      if(selected.length>=2) return selected;
      return D.samples.slice(0,Math.min(2,D.samples.length));
    }

    function valueRange(keys,samples){
      const values=[1];
      keys.forEach(key=>samples.forEach(sample=>{
        const value=sample.parameters?.[key]?.normalized;
        if(Number.isFinite(value)) values.push(value);
      }));
      let minimum=Math.min(...values);
      let maximum=Math.max(...values);
      if(maximum-minimum<.08){ minimum-=.05; maximum+=.05; }
      const padding=(maximum-minimum)*.12;
      return [minimum-padding,maximum+padding];
    }

    function pathFor(samples,valueFor,xFor,yFor){
      let path='';
      let drawing=false;
      samples.forEach(sample=>{
        const value=valueFor(sample);
        if(!Number.isFinite(value)){ drawing=false; return; }
        const x=xFor(sampleTime(sample));
        const y=yFor(value);
        path+=`${drawing?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;
        drawing=true;
      });
      return path;
    }

    function tickValues(minimum,maximum,count=5){
      const result=[];
      for(let index=0;index<count;index+=1) result.push(minimum+(maximum-minimum)*index/(count-1));
      return result;
    }

    // The real-time axis is laid out in whole seconds the learner actually watched, which for most
    // sessions is a much shorter span than the simulated clock - dense enough that even-spaced
    // fractional ticks (tickValues above) would crowd the axis with numbers like "13.7s". Snapping
    // to round steps of at least 5 seconds keeps it readable at any zoom level.
    const REAL_TIME_TICK_STEPS=[5,10,15,30,60,120,300,600,900,1800,3600,7200];
    function realTimeTickStep(span){
      const raw=Math.max(5,span/6);
      const step=REAL_TIME_TICK_STEPS.find(candidate=>candidate>=raw);
      return step||Math.ceil(raw/3600)*3600;
    }
    function realTimeTicks(minimum,maximum){
      const step=realTimeTickStep(Math.max(.001,maximum-minimum));
      const ticks=[];
      for(let value=Math.ceil(minimum/step)*step; value<=maximum+1e-6; value+=step) ticks.push(value);
      // Only fall back to labeling the window edge when NO step-aligned tick landed inside it -
      // unconditionally adding the edge (as an earlier version of this did) put it as little as a
      // couple of seconds from the next regular tick, breaking the 5-second floor this axis exists
      // to guarantee.
      if(!ticks.length) ticks.push(Math.max(0,minimum));
      return ticks;
    }

    function interventionGroups(){
      const groups=[];
      D.interventions.slice().sort((a,b)=>eventTime(a)-eventTime(b)).forEach(event=>{
        const elapsed=eventTime(event);
        const prior=groups.at(-1);
        const sameAction=prior&&event.actionId&&prior.actionId===event.actionId;
        const legacySameMoment=prior&&!event.actionId&&!prior.actionId&&Math.abs(elapsed-prior.elapsed)<=.5;
        if(sameAction||legacySameMoment) prior.events.push(event);
        else groups.push({elapsed,actionId:event.actionId||'',events:[event]});
      });
      return groups;
    }

    function interventionTooltip(group){
      const lines=[`<b>${esc(L.time)}: ${formatNumber(group.elapsed,2)} ${esc(L.seconds)}</b>`];
      group.events.slice(0,8).forEach(event=>{
        const unit=event.unit?` ${esc(event.unit)}`:'';
        const change=Number.isFinite(event.percentageChange)?`${event.percentageChange>=0?'+':''}${formatNumber(event.percentageChange,1)}%`:
          (Number.isFinite(event.absoluteChange)?`${event.absoluteChange>=0?'+':''}${formatNumber(event.absoluteChange,3)}${unit}`:'—');
        lines.push(`${esc(event.parameterName)}: ${esc(formatNumber(event.valueBefore,3))}${unit} → ${esc(formatNumber(event.valueAfter,3))}${unit} (${esc(change)}; ${esc(sourceLabel(event.source))}; ${esc(event.interventionType||event.source||'—')})`);
      });
      if(group.events.length>8) lines.push(`+${group.events.length-8} ${esc(L.events)}`);
      return lines.join('<br>');
    }

    // Fixed hues for the simulator's four lenses, kept apart from both the intervention marker
    // colors and the parameter trace palette so a learner never confuses "what happened" with
    // "how it was being watched". An id outside this map (future lens) still gets a stable color.
    const LENS_COLORS={seconds:'#3ddc97',minutes:'#5b8cff',hours:'#c084fc',days:'#ff6f91'};
    function lensColor(id){
      if(LENS_COLORS[id]) return LENS_COLORS[id];
      const values=Object.values(LENS_COLORS);
      let hash=0;
      String(id||'').split('').forEach(character=>{ hash=(hash*31+character.charCodeAt(0))>>>0; });
      return values[hash%values.length];
    }

    // One row per stretch of time the learner watched through a single lens/auto combination.
    // Built once per draw from the recorder's own timeline, so it always matches the sample and
    // intervention clock the rest of the chart uses.
    function lensSegments(){
      const events=(D.lensEvents||[]).slice().sort((a,b)=>eventTime(a)-eventTime(b));
      return events.map((event,index)=>({
        start:eventTime(event),
        end:index+1<events.length?eventTime(events[index+1]):fullDuration,
        lensId:event.lensId||'',
        lensTitle:event.lensTitle||event.lensId||'',
        auto:Boolean(event.auto),
        compression:event.compression
      }));
    }

    function lensTooltip(segment){
      const mode=segment.auto?L.timeScaleAuto:L.timeScaleManual;
      const compressionText=Number.isFinite(segment.compression)&&segment.compression>0
        ? ` · ${formatNumber(segment.compression,segment.compression<10?1:0)}×`
        : '';
      const end=Math.min(segment.end,fullDuration);
      return `<b>${esc(L.timeScale)}: ${esc(segment.lensTitle)}</b><br>${esc(mode)}${compressionText}<br>${esc(L.time)}: ${formatNumber(segment.start,1)}–${formatNumber(end,1)} ${esc(L.seconds)}`;
    }

    function showTooltip(html,event){
      tooltip.innerHTML=html;
      tooltip.hidden=false;
      const frameRect=frame.getBoundingClientRect();
      const tooltipRect=tooltip.getBoundingClientRect();
      const left=Math.min(frameRect.width-tooltipRect.width-10,Math.max(10,event.clientX-frameRect.left+14));
      const top=Math.min(frameRect.height-tooltipRect.height-10,Math.max(10,event.clientY-frameRect.top+14));
      tooltip.style.left=`${left}px`;
      tooltip.style.top=`${top}px`;
    }

    function hideTooltip(){
      tooltip.hidden=true;
    }

    function closestSample(elapsed){
      let low=0;
      let high=D.samples.length-1;
      while(low<high){
        const middle=Math.floor((low+high)/2);
        if(sampleTime(D.samples[middle])<elapsed) low=middle+1; else high=middle;
      }
      const current=D.samples[low];
      const prior=D.samples[Math.max(0,low-1)];
      return Math.abs((prior?sampleTime(prior):Infinity)-elapsed)<=Math.abs((current?sampleTime(current):Infinity)-elapsed)?prior:current;
    }

    function draw(){
      const keys=D.definitions.filter(definition=>visible.has(definition.key)).map(definition=>definition.key);
      const traces=keys.map(key=>({type:'parameter',key,definition:definitionByKey[key]}));
      if(stabilityVisible) traces.push({type:'stability',key:'__stability',definition:{label:L.stability,unit:''}});
      const width=Math.max(720,Math.round(frame.clientWidth||1100));
      const height=mode==='separated'?Math.max(520,traces.length*118+76):560;
      const margin={left:74,right:stabilityVisible&&mode==='overlay'?72:28,top:24,bottom:54};
      const plot={x:margin.left,y:margin.top,width:width-margin.left-margin.right,height:height-margin.top-margin.bottom};
      svg.replaceChildren();
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      svg.setAttribute('width',String(width));
      svg.setAttribute('height',String(height));
      svg.style.height=`${height}px`;
      const background=svgElement('rect',{x:0,y:0,width,height,fill:'#07111f'});
      svg.appendChild(background);
      if(!traces.length || !D.samples.length){
        addText(width/2,height/2,L.noSelection,{'text-anchor':'middle',fill:'#a9bfd5','font-size':16});
        return;
      }
      const samples=samplesInView();
      const xFor=elapsed=>plot.x+(elapsed-viewStart)/Math.max(.001,viewEnd-viewStart)*plot.width;
      const realTime=timeBasis==='real';
      const timeTicks=realTime?realTimeTicks(viewStart,viewEnd):tickValues(viewStart,viewEnd,7);
      timeTicks.forEach(time=>{
        const x=xFor(time);
        svg.appendChild(svgElement('line',{x1:x,y1:plot.y,x2:x,y2:plot.y+plot.height,stroke:'#1b3249','stroke-width':1}));
        addText(x,plot.y+plot.height+24,`${formatNumber(time,realTime?0:1)}s`,{'text-anchor':'middle',fill:'#8faac2','font-size':11});
      });
      addText(plot.x+plot.width/2,height-12,realTime?L.wallElapsed:L.elapsed,{'text-anchor':'middle',fill:'#c8d9e8','font-size':12,'font-weight':700});

      // A thin rail under the plot, one colored segment per stretch the learner watched through a
      // single lens/auto combination - so the x-axis itself says which time scale was active where,
      // not just what the parameter curves did. Dashed border = a manual choice, not auto-scaling.
      const railTop=plot.y+plot.height+2;
      const railHeight=10;
      const railSegments=lensSegments().filter(segment=>segment.end>=viewStart&&segment.start<=viewEnd);
      if(railSegments.length){
        addText(plot.x-10,railTop+railHeight/2+3,L.timeScale,{'text-anchor':'end',fill:'#8aa0b8','font-size':9,'font-weight':700});
      }
      railSegments.forEach(segment=>{
        const x0=xFor(Math.max(segment.start,viewStart));
        const x1=xFor(Math.min(segment.end,viewEnd));
        const segmentWidth=Math.max(1,x1-x0);
        const color=lensColor(segment.lensId);
        svg.appendChild(svgElement('rect',{x:x0,y:railTop,width:segmentWidth,height:railHeight,fill:color,opacity:.4,rx:2,'pointer-events':'none'}));
        if(!segment.auto){
          svg.appendChild(svgElement('rect',{x:x0,y:railTop,width:segmentWidth,height:railHeight,fill:'none',stroke:color,'stroke-width':1,'stroke-dasharray':'3 2',rx:2,'pointer-events':'none'}));
        }
        if(segment.start>viewStart){
          const boundaryX=xFor(segment.start);
          svg.appendChild(svgElement('line',{x1:boundaryX,y1:railTop-2,x2:boundaryX,y2:railTop+railHeight+2,stroke:color,'stroke-width':1.5,opacity:.9,'pointer-events':'none'}));
        }
        const hit=svgElement('rect',{x:x0,y:railTop,width:Math.max(6,segmentWidth),height:railHeight,fill:'transparent','pointer-events':'all',cursor:'help'});
        hit.addEventListener('pointerenter',event=>showTooltip(lensTooltip(segment),event));
        hit.addEventListener('pointermove',event=>showTooltip(lensTooltip(segment),event));
        hit.addEventListener('pointerleave',hideTooltip);
        svg.appendChild(hit);
      });

      let overlayRange=null;
      const laneData=[];
      if(mode==='overlay'){
        overlayRange=valueRange(keys,samples);
        const [minimum,maximum]=overlayRange;
        const yFor=value=>plot.y+(maximum-value)/(maximum-minimum)*plot.height;
        tickValues(minimum,maximum,6).forEach(value=>{
          const y=yFor(value);
          svg.appendChild(svgElement('line',{x1:plot.x,y1:y,x2:plot.x+plot.width,y2:y,stroke:'#1b3249','stroke-width':1}));
          addText(plot.x-10,y+4,formatNumber(value,2),{'text-anchor':'end',fill:'#8faac2','font-size':11});
        });
        addText(18,plot.y+plot.height/2,L.normalized,{transform:`rotate(-90 18 ${plot.y+plot.height/2})`,'text-anchor':'middle',fill:'#c8d9e8','font-size':12,'font-weight':700});
        keys.forEach(key=>{
          const definition=definitionByKey[key];
          const path=pathFor(samples,sample=>sample.parameters?.[key]?.normalized,xFor,yFor);
          if(path) svg.appendChild(svgElement('path',{d:path,fill:'none',stroke:colorByKey[key],'stroke-width':2.25,'stroke-dasharray':definition?.hidden?'6 3':'','stroke-linejoin':'round','stroke-linecap':'round'}));
        });
        if(stabilityVisible){
          const stabilityY=value=>plot.y+(100-value)/100*plot.height;
          [0,25,50,75,100].forEach(value=>addText(plot.x+plot.width+10,stabilityY(value)+4,String(value),{fill:'#ff829b','font-size':11}));
          addText(width-14,plot.y+plot.height/2,L.stability,{transform:`rotate(90 ${width-14} ${plot.y+plot.height/2})`,'text-anchor':'middle',fill:'#ff829b','font-size':12,'font-weight':700});
          const stabilityPath=pathFor(samples,sample=>sample.stabilityScore,xFor,stabilityY);
          if(stabilityPath) svg.appendChild(svgElement('path',{d:stabilityPath,fill:'none',stroke:'#ff3f68','stroke-width':3,'stroke-dasharray':'8 4','stroke-linejoin':'round'}));
        }
      }else{
        const laneHeight=plot.height/traces.length;
        traces.forEach((trace,index)=>{
          const laneTop=plot.y+index*laneHeight;
          const laneBottom=laneTop+laneHeight;
          const range=trace.type==='stability'?[0,100]:valueRange([trace.key],samples);
          const yFor=value=>laneTop+(range[1]-value)/(range[1]-range[0])*laneHeight;
          laneData.push({trace,laneTop,laneBottom,range,yFor});
          svg.appendChild(svgElement('rect',{x:plot.x,y:laneTop,width:plot.width,height:laneHeight,fill:index%2?'#091727':'#071421'}));
          svg.appendChild(svgElement('line',{x1:plot.x,y1:laneBottom,x2:plot.x+plot.width,y2:laneBottom,stroke:'#294159','stroke-width':1}));
          const label=trace.type==='stability'?L.stability:trace.definition.label;
          addText(plot.x-10,laneTop+laneHeight/2+4,label,{'text-anchor':'end',fill:trace.type==='stability'?'#ff829b':colorByKey[trace.key],'font-size':10,'font-weight':700});
          addText(plot.x+5,laneTop+13,`${formatNumber(range[1],2)} / ${formatNumber(range[0],2)}`,{fill:'#69869f','font-size':9});
          const path=pathFor(samples,sample=>trace.type==='stability'?sample.stabilityScore:sample.parameters?.[trace.key]?.normalized,xFor,yFor);
          if(path) svg.appendChild(svgElement('path',{d:path,fill:'none',stroke:trace.type==='stability'?'#ff3f68':colorByKey[trace.key],'stroke-width':trace.type==='stability'?3:2.2,'stroke-dasharray':trace.type==='stability'?'8 4':(trace.definition?.hidden?'6 3':''),'stroke-linejoin':'round','stroke-linecap':'round'}));
        });
      }

      const hover=svgElement('rect',{x:plot.x,y:plot.y,width:plot.width,height:plot.height,fill:'transparent','pointer-events':'all',cursor:'crosshair'});
      svg.appendChild(hover);
      hover.addEventListener('pointerdown',event=>{
        panAnchor={clientX:event.clientX,start:viewStart,end:viewEnd,width:plot.width};
        hover.setPointerCapture?.(event.pointerId);
        hideTooltip();
      });
      hover.addEventListener('pointermove',event=>{
        if(panAnchor){
          const delta=(event.clientX-panAnchor.clientX)/panAnchor.width*(panAnchor.end-panAnchor.start);
          const span=panAnchor.end-panAnchor.start;
          let start=panAnchor.start-delta;
          start=Math.max(0,Math.min(fullDuration-span,start));
          panAnchor.nextStart=start;
          return;
        }
        const rect=svg.getBoundingClientRect();
        const localX=(event.clientX-rect.left)/rect.width*width;
        const localY=(event.clientY-rect.top)/rect.height*height;
        const elapsed=viewStart+(localX-plot.x)/plot.width*(viewEnd-viewStart);
        const sample=closestSample(elapsed);
        if(!sample) return;
        let trace=null;
        if(mode==='separated'){
          const lane=laneData.find(item=>localY>=item.laneTop&&localY<=item.laneBottom);
          trace=lane?.trace||traces[0];
        }else{
          let distance=Infinity;
          traces.forEach(candidate=>{
            let y;
            if(candidate.type==='stability') y=plot.y+(100-sample.stabilityScore)/100*plot.height;
            else{
              const value=sample.parameters?.[candidate.key]?.normalized;
              if(!Number.isFinite(value)) return;
              y=plot.y+(overlayRange[1]-value)/(overlayRange[1]-overlayRange[0])*plot.height;
            }
            const candidateDistance=Math.abs(y-localY);
            if(candidateDistance<distance){ distance=candidateDistance; trace=candidate; }
          });
        }
        if(!trace) return;
        // In real-time mode sampleTime() already IS the wall-clock elapsed, so labeling it
        // "Accumulated simulation time" would show the same number under two contradictory
        // labels. Swap the label instead, and drop the now-duplicate wall-clock line.
        const timeLines=`${esc(realTime?L.wallElapsed:L.elapsed)}: ${formatNumber(sampleTime(sample),2)} ${esc(L.seconds)}`+
          (realTime?'':`<br>${esc(L.wallElapsed)}: ${formatNumber(sample.elapsed,2)} ${esc(L.seconds)}`);
        if(trace.type==='stability'){
          showTooltip(`<b>${esc(L.stability)}</b><br>${esc(L.stability)}: ${formatNumber(sample.stabilityScore,2)}<br>${timeLines}<br>${esc(L.simulationTime)}: ${formatNumber(sample.simulationTimestamp,2)} ${esc(L.seconds)}<br>${esc(statusLabel(sample.status))}`,event);
        }else{
          const value=sample.parameters?.[trace.key];
          if(!value) return;
          // A hidden pool's actual and normalized are the same dimensionless number (see
          // hiddenStateMap()), so showing both as if one were a unit reading and the other a
          // percent-of-baseline would be redundant and wrong; one plain line replaces both.
          const valueLine=trace.definition.hidden
            ? `${esc(L.hiddenValue)}: ${value.actual>=0?'+':''}${formatNumber(value.actual,3)}`
            : `${esc(L.actual)}: ${formatNumber(value.actual,3)} ${esc(trace.definition.unit||'')}<br>${esc(L.normalized)}: ${formatNumber(value.normalized,4)} (${formatNumber(value.normalized*100,1)}%)`;
          const titleTag=trace.definition.hidden?` <i>(${esc(L.hiddenTag)})</i>`:'';
          showTooltip(`<b>${esc(trace.definition.label)}</b>${titleTag}<br>${valueLine}<br>${timeLines}<br>${esc(L.simulationTime)}: ${formatNumber(sample.simulationTimestamp,2)} ${esc(L.seconds)}<br>${esc(statusLabel(sample.status))}`,event);
        }
      });
      hover.addEventListener('pointerup',event=>{
        if(Number.isFinite(panAnchor?.nextStart)){
          const span=panAnchor.end-panAnchor.start;
          viewStart=panAnchor.nextStart;
          viewEnd=viewStart+span;
        }
        panAnchor=null;
        hover.releasePointerCapture?.(event.pointerId);
        draw();
      });
      hover.addEventListener('pointercancel',()=>{ panAnchor=null; });
      hover.addEventListener('pointerleave',()=>{ if(!panAnchor) hideTooltip(); });
      hover.addEventListener('wheel',event=>{
        event.preventDefault();
        const rect=svg.getBoundingClientRect();
        const localX=(event.clientX-rect.left)/rect.width*width;
        const center=viewStart+(localX-plot.x)/plot.width*(viewEnd-viewStart);
        zoom(event.deltaY>0?1.25:.8,center);
      },{passive:false});

      interventionGroups().filter(group=>group.elapsed>=viewStart&&group.elapsed<=viewEnd).forEach((group,index)=>{
        const x=xFor(group.elapsed)+((index%3)-1)*2;
        const source=group.events[0]?.source;
        const color=source==='preset_event'?'#ffb84d':(source==='button'?'#c78cff':'#58d5ff');
        const line=svgElement('line',{x1:x,y1:plot.y,x2:x,y2:plot.y+plot.height,stroke:color,'stroke-width':2,'stroke-dasharray':'5 5',opacity:.82,'pointer-events':'none'});
        svg.appendChild(line);
        const hitLine=svgElement('line',{x1:x,y1:plot.y,x2:x,y2:plot.y+plot.height,stroke:'transparent','stroke-width':24,'pointer-events':'stroke'});
        hitLine.style.cursor='help';
        hitLine.addEventListener('pointerenter',event=>showTooltip(interventionTooltip(group),event));
        hitLine.addEventListener('pointermove',event=>showTooltip(interventionTooltip(group),event));
        hitLine.addEventListener('pointerleave',hideTooltip);
        svg.appendChild(hitLine);
        const marker=svgElement('path',{d:`M${x-6},${plot.y} L${x+6},${plot.y} L${x},${plot.y+9} Z`,fill:color});
        marker.style.cursor='help';
        marker.addEventListener('pointerenter',event=>showTooltip(interventionTooltip(group),event));
        marker.addEventListener('pointermove',event=>showTooltip(interventionTooltip(group),event));
        marker.addEventListener('pointerleave',hideTooltip);
        svg.appendChild(marker);
      });
    }

    function zoom(factor,center=(viewStart+viewEnd)/2){
      const current=viewEnd-viewStart;
      // The real-time axis never shows ticks finer than 5 seconds (see REAL_TIME_TICK_STEPS), so
      // zooming past that would open a window with nothing to read its scale by.
      const minSpan=timeBasis==='real'?Math.min(fullDuration,5):Math.min(fullDuration,fullDuration/200||.001);
      const span=Math.max(minSpan,Math.min(fullDuration,current*factor));
      const ratio=current?((center-viewStart)/current):.5;
      let start=center-span*ratio;
      start=Math.max(0,Math.min(fullDuration-span,start));
      viewStart=start;
      viewEnd=start+span;
      draw();
    }

    function buildTables(){
      const interventionHead=`<tr><th>${esc(L.time)}</th><th>${esc(L.parameter)}</th><th>${esc(L.before)}</th><th>${esc(L.after)}</th><th>${esc(L.change)}</th><th>${esc(L.source)}</th><th>${esc(L.action)}</th></tr>`;
      const interventionRows=D.interventions.map(event=>{
        const unit=event.unit?` ${esc(event.unit)}`:'';
        const change=Number.isFinite(event.percentageChange)?`${event.percentageChange>=0?'+':''}${formatNumber(event.percentageChange,2)}%`:
          (Number.isFinite(event.absoluteChange)?`${event.absoluteChange>=0?'+':''}${formatNumber(event.absoluteChange,3)}${unit}`:'—');
        return `<tr><td>${formatNumber(eventTime(event),2)}s<small>${esc(L.wallElapsed)}: ${formatNumber(event.elapsed,2)}s</small></td><td><b>${esc(event.parameterName)}</b><small>${esc(event.parameterId)}</small></td><td>${formatNumber(event.valueBefore,3)}${unit}</td><td>${formatNumber(event.valueAfter,3)}${unit}</td><td>${esc(change)}</td><td>${esc(sourceLabel(event.source))}</td><td>${esc(phaseLabel(event.phase))}${Number.isFinite(event.durationSeconds)?`<small>${formatNumber(event.durationSeconds,2)}s</small>`:''}</td></tr>`;
      }).join('')||`<tr><td colspan="7">—</td></tr>`;
      document.getElementById('interventionTable').innerHTML=`<thead>${interventionHead}</thead><tbody>${interventionRows}</tbody>`;
      const parameterHead=`<tr><th>${esc(L.parameter)}</th><th>${esc(L.initial)}</th><th>${esc(L.final)}</th><th>${esc(L.minimum)}</th><th>${esc(L.maximum)}</th><th>${esc(L.greatest)}</th></tr>`;
      const parameterRows=D.parameterStatistics.map(statistic=>{
        const unit=statistic.unit?` ${esc(statistic.unit)}`:'';
        // A hidden pool's deviation is an absolute dimensionless number, not a fraction of a
        // clinical baseline, so it is never shown as a percentage.
        const deviationText=statistic.hidden
          ? formatNumber(statistic.greatestNormalizedDeviation,3)
          : `${formatNumber(statistic.greatestNormalizedDeviation*100,1)}%`;
        const hiddenTag=statistic.hidden?` <em>(${esc(L.hiddenTag)})</em>`:'';
        return `<tr><td><b>${esc(statistic.label)}</b>${hiddenTag}<small>${esc(statistic.key)}</small></td><td>${formatNumber(statistic.initial,3)}${unit}</td><td>${formatNumber(statistic.final,3)}${unit}</td><td>${formatNumber(statistic.minimum,3)}${unit}</td><td>${formatNumber(statistic.maximum,3)}${unit}</td><td>${formatNumber(statistic.greatestDeviationElapsed,2)}s<small>${deviationText}</small></td></tr>`;
      }).join('');
      document.getElementById('parameterTable').innerHTML=`<thead>${parameterHead}</thead><tbody>${parameterRows}</tbody>`;
    }

    function exportImage(){
      const clone=svg.cloneNode(true);
      clone.querySelectorAll('[pointer-events="all"]').forEach(element=>element.remove());
      const source=new XMLSerializer().serializeToString(clone);
      const blob=new Blob([source],{type:'image/svg+xml;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const image=new Image();
      image.onload=()=>{
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1200,Number(svg.getAttribute('width'))||1200);
        canvas.height=Math.max(600,Number(svg.getAttribute('height'))||600);
        const context=canvas.getContext('2d');
        context.fillStyle='#07111f';
        context.fillRect(0,0,canvas.width,canvas.height);
        context.drawImage(image,0,0,canvas.width,canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(output=>{
          if(!output) return;
          const downloadUrl=URL.createObjectURL(output);
          const anchor=document.createElement('a');
          anchor.href=downloadUrl;
          anchor.download='homeostasis-report-chart.png';
          anchor.click();
          setTimeout(()=>URL.revokeObjectURL(downloadUrl),1000);
        },'image/png');
      };
      image.src=url;
    }

    document.getElementById('showAll').addEventListener('click',()=>{
      D.definitions.forEach(definition=>visible.add(definition.key));
      stabilityVisible=true;
      syncLegend();
      draw();
    });
    document.getElementById('hideAll').addEventListener('click',()=>{
      visible.clear();
      stabilityVisible=false;
      syncLegend();
      draw();
    });
    document.getElementById('showChanged').addEventListener('click',()=>{
      visible.clear();
      defaultVisibleKeys.forEach(key=>visible.add(key));
      stabilityVisible=false;
      syncLegend();
      draw();
    });
    document.getElementById('modeSelect').addEventListener('change',event=>{
      mode=event.target.value==='separated'?'separated':'overlay';
      draw();
    });
    document.getElementById('timeBasisToggle').addEventListener('click',()=>{
      timeBasis=timeBasis==='real'?'simulated':'real';
      fullDuration=fullDurationFor();
      viewStart=0;
      viewEnd=fullDuration;
      syncTimeBasisButton();
      draw();
    });
    document.getElementById('zoomIn').addEventListener('click',()=>zoom(.65));
    document.getElementById('zoomOut').addEventListener('click',()=>zoom(1.45));
    document.getElementById('resetView').addEventListener('click',()=>{
      viewStart=0;
      viewEnd=fullDuration;
      draw();
    });
    document.getElementById('exportImage').addEventListener('click',exportImage);
    globalThis.addEventListener('resize',()=>draw(),{passive:true});
    fillStaticText();
    buildGroupControls();
    buildLegend();
    buildLensLegend();
    buildTables();
    draw();
  }

  const REPORT_STYLES=`
    :root{color-scheme:dark;--bg:#07111f;--panel:#0d1c2d;--line:#243c53;--text:#eaf4ff;--muted:#9db2c7;--accent:#58d5ff}
    *{box-sizing:border-box}body{margin:0;background:linear-gradient(145deg,#06101c,#0a1727 44%,#07111f);color:var(--text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;line-height:1.45}
    main{width:min(1500px,calc(100% - 32px));margin:0 auto;padding:32px 0 56px}header{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin-bottom:20px}h1{font-size:clamp(26px,4vw,44px);margin:0;letter-spacing:-.025em}h2{font-size:20px;margin:0 0 14px}p{color:var(--muted)}.report-meta{color:var(--muted);font-size:13px;text-align:right}.report-meta b{display:block;color:var(--text);font-size:14px}
    .summary-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:16px 0}.metric{background:linear-gradient(145deg,#102438,#0b1928);border:1px solid var(--line);border-radius:16px;padding:14px}.metric span{display:block;color:var(--muted);font-size:11px;min-height:32px}.metric strong{display:block;font-size:24px;margin-top:3px}.metric.scenario-metric{grid-column:span 2}.metric.scenario-metric strong{font-size:15px;line-height:1.45}.summary-detail{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}.summary-detail section,.card{background:rgba(12,27,44,.88);border:1px solid var(--line);border-radius:18px;padding:18px}.summary-detail h2{font-size:14px;color:#bad2e7;margin-bottom:8px}.summary-detail ul{margin:0;padding-left:20px;color:#e8f4ff}
    .chart-card{padding:18px}.chart-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.chart-tools,.group-controls{display:flex;gap:7px;align-items:center;flex-wrap:wrap}button,select{appearance:none;border:1px solid #31516d;background:#102840;color:var(--text);border-radius:10px;padding:8px 11px;font:inherit;font-size:12px;font-weight:750;cursor:pointer}button:hover,select:hover{border-color:#58d5ff;background:#153451}.primary-tool{background:#125e7d}.control-label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.08em}.group-controls{padding:12px 0;border-bottom:1px solid var(--line)}
    .trace-legend{display:flex;gap:6px;flex-wrap:wrap;padding:12px 0}.trace-toggle{display:inline-flex;align-items:center;gap:7px;padding:6px 8px;background:#10243a;border-color:#2b455d;font-size:11px}.trace-toggle.off{opacity:.42;filter:saturate(.25)}.trace-swatch{width:14px;height:3px;border-radius:99px}.trace-remove{color:#7892aa;font-size:14px;line-height:1}.stability-toggle{order:999;border-color:#71384a}
    .lens-legend{display:flex;gap:9px;align-items:center;flex-wrap:wrap;padding:0 0 10px;font-size:11px;color:var(--muted)}.lens-legend-label{font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#8aa0b8;font-size:10px}.lens-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:#10243a;border:1px solid #2b455d}.lens-swatch{width:10px;height:10px;border-radius:3px}.lens-legend-hint{color:#7692aa}
    .chart-frame{position:relative;overflow:auto;border:1px solid var(--line);border-radius:14px;background:#07111f;min-height:560px}.chart-frame svg{display:block;width:100%;min-width:720px;touch-action:none}.chart-tooltip{position:absolute;z-index:5;max-width:390px;padding:10px 12px;border:1px solid #42627c;border-radius:10px;background:rgba(4,13,23,.96);box-shadow:0 10px 30px rgba(0,0,0,.38);font-size:12px;pointer-events:none}.chart-tooltip b{color:#fff}.tables{display:grid;gap:18px;margin-top:18px}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px}table{width:100%;border-collapse:collapse;min-width:850px;font-size:12px}th,td{padding:10px 11px;border-bottom:1px solid #20384e;text-align:left;vertical-align:top}th{position:sticky;top:0;background:#10263b;color:#b9d0e3;font-size:11px;text-transform:uppercase;letter-spacing:.05em}td small{display:block;color:#7692aa;margin-top:2px}.note{margin-top:18px}.note h2{font-size:15px}.note p{margin:0}.ai-analysis{margin-top:18px;border-color:#315c76;background:linear-gradient(145deg,rgba(11,35,52,.96),rgba(18,28,50,.96))}.ai-analysis-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}.ai-analysis-head h2{margin:0}.ai-analysis-meta{color:#87a9c4;font-size:12px}.ai-analysis-text{overflow-wrap:anywhere;color:#e5f2ff;font:inherit;line-height:1.72;margin:18px 0;padding:18px;border:1px solid #294d67;border-radius:14px;background:rgba(4,16,28,.64)}.ai-analysis-text>*:first-child{margin-top:0}.ai-analysis-text>*:last-child{margin-bottom:0}.ai-analysis-text h3{font-size:18px;color:#89e1ff;margin:22px 0 10px}.ai-analysis-text h4{font-size:15px;color:#d8ecff;margin:18px 0 8px}.ai-analysis-text p{margin:8px 0;color:#e5f2ff}.ai-analysis-text ul,.ai-analysis-text ol{margin:8px 0 14px;padding-left:1.4em}.ai-analysis-text li{margin:5px 0}.ai-analysis-text blockquote{margin:12px 0;padding:8px 12px;border-left:3px solid #58d5ff;background:rgba(88,213,255,.08);color:#d9ebf8}.ai-analysis-text code{padding:1px 5px;border-radius:5px;background:#102b42;color:#a9eaff}.ai-analysis-text hr{border:0;border-top:1px solid #31536d;margin:18px 0}.ai-analysis-disclaimer{margin:0;padding:12px 14px;border-left:4px solid #ffd166;background:rgba(255,209,102,.07);color:#d8e6f3;font-size:12px}
    @media(max-width:1000px){.summary-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:680px){main{width:min(100% - 20px,1500px);padding-top:20px}header{display:block}.report-meta{text-align:left;margin-top:10px}.summary-grid{grid-template-columns:repeat(2,1fr)}.summary-detail{grid-template-columns:1fr}.chart-card{padding:12px}.metric strong{font-size:21px}}
  `;

  function buildInteractiveReportHtml(data){
    const json=safeJsonForScript(data);
    const runtime=reportRuntime.toString();
    return `<!doctype html>
<html lang="${data.language==='zh'?'zh-CN':'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HomeoXNet Simulation Session Report</title>
<style>${REPORT_STYLES}</style>
</head>
<body>
<main>
  <header>
    <div><h1 id="reportTitle">HomeoXNet Simulation Session Report</h1><p>HomeoXNet · ${REPORT_VERSION} · ${data.language==='zh'?'会话 ID':'Session ID'}: ${String(data.metadata.browserLocalSessionId).replace(/[^\w-]/g,'')}</p></div>
    <div class="report-meta"><span id="generatedLabel">Generated</span><b id="generatedValue"></b></div>
  </header>
  <section class="summary-grid">
    <div class="metric"><span id="durationLabel">Session duration</span><strong id="durationValue"></strong></div>
    <div class="metric"><span id="interventionsLabel">Interventions</span><strong id="interventionsValue"></strong></div>
    <div class="metric scenario-metric"><span id="scenarioLabel">Scenario used</span><strong id="scenarioValue"></strong></div>
    <div class="metric"><span id="minimumLabel">Minimum Stability Score</span><strong id="minimumValue"></strong></div>
    <div class="metric"><span id="finalLabel">Final Stability Score</span><strong id="finalValue"></strong></div>
  </section>
  <section class="summary-detail">
    <section><h2 id="strongestTitle"></h2><ul id="strongestList"></ul></section>
    <section><h2 id="deviationsTitle"></h2><ul id="deviationsList"></ul></section>
  </section>
  <section class="card chart-card">
    <div class="chart-head"><h2 id="chartTitle"></h2><div class="chart-tools">
      <select id="modeSelect" aria-label="Chart display mode"></select>
      <button id="timeBasisToggle" type="button" aria-pressed="false"></button>
      <button id="zoomIn" type="button"></button><button id="zoomOut" type="button"></button>
      <button id="resetView" type="button"></button><button id="exportImage" class="primary-tool" type="button"></button>
    </div></div>
    <div class="group-controls" id="groupControls"></div>
    <div class="chart-tools"><button id="showAll" type="button"></button><button id="hideAll" type="button"></button><button id="showChanged" type="button"></button></div>
    <div class="trace-legend" id="traceLegend" aria-label="Trace visibility controls"></div>
    <div class="lens-legend" id="lensLegend" aria-label="Time scale legend" hidden></div>
    <div class="chart-frame" id="chartFrame"><svg id="chartSvg" role="img" aria-label="Interactive normalized parameter chart"></svg><div class="chart-tooltip" id="tooltip" hidden></div></div>
  </section>
  <section class="tables">
    <section class="card"><h2 id="interventionTitle"></h2><div class="table-wrap"><table id="interventionTable"></table></div></section>
  </section>
  <section class="card ai-analysis" id="aiAnalysisSection" hidden>
    <div class="ai-analysis-head"><h2 id="aiAnalysisTitle"></h2><div class="ai-analysis-meta" id="aiAnalysisMeta"></div></div>
    <div class="ai-analysis-text" id="aiAnalysisText"></div>
    <p class="ai-analysis-disclaimer" id="aiAnalysisDisclaimer"></p>
  </section>
  <section class="tables">
    <section class="card"><h2 id="parameterTitle"></h2><div class="table-wrap"><table id="parameterTable"></table></div></section>
  </section>
  <section class="card note"><h2 id="noteTitle"></h2><p id="noteText"></p></section>
</main>
<script>const REPORT_DATA=${json};(${runtime})();</script>
</body>
</html>`;
  }

  class SessionRecorder{
    constructor(options={}){
      this.sampleIntervalMs=Math.max(250,finite(options.sampleIntervalMs,DEFAULT_SAMPLE_INTERVAL_MS));
      this.maxSamples=Math.max(500,Math.round(finite(options.maxSamples,DEFAULT_MAX_SAMPLES)));
      this.browserLocalSessionId=browserSessionId();
      this.reset(options.meta||null);
    }

    reset(meta=null){
      this.meta=meta?clone(meta):this.meta||null;
      this.active=false;
      this.startedAtPerformance=null;
      this.startedAtIso=null;
      this.runId=uuid();
      this.samples=[];
      this.interventions=[];
      this.scenariosUsed=[];
      this.lensEvents=[];
      this.pendingDrags=new Map();
      this.lastSampleElapsed=-Infinity;
      this.normalizedSimulationElapsed=0;
      this.lastSimulationTimestamp=null;
      this.effectiveSampleIntervalMs=this.sampleIntervalMs;
      this.minimumStabilityScore=Infinity;
      this.firstZeroElapsed=null;
      this.firstZeroNormalizedElapsed=null;
      this.initialSnapshot=null;
      this.lastSnapshot=null;
      this.actionSequence=0;
      this.notify();
    }

    setMeta(meta){
      this.meta=clone(meta);
    }

    notify(){
      try{
        global.dispatchEvent(new CustomEvent('homeostasis:recording-change',{detail:{active:this.active}}));
      }catch(_error){}
    }

    elapsedSeconds(){
      if(!this.active || this.startedAtPerformance==null) return 0;
      return Math.max(0,(performance.now()-this.startedAtPerformance)/1000);
    }

    updateNormalizedSimulationElapsed(snapshot){
      const timestamp=finite(snapshot?.simTime);
      if(timestamp==null) return this.normalizedSimulationElapsed;
      if(this.lastSimulationTimestamp==null){
        this.lastSimulationTimestamp=timestamp;
        return this.normalizedSimulationElapsed;
      }
      const delta=timestamp-this.lastSimulationTimestamp;
      if(delta>=0){
        this.normalizedSimulationElapsed+=delta;
        this.lastSimulationTimestamp=timestamp;
      }else if(timestamp<=0.5 || timestamp<=this.lastSimulationTimestamp*0.25){
        this.lastSimulationTimestamp=timestamp;
      }
      return this.normalizedSimulationElapsed;
    }

    ensureActive(snapshot,status='running'){
      if(this.active) return;
      if(!snapshot || !this.meta) throw new Error('Session recorder is not ready.');
      this.active=true;
      this.startedAtPerformance=performance.now();
      this.startedAtIso=new Date().toISOString();
      this.initialSnapshot=clone(snapshot);
      this.capture(snapshot,status,true,0);
      this.notify();
    }

    beginDrag(key,snapshot,controlBefore=0){
      if(!snapshot || this.pendingDrags.has(key)) return;
      this.pendingDrags.set(key,{
        key,
        beforeSnapshot:clone(snapshot),
        controlBefore:finite(controlBefore,0),
        startedAtPerformance:performance.now(),
        changed:false
      });
    }

    markDragChanged(key,status='running'){
      const pending=this.pendingDrags.get(key);
      if(!pending) return;
      pending.changed=true;
      this.ensureActive(pending.beforeSnapshot,status);
      pending.elapsed=this.elapsedSeconds();
      pending.normalizedElapsed=this.normalizedSimulationElapsed;
    }

    cancelDrag(key){
      this.pendingDrags.delete(key);
    }

    finishDrag(key,afterSnapshot,controlAfter,status='running'){
      const pending=this.pendingDrags.get(key);
      this.pendingDrags.delete(key);
      if(!pending?.changed || !afterSnapshot) return false;
      this.ensureActive(pending.beforeSnapshot,status);
      const actionId=this.nextActionId('slider');
      const before=this.paramFrom(pending.beforeSnapshot,key);
      const after=this.paramFrom(afterSnapshot,key);
      this.interventions.push(this.makeEvent({
        actionId,
        elapsed:finite(pending.elapsed,this.elapsedSeconds()),
        endElapsed:this.elapsedSeconds(),
        normalizedElapsed:finite(pending.normalizedElapsed,this.normalizedSimulationElapsed),
        endNormalizedElapsed:this.updateNormalizedSimulationElapsed(afterSnapshot),
        key,
        before,
        after,
        source:'slider',
        phase:'ended',
        durationSeconds:Math.max(0,(performance.now()-pending.startedAtPerformance)/1000),
        controlBefore:pending.controlBefore,
        controlAfter:finite(controlAfter,0),
        interventionType:'parameter adjustment'
      }));
      this.capture(afterSnapshot,status,true);
      return true;
    }

    recordParameterAction({key,beforeSnapshot,afterSnapshot,source='other',phase='ended',interventionType='parameter adjustment',controlBefore=null,controlAfter=null,status='running'}){
      const before=this.paramFrom(beforeSnapshot,key);
      const after=this.paramFrom(afterSnapshot,key);
      if(!before || !after) return false;
      const actualChanged=Math.abs(after.value-before.value)>1e-12;
      const controlChanged=Number.isFinite(controlBefore)&&Number.isFinite(controlAfter)&&Math.abs(controlAfter-controlBefore)>1e-12;
      if(!actualChanged&&!controlChanged) return false;
      this.ensureActive(beforeSnapshot,status);
      const normalizedElapsed=this.updateNormalizedSimulationElapsed(beforeSnapshot);
      this.interventions.push(this.makeEvent({
        actionId:this.nextActionId(source),
        elapsed:this.elapsedSeconds(),
        normalizedElapsed,
        key,before,after,source,phase,interventionType,controlBefore,controlAfter
      }));
      this.capture(afterSnapshot,status,true);
      return true;
    }

    recordMultiParameterAction({keys,beforeSnapshot,afterSnapshot,source='button',interventionType='multi-parameter intervention',scenarioSelection=null,status='running'}){
      const validKeys=(keys||[]).filter(key=>this.paramFrom(beforeSnapshot,key)&&this.paramFrom(afterSnapshot,key));
      if(!validKeys.length) return false;
      this.ensureActive(beforeSnapshot,status);
      const actionId=this.nextActionId(source);
      const elapsed=this.elapsedSeconds();
      const normalizedElapsed=this.updateNormalizedSimulationElapsed(beforeSnapshot);
      if(scenarioSelection){
        this.scenariosUsed.push({
          majorId:String(scenarioSelection.majorId||''),
          majorLabel:String(scenarioSelection.majorLabel||scenarioSelection.majorId||''),
          minorId:String(scenarioSelection.minorId||''),
          minorLabel:String(scenarioSelection.minorLabel||scenarioSelection.minorId||''),
          elapsed,
          normalizedElapsed
        });
      }
      validKeys.forEach(key=>{
        const before=this.paramFrom(beforeSnapshot,key);
        const after=this.paramFrom(afterSnapshot,key);
        this.interventions.push(this.makeEvent({
          actionId,elapsed,normalizedElapsed,key,before,after,source,phase:'ended',interventionType,
          controlBefore:finite(before.control),controlAfter:finite(after.control)
        }));
      });
      this.capture(afterSnapshot,status,true);
      return true;
    }

    // Which time scale the learner was watching through, at the moment it changed. Interventions
    // record what the learner did; this records how they were watching it, on the same clock, so
    // the report can show a curve drawn partly at 1x and partly at 2880x is not the same as one
    // drawn wholly at one scale.
    recordLensChange({lensId,lensTitle,auto,compression}){
      if(!this.active) return;
      this.lensEvents.push({
        elapsed:this.elapsedSeconds(),
        normalizedElapsed:this.normalizedSimulationElapsed,
        lensId:String(lensId||''),
        lensTitle:lensTitle?String(lensTitle):String(lensId||''),
        auto:Boolean(auto),
        compression:finite(compression)
      });
    }

    nextActionId(prefix='action'){
      this.actionSequence+=1;
      return `${prefix}-${this.actionSequence}`;
    }

    paramFrom(snapshot,key){
      const parameter=snapshot?.params?.find(item=>item.key===key);
      return parameter?clone(parameter):null;
    }

    makeEvent({actionId,elapsed,endElapsed=null,normalizedElapsed=null,endNormalizedElapsed=null,key,before,after,source,phase,durationSeconds=null,controlBefore=null,controlAfter=null,interventionType}){
      const valueBefore=finite(before?.value);
      const valueAfter=finite(after?.value);
      const absoluteChange=valueBefore!=null&&valueAfter!=null?valueAfter-valueBefore:null;
      const percentageChange=valueBefore!=null&&valueAfter!=null&&Math.abs(valueBefore)>1e-12?absoluteChange/valueBefore*100:null;
      const controlDelta=Number.isFinite(controlBefore)&&Number.isFinite(controlAfter)?controlAfter-controlBefore:0;
      const directionSource=Math.abs(absoluteChange||0)>1e-12?absoluteChange:controlDelta;
      return {
        actionId,
        elapsed:finite(elapsed,0),
        endElapsed:finite(endElapsed),
        normalizedElapsed:finite(normalizedElapsed,0),
        endNormalizedElapsed:finite(endNormalizedElapsed),
        parameterName:after?.label||before?.label||key,
        parameterId:key,
        unit:after?.unit||before?.unit||'',
        valueBefore,
        valueAfter,
        absoluteChange,
        percentageChange,
        direction:directionSource>0?'increase':(directionSource<0?'decrease':'unchanged'),
        source,
        phase,
        durationSeconds:finite(durationSeconds),
        controlBefore:finite(controlBefore),
        controlAfter:finite(controlAfter),
        interventionType:interventionType||source
      };
    }

    capture(snapshot,status='running',force=false,elapsedOverride=null){
      if(!this.active || !snapshot || !this.meta) return false;
      const elapsed=elapsedOverride==null?this.elapsedSeconds():Math.max(0,finite(elapsedOverride,0));
      const normalizedElapsed=this.updateNormalizedSimulationElapsed(snapshot);
      const health=Math.max(0,finite(snapshot.health,0));
      if(health<=0&&this.firstZeroElapsed==null){
        this.firstZeroElapsed=elapsed;
        this.firstZeroNormalizedElapsed=normalizedElapsed;
        force=true;
      }
      if(!force&&elapsed-this.lastSampleElapsed<this.effectiveSampleIntervalMs/1000) return false;
      const sample={
        elapsed,
        normalizedElapsed,
        simulationTimestamp:finite(snapshot.simTime,0),
        // Hidden states merge into the same map as visible parameters, keyed by their own state
        // id, so every downstream reader (chart traces, parameter statistics, the AI sample set)
        // treats them exactly like any other parameter without a separate code path.
        parameters:{...parameterMap(snapshot,this.meta.defs),...hiddenStateMap(snapshot)},
        stabilityScore:health,
        status:String(status||'running')
      };
      this.samples.push(sample);
      this.lastSampleElapsed=elapsed;
      this.lastSnapshot=clone(snapshot);
      this.minimumStabilityScore=Math.min(this.minimumStabilityScore,health);
      if(this.samples.length>this.maxSamples) this.compactSamples();
      return true;
    }

    compactSamples(){
      const lastIndex=this.samples.length-1;
      this.samples=this.samples.filter((_sample,index)=>index%2===0||index===lastIndex);
      this.effectiveSampleIntervalMs*=2;
      this.lastSampleElapsed=this.samples.at(-1)?.elapsed??-Infinity;
    }

    buildSnapshot(snapshot,status='running'){
      if(!this.active) throw new Error('No user intervention has been recorded.');
      this.capture(snapshot,status,true);
      const samples=clone(this.samples);
      const interventions=clone(this.interventions);
      const scenariosUsed=clone(this.scenariosUsed);
      // The five hidden pools join the same definitions array as the 34 visible parameters, in
      // their own "hidden" group, so every reader downstream (chart, legend, tables, the AI
      // evidence pack) handles them through the ordinary parameter code path rather than a
      // second one. Each is already a deviation from its own resting baseline of 0, not a
      // fraction of a clinical reference, so base/scale describe that baseline rather than a
      // clinical value - see hiddenStateMap() for how a sample's actual/normalized are filled in.
      const hiddenDefinitions=Object.entries(this.meta?.time?.hiddenStates||{}).map(([key,info])=>({
        key, label:info?.label||key, unit:'', group:'hidden', base:0, scale:3.2, warn:null, danger:null,
        hidden:true, owner:info?.owner||null,
        temporal:{layer:info?.layer||null, tau:finite(info?.tau)}
      }));
      const definitions=[...clone(this.meta?.defs||[]),...hiddenDefinitions];
      // "Changed" has to mean changed enough to be worth reading, not merely different in the
      // last decimal. At a 1e-9 tolerance every one of the 34 parameters qualified, because a
      // coupled ODE system never leaves anything exactly where it started - so the report's
      // "changed parameters" view showed everything and told the learner nothing.
      //
      // The threshold is a fraction of each parameter's own scale (one state unit in clinical
      // units), so it means the same thing for a pH as for a heart rate: 3% of scale is about
      // 0.008 pH, 1.1 bpm, 1.0 mmHg of MAP. That is deliberately close to the movement the
      // network already treats as "this node has moved", so the report agrees with what the
      // learner watched light up on screen.
      const CHANGE_FRACTION_OF_SCALE=0.03;
      const defaultVisibleParameterIds=definitions.filter(definition=>{
        const values=samples
          .map(sample=>finite(sample.parameters?.[definition.key]?.actual))
          .filter(value=>value!=null);
        if(values.length<2) return false;
        const initial=values[0];
        const scale=Math.abs(finite(definition.scale,0));
        const tolerance=scale>0
          ? scale*CHANGE_FRACTION_OF_SCALE
          : Math.max(1,Math.abs(initial),Math.abs(finite(definition.base,0)))*1e-4;
        return values.some(value=>Math.abs(value-initial)>tolerance);
      }).map(definition=>definition.key);
      const parameterStatistics=definitions.map(definition=>{
        const points=samples.map(sample=>({
          elapsed:Number.isFinite(sample.normalizedElapsed)?sample.normalizedElapsed:sample.elapsed,
          actual:sample.parameters?.[definition.key]?.actual,
          normalized:sample.parameters?.[definition.key]?.normalized
        })).filter(point=>Number.isFinite(point.actual)&&Number.isFinite(point.normalized));
        const initial=points[0]?.actual??null;
        const final=points.at(-1)?.actual??null;
        const minimum=points.length?Math.min(...points.map(point=>point.actual)):null;
        const maximum=points.length?Math.max(...points.map(point=>point.actual)):null;
        // A hidden pool's baseline is 0 (no net deviation), not 1 - it is not a fraction of a
        // clinical reference the way a visible parameter's normalized value is.
        const restingNormalized=definition.hidden?0:1;
        const greatest=points.reduce((winner,point)=>{
          const deviation=Math.abs(point.normalized-restingNormalized);
          return !winner||deviation>winner.deviation?{deviation,elapsed:point.elapsed}:winner;
        },null);
        return {
          key:definition.key,label:definition.label,unit:definition.unit||'',initial,final,minimum,maximum,
          hidden:Boolean(definition.hidden),
          greatestDeviationElapsed:greatest?.elapsed??null,
          greatestNormalizedDeviation:greatest?.deviation??null
        };
      });
      const altered=interventions.map(event=>{
        const definition=definitions.find(item=>item.key===event.parameterId);
        const baseline=finite(definition?.base);
        const magnitude=baseline&&Number.isFinite(event.absoluteChange)?Math.abs(event.absoluteChange/baseline):
          (Number.isFinite(event.percentageChange)?Math.abs(event.percentageChange)/100:0);
        return {event,magnitude};
      }).sort((a,b)=>b.magnitude-a.magnitude);
      const alteredUnique=[];
      altered.forEach(item=>{
        if(alteredUnique.some(existing=>existing.event.parameterId===item.event.parameterId)) return;
        alteredUnique.push(item);
      });
      // The headline "largest deviations" panel stays about the 34 clinical readouts: a hidden
      // pool's deviation is on a different, unitless scale and its own row further down (the
      // full parameter table, the chart) is where it belongs.
      const largest=parameterStatistics.filter(statistic=>!statistic.hidden)
        .sort((a,b)=>(b.greatestNormalizedDeviation||0)-(a.greatestNormalizedDeviation||0));
      const durationSeconds=this.elapsedSeconds();
      const normalizedSimulationDurationSeconds=samples.at(-1)?.normalizedElapsed??0;
      const finalStabilityScore=samples.at(-1)?.stabilityScore??null;
      const actionIds=new Set(interventions.map(event=>event.actionId));
      const language=this.meta?.lang==='en'?'en':'zh';
      const alteredLabel=item=>{
        const event=item.event;
        if(Number.isFinite(event.percentageChange)) return `${event.parameterName}: ${event.percentageChange>=0?'+':''}${event.percentageChange.toFixed(1)}%`;
        return `${event.parameterName}: ${event.direction}`;
      };
      const deviationLabel=statistic=>`${statistic.label}: ${((statistic.greatestNormalizedDeviation||0)*100).toFixed(1)}%`;
      return {
        reportSchemaVersion:1,
        language,
        simulatorVersion:REPORT_VERSION,
        groups:{...clone(this.meta?.groups||{}),hidden:language==='en'?'Hidden internal states':'内部隐藏状态'},
        definitions,
        defaultVisibleParameterIds,
        scenariosUsed,
        samples,
        interventions,
        lensEvents:clone(this.lensEvents),
        parameterStatistics,
        metadata:{
          generatedAt:new Date().toISOString(),
          simulatorVersion:REPORT_VERSION,
          sessionStartedAt:this.startedAtIso,
          durationSeconds,
          normalizedSimulationDurationSeconds,
          samplingIntervalMs:this.sampleIntervalMs,
          effectiveSamplingIntervalMs:this.effectiveSampleIntervalMs,
          initialParameterValues:clone(samples[0]?.parameters||{}),
          finalParameterValues:clone(samples.at(-1)?.parameters||{}),
          minimumStabilityScore:Number.isFinite(this.minimumStabilityScore)?this.minimumStabilityScore:null,
          finalStabilityScore,
          firstStabilityZeroElapsed:this.firstZeroElapsed,
          firstStabilityZeroNormalizedElapsed:this.firstZeroNormalizedElapsed,
          stabilityReachedZero:this.firstZeroElapsed!=null,
          totalInterventions:actionIds.size,
          interventionEventRows:interventions.length,
          browserLocalSessionId:this.browserLocalSessionId,
          sessionRunId:this.runId,
          language
        },
        summary:{
          mostAltered:alteredUnique.slice(0,4).map(alteredLabel),
          largestDeviations:largest.slice(0,4).map(deviationLabel)
        }
      };
    }
  }

  function timestampFilename(date=new Date()){
    const pad=value=>String(value).padStart(2,'0');
    return `homeostasis-report-${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.html`;
  }

  let lastDownloadFilename='';
  let repeatedDownloadCount=1;
  function uniqueTimestampFilename(date){
    const base=timestampFilename(date);
    if(base!==lastDownloadFilename){
      lastDownloadFilename=base;
      repeatedDownloadCount=1;
      return base;
    }
    repeatedDownloadCount+=1;
    return base.replace(/\.html$/,`-${repeatedDownloadCount}.html`);
  }

  function downloadInteractiveReport(data){
    const prepared=prepareInteractiveReport(data);
    const {html,filename}=prepared;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;
    anchor.download=filename;
    anchor.rel='noopener';
    anchor.style.display='none';
    document.body.appendChild(anchor);
    try{
      if(typeof anchor.download==='string'){
        anchor.click();
        return {filename:anchor.download,openedFallback:false};
      }
      const opened=global.open(url,'_blank','noopener');
      if(!opened) throw new Error('The browser blocked the report download.');
      return {filename:anchor.download,openedFallback:true};
    }finally{
      anchor.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60_000);
    }
  }

  function prepareInteractiveReport(data){
    return {
      html:buildInteractiveReportHtml(clone(data)),
      filename:uniqueTimestampFilename(new Date(data.metadata.generatedAt))
    };
  }

  // ---- What the AI report is given -----------------------------------------------------------
  //
  // The recorder samples on REAL time, one sample per 750 ms of watching. A list thinned by
  // position alone therefore shows a session at the pace the learner watched it: ten real minutes
  // on the seconds lens fill most of it, while a two-hour collapse watched on the hours lens gets
  // one or two samples, and the report cannot say when the collapse began. Three samplings are
  // merged instead - by position (what the learner saw), evenly in simulated time (what the patient
  // lived through) and log-evenly in simulated time (the fast early responses of a days-long run) -
  // plus the samples either side of each action. The server picks its checkpoints from this set.
  const AI_SAMPLES_PER_SPACING = 80;
  const AI_ACTION_NEIGHBOUR_LIMIT = 60;
  const AI_MAX_INTERVENTIONS = 200;

  function aiSampleTime(sample){
    return finite(sample?.normalizedElapsed,finite(sample?.elapsed,0));
  }

  function selectAiSampleIndexes(samples, events){
    const count=samples.length;
    if(count<=AI_SAMPLES_PER_SPACING*3) return samples.map((_sample,index)=>index);
    const times=samples.map(aiSampleTime);
    // Last index whose time is at or before `target`; the recorder's clock never runs backwards.
    const atOrBefore=target=>{
      let low=0, high=count-1;
      while(low<high){
        const middle=Math.ceil((low+high)/2);
        if(times[middle]<=target) low=middle; else high=middle-1;
      }
      return low;
    };
    const indexes=new Set([0,count-1]);
    const steps=AI_SAMPLES_PER_SPACING-1;
    for(let step=1;step<steps;step++) indexes.add(Math.round(step*(count-1)/steps));
    const start=times[0], span=times[count-1]-times[0];
    if(span>0){
      for(let step=1;step<steps;step++) indexes.add(atOrBefore(start+step*span/steps));
      // Log spacing needs a positive origin; half a simulated second, or a hundred-thousandth of
      // the run, keeps the first steps finer than any lens can show.
      const origin=Math.max(span*1e-5,.5);
      const ratio=Math.log((span+origin)/origin);
      for(let step=1;step<steps;step++) indexes.add(atOrBefore(start+origin*Math.exp(step*ratio/steps)-origin));
    }
    (events||[]).slice(0,AI_ACTION_NEIGHBOUR_LIMIT).forEach(event=>{
      const time=finite(event?.normalizedElapsed);
      if(time==null) return;
      const index=atOrBefore(time);
      indexes.add(index);
      indexes.add(Math.min(count-1,index+1));
    });
    return [...indexes].sort((a,b)=>a-b);
  }

  function roundedForAi(value){
    const number=finite(value);
    return number==null?null:Math.round(number*1e4)/1e4;
  }

  // `normalized` is dropped: the server derives it from each definition's base, and leaving it out
  // halves the size of a sample.
  function compactAiSample(sample){
    const parameters={};
    Object.entries(sample?.parameters||{}).forEach(([key,point])=>{
      const actual=roundedForAi(point?.actual);
      if(actual==null) return;
      parameters[key]=Number.isFinite(point?.control)?{actual,control:point.control}:{actual};
    });
    return {
      elapsed:roundedForAi(sample?.elapsed),
      normalizedElapsed:roundedForAi(sample?.normalizedElapsed),
      stabilityScore:roundedForAi(sample?.stabilityScore),
      status:sample?.status,
      parameters
    };
  }

  // A definition as the evidence pack uses it. The model card each definition carries for the
  // transparency panel is most of its size and the server never reads it; the time layer is kept,
  // because it is how the report names the clock a mechanism runs on.
  function compactAiDefinition(definition){
    const layer=definition?.temporal?.layer;
    const tau=finite(definition?.temporal?.tau);
    return {
      key:definition?.key,
      label:definition?.label,
      unit:definition?.unit,
      group:definition?.group,
      base:definition?.base,
      scale:definition?.scale,
      warn:definition?.warn,
      danger:definition?.danger,
      ...(layer||tau!=null?{temporal:{layer:layer||null,tau}}:{}),
      // Marks one of the five internally-integrated states (aqp2, kBody, rbcMass, hco3Buffer,
      // hco3Renal) that reconstruct a visible parameter but are never shown live - the model
      // card's own "hidden" flag from simEngine.js, carried through so the prompt never treats
      // one as a measured value.
      ...(definition?.hidden?{hidden:true,owner:definition?.owner||null}:{})
    };
  }

  // `context` carries what only the page knows: every self-amplifying loop seen during the run
  // (the server cross-checks them against the live engine but cannot reconstruct the history),
  // how the learner watched, and whether Stability was being scored.
  function compactReportForAi(report, context={}){
    const allSamples=Array.isArray(report?.samples)?report.samples:[];
    const interventions=(report?.interventions||[]).slice(0,AI_MAX_INTERVENTIONS);
    const timeScale=context.timeScale&&typeof context.timeScale==='object'?context.timeScale:null;
    // Ground truth for the server's per-checkpoint lens_estimate: which lens was actually on
    // screen, on the same normalizedElapsed clock as every sample and checkpoint. Lens switches
    // are rare (a handful per session at most), so the interventions cap is generous headroom
    // here rather than an expected limit.
    const lensEvents=(report?.lensEvents||[]).slice(0,AI_MAX_INTERVENTIONS)
      .map(event=>({normalizedElapsed:roundedForAi(event?.normalizedElapsed),lensId:typeof event?.lensId==='string'?event.lensId:null}))
      .filter(event=>event.normalizedElapsed!=null&&event.lensId);
    return {
      language:report?.language,
      definitions:(report?.definitions||[]).map(compactAiDefinition),
      scenariosUsed:report?.scenariosUsed,
      interventions,
      lensEvents,
      parameterStatistics:report?.parameterStatistics,
      samples:selectAiSampleIndexes(allSamples,interventions).map(index=>compactAiSample(allSamples[index])),
      viciousCycles:Array.isArray(context.viciousCycles)?context.viciousCycles:[],
      timeScale:timeScale?{...timeScale,lensSeconds:{...(timeScale.lensSeconds||{})}}:null,
      metadata:{
        normalizedSimulationDurationSeconds:report?.metadata?.normalizedSimulationDurationSeconds,
        totalInterventions:report?.metadata?.totalInterventions,
        minimumStabilityScore:report?.metadata?.minimumStabilityScore,
        finalStabilityScore:report?.metadata?.finalStabilityScore,
        stabilityReachedZero:report?.metadata?.stabilityReachedZero,
        ...(typeof context.stabilityScoringEnabled==='boolean'?{stabilityScoringEnabled:context.stabilityScoringEnabled}:{})
      }
    };
  }

  global.HomeostasisSessionReporting={
    SessionRecorder,
    buildInteractiveReportHtml,
    prepareInteractiveReport,
    downloadInteractiveReport,
    timestampFilename,
    compactReportForAi,
    version:REPORT_VERSION
  };
})(window);
