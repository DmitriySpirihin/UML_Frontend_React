import{A as p,d as ct,t as P,f as z,X as lt,l as Y,j as c,z as dt,b_ as ut,C as k}from"./index-xkh0JCWl.js";import{r as g}from"./recharts-Bg6K2Pzo.js";const pt="https://ultymylife.ru/api/insight",W=["Ты — персональный фитнес-аналитик. Проанализируй данные за последние 7 дней и дай краткий, практичный отчёт на русском языке.","You are a personal fitness analyst. Analyze the data from the last 7 days and provide a short, practical report in English."],U=[`Требования к ответу:
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

Data to analyze:`];function gt(t){const h=new Date,a=[];for(let n=6;n>=0;n--){const e=new Date(h);e.setDate(e.getDate()-n),a.push(e.toISOString().split("T")[0])}const r=p.pData||{},m=p.habitsByDate||{},E=p.trainingLog||{},w=p.breathingLog||{},T=p.meditationLog||{},A=p.hardeningLog||{},v=p.sleepingLog||{},M=p.mentalLog||{},I=p.mentalRecords||[],D=p.programs||{},B=p.exercises||{},x=ct||{},l=(n,e)=>e.length===0?`${n} (last 7 days):
  No data
`:`${n} (last 7 days):
${e.join(`
`)}
`,F=`
USER:
- age: ${r.age||"unknown"}
- gender: ${r.gender!==void 0?r.gender:"unknown"}
- height: ${r.height||"unknown"} cm
- wrist: ${r.wrist||"unknown"} cm
- goal: ${r.goal||"unknown"}
`.trim(),H=[];a.forEach(n=>{const e=m[n];if(!e)return;const d=(Array.isArray(e)?e:Object.entries(e).map(([o,i])=>({habitId:Number(o),status:i}))).map(o=>{const i=x[o.habitId],$=i?.name?i.name[t]||i.name[0]||`Habit #${o.habitId}`:`Habit #${o.habitId}`;return{habitId:o.habitId,status:o.status,habitName:$}});d.length>0&&H.push(`  ${n}: ${JSON.stringify(d)}`)});const J=l(t===0?"ПРИВЫЧКИ (за последние 7 дней)":"HABITS_BY_DATE",H),y=[];a.forEach(n=>{const e=E[n];!e||!e.length||(y.push(`  DATE: ${n}`),e.forEach((s,d)=>{const o=D[s.programId],i=o?.name?o.name[t]||o.name[0]||`Program #${s.programId}`:`Program #${s.programId}`;y.push(`    [Session #${d+1}] program: ${i}, dayIndex: ${s.dayIndex}, completed: ${s.completed}, duration(ms): ${s.duration||0}, tonnage: ${s.tonnage||0}`),y.push("      exercises:"),(s.exerciseOrder||[]).forEach(u=>{const b=s.exercises?.[u],S=B[u],rt=S?.name?S.name[t]||S.name[0]||`Exercise #${u}`:`Exercise #${u}`;b&&(y.push(`        - ${rt} (mgId: ${b.mgId||"N/A"})`),y.push("          sets:"),(b.sets||[]).forEach((N,it)=>{y.push(`            * set ${it+1}: type=${N.type||"N/A"}, reps=${N.reps||0}, weight=${N.weight||0}, time=${N.time||0}`)}),y.push(`          totalTonnage: ${b.totalTonnage||0}, completed: ${b.completed||!1}`))})}))});const q=l(t===0?"ТРЕНИРОВКИ":"TRAININGS",y),R=(n,e=[])=>{const s=[];return a.forEach(d=>{const o=n[d];!o||!o.length||(s.push(`  ${d}:`),o.forEach((i,$)=>{const u=(i.endTime||0)-(i.startTime||0);let b=`    #${$+1}: duration(ms): ${u}`;e.forEach(S=>{i[S]!=null&&(b+=`, ${S}: ${i[S]}`)}),s.push(b)}))}),s},Z=l(t===0?"ДЫХАНИЕ":"BREATHING",R(w,["maxHold"])),X=l(t===0?"МЕДИТАЦИЯ":"MEDITATION",R(T)),K=l(t===0?"ЗАКАЛИВАНИЕ":"HARDENING",R(A,["timeInColdWater"])),j=[];let L=0,O=0;a.forEach(n=>{const e=M[n];if(e==null)return;const s=Number(e)||0;L+=s,O++,j.push(`  ${n}: duration(sec): ${s}, duration(min): ${Math.round(s/60*10)/10}`)}),j.length>0&&j.push(`  total(sec): ${L}, total(min): ${Math.round(L/60*10)/10}, days: ${O}`);const Q=l(t===0?"МЕНТАЛЬНАЯ АКТИВНОСТЬ":"MENTAL",j),V=[["Быстрый счёт","Mental math"],["Память в действии","Memory"],["Числовая логика","Number logic"],["Чистый фокус","Pure focus"]],C=[];(I||[]).forEach((n,e)=>{const s=V[e]?.[t]||`Category ${e}`,d=(Array.isArray(n)?n:[]).map(u=>Number(u)||0),o=d.length?Math.max(...d):0,i=d.filter(u=>u>0),$=i.length?Math.round(i.reduce((u,b)=>u+b,0)/i.length*10)/10:0;C.push(`  ${s}: best=${o}, avg(nonZero)=${$}, byDifficulty=${JSON.stringify(d)}`)});const tt=C.length?t===0?`РЕЗУЛЬТАТЫ МЕНТАЛЬНЫХ ТРЕНИРОВОК (лучшие):
${C.join(`
`)}
`:`MENTAL_RECORDS (best scores):
${C.join(`
`)}
`:t===0?`РЕЗУЛЬТАТЫ МЕНТАЛЬНЫХ ТРЕНИРОВОК:
  Нет данных
`:`MENTAL_RECORDS:
  No data
`;function et(n){const s=[100,200,300,400][n]||100;let d=0;for(let o=1;o<=20;o++){const i=Math.min(1+o*.02,1.3),$=1.6,u=o-1,b=u>=5?Math.min(1+.1*Math.min(u/10,4),1.5):1;d+=Math.round(s*i*$*b)}return d}const _=[["начальный","novice"],["средний","intermediate"],["продвинутый","advanced"],["безумный","insane"]].map((n,e)=>`  ${n[t]||n[0]}: estimatedMax≈${et(e)}`),nt=t===0?`ПОДСКАЗКИ ПО МАКС. БАЛЛАМ (масштаб математики, максимум при идеальном решении 20 вопросов):
${_.join(`
`)}
`:`MENTAL_SCORE_HINTS (math scale, estimated max for perfect 20 questions):
${_.join(`
`)}
`,G=[];a.forEach(n=>{const e=v[n];e&&G.push(`  ${n}: bedtime(ms): ${e.bedtime||0}, duration(ms): ${e.duration||0}, mood(1-5): ${e.mood||"N/A"}, note: "${e.note||""}"`)});const st=l(t===0?"СОН":"SLEEP",G),ot=(W[t]||W[0]).trim(),at=`
${(U[t]||U[0]).trim()}

${F}

${J}
${q}
${Z}
${X}
${K}
${Q}
${tt}
${nt}
${st}
`.trim();return{systemPrompt:ot,userPrompt:at}}async function ht(t){try{const{systemPrompt:h,userPrompt:a}=gt(t),r=await fetch(pt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"system",content:h},{role:"user",content:a}]})});if(!r.ok)throw new Error(`Insight API error: ${r.status}`);return(await r.json()).insight}catch(h){throw console.error("Failed to get insight:",h),h}}const mt=()=>{const[t,h]=g.useState(P.value),[a,r]=g.useState(z.value),[m,E]=g.useState(p.prefs[0]),[w,T]=g.useState(lt.value),[A,v]=g.useState(0),[M,I]=g.useState(""),[D,B]=g.useState(!0);return g.useEffect(()=>{(async()=>{try{const l=await ht(m);I(l)}catch{I(m===0?"Не удалось загрузить инсайт. Попробуйте позже.":"Failed to load insight. Please try again.")}finally{B(!1)}})()},[m,w]),g.useEffect(()=>{const x=P.subscribe(h),l=z.subscribe(r);return()=>{x.unsubscribe(),l.unsubscribe()}},[]),g.useEffect(()=>{const x=Y.subscribe(l=>{E(l==="ru"?0:1)});return()=>{x.unsubscribe()}},[]),c.jsxs("div",{style:{...f(t).panel},children:[c.jsxs("div",{style:f(t).header,children:[c.jsxs("div",{style:f(t).iconGlowContainer,children:[c.jsx(dt,{size:28,color:"#fff",style:{zIndex:2}}),c.jsx(ut,{size:14,color:"#00E5FF",style:{position:"absolute",top:"10px",right:"10px",zIndex:2}}),c.jsx("div",{style:f(t).iconGlow})]}),c.jsxs("div",{style:f(t).titleContainer,children:[c.jsx("span",{style:f(t).gradientTitle,children:m===0?"AI Анализ":"AI Analysis"}),c.jsx("span",{style:f(t).subtitle,children:m===0?"Персональный инсайт":"Personal Insight"})]})]}),c.jsx("div",{style:f(t,a).contentBody,children:D?c.jsxs("div",{style:f(t).loadingContainer,children:[c.jsx("div",{style:f(t).pulseCircle}),c.jsx("span",{style:{opacity:.7,fontSize:"14px"},children:m===0?"Анализирую данные...":"Analyzing data..."})]}):c.jsx("div",{style:f(t).textWrapper,children:M.split(`
`).map((x,l)=>c.jsx("p",{style:{margin:"0 0 12px 0",lineHeight:"1.6"},children:x},l))})})]})},f=(t,h)=>{const a=t==="dark",r="#00E5FF",m="#BF5AF2";return{panel:{display:"flex",flexDirection:"column",width:"95vw",maxWidth:"400px",height:"76vh",marginTop:"20px",borderRadius:"32px",backgroundColor:a?"rgba(30, 30, 35, 0.95)":"rgba(255, 255, 255, 0.95)",border:`1px solid ${a?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.05)"}`,boxShadow:`0 20px 50px ${a?"rgba(0,0,0,0.6)":"rgba(0,0,0,0.2)"}, 0 0 30px rgba(0, 229, 255, 0.1)`,overflowY:"scroll"},header:{padding:"30px 24px 20px 24px",display:"flex",flexDirection:"column",alignItems:"center",borderBottom:`1px solid ${k.get("border",t)}50`,background:a?"linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(0,0,0,0) 100%)":"linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(255,255,255,0) 100%)"},iconGlowContainer:{width:"64px",height:"64px",borderRadius:"20px",backgroundColor:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginBottom:"16px",boxShadow:"0 8px 20px rgba(0,0,0,0.2)"},iconGlow:{position:"absolute",inset:0,borderRadius:"20px",background:`linear-gradient(135deg, ${r}, ${m})`,opacity:.8,filter:"blur(15px)",zIndex:0},titleContainer:{textAlign:"center"},gradientTitle:{fontSize:"22px",fontWeight:"800",fontFamily:"Segoe UI, sans-serif",background:`linear-gradient(90deg, ${r} 0%, ${m} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",display:"block",marginBottom:"4px"},subtitle:{fontSize:"13px",color:k.get("subText",t),fontWeight:"500",letterSpacing:"0.5px"},contentBody:{flex:1,overflowY:"auto",padding:"24px",fontSize:h===0?"15px":"17px",color:k.get("mainText",t),textAlign:"left",position:"relative"},textWrapper:{animation:"fadeIn 0.5s ease-out"},loadingContainer:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",color:k.get("subText",t)},pulseCircle:{width:"40px",height:"40px",borderRadius:"50%",border:`3px solid ${r}`,borderTopColor:"transparent",animation:"spin 1s linear infinite"},footer:{padding:"20px",borderTop:`1px solid ${k.get("border",t)}50`,display:"flex",justifyContent:"center",backgroundColor:a?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.5)"},closeButton:{width:"100%",padding:"14px",borderRadius:"16px",border:"none",backgroundColor:a?"rgba(255,255,255,0.08)":"#f0f0f0",color:k.get("mainText",t),display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",cursor:"pointer",fontSize:"15px",transition:"background-color 0.2s"}}},St=()=>{const[t,h]=g.useState("dark"),[a,r]=g.useState(p.prefs[0]),[m,E]=g.useState(p.prefs[4]);return g.useEffect(()=>{const w=P.subscribe(h),T=Y.subscribe(v=>r(v==="ru"?0:1)),A=z.subscribe(E);return()=>{w.unsubscribe(),T.unsubscribe(),A.unsubscribe()}},[]),c.jsx("div",{style:bt(t).container,children:c.jsx(mt,{})})},bt=(t,h)=>({container:{backgroundColor:k.get("background",t),display:"flex",flexDirection:"column",justifyContent:"start",alignItems:"center",height:"89vh",marginTop:"120px",width:"100vw",fontFamily:"Segoe UI"}});export{St as default};
