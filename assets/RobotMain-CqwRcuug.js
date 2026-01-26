import{A as g,d as ct,t as A,f as L,a2 as lt,l as Y,j as a,P as dt,c9 as ut,C as k,U as pt,p as gt}from"./index-kjm5JxV5.js";import{r as p}from"./recharts-Bg6K2Pzo.js";const ht="https://ultymylife.ru/api/insight",G=["Ты — персональный фитнес-аналитик. Проанализируй данные за последние 7 дней и дай краткий, практичный отчёт на русском языке.","You are a personal fitness analyst. Analyze the data from the last 7 days and provide a short, practical report in English."],W=[`Требования к ответу:
1) Кратко опиши общий уровень активности и прогресс за неделю. Используй 📊 или 🔍.
2) Отметь сильные стороны и питивные тренды. Добавь ✅, 🌟 или 💪.
3) Укажи проблемные зоны (что чаще всего пропускалось, где нет прогресса). Используй ⚠️ или 🚧.
4) Дай 3–5 конкретных и выполнимых рекомендаций на следующую неделю. Начинай каждую с 💡, 🎯 или 📅.
5) Стиль: коротко, по делу, мотивирующе, без "воды". Каждый пункт — с новой строки. НЕ используй Markdown, списки, жирный шрифт или дефисы в начале строк. Используй только текст и эмодзи для акцента.

Примечание по привычкам:
- Для положительных привычек (например, "Ходьба"): status = -2 → completed, status = 0 → skipped.
- Для отрицательных привычек (например, "Курение"): status = 1 → успех (воздержался), status = 0 → срыв.

Данные для анализа:`,`Requirements for your response:
1) Briefly describe the overall activity level and progress over the past week. Use 📊 or 🔍.
2) Highlight strengths and positive trends. Add ✅, 🌟, or 💪.
3) Point out problem areas (what is most often skipped or shows no progress). Use ⚠️ or 🚧.
4) Give 3–5 specific, actionable recommendations for next week. Start each with 💡, 🎯, or 📅.
5) Style: short, to the point, motivating, no fluff. Each point on a new line. DO NOT use Markdown, bullets, bold text, or leading dashes. Use only plain text and emojis for visual emphasis.

Habit status note:
- For positive habits (e.g., "Walking"): status = -2 → completed, status = 0 → skipped.
- For negative habits (e.g., "Smoking"): status = 1 → success (abstained), status = 0 → relapse.

Data to analyze:`];function mt(t){const h=new Date,r=[];for(let n=6;n>=0;n--){const e=new Date(h);e.setDate(e.getDate()-n),r.push(e.toISOString().split("T")[0])}const i=g.pData||{},m=g.habitsByDate||{},w=g.trainingLog||{},T=g.breathingLog||{},j=g.meditationLog||{},E=g.hardeningLog||{},C=g.sleepingLog||{},I=g.mentalLog||{},v=g.mentalRecords||[],P=g.programs||{},B=g.exercises||{},x=ct||{},l=(n,e)=>e.length===0?`${n} (last 7 days):
  No data
`:`${n} (last 7 days):
${e.join(`
`)}
`,F=`
USER:
- age: ${i.age||"unknown"}
- gender: ${i.gender!==void 0?i.gender:"unknown"}
- height: ${i.height||"unknown"} cm
- wrist: ${i.wrist||"unknown"} cm
- goal: ${i.goal||"unknown"}
`.trim(),H=[];r.forEach(n=>{const e=m[n];if(!e)return;const d=(Array.isArray(e)?e:Object.entries(e).map(([o,c])=>({habitId:Number(o),status:c}))).map(o=>{const c=x[o.habitId],$=c?.name?c.name[t]||c.name[0]||`Habit #${o.habitId}`:`Habit #${o.habitId}`;return{habitId:o.habitId,status:o.status,habitName:$}});d.length>0&&H.push(`  ${n}: ${JSON.stringify(d)}`)});const J=l(t===0?"ПРИВЫЧКИ (за последние 7 дней)":"HABITS_BY_DATE",H),y=[];r.forEach(n=>{const e=w[n];!e||!e.length||(y.push(`  DATE: ${n}`),e.forEach((s,d)=>{const o=P[s.programId],c=o?.name?o.name[t]||o.name[0]||`Program #${s.programId}`:`Program #${s.programId}`;y.push(`    [Session #${d+1}] program: ${c}, dayIndex: ${s.dayIndex}, completed: ${s.completed}, duration(ms): ${s.duration||0}, tonnage: ${s.tonnage||0}`),y.push("      exercises:"),(s.exerciseOrder||[]).forEach(u=>{const b=s.exercises?.[u],S=B[u],rt=S?.name?S.name[t]||S.name[0]||`Exercise #${u}`:`Exercise #${u}`;b&&(y.push(`        - ${rt} (mgId: ${b.mgId||"N/A"})`),y.push("          sets:"),(b.sets||[]).forEach((D,it)=>{y.push(`            * set ${it+1}: type=${D.type||"N/A"}, reps=${D.reps||0}, weight=${D.weight||0}, time=${D.time||0}`)}),y.push(`          totalTonnage: ${b.totalTonnage||0}, completed: ${b.completed||!1}`))})}))});const q=l(t===0?"ТРЕНИРОВКИ":"TRAININGS",y),R=(n,e=[])=>{const s=[];return r.forEach(d=>{const o=n[d];!o||!o.length||(s.push(`  ${d}:`),o.forEach((c,$)=>{const u=(c.endTime||0)-(c.startTime||0);let b=`    #${$+1}: duration(ms): ${u}`;e.forEach(S=>{c[S]!=null&&(b+=`, ${S}: ${c[S]}`)}),s.push(b)}))}),s},Z=l(t===0?"ДЫХАНИЕ":"BREATHING",R(T,["maxHold"])),K=l(t===0?"МЕДИТАЦИЯ":"MEDITATION",R(j)),Q=l(t===0?"ЗАКАЛИВАНИЕ":"HARDENING",R(E,["timeInColdWater"])),M=[];let z=0,O=0;r.forEach(n=>{const e=I[n];if(e==null)return;const s=Number(e)||0;z+=s,O++,M.push(`  ${n}: duration(sec): ${s}, duration(min): ${Math.round(s/60*10)/10}`)}),M.length>0&&M.push(`  total(sec): ${z}, total(min): ${Math.round(z/60*10)/10}, days: ${O}`);const V=l(t===0?"МЕНТАЛЬНАЯ АКТИВНОСТЬ":"MENTAL",M),X=[["Быстрый счёт","Mental math"],["Память в действии","Memory"],["Числовая логика","Number logic"],["Чистый фокус","Pure focus"]],N=[];(v||[]).forEach((n,e)=>{const s=X[e]?.[t]||`Category ${e}`,d=(Array.isArray(n)?n:[]).map(u=>Number(u)||0),o=d.length?Math.max(...d):0,c=d.filter(u=>u>0),$=c.length?Math.round(c.reduce((u,b)=>u+b,0)/c.length*10)/10:0;N.push(`  ${s}: best=${o}, avg(nonZero)=${$}, byDifficulty=${JSON.stringify(d)}`)});const tt=N.length?t===0?`РЕЗУЛЬТАТЫ МЕНТАЛЬНЫХ ТРЕНИРОВОК (лучшие):
${N.join(`
`)}
`:`MENTAL_RECORDS (best scores):
${N.join(`
`)}
`:t===0?`РЕЗУЛЬТАТЫ МЕНТАЛЬНЫХ ТРЕНИРОВОК:
  Нет данных
`:`MENTAL_RECORDS:
  No data
`;function et(n){const s=[100,200,300,400][n]||100;let d=0;for(let o=1;o<=20;o++){const c=Math.min(1+o*.02,1.3),$=1.6,u=o-1,b=u>=5?Math.min(1+.1*Math.min(u/10,4),1.5):1;d+=Math.round(s*c*$*b)}return d}const U=[["начальный","novice"],["средний","intermediate"],["продвинутый","advanced"],["безумный","insane"]].map((n,e)=>`  ${n[t]||n[0]}: estimatedMax≈${et(e)}`),nt=t===0?`ПОДСКАЗКИ ПО МАКС. БАЛЛАМ (масштаб математики, максимум при идеальном решении 20 вопросов):
${U.join(`
`)}
`:`MENTAL_SCORE_HINTS (math scale, estimated max for perfect 20 questions):
${U.join(`
`)}
`,_=[];r.forEach(n=>{const e=C[n];e&&_.push(`  ${n}: bedtime(ms): ${e.bedtime||0}, duration(ms): ${e.duration||0}, mood(1-5): ${e.mood||"N/A"}, note: "${e.note||""}"`)});const st=l(t===0?"СОН":"SLEEP",_),ot=(G[t]||G[0]).trim(),at=`
${(W[t]||W[0]).trim()}

${F}

${J}
${q}
${Z}
${K}
${Q}
${V}
${tt}
${nt}
${st}
`.trim();return{systemPrompt:ot,userPrompt:at}}async function bt(t){try{const{systemPrompt:h,userPrompt:r}=mt(t),i=await fetch(ht,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"system",content:h},{role:"user",content:r}]})});if(!i.ok)throw new Error(`Insight API error: ${i.status}`);return(await i.json()).insight}catch(h){throw console.error("Failed to get insight:",h),h}}const ft=()=>{const[t,h]=p.useState(A.value),[r,i]=p.useState(L.value),[m,w]=p.useState(g.prefs[0]),[T,j]=p.useState(lt.value),[E,C]=p.useState(0),[I,v]=p.useState(""),[P,B]=p.useState(!0);return p.useEffect(()=>{(async()=>{try{const l=await bt(m);v(l)}catch{v(m===0?"Не удалось загрузить инсайт. Попробуйте позже.":"Failed to load insight. Please try again.")}finally{B(!1)}})()},[m,T]),p.useEffect(()=>{const x=A.subscribe(h),l=L.subscribe(i);return()=>{x.unsubscribe(),l.unsubscribe()}},[]),p.useEffect(()=>{const x=Y.subscribe(l=>{w(l==="ru"?0:1)});return()=>{x.unsubscribe()}},[]),a.jsxs("div",{style:{...f(t).panel},children:[a.jsxs("div",{style:f(t).header,children:[a.jsxs("div",{style:f(t).iconGlowContainer,children:[a.jsx(dt,{size:28,color:"#fff",style:{zIndex:2}}),a.jsx(ut,{size:14,color:"#00E5FF",style:{position:"absolute",top:"10px",right:"10px",zIndex:2}}),a.jsx("div",{style:f(t).iconGlow})]}),a.jsxs("div",{style:f(t).titleContainer,children:[a.jsx("span",{style:f(t).gradientTitle,children:m===0?"AI Анализ":"AI Analysis"}),a.jsx("span",{style:f(t).subtitle,children:m===0?"Персональный инсайт":"Personal Insight"})]})]}),a.jsx("div",{style:f(t,r).contentBody,children:P?a.jsxs("div",{style:f(t).loadingContainer,children:[a.jsx("div",{style:f(t).pulseCircle}),a.jsx("span",{style:{opacity:.7,fontSize:"14px"},children:m===0?"Анализирую данные...":"Analyzing data..."})]}):a.jsx("div",{style:f(t).textWrapper,children:I.split(`
`).map((x,l)=>a.jsx("p",{style:{margin:"0 0 12px 0",lineHeight:"1.6"},children:x},l))})})]})},f=(t,h)=>{const r=t==="dark",i="#00E5FF",m="#BF5AF2";return{panel:{display:"flex",flexDirection:"column",width:"95vw",maxWidth:"400px",height:"76vh",marginTop:"20px",borderRadius:"32px",backgroundColor:r?"rgba(30, 30, 35, 0.95)":"rgba(255, 255, 255, 0.95)",border:`1px solid ${r?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.05)"}`,boxShadow:`0 20px 50px ${r?"rgba(0,0,0,0.6)":"rgba(0,0,0,0.2)"}, 0 0 30px rgba(0, 229, 255, 0.1)`,overflowY:"scroll"},header:{padding:"30px 24px 20px 24px",display:"flex",flexDirection:"column",alignItems:"center",borderBottom:`1px solid ${k.get("border",t)}50`,background:r?"linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(0,0,0,0) 100%)":"linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(255,255,255,0) 100%)"},iconGlowContainer:{width:"64px",height:"64px",borderRadius:"20px",backgroundColor:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginBottom:"16px",boxShadow:"0 8px 20px rgba(0,0,0,0.2)"},iconGlow:{position:"absolute",inset:0,borderRadius:"20px",background:`linear-gradient(135deg, ${i}, ${m})`,opacity:.8,filter:"blur(15px)",zIndex:0},titleContainer:{textAlign:"center"},gradientTitle:{fontSize:"22px",fontWeight:"800",fontFamily:"Segoe UI, sans-serif",background:`linear-gradient(90deg, ${i} 0%, ${m} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",display:"block",marginBottom:"4px"},subtitle:{fontSize:"13px",color:k.get("subText",t),fontWeight:"500",letterSpacing:"0.5px"},contentBody:{flex:1,overflowY:"auto",padding:"24px",fontSize:h===0?"15px":"17px",color:k.get("mainText",t),textAlign:"left",position:"relative"},textWrapper:{animation:"fadeIn 0.5s ease-out"},loadingContainer:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",color:k.get("subText",t)},pulseCircle:{width:"40px",height:"40px",borderRadius:"50%",border:`3px solid ${i}`,borderTopColor:"transparent",animation:"spin 1s linear infinite"},footer:{padding:"20px",borderTop:`1px solid ${k.get("border",t)}50`,display:"flex",justifyContent:"center",backgroundColor:r?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.5)"},closeButton:{width:"100%",padding:"14px",borderRadius:"16px",border:"none",backgroundColor:r?"rgba(255,255,255,0.08)":"#f0f0f0",color:k.get("mainText",t),display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",cursor:"pointer",fontSize:"15px",transition:"background-color 0.2s"}}},Et=()=>{const[t,h]=p.useState("dark"),[r,i]=p.useState(g.prefs[0]),[m,w]=p.useState(g.prefs[4]),[T,j]=p.useState(pt.hasPremium);return p.useEffect(()=>{const E=A.subscribe(h),C=Y.subscribe(i),I=L.subscribe(w),v=gt.subscribe(j);return()=>{E.unsubscribe(),C.unsubscribe(),I.unsubscribe(),v.unsubscribe()}},[]),a.jsxs("div",{style:xt(t).container,children:[a.jsx(ft,{}),!T&&a.jsx("div",{style:{width:"100vw",height:"80vh",position:"fixed",zIndex:2555,pointerEvents:"none"},children:a.jsx("div",{onClick:E=>E.stopPropagation(),style:{position:"absolute",inset:0,zIndex:2555,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",backgroundColor:A.value==="dark"?"rgba(10, 10, 10, 0.85)":"rgba(255, 255, 255, 0.9)",backdropFilter:"blur(22px)",textAlign:"center"},children:a.jsx("div",{style:{color:A.value==="dark"?"#FFD700":"#D97706",fontSize:"11px",fontWeight:"bold",fontFamily:"Segoe UI"},children:r===0?"ТОЛЬКО ДЛЯ ПРЕМИУМ":"PREMIUM USERS ONLY"})})})]})},xt=(t,h)=>({container:{backgroundColor:k.get("background",t),display:"flex",flexDirection:"column",justifyContent:"start",alignItems:"center",height:"89vh",marginTop:"120px",width:"100vw",fontFamily:"Segoe UI"}});export{Et as default};
