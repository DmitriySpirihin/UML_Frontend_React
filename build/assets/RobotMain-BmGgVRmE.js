import{A as u,U as Q,b as ge,t as B,f as _,l as ee,j as o,cq as ue,C as N,cr as he,aO as me,cs as xe,ct as fe,cu as ye,cv as be,B as Se,aP as $e,p as Ee}from"./index-Cgkkm6qK.js";import{r as f}from"./recharts-k8ghPecL.js";const Te="https://ultymylife.ru/api/insight",d={GENERAL:"general",PROGRESS_ANALYSE:"progress",RECOVERY_RATE:"recovery_rate",HABITS:"habits",FOCUS_MINDSET:"focus",TIME_MANAGEMENT:"efficiency",RUNNING:"running",CYCLING:"cycling"},J=[`Ты — элитный спортивный физиолог и аналитик данных по имени UltyMyBro. Анализируй данные о сне 😴, тренировках 💪, ментальном состоянии 🧠 и задачах ✅. 

ОСНОВНЫЕ ПРАВИЛА:
1. Инсайт должен быть КРАТКИМ — 2-4 предложения, максимум 120 слов
2. Используй эмодзи как визуальные маркеры:
   • 😴 — сон и восстановление
   • ⚡ — энергия и выносливость
   • 💡 — ключевой вывод
   • 📈 — тренды и корреляции
   • ✅ — рекомендация к действию
3. Всегда обращайся к пользователю по имени
4. Завершай сообщение подписью «— UltyMyBro»

Формат ответа:
💡 [Краткий вывод о главной взаимосвязи]
📈 [Конкретная корреляция из данных]
✅ [Одна конкретная рекомендация]

НЕ пиши длинные абзацы, избегай общих фраз.`,`You are an elite sports physiologist and data scientist named UltyMyBro. Analyze sleep 😴, workouts 💪, mental state 🧠, and tasks ✅ data.

CORE RULES:
1. Insight MUST be CONCISE — 2-4 sentences, max 120 words
2. Use emojis as visual markers:
   • 😴 — sleep & recovery
   • ⚡ — energy & endurance
   • 💡 — key insight
   • 📈 — trends & correlations
   • ✅ — actionable recommendation
3. Always address the user by name
4. End with signature "— UltyMyBro"

Response format:
💡 [Brief core insight]
📈 [Specific data correlation]
✅ [One concrete action step]

NO long paragraphs, NO generic advice.`],K={[d.GENERAL]:[`Отчёт по общей продуктивности (Синтез всех сфер):
1) 📊 Анализ: Как сон, дыхательные практики, медитация и закалка повлияли на закрытие задач?
2) 💪 Главная победа: Лучший результат в спорте или дисциплине.
3) ⚠️ Узкое горлышко: Что мешает успевать всё?
4) 🎯 План: 3 микро-шага на неделю.Поприветствуй пользователя в начале по имени`,`General Productivity Report (Life Synthesis):
1) 📊 Analysis: How did sleep, breathing exercises, meditation, and hardening impact task completion?
2) 💪 Key Win: Top achievement in sports or discipline.
3) ⚠️ Bottleneck: What is hindering your overall progress?
4) 🎯 Action Plan: 3 micro-steps for next week.Greet the user by name at the start`],[d.PROGRESS_ANALYSE]:[`Анализ прогресса (Кратко):
1) 📈 Тренд: Веса и объём — рост или плато?
2) 🔥 Пик: Самый эффективный день.
3) 🎯 Коррекция: Одно правка в интенсивность.`,`Progress Analysis (Brief):
1) 📈 Trend: Weights & Volume — growth or plateau?
2) 🔥 Peak: Most effective day.
3) 🎯 Correction: One adjustment to intensity.`],[d.RECOVERY_RATE]:[`Восстановление (Вердикт):
1) 🛌 Ресурс: Хватает ли сна и практик восстановления (дыхание/медитация/закалка) для твоих нагрузок?
2) ⚠️ Риск: Признаки переутомления.
3) 🎯 Режим: Конкретный совет по отдыху сегодня.`,`Recovery (Verdict):
1) 🛌 Resource: Are sleep and recovery practices (breathing/meditation/hardening) sufficient for your load?
2) ⚠️ Risk: Signs of overtraining.
3) 🎯 Protocol: Specific rest advice for today.`],[d.HABITS]:[`Дисциплина (Паттерны):
1) 🧱 Якорь: Твоя самая стабильная привычка.
2) ⚠️ Сбой: Когда и почему происходят срывы?
3) 🎯 Укрепление: Как закрыть слабое звено.`,`Discipline (Patterns):
1) 🧱 Anchor: Your most stable habit.
2) ⚠️ Leak: When and why do failures occur?
3) 🎯 Fix: How to strengthen the weak link.`],[d.FOCUS_MINDSET]:[`Ментальный фокус:
1) 🧠 Состояние: Уровень ментальной выносливости и риск выгорания.
2) ⚡️ Совет: Один психологический прием для фокуса сегодня.`,`Focus & Mindset:
1) 🧠 State: Mental stamina level and burnout risk.
2) ⚡️ Tip: One psychological tactic for focus today.`],[d.TIME_MANAGEMENT]:[`Управление временем:
1) 🕒 Golden Hour: Твое самое продуктивное время на основе логов.
2) 📉 Dead Zone: Когда эффективность падает и как это исправить.`,`Time Management:
1) 🕒 Golden Hour: Your most productive window based on logs.
2) 📉 Dead Zone: When efficiency drops and how to fix it.`],[d.RUNNING]:[`Анализ беговых тренировок (последние 7 дней):
1) 📈 Динамика: Изменение дистанции, темпа (мин/км) и ЧСС за неделю.
2) 🥇 Пиковая сессия: Лучший результат по дистанции/темпу с анализом условий.
3) ⚠️ Риски: Признаки переутомления (ухудшение темпа при той же дистанции, аномальная ЧСС).
4) 🎯 Тактика: Конкретная рекомендация по улучшению выносливости или скорости на следующую неделю. Упомяни погодные условия если есть в заметках.`,`Running Analysis (Last 7 Days):
1) 📈 Trend: Distance, pace (min/km), and heart rate progression.
2) 🥇 Peak Session: Best distance/pace performance with context analysis.
3) ⚠️ Risks: Overtraining signs (worsening pace at same distance, abnormal HR).
4) 🎯 Strategy: Specific recommendation to improve endurance/speed next week. Mention weather conditions if noted in logs.`],[d.CYCLING]:[`Анализ велотренировок (последние 7 дней):
1) 📈 Динамика: Скорость (км/ч), набор высоты (м) и каденс (об/мин) за неделю.
2) 🥇 Пиковая сессия: Лучший результат по дистанции/средней скорости с анализом профиля маршрута (равнина/холмы).
3) ⚠️ Риски: Признаки перетренированности (падение каденса при той же мощности, аномальная ЧСС).
4) 🎯 Тактика: Рекомендация по интервальной тренировке или работе над техникой педалирования на следующую неделю. Упомяни влияние рельефа из заметок.`,`Cycling Analysis (Last 7 Days):
1) 📈 Trend: Speed (km/h), elevation gain (m), and cadence (rpm) progression.
2) 🥇 Peak Session: Best distance/average speed performance with terrain analysis (flat/hilly).
3) ⚠️ Risks: Overtraining signs (declining cadence at same power output, abnormal HR response).
4) 🎯 Strategy: Specific interval training or pedaling technique recommendation for next week. Reference terrain impact from session notes.`]};function Ie(n,m=d.GENERAL){const r=t=>{const s=t.getTimezoneOffset()*6e4;return new Date(t.getTime()-s).toISOString().split("T")[0]},p=new Date,i=[];for(let t=6;t>=0;t--){const s=new Date(p);s.setDate(s.getDate()-t),i.push(r(s))}const x=u.pData||{},C=Q.name?.trim()||(n===0?"Пользователь":"User"),D=u.habitsByDate||{},A=u.trainingLog||{},E=u.breathingLog||{},v=u.meditationLog||{},T=u.hardeningLog||{},F=u.sleepingLog||{};u.mentalLog;const G=u.todoList||[],P=u.programs||{},O=u.exercises||{},H=ge||{},a=(t,s)=>s.length===0?`${t} (last 7 days):
  No data found
`:`${t} (last 7 days):
${s.join(`
`)}
`,b=`
USER CONTEXT:
- Name: ${C}
- Profile: ${x.age||"?"} y.o, ${x.gender===0?"Male":"Female"}, Goal: ${x.goal!==void 0?["Mass","Strength","Cut","Health"][x.goal]:"General"}
`.trim(),I=G.map(t=>{const s=t.goals||[],e=s.filter(c=>c.isDone).length,h=s.length>0?`(${e}/${s.length} goals)`:"",g=t.isDone?"✅ DONE":"⏳ IN PROGRESS";return`  - [${t.category}] ${t.name}: ${g} ${h} | Priority: ${t.priority}/5, Urgency: ${t.urgency}/5, Difficulty: ${t.difficulty}/5 | Deadline: ${t.deadLine}`}),R=a("TO-DO LIST & PRODUCTIVITY",I),U=[];i.forEach(t=>{const s=F[t];if(!s)return;const e=Math.round((s.duration||0)/36e4)/10;U.push(`  ${t}: Sleep=${e}h, Mood=${s.mood}/5, Note="${s.note||""}"`)});const te=a("SLEEP_AND_RECOVERY",U),W=[];i.forEach(t=>{(Array.isArray(E[t])?E[t]:[]).forEach((e,h)=>{if(!e?.startTime||!e?.endTime)return;const g=Math.round((e.endTime-e.startTime)/6e4),c=e.maxHold?Math.round(e.maxHold/1e3):0;W.push(`  ${t} [Session ${h+1}]: Duration=${g} min, Max Breath Hold=${c} sec`)})});const ne=a("BREATHING_EXERCISES",W),V=[];i.forEach(t=>{(Array.isArray(v[t])?v[t]:[]).forEach((e,h)=>{if(!e?.startTime||!e?.endTime)return;const g=Math.round((e.endTime-e.startTime)/6e4);V.push(`  ${t} [Session ${h+1}]: Duration=${g} min`)})});const oe=a("MEDITATION",V),q=[];i.forEach(t=>{(Array.isArray(T[t])?T[t]:[]).forEach((e,h)=>{if(!e?.startTime||!e?.endTime)return;const g=Math.round((e.endTime-e.startTime)/6e4),c=e.timeInColdWater?Math.round(e.timeInColdWater/6e4):0;q.push(`  ${t} [Session ${h+1}]: Total=${g} min, Cold Exposure=${c} min`)})});const ie=a("HARDENING",q),X=[];i.forEach(t=>{const s=D[t];if(!s)return;const h=(Array.isArray(s)?s:Object.entries(s).map(([g,c])=>({habitId:Number(g),status:c}))).map(g=>{const c=H[g.habitId],$=c?.name?c.name[1]||c.name[0]:`Habit #${g.habitId}`;let S="Skipped";return g.status===-2&&(S="Done"),g.status===1&&(S="Abstained (Success)"),g.status===0&&(S="Failed/Skipped"),`${$}: ${S}`});h.length>0&&X.push(`  ${t}: ${h.join(", ")}`)});const se=a("HABITS",X),L=[];i.forEach(t=>{const s=A[t];!s||!s.length||s.forEach(e=>{const h=e.type&&["RUNNING","CYCLING","SWIMMING"].includes(e.type),g=!h||e.type==="GYM"||!e.type;if(h){let c;e.type==="SWIMMING"?c=`${Math.round(e.distance*1e3)} m`:c=`${e.distance.toFixed(1)} km`;const $=Math.round(e.duration||0);let S="";if(e.type==="RUNNING"&&e.distance>0&&$>0){const y=$/e.distance,M=Math.floor(y),w=Math.round((y-M)*60);S=` | Pace: ${M}:${w.toString().padStart(2,"0")} min/km`}else if(e.type==="CYCLING"&&e.distance>0&&$>0){const y=$/60;S=` | Speed: ${(e.distance/y).toFixed(1)} km/h`}const k=[`Type: ${e.type}`,`Distance: ${c}`,`Duration: ${$} min${S}`];if(e.elevationGain>0&&k.push(`Elevation: ${e.elevationGain} m`),e.avgHeartRate>0&&k.push(`HR: ${e.avgHeartRate} bpm`),e.avgCadence>0){const y=e.type==="CYCLING"?"rpm":"spm";k.push(`Cadence: ${e.avgCadence} ${y}`)}if(e.rpe>0&&k.push(`RPE: ${e.rpe}/10`),e.notes?.trim()){const y=e.notes.trim().length>40?e.notes.trim().substring(0,40)+"...":e.notes.trim();k.push(`Notes: "${y}"`)}L.push(`  DATE: ${t} | ${k.join(" | ")}`)}else if(g){const c=P[e.programId],$=c?.name?Array.isArray(c.name)?c.name[1]||`Prog #${e.programId}`:c.name:`Prog #${e.programId}`,S=Math.round((e.duration||0)/6e4);L.push(`  DATE: ${t} | Program: ${$} | Duration: ${S} min`),(e.exerciseOrder||[]).forEach(y=>{const M=e.exercises?.[y];if(!M)return;const w=O[y],de=w?.name?Array.isArray(w.name)?w.name[1]||`Ex #${y}`:w.name:`Ex #${y}`;let z=0,Z=0;(M.sets||[]).forEach(Y=>{Y.weight>z&&(z=Y.weight),Z+=Y.reps||0});const pe=M.totalTonnage||0;L.push(`    - ${de}: Max=${z}kg, Reps=${Z}, Vol=${pe.toFixed(1)}kg`)})}})});const re=a("TRAINING_LOG",L),j=[];i.forEach(t=>{const s=u.mentalLog[t];if(!Array.isArray(s)||s.length===0){j.push(`  ${t}: []`);return}j.push(`  ${t}: [`),s.forEach((e,h)=>{const g=`{type:'${e.type}',difficulty:'${e.difficulty}',duration:${e.duration},scores:${e.scores},rightAnswers:'${e.rightAnswers}',maxPosibleScores:${e.maxPosibleScores}}`;j.push(`    ${g}${h<s.length-1?",":""}`)}),j.push("  ]")});const ae=a("BRAIN_TRAINING",j),ce=(J[n]||J[0]).trim(),le=`
${(K[m][n]||K[m][0]).trim()}
${b}
${R}
${te}
${ne}
${oe}
${ie}
${se}
${re}
${ae}
`.trim();return{systemPrompt:ce,userPrompt:le}}async function Ce(n,m=d.GENERAL){try{const{systemPrompt:r,userPrompt:p}=Ie(n,m),i=await fetch(Te,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"system",content:r},{role:"user",content:p}]})});if(!i.ok)throw new Error(`Insight API error: ${i.status} ${i.statusText}`);return(await i.json()).insight}catch(r){console.error("Failed to get insight:",r);const p=n===0?`Не удалось получить аналитику: ${r.message}. Проверьте подключение к интернету.`:`Failed to generate insight: ${r.message}. Please check your connection.`;throw new Error(p)}}const Ae=()=>{const[n,m]=f.useState(B.value),[r,p]=f.useState(_.value),[i,x]=f.useState(u.prefs[0]),[C,D]=f.useState(d.GENERAL),[A,E]=f.useState(""),[v,T]=f.useState(!0),[F,G]=f.useState(!1);u.insightCache||(u.insightCache={});const P=async a=>{T(!0),D(a);const b=new Date().toISOString().split("T")[0],I=u.insightCache[a];if(I&&I.date===b&&I.text){E(I.text),T(!1);return}try{const R=await Ce(i,a);u.insightCache[a]={text:R,date:b},E(R)}catch{E(i===0?"Не удалось загрузить данные. Попробуйте позже.":"Failed to load insights. Please try again.")}finally{T(!1)}};f.useEffect(()=>{P(d.GENERAL)},[i]),f.useEffect(()=>{const a=B.subscribe(m),b=_.subscribe(p),I=ee.subscribe(R=>x(R==="ru"?0:1));return()=>{a.unsubscribe(),b.unsubscribe(),I.unsubscribe()}},[]);const O=[{type:d.GENERAL,label:i===0?"Общее":"General",icon:o.jsx(he,{})},{type:d.PROGRESS_ANALYSE,label:i===0?"Прогресс":"Progress",icon:o.jsx(me,{})},{type:d.RECOVERY_RATE,label:i===0?"Восстановление":"Recovery",icon:o.jsx(xe,{})},{type:d.HABITS,label:i===0?"Привычки":"Habits",icon:o.jsx(fe,{})},{type:d.FOCUS_MINDSET,label:i===0?"Ментальное":"Focus",icon:o.jsx(ye,{})},{type:d.TIME_MANAGEMENT,label:i===0?"График":"Schedule",icon:o.jsx(be,{})},{type:d.RUNNING,label:i===0?"Бег":"Running",icon:o.jsx(Se,{})},{type:d.CYCLING,label:i===0?"Вело":"Cycling",icon:o.jsx($e,{})}],H=i===0?"⚠️ Внимание: Данный анализ предоставляется исключительно в информационных целях и не является медицинской рекомендацией. Перед внесением изменений в режим тренировок, питания или сна проконсультируйтесь с квалифицированным медицинским специалистом.":"⚠️ Disclaimer: This analysis is for informational purposes only and does not constitute medical advice. Please consult with a qualified healthcare professional before making any changes to your exercise, nutrition, or sleep regimen.";return o.jsxs("div",{style:l(n).panel,children:[o.jsxs("div",{style:l(n).header,children:[o.jsx("img",{src:"images/Couch.png",style:l(n).mascot,alt:"Couch"}),o.jsxs("div",{style:l(n).titleContainer,children:[o.jsx("span",{style:l(n).gradientTitle,children:i===0?"Анализ от UltyMyBro":"UltyMyBro Analysis"}),o.jsx("span",{style:l(n).subtitle,children:i===0?"Персональный инсайт":"Personal Insight"})]})]}),o.jsx("div",{style:l(n,r).contentBody,children:v?o.jsxs("div",{style:l(n).loadingContainer,children:[o.jsx("div",{style:l(n).modernSpinnerContainer,children:o.jsx("div",{style:l(n).modernSpinner,children:o.jsx("img",{src:"images/Thinking.png",style:l(n).loadingIcon,alt:"Couch"})})}),o.jsx("span",{style:{opacity:.7,fontSize:"14px",marginTop:"12px"},children:i===0?"Анализирую данные...":"Analyzing data..."})]}):o.jsxs("div",{style:l(n).textWrapper,children:[A.split(`
`).map((a,b)=>o.jsx("p",{style:{margin:"0 0 12px 0",lineHeight:"1.6"},children:a},b)),o.jsxs("div",{style:l(n).optionsDivider,children:[F?o.jsxs("div",{style:l(n).expandedContainer,children:[o.jsx("div",{style:l(n).buttonRow,children:O.map(a=>{const b=C===a.type;return o.jsxs("button",{onClick:()=>P(a.type),style:l(n,b).filterBtn,children:[o.jsx("span",{style:{marginRight:"6px",fontSize:"14px",display:"flex"},children:a.icon}),a.label]},a.type)})}),o.jsx("button",{onClick:()=>G(!1),style:l(n).hideBtn,children:i===0?"Скрыть":"Hide"})]}):o.jsxs("button",{onClick:()=>G(!0),style:l(n).showMoreBtn,children:[o.jsx(ue,{size:20,style:{marginRight:"8px"}}),i===0?"Больше параметров":"More Options"]}),o.jsx("div",{style:l(n).disclaimerContainer,children:o.jsx("span",{style:l(n).disclaimerText,children:H})})]})]})}),o.jsx("style",{children:`
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }
                @keyframes pulseGlow { 
                    0%, 100% { opacity: 0.7; box-shadow: 0 0 15px #00E5FF80, 0 0 25px #BF5AF280; }
                    50% { opacity: 1; box-shadow: 0 0 25px #00E5FFCC, 0 0 35px #BF5AF2CC; }
                }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .contentBody::-webkit-scrollbar { 
                    width: 0px; 
                    background: transparent; 
                }
                /* Modern gradient spinner animation */
                @keyframes gradientRotate {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `})]})},l=(n,m)=>{const r=n==="dark",p="#00E5FF",i="#BF5AF2",x=typeof m=="boolean"?m:!1,C=typeof m=="number"?m:0;return{panel:{display:"flex",flexDirection:"column",width:"95vw",maxWidth:"400px",height:"76vh",marginTop:"20px",borderRadius:"32px",backgroundColor:r?"rgba(30, 30, 35, 0.95)":"rgba(255, 255, 255, 0.95)",border:`1px solid ${r?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.05)"}`,boxShadow:`0 20px 50px ${r?"rgba(0,0,0,0.6)":"rgba(0,0,0,0.2)"}, 0 0 30px rgba(0, 229, 255, 0.1)`,overflow:"hidden"},header:{display:"flex",flexDirection:"column",alignItems:"center",position:"relative",flexShrink:0,borderBottom:"1px solid  rgba(94, 94, 94, 0.35)",padding:"22px"},iconGlowContainer:{width:"52px",height:"52px",borderRadius:"18px",backgroundColor:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginBottom:"12px",boxShadow:"0 8px 20px rgba(0,0,0,0.2)"},iconGlow:{position:"absolute",inset:0,borderRadius:"18px",background:`linear-gradient(135deg, ${p}, ${i})`,opacity:.8,filter:"blur(15px)",zIndex:0},titleContainer:{marginTop:"15%",textAlign:"center",zIndex:2},gradientTitle:{fontSize:"25px",fontWeight:"800",fontFamily:"Segoe UI, sans-serif",background:`linear-gradient(90deg, ${p} 0%, ${i} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",display:"block"},subtitle:{fontSize:"12px",color:N.get("subText",n),fontWeight:"500",opacity:.8},mascot:{position:"absolute",top:"1%",left:"35%",width:"100px",zIndex:1,filter:"drop-shadow(0 5px 15px rgba(0,0,0,0.4))",pointerEvents:"none"},loadingIcon:{position:"absolute",width:"150px",borderRadius:"50%",marginTop:"10%",zIndex:1,filter:"drop-shadow(0 5px 15px rgba(0,0,0,0.4))",pointerEvents:"none"},contentBody:{flex:1,overflowY:"auto",padding:"10px 24px 30px 24px",fontSize:C===0?"15px":"17px",color:N.get("mainText",n),textAlign:"left",position:"relative",scrollbarWidth:"none"},textWrapper:{animation:"fadeIn 0.5s ease-out",marginTop:"20px"},loadingContainer:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",color:N.get("subText",n)},modernSpinnerContainer:{position:"relative",width:"150px",height:"150px",display:"flex",alignItems:"center",justifyContent:"center"},modernSpinner:{position:"absolute",width:"100%",height:"100%",borderRadius:"50%",background:`linear-gradient(45deg, ${p}40, ${i}80, ${p}40)`,backgroundSize:"250% 250%",animation:"gradientRotate 3s ease infinite, pulseGlow 2s ease-in-out infinite",opacity:.9,boxShadow:`0 0 20px ${p}60, 0 0 30px ${i}60`,"::before":{content:'""',position:"absolute",top:"8px",left:"8px",right:"8px",bottom:"8px",borderRadius:"50%",backgroundColor:r?"rgba(30,30,35,0.95)":"rgba(255,255,255,0.95)"}},disclaimerContainer:{marginTop:"28px",paddingTop:"18px",borderTop:`1px solid ${r?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"}`,display:"flex",alignItems:"flex-start",gap:"10px",padding:"12px 16px",borderRadius:"16px",backgroundColor:r?"rgba(35, 35, 45, 0.7)":"rgba(245, 247, 250, 0.85)",backdropFilter:"blur(4px)"},disclaimerIcon:{marginTop:"2px",color:"#FFAA00",flexShrink:0},disclaimerText:{fontSize:"12px",lineHeight:"1.5",color:r?"rgba(255, 255, 255, 0.85)":"rgba(0, 0, 0, 0.75)",fontStyle:"italic",fontWeight:"500"},optionsDivider:{marginTop:"30px",paddingBottom:"20px",borderTop:`1px solid ${r?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.05)"}`,paddingTop:"20px",textAlign:"center"},showMoreBtn:{display:"inline-flex",alignItems:"center",padding:"10px 20px",borderRadius:"12px",border:"none",cursor:"pointer",backgroundColor:r?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.03)",color:p,fontSize:"14px",fontWeight:"600",transition:"transform 0.2s ease",":hover":{transform:"translateY(-1px)"}},expandedContainer:{animation:"fadeIn 0.3s ease-in"},buttonRow:{display:"flex",flexWrap:"wrap",gap:"8px",justifyContent:"center",marginBottom:"16px"},filterBtn:{display:"flex",alignItems:"center",justifyContent:"center",padding:"8px 14px",borderRadius:"16px",cursor:"pointer",fontSize:"13px",fontWeight:"600",transition:"all 0.2s ease",backgroundColor:x?r?"rgba(0, 229, 255, 0.2)":"rgba(0, 229, 255, 0.1)":r?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",color:x?p:N.get("subText",n),boxShadow:x?`0 0 15px ${p}30`:"none",border:`1px solid ${x?p:"transparent"}`},hideBtn:{background:"none",border:"none",color:N.get("subText",n),fontSize:"12px",cursor:"pointer",textDecoration:"underline",opacity:.6,":hover":{opacity:1}}}},we=()=>{const[n,m]=f.useState("dark"),[r,p]=f.useState(u.prefs[0]),[i,x]=f.useState(u.prefs[4]),[C,D]=f.useState(Q.hasPremium);return f.useEffect(()=>{const A=B.subscribe(m),E=ee.subscribe(p),v=_.subscribe(x),T=Ee.subscribe(D);return()=>{A.unsubscribe(),E.unsubscribe(),v.unsubscribe(),T.unsubscribe()}},[]),o.jsxs("div",{style:Re(n).container,children:[o.jsx(Ae,{}),!C&&o.jsx("div",{style:{width:"100vw",height:"80vh",position:"fixed",zIndex:2555,pointerEvents:"none"},children:o.jsx("div",{onClick:A=>A.stopPropagation(),style:{position:"absolute",inset:0,zIndex:2555,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",backgroundColor:B.value==="dark"?"rgba(10, 10, 10, 0.85)":"rgba(255, 255, 255, 0.9)",backdropFilter:"blur(10px)",textAlign:"center"},children:o.jsx("div",{style:{color:B.value==="dark"?"#FFD700":"#D97706",fontSize:"11px",fontWeight:"bold",fontFamily:"Segoe UI"},children:r===0?"ТОЛЬКО ДЛЯ ПРЕМИУМ":"PREMIUM USERS ONLY"})})})]})},Re=(n,m)=>({container:{backgroundColor:N.get("background",n),display:"flex",flexDirection:"column",justifyContent:"start",alignItems:"center",height:"89vh",marginTop:"120px",width:"100vw",fontFamily:"Segoe UI"}});export{we as default};
