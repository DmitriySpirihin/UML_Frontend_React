import{A as S,j as t,k as B,z as H,B as P,D as z,E as A,G as O,n as G,t as L,l as U,f as W,m as b,a as N,C as v}from"./index-DGPlUMvs.js";import{r as p}from"./recharts-Bg6K2Pzo.js";const X=()=>{const[n,a]=p.useState(()=>S?.prefs?.[1]===0?"dark":"light"),[s,o]=p.useState(()=>S?.prefs?.[0]??0),[e,i]=p.useState(0),[r,x]=p.useState("MainCard"),u=p.useMemo(()=>[{id:"MainCard",icon:t.jsx(B,{}),title:s===0?"Общее":"General",color:"#404040"},{id:"HabitsMain",icon:t.jsx(H,{}),title:s===0?"Привычки":"Habits",color:"#FFD700"},{id:"TrainingMain",icon:t.jsx(P,{}),title:s===0?"Тренировки":"Workout",color:"#FF4D4D"},{id:"MentalMain",icon:t.jsx(z,{}),title:s===0?"Мозг":"Brain",color:"#4DA6FF"},{id:"RecoveryMain",icon:t.jsx(A,{}),title:s===0?"Восстановление":"Recovery",color:"#4DFF88"},{id:"SleepMain",icon:t.jsx(O,{}),title:s===0?"Сон":"Sleep",color:"#A64DFF"},{id:"ToDoMain",icon:t.jsx(G,{}),title:s===0?"Задачи":"To-Do",color:"#FFA64D"}],[s]);p.useEffect(()=>{const l=L.subscribe(a),c=U.subscribe(y=>o(y==="ru"?0:1)),f=W.subscribe(i);return()=>{l.unsubscribe(),c.unsubscribe(),f.unsubscribe()}},[]);const d=Y(n,e),g=p.useMemo(()=>u.find(c=>c.id===r)?.color||"#6E6E6E",[u,r]),h=p.useMemo(()=>({MainCard:"images/bro.png",HabitsMain:"images/bro_habits.png",TrainingMain:"images/bro_training.png",MentalMain:"images/bro_mind.png",RecoveryMain:"images/bro_meditating.png",SleepMain:"images/bro_sleeping.png",ToDoMain:"images/bro_task.png"}),[])[r]||guideMain,m=r==="HabitsMain"?{transform:"scale(1.15) translateY(6px)"}:{transform:"scale(1.05) translateY(2px)"},T=p.useMemo(()=>{const l=Q(n),c=q(s,r,g);return`<style>${l}</style>${c}`},[n,s,r,g]);return t.jsxs("div",{style:d.container,children:[t.jsxs("div",{style:d.header,children:[t.jsxs("div",{style:d.topBar,children:[t.jsx("span",{style:d.headerTitle,children:s===0?"Инструкция":"User Guide"}),t.jsx("div",{style:{width:40}})]}),t.jsx("div",{style:d.tabsContainer,className:"no-scrollbar",children:u.map(l=>{const c=r===l.id;return t.jsxs(b.div,{onClick:()=>x(l.id),style:d.tabItem(c,l.color),whileTap:{scale:.95},children:[t.jsx("div",{style:{fontSize:"18px",display:"flex"},children:l.icon}),c&&t.jsx(b.span,{initial:{opacity:0,width:0},animate:{opacity:1,width:"auto"},style:d.tabText,children:l.title})]},l.id)})})]}),t.jsxs("div",{style:d.scrollView,className:"no-scrollbar",children:[t.jsx(N,{mode:"wait",children:t.jsxs(b.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.18},style:d.contentContainer,children:[t.jsxs(b.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},transition:{duration:.22},style:d.coachRow,children:[t.jsx(b.img,{src:h,alt:"Guide",style:{...d.coachImg,...m},animate:{y:[0,-3,0]},transition:{duration:2.8,repeat:1/0,ease:"easeInOut"}},h),t.jsxs("div",{style:d.speech,children:[t.jsx("div",{style:d.speechTitle,children:s===0?"UltyMyBro:":"Guide:"}),t.jsx("div",{style:d.speechText,children:_(s,r)}),t.jsx("div",{style:d.speechTail})]})]}),t.jsx("div",{style:d.htmlContent,dangerouslySetInnerHTML:{__html:T}})]},r)}),t.jsx("div",{style:{height:"110px"}})]})]})};function Y(n,a){const s=v.get("background",n),o=v.get("mainText",n),e=v.get("subText",n),i=v.get("simplePanel",n),r=v.get("border",n);return{container:{backgroundColor:s,display:"flex",flexDirection:"column",height:"90vh",marginTop:"100px",width:"100vw",fontFamily:"Segoe UI, system-ui, -apple-system, sans-serif",overflow:"hidden"},header:{width:"100%",backgroundColor:s,paddingTop:"40px",borderBottom:`1px solid ${r}`,zIndex:10},topBar:{display:"flex",width:"100%",alignItems:"center",justifyContent:"center",padding:"0 20px 15px 20px",boxSizing:"border-box"},headerTitle:{fontSize:"20px",fontWeight:"900",color:o,letterSpacing:"0.2px"},tabsContainer:{display:"flex",gap:"10px",padding:"0 20px 15px 20px",overflowX:"auto",width:"100%",boxSizing:"border-box"},tabItem:(x,u)=>({padding:x?"8px 16px":"8px 12px",borderRadius:"999px",backgroundColor:x?u:i,color:x?"#FFF":e,display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",flexShrink:0,transition:"background-color 0.25s ease",border:x?"none":`1px solid ${r}`,boxShadow:x?"0 10px 22px rgba(0,0,0,0.18)":"none"}),tabText:{fontSize:"14px",fontWeight:"800",whiteSpace:"nowrap",overflow:"hidden"},scrollView:{flex:1,width:"100%",overflowY:"auto",padding:"18px 18px",boxSizing:"border-box"},contentContainer:{width:"100%",maxWidth:"660px",margin:"0 auto"},coachRow:{width:"100%",display:"flex",alignItems:"center",gap:"14px",marginBottom:"14px"},coachImg:{width:"96px",height:"96px",objectFit:"contain",flexShrink:0,filter:n==="dark"?"drop-shadow(0 16px 22px rgba(0,0,0,0.60))":"drop-shadow(0 12px 18px rgba(0,0,0,0.12))"},speech:{position:"relative",flex:1,backgroundColor:i,border:`1px solid ${r}55`,borderRadius:"18px",padding:"12px 14px",boxShadow:n==="dark"?"0 14px 34px rgba(0,0,0,0.42)":"0 10px 26px rgba(0,0,0,0.08)"},speechTitle:{fontSize:"12px",fontWeight:900,color:e,opacity:.75,marginBottom:"6px"},speechText:{fontSize:a===0?"14px":"16px",fontWeight:800,color:o,lineHeight:1.35},speechTail:{position:"absolute",left:"-8px",bottom:"18px",width:"14px",height:"14px",backgroundColor:i,borderLeft:`1px solid ${r}55`,borderBottom:`1px solid ${r}55`,transform:"rotate(45deg)",borderBottomLeftRadius:"4px"},htmlContent:{width:"100%",backgroundColor:n==="dark"?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)",border:`1px solid ${r}55`,borderRadius:"22px",padding:"16px 16px",boxShadow:n==="dark"?"0 22px 60px rgba(0,0,0,0.52)":"0 14px 34px rgba(0,0,0,0.10)",color:o,lineHeight:1.55,fontSize:a===0?"15px":"17px",boxSizing:"border-box",overflow:"hidden"}}}function _(n,a){const s=n===0;return(s?{MainCard:"Сверху вкладки — это телепорт по разделам",HabitsMain:"Привычки — это автопилот",TrainingMain:"Тренировки — это доказательства, а не ощущения",MentalMain:"Мозг — это мини-игры: выбери режим, уровень и жми «Начать» ",RecoveryMain:"Восстановление — это быстрый сброс стресса",SleepMain:"Сон — это чит-код жизни ",ToDoMain:"Задачи — это порядок в голове"}:{MainCard:"At the top of the tab is a teleport across sections",HabitsMain:"Habits are an autopilot",TrainingMain:"Workouts are proofs, not sensations",MentalMain:"The brain is a mini-game: select the mode, level and click 'Start'",RecoveryMain:"Recovery is a quick stress relief",SleepMain:"Sleep is the cheat code of life",ToDoMain:"Tasks are an order in the head"})[a]||(s?"Инструкция в разработке…":"Guide coming soon…")}function q(n,a,s){const o=n===0,e=(M,w,k,I,E,D,F="")=>`
    <div class="ux" style="--accent:${s}">
      <div class="uxHeader">
        <div class="uxTitle">${M}</div>
        <div class="uxSubtitle">${w}</div>
      </div>

      <div class="uxHero">
        <div class="uxHeroGlow"></div>

        <div class="uxHeroTop">
          <div class="uxBadge">${k}</div>
          <div class="uxMeta">${I}</div>
        </div>

        <div class="uxSteps">
          ${E}
        </div>

        <div class="uxDivider"></div>

        <div class="uxTip">
          ${D}
        </div>
      </div>

      ${F}
    </div>
  `,i=(M,w,k)=>`
    <div class="uxStep">
      <div class="uxNum">${M}</div>
      <div class="uxStepBody">
        <div class="uxStepTitle">${w}</div>
        <div class="uxStepText">${k}</div>
      </div>
    </div>
  `,r=e("Инструкция","Коротко, красиво и по делу — как пользоваться UltyMyLife","Quick Start","1 минута",[i("1","Навигация","Все разделы доступны из главного меню — вкладки сверху."),i("2","Авто-сохранение","Данные сохраняются сразу. Никаких “ой, не сохранилось”."),i("3","Управление",'Создавай через <span class="uxChip uxChipPlus">＋</span> и завершай через <span class="uxChip uxChipOk">✓</span>.')].join(""),'<div class="uxTipIcon">●</div><div class="uxTipText">Старт: выбери <b>один</b> раздел и веди его 7 дней — так формируется привычка.</div>',`
      <div class="uxMini">
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Ритм</div>
          <div class="uxMiniText">Лучше 5 минут ежедневно, чем 1 час раз в неделю.</div>
        </div>
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Фокус</div>
          <div class="uxMiniText">Не начинай с 5 разделов — мозг устроит митинг протеста.</div>
        </div>
      </div>
    `),x=e("User Guide","Clean and quick — how to use UltyMyLife","Quick Start","1 minute",[i("1","Navigation","Use top tabs to switch sections."),i("2","Auto-save","Data saves instantly."),i("3","Controls",'Add with <span class="uxChip uxChipPlus">＋</span> and complete with <span class="uxChip uxChipOk">✓</span>.')].join(""),'<div class="uxTipIcon">●</div><div class="uxTipText">Starter tip: pick <b>one</b> section and stick to it for 7 days.</div>'),u=e("Привычки","Быстро разобраться: как добавлять, отмечать и видеть прогресс","HABITS","1–3 мин",[i("1","Добавь привычку",'Нажми <span class="uxChip uxChipPlus">＋</span> → выбери из списка <b>или</b> создай свою. Дальше: дата старта + этапы (цели).'),i("2","Отмечай день свайпом","<b>Обычная привычка:</b> свайп <b>вправо</b> — ✅ сделал, свайп <b>влево</b> — ❌ пропуск. Ошибся? свайпни ещё раз и вернись в нейтральное состояние."),i("3","Если это “Отказ от вредного” — там другой смысл","Тут приложение считает <b>время без срыва</b>. День “победы” проставляется сам. Если сорвался — сделай <b>свайп влево</b>: это отметит срыв и <b>сбросит таймер</b>."),i("4","Понимай прогресс правильно","Серия (<b>streak</b>) растёт только от ✅ дней. В метриках прогресс идёт к “автоматизму” — обычно это <b>66 дней</b> (а для отказа ставится больше).")].join(""),`<div class="uxTipIcon">🔥</div><div class="uxTipText">
    Быстрый старт: <b>1 привычка</b> → <b>одно время</b> → <b>7 дней</b>. Твоя цель сейчас — не “идеально”, а “стабильно”.
  </div>`,`
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Формула</div>
        <div class="uxMiniText">Сделай действие “на минимум” (2 минуты) — так привычка приживается быстрее.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Этапы</div>
        <div class="uxMiniText">Добавляй 3–5 целей-ступеней: мозг любит понятные “уровни”.</div>
      </div>
    </div>
  `),d=e("Habits","Quick clarity: add, mark days, and understand progress","HABITS","1–3 min",[i("1","Add a habit",'Tap <span class="uxChip uxChipPlus">＋</span> → pick from the list <b>or</b> create your own. Set start date + milestone goals.'),i("2","Mark the day with a swipe","<b>Regular habit:</b> swipe <b>right</b> — ✅ done, swipe <b>left</b> — ❌ missed. If you mis-tapped, swipe again to return to neutral."),i("3","“Quit a bad habit” works differently","Here the app tracks <b>time without relapse</b>. A “win day” is set automatically. Relapse? <b>Swipe left</b> to mark it and <b>reset the timer</b>."),i("4","Read progress correctly","Your <b>streak</b> grows only from ✅ days. Metrics show progress toward “automaticity” — usually <b>66 days</b> (more for quitting).")].join(""),`<div class="uxTipIcon">🔥</div><div class="uxTipText">
    Starter mode: <b>1 habit</b> → <b>one time</b> → <b>7 days</b>. Aim for consistency, not perfection.
  </div>`,`
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Minimum</div>
        <div class="uxMiniText">Do the 2-minute version — consistency becomes effortless.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Milestones</div>
        <div class="uxMiniText">Add 3–5 steps. Clear levels = better motivation.</div>
      </div>
    </div>
  `),g=e("Тренировки","Логика: Программа → День → Сессия → Упражнения → Подходы","WORKOUT","2–8 минут",[i("0","Один раз настрой программу","Зайди в «Программы»: создай программу, добавь хотя бы 1 день и упражнения. Если программа пустая — сессия не стартует."),i("1","Выбери день","Нажми дату в календаре — увидишь тренировки на этот день (⏳ черновик / ✅ выполнено)."),i("2","Стартуй сессию","Нажми 📖, чтобы создать новую тренировку. Чтобы продолжить/поправить старую — открой карточку тренировки."),i("3","Добавь упражнения","Жми ➕ и выбирай упражнения из программы. Можно добавлять свои упражнения/варианты."),i("4","Заполни подходы","Вводи повторения и вес. Тоннаж считается автоматически: вес × повторения. ✏️ — редактировать упражнение или подход."),i("5","Заверши и сохрани","Нажми 🏁 — тренировка сохранится. Данные пишутся сразу, ничего вручную «сохранять» не надо."),i("6","Смысл в данных","Смотри аналитику: тоннаж, прогресс по 1RM, загрузку мышц — это превращает тренировки в систему, а не в «ощущения».")].join(""),`<div class="uxTipIcon">🏋️</div>
   <div class="uxTipText">
     Минимальный рабочий сценарий: <b>3 упражнения</b> × <b>2–3 подхода</b>. 
     Главное — записать хоть что-то, чтобы завтра было с чем сравнивать.
   </div>`,`
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Как расти</div>
        <div class="uxMiniText">Прибавляй <b>+1 повтор</b> или <b>+1–2.5 кг</b> к прошлой сессии — этого достаточно.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Тоннаж</div>
        <div class="uxMiniText">Тоннаж = <b>вес × повторы</b>. Он помогает видеть объём и перегрузку.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">1RM (оценка)</div>
        <div class="uxMiniText">Примерная сила считается автоматически по подходам (формула типа Epley).</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Не идеально — нормально</div>
        <div class="uxMiniText">Устал? Уменьши объём, но не пропадай. Регулярность важнее геройства.</div>
      </div>
    </div>
  `),C=e("Workout","Logic: Program → Day → Session → Exercises → Sets","WORKOUT","2–8 min",[i("0","Set up a program once","Create a program, add at least 1 day and exercises. Empty program = no session start."),i("1","Pick a day","Tap a date in the calendar to view sessions (draft ⏳ / done ✅)."),i("2","Start a session","Tap 📖 to create a new workout. Tap a session card to continue/edit it."),i("3","Add exercises","Use ➕ to add exercises from your program (custom exercises are ok)."),i("4","Log sets","Enter reps & weight. Tonnage is calculated automatically (weight × reps). ✏️ edits."),i("5","Finish & save","Tap 🏁 — workout is saved instantly."),i("6","Use analytics","Track tonnage, estimated 1RM, muscle load — progress becomes measurable.")].join(""),'<div class="uxTipIcon">🏋️</div><div class="uxTipText"><b>3 exercises</b> × <b>2–3 sets</b> is enough to start. Consistency wins.</div>'),h=e("Мозг","Мини-тренировки: режим → уровень → раунды → очки → рекорд","BRAIN","3–8 минут",[i("1","Выбери режим",`
      Тут 4 типа тренировок:
      <b>🎯 Фокус</b> — найди и посчитай цель (★) среди помех;
      <b>🧠 Память</b> — запомни последовательность и введи её;
      <b>🧮 Счёт</b> — быстрые примеры на время;
      <b>🧩 Логика</b> — найди “лишнее” по правилу.
    `),i("2","Выбери уровень сложности",`
      Уровень меняет нагрузку: количество элементов/скорость/время.
      В некоторых режимах часть уровней может быть закрыта (Premium).
    `),i("3","Жми «Начать» и играй раундами",`
      Каждый раунд даёт очки. В конце сессии результат сравнивается с твоим рекордом и сохраняется автоматически.
    `)].join(""),`<div class="uxTipIcon">🎯</div><div class="uxTipText">
     Идеальный старт: <b>1 режим</b> + <b>1 уровень</b> + <b>7 дней</b>. Мозг любит повторение, а не героизм.
   </div>`,`
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🎯 Фокус</div>
        <div class="uxMiniText">
          Задача: найти ★ среди символов и дать правильный счёт за лимит времени.
          Чем выше уровень — тем больше элементов и сложнее отвлекалки.
        </div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🧠 Память</div>
        <div class="uxMiniText">
          Сначала смотришь последовательность, потом вводишь ответ.
          На продвинутых стадиях может включиться <b>обратный режим</b> (ввод наоборот).
        </div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🧮 Счёт</div>
        <div class="uxMiniText">
          Уровни отличаются наборами операций и таймером.
          Есть режим “до первой ошибки” (Endless) и “без таймера” (Relax).
        </div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">🧩 Логика</div>
        <div class="uxMiniText">
          Найди один неверный элемент в ряду.
          На сложных уровнях правила могут меняться — это нормально: цель в том, чтобы заметить закономерность.
        </div>
      </div>
    </div>
  `),m=e("Brain","Mini training: mode → level → rounds → score → record","BRAIN","3–8 min",[i("1","Pick a mode",`
      4 training types:
      <b>🎯 Focus</b> — count the target (★) among distractors;
      <b>🧠 Memory</b> — memorize a sequence and enter it;
      <b>🧮 Math</b> — fast calculations with a timer;
      <b>🧩 Logic</b> — find the odd one out by rule.
    `),i("2","Pick difficulty",`
      Difficulty changes load (amount/speed/time).
      Some levels may be locked (Premium).
    `),i("3","Press Start and play rounds",`
      Each round gives points. At the end your result updates your personal record automatically.
    `)].join(""),`<div class="uxTipIcon">🎯</div><div class="uxTipText">
     Best start: <b>one</b> mode + <b>one</b> level for <b>7 days</b>. Repetition beats intensity.
   </div>`),T=e("Восстановление","Дыхание, медитация и закалка — чтобы быстро прийти в норму","RECOVERY","3–10 минут",[i("1","Выбери режим","Внутри раздела есть 3 направления: дыхание / медитация / закалка. Каждый — со своими протоколами."),i("2","Выбери протокол","Открой карточку протокола и запусти сессию. Некоторые протоколы могут быть закрыты без Premium."),i("3","Пройди сессию","Во время таймера можно поставить паузу и продолжить. Когда закончил — жми «Финиш», чтобы сессия сохранилась."),i("4","Повтори коротко, но регулярно","Смысл восстановления — в частоте. Лучше 3–5 минут каждый день, чем редко и героически.")].join(""),'<div class="uxTipIcon">🧘</div><div class="uxTipText"><b>Быстрый старт:</b> начни с дыхания 3–5 минут. Если нужно успокоиться — медитация. Если бодрость — закалка (осторожно, без фанатизма).</div>',`
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Пауза</div>
        <div class="uxMiniText">Пауза → «Продолжить» или «Финиш». «Финиш» фиксирует сессию в логах.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Зачем “Финиш”</div>
        <div class="uxMiniText">Пока не нажал “Финиш”, прогресс может не сохраниться. Жми — и всё запишется.</div>
      </div>
    </div>
  `),l=e("Recovery","Breathing, meditation and hardening — to reset fast","RECOVERY","3–10 min",[i("1","Pick a mode","Inside Recovery: breathing / meditation / hardening. Each has its own protocols."),i("2","Pick a protocol","Open a protocol card and start a session. Some items may require Premium."),i("3","Run the session","You can pause and resume. When done, press “Finish” to save the session."),i("4","Repeat consistently","Recovery works best with frequency: 3–5 minutes daily beats rare long sessions.")].join(""),'<div class="uxTipIcon">🧘</div><div class="uxTipText"><b>Quick start:</b> breathing 3–5 min. Calm down — meditation. Energy — hardening (carefully).</div>'),c=e("Сон","Заполняешь 3 поля — и видишь, что реально влияет на твою энергию","SLEEP LOG","30 секунд",[i("1","Выбери день в календаре","Тап по дате. Подсказка: высота заливки — длительность, цвет — самочувствие."),i("2","Добавь запись сна","Открой добавление сна и выставь: Время отбоя + Длительность (3–14 часов) + Самочувствие (1–5)."),i("3","Добавь заметку (по желанию)","Коротко: кофеин/тренировка/стресс/экран/алкоголь/просыпания. Это потом даёт инсайты."),i("4","Сохрани и посмотри карточку дня","После сохранения на выбранной дате увидишь: отбой, длительность, настроение звёздами и заметку.")].join(""),'<div class="uxTipIcon">🌙</div><div class="uxTipText"><b>Важное правило:</b> нельзя заполнять сон на будущие даты. Заполняй сегодня/вчера — и всё ок.</div>',`
    <div class="uxMini">
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Минимум</div>
        <div class="uxMiniText">Если лень: поставь только длительность + самочувствие. Уже достаточно для статистики.</div>
      </div>
      <div class="uxMiniCard">
        <div class="uxMiniTitle">Эксперимент</div>
        <div class="uxMiniText">Меняй по 1 фактору на 3 дня (например, без кофе после 16:00) — так видно причину.</div>
      </div>
    </div>
  `),f=e("Sleep","Track 3 fields and discover what truly impacts your energy","SLEEP LOG","30 sec",[i("1","Pick a day on the calendar","Tap a date. Fill height = duration, color = mood."),i("2","Add a sleep entry","Set Bedtime + Duration (3–14h) + Mood (1–5)."),i("3","Add a note (optional)","Caffeine/workout/stress/screens/alcohol/awakenings — helps insights later."),i("4","Save and view the day card","You’ll see bedtime, duration, mood stars, and the note.")].join(""),'<div class="uxTipIcon">🌙</div><div class="uxTipText"><b>Rule:</b> you can’t log sleep for future dates.</div>'),y=e("Задачи","Порядок в голове — скорость в жизни","TO-DO","каждый день",[i("1","Добавь задачи",'Нажми <span class="uxChip uxChipPlus">＋</span> и запиши всё, что давит на мозг.'),i("2","Выбери приоритеты","Оставь 1–3 главных на сегодня. Остальное — вторично."),i("3","Дроби и закрывай","Разбей большую задачу на маленькие шаги и закрывай по одному.")].join(""),'<div class="uxTipIcon">✅</div><div class="uxTipText">Формула дня: <b>1 важное</b> + <b>1 полезное</b> + <b>1 быстрое</b>.</div>',`
      <div class="uxMini">
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Антипрокраст</div>
          <div class="uxMiniText">Начни с “самого лёгкого шага” на 2 минуты.</div>
        </div>
        <div class="uxMiniCard">
          <div class="uxMiniTitle">Чистота</div>
          <div class="uxMiniText">Если задача висит 7+ дней — либо разбить, либо удалить.</div>
        </div>
      </div>
    `),R=e("To-Do","A clean mind moves faster","TO-DO","daily",[i("1","Add tasks",'Tap <span class="uxChip uxChipPlus">＋</span> and dump what’s on your mind.'),i("2","Pick priorities","Keep 1–3 main tasks for today."),i("3","Break & finish","Split big tasks into small steps and close them one by one.")].join(""),'<div class="uxTipIcon">✅</div><div class="uxTipText">Daily formula: <b>1 important</b> + <b>1 useful</b> + <b>1 quick win</b>.</div>'),$=e("Скоро","Инструкция для этого раздела сейчас допиливается","IN PROGRESS","",i("1","Чуть-чуть терпения","Сейчас доделаем “Привычки”, потом пойдём по вкладкам дальше."),'<div class="uxTipIcon">●</div><div class="uxTipText">Пока ориентир простой: вкладки сверху → читаешь → делаешь.</div>'),j=e("Coming Soon","Guide for this section is being polished","IN PROGRESS","",i("1","A bit of patience","We’ll finish Habits first, then continue tab by tab."),'<div class="uxTipIcon">●</div><div class="uxTipText">For now: top tabs → read → do.</div>');switch(a){case"MainCard":return o?r:x;case"HabitsMain":return o?u:d;case"TrainingMain":return o?g:C;case"MentalMain":return o?h:m;default:return o?$:j;case"RecoveryMain":return o?T:l;case"SleepMain":return o?c:f;case"ToDoMain":return o?y:R}}function Q(n){const a=n==="dark",s=a?"rgba(255,255,255,0.92)":"rgba(10,10,10,0.92)",o=a?"rgba(255,255,255,0.58)":"rgba(10,10,10,0.55)",e=a?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)";return`
    .ux{ width:100%; }

    .uxHeader{ text-align:center; margin-bottom: 14px; }
    .uxTitle{ font-size: 26px; font-weight: 950; letter-spacing: .2px; color: ${s}; margin-bottom: 6px; }
    .uxSubtitle{ font-size: 14px; color: ${o}; line-height: 1.35; font-style: italic; max-width: 520px; margin: 0 auto; }

    .uxHero{
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      border: 1px solid ${e};
      background: linear-gradient(180deg, ${a?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.75)"}, ${a?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.55)"});
      box-shadow: ${a?"0 28px 70px rgba(0,0,0,0.60)":"0 20px 50px rgba(0,0,0,0.12)"};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 16px;
    }

    .uxHeroGlow{
      position:absolute;
      inset:-140px -120px auto -120px;
      height: 280px;
      background: radial-gradient(circle at 45% 45%,
        color-mix(in srgb, var(--accent) 40%, transparent),
        transparent 60%);
      pointer-events:none;
      filter: blur(2px);
      opacity: ${a?"0.75":"0.55"};
    }

    .uxHeroTop{ position: relative; display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; }

    .uxBadge{
      font-size: 12px;
      font-weight: 900;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid ${e};
      background: ${a?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.60)"};
      color: ${s};
      letter-spacing: .3px;
      text-transform: uppercase;
    }

    .uxMeta{ font-size: 12px; color: ${o}; font-weight: 800; }

    .uxSteps{ position: relative; display:flex; flex-direction: column; gap: 10px; margin-top: 6px; }

    .uxStep{
      display:flex;
      gap: 12px;
      padding: 12px 12px;
      border-radius: 18px;
      border: 1px solid ${a?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)"};
      background: ${a?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.55)"};
    }

    .uxNum{
      width: 30px;
      height: 30px;
      border-radius: 12px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight: 950;
      color: ${s};
      border: 1px solid ${e};
      background: ${a?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.70)"};
      box-shadow: ${a?"0 10px 18px rgba(0,0,0,0.45)":"0 10px 18px rgba(0,0,0,0.10)"};
      flex-shrink: 0;
    }

    .uxStepBody{ flex: 1; }
    .uxStepTitle{ font-size: 15px; font-weight: 950; color: ${s}; margin-bottom: 4px; letter-spacing: .1px; }
    .uxStepText{ font-size: 14px; font-weight: 700; color: ${s}; line-height: 1.4; }

    .uxChip{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-width: 30px;
      height: 24px;
      padding: 0 8px;
      margin: 0 6px;
      border-radius: 10px;
      border: 1px solid ${e};
      font-weight: 950;
      font-size: 14px;
      transform: translateY(-1px);
      user-select:none;
    }

    .uxChipPlus{
      background: color-mix(in srgb, var(--accent) 22%, transparent);
    }

    .uxChipOk{
      background: ${a?"rgba(90,255,170,0.14)":"rgba(90,255,170,0.10)"};
    }

    .uxDivider{
      height: 1px;
      background: ${a?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.07)"};
      margin: 14px 0 12px 0;
    }

    .uxTip{
      display:flex;
      gap: 12px;
      align-items:flex-start;
      padding: 12px 12px;
      border-radius: 18px;
      border: 1px dashed ${e};
      background: ${a?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.60)"};
    }

    .uxTipIcon{
      width: 28px;
      height: 28px;
      border-radius: 12px;
      display:flex;
      align-items:center;
      justify-content:center;
      border: 1px solid ${e};
      color: ${a?"rgba(255,255,255,0.80)":"rgba(0,0,0,0.55)"};
      background: color-mix(in srgb, var(--accent) 16%, ${a?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.85)"});
      flex-shrink: 0;
    }

    .uxTipText{
      color:${s};
      font-weight: 850;
      font-size: 14px;
      line-height: 1.35;
    }

    .uxMini{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 12px;
    }

    .uxMiniCard{
      border-radius: 18px;
      border: 1px solid ${e};
      background: ${a?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.65)"};
      padding: 12px 12px;
      box-shadow: ${a?"0 16px 40px rgba(0,0,0,0.40)":"0 12px 30px rgba(0,0,0,0.08)"};
    }

    .uxMiniTitle{
      color:${s};
      font-weight: 950;
      font-size: 13px;
      margin-bottom: 6px;
      letter-spacing: .2px;
      text-transform: uppercase;
      opacity: .9;
    }

    .uxMiniText{
      color:${o};
      font-weight: 800;
      font-size: 13px;
      line-height: 1.35;
    }
  `}export{X as default};
