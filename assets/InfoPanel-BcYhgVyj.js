import{A as g,t as m,l as w,f as S,j as t,m as h,a as k,C as l,k as v,z as T,B as C,D as F,E as j,G as M,n as D}from"./index-BuXiURDS.js";import{r as c}from"./recharts-Bg6K2Pzo.js";const A=()=>{const[i,b]=c.useState(g.prefs[1]===0?"dark":"light"),[e,o]=c.useState(g.prefs[0]),[r,d]=c.useState(0),[a,p]=c.useState("MainCard"),x=[{id:"MainCard",icon:t.jsx(v,{}),title:e===0?"Общее":"General",subtitle:"",color:"#404040"},{id:"HabitsMain",icon:t.jsx(T,{}),title:e===0?"Привычки":"Habits",subtitle:"",color:"#FFD700"},{id:"TrainingMain",icon:t.jsx(C,{}),title:e===0?"Тренировки":"Workout",subtitle:"",color:"#FF4D4D"},{id:"MentalMain",icon:t.jsx(F,{}),title:e===0?"Мозг":"Brain",subtitle:"",color:"#4DA6FF"},{id:"RecoveryMain",icon:t.jsx(j,{}),title:e===0?"Восстановление":"Recovery",subtitle:"",color:"#4DFF88"},{id:"SleepMain",icon:t.jsx(M,{}),title:e===0?"Сон":"Sleep",subtitle:"",color:"#A64DFF"},{id:"ToDoMain",icon:t.jsx(D,{}),title:e===0?"Задачи":"To-Do",subtitle:"",color:"#FFA64D"}];c.useEffect(()=>{const n=m.subscribe(b),u=w.subscribe(f=>o(f==="ru"?0:1)),y=S.subscribe(d);return()=>{n.unsubscribe(),u.unsubscribe(),y.unsubscribe()}},[]);const s=B(i,r);return t.jsxs("div",{style:s.container,children:[t.jsxs("div",{style:s.header,children:[t.jsxs("div",{style:s.topBar,children:[t.jsx("span",{style:s.headerTitle,children:e===0?"Инструкция":"User Guide"}),t.jsx("div",{style:{width:40}})," "]}),t.jsx("div",{style:s.tabsContainer,className:"no-scrollbar",children:x.map(n=>{const u=a===n.id;return t.jsxs(h.div,{onClick:()=>p(n.id),style:s.tabItem(u,n.color),whileTap:{scale:.95},children:[t.jsx("div",{style:{fontSize:"18px",display:"flex"},children:n.icon}),u&&t.jsx(h.span,{initial:{opacity:0,width:0},animate:{opacity:1,width:"auto"},style:s.tabText,children:n.title})]},n.id)})})]}),t.jsxs("div",{style:s.scrollView,className:"no-scrollbar",children:[t.jsx(k,{mode:"wait",children:t.jsx(h.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.2},style:s.contentContainer,children:t.jsx("div",{style:s.htmlContent,dangerouslySetInnerHTML:{__html:I(e,a)}})},a)}),t.jsx("div",{style:{height:"100px"}})]})]})},B=(i,b)=>{const e=l.get("background",i),o=l.get("mainText",i),r=l.get("subText",i),d=l.get("simplePanel",i);return{container:{backgroundColor:e,display:"flex",flexDirection:"column",height:"90vh",marginTop:"100px",width:"100vw",fontFamily:"Segoe UI",overflow:"hidden"},header:{width:"100%",backgroundColor:e,paddingTop:"40px",borderBottom:`1px solid ${l.get("border",i)}`,zIndex:10},topBar:{display:"flex",width:"100%",alignItems:"center",justifyContent:"center",padding:"0 20px 15px 20px"},backBtn:{width:"40px",height:"40px",borderRadius:"12px",backgroundColor:d,display:"flex",alignItems:"center",justifyContent:"center",color:o,cursor:"pointer"},headerTitle:{fontSize:"20px",fontWeight:"700",color:o},tabsContainer:{display:"flex",gap:"10px",padding:"0 20px 15px 20px",overflowX:"scroll",width:"100%",boxSizing:"border-box"},tabItem:(a,p)=>({padding:a?"8px 16px":"8px 12px",borderRadius:"20px",backgroundColor:a?p:d,color:a?"#FFF":r,display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",flexShrink:0,transition:"background-color 0.3s ease",border:a?"none":`1px solid ${l.get("border",i)}`}),tabText:{fontSize:"14px",fontWeight:"600",whiteSpace:"nowrap",overflow:"hidden"},scrollView:{flex:1,width:"90%",overflowY:"scroll",padding:"20px"},contentContainer:{width:"100%",maxWidth:"600px",margin:"0 auto"},htmlContent:{whiteSpace:"pre-wrap",wordWrap:"break-word",textAlign:"left",lineHeight:"1.6",fontSize:b===0?"15px":"17px",color:o,fontFamily:"Segoe UI, sans-serif"}}};function I(i,b){const e=i===0,o=`🧠✨ <b>Инструкция</b>
<i>Ваш помощник для роста, здоровья и продуктивности</i>

## 📋 Общие принципы
• <b>Навигация:</b> Все разделы доступны из главного меню.
• <b>Авто-сохранение:</b> Данные сохраняются мгновенно.
• <b>Управление:</b> Используйте ➕ для создания и ✅ для завершения.`,r=`🧠✨ <b>User Guide</b>
<i>Your assistant for growth, health, and productivity</i>

## 📋 General Principles
• <b>Navigation:</b> Access all features from the main menu.
• <b>Auto-Save:</b> Data saves instantly.
• <b>Controls:</b> Use ➕ to add items and ✅ to mark as done.`;switch(b){case"MainCard":return e?o:r;case"HabitsMain":return e?`## 🔄 Привычки
*Создавайте полезные рутины.*

• <b>Добавить:</b> Укажите название, частоту и иконку.
• <b>Календарь:</b> Зелёные дни = успех. Старайтесь не прерывать цепочку!
• <b>Напоминания:</b> Установите время, и мы напомним.
• <b>Статистика:</b> Следите за лучшими сериями выполнения.

> 💡 <b>Совет:</b> Начните с 1–3 простых привычек, чтобы не перегореть.`:`## 🔄 Habits
*Build stick-to-it routines.*

• <b>Add:</b> Set a name, frequency, and icon.
• <b>Calendar:</b> Green days = success. Keep the streak alive!
• <b>Reminders:</b> Set a time, and we'll notify you.
• <b>Stats:</b> Track your current and best streaks.

> 💡 <b>Tip:</b> Start with 1–3 simple habits to avoid burnout.`;case"TrainingMain":return e?`## 🏋️ Тренировки
*Ваш карманный тренер.*

• <b>Новая тренировка:</b> Выберите тип (Силовая, Кардио, и т.д.).
• <b>Упражнения:</b> Фиксируйте веса, повторы и подходы.
• <b>Прогресс:</b> Графики покажут, как растут ваши показатели.
• <b>Медиа:</b> Прикрепляйте фото формы или заметки к тренировке.

> 💪 <b>Совет:</b> Записывайте веса сразу во время отдыха между подходами.`:`## 🏋️ Workout Log
*Your pocket trainer.*

• <b>New Workout:</b> Choose a type (Strength, Cardio, Yoga, etc.).
• <b>Exercises:</b> Log weights, reps, and sets easily.
• <b>Progress:</b> Charts show how your strength grows over time.
• <b>Media:</b> Attach physique photos or notes to any session.

> 💪 <b>Tip:</b> Log your weights during rest periods for accuracy.`;case"MentalMain":return e?`## 🧩 Мозг
*Фитнес для ума.*

• <b>Мини-игры:</b> Задания на память, реакцию и счет.
• <b>Аналитика:</b> Смотрите динамику развития когнитивных навыков.
• <b>Цели:</b> Ставьте планки (например, «Улучшить память на 10%»).

> 🌟 <b>Совет:</b> Даже 5 минут игры утром помогают проснуться лучше кофе.`:`## 🧩 Brain Training
*Fitness for your mind.*

• <b>Mini-games:</b> Daily tasks for memory, reaction, and logic.
• <b>Analytics:</b> Watch your cognitive skills improve.
• <b>Goals:</b> Set targets (e.g., "Improve memory by 10%").

> 🌟 <b>Tip:</b> 5 minutes of brain training wakes you up better than coffee.`;case"RecoveryMain":return e?`## 🌿 Восстановление
*Баланс стресса и отдыха.*

### 🌬️ Дыхание
Выбирайте технику (например, "4-7-8" для сна) и следуйте за визуальным ритмом.

### 🧘 Медитация
Таймер с фоновыми звуками для концентрации или расслабления.

### ❄️ Закаливание
Трекер холодовых процедур (душ, ванна). Отмечайте длительность и ощущения.`:`## 🌿 Recovery
*Balance stress with rest.*

### 🌬️ Breathing
Choose a technique (e.g., "Box Breathing") and follow the visual rhythm.

### 🧘 Meditation
Timer with ambient sounds for focus or relaxation.

### ❄️ Cold Exposure
Track cold showers or ice baths. Log duration and how you felt afterward.`;case"SleepMain":return e?`## 😴 Сон
*Качество ночи определяет качество дня.*

• <b>Режим:</b> Фиксируйте время отбоя и подъема.
• <b>Оценка:</b> Ставьте рейтинг своему самочувствию (1–5).
• <b>Факторы:</b> Отмечайте кофеин, стресс или алкоголь, чтобы видеть закономерности.

> 🌙 <b>Совет:</b> Старайтесь ложиться в одно время даже в выходные.`:`## 😴 Sleep Diary
*Good days start with good nights.*

• <b>Schedule:</b> Log bedtime and wake-up times.
• <b>Quality:</b> Rate how you feel (1–5 stars).
• <b>Factors:</b> Tag caffeine, stress, or screens to spot patterns.

> 🌙 <b>Tip:</b> Consistency is key. Try to wake up at the same time daily.`;case"ToDoMain":return e?`## ✅ Задачи
*Порядок в делах — порядок в голове.*

• <b>Создание:</b> Имя задачи, дедлайн и приоритет (🔥 Высокий / ❄️ Низкий).
• <b>Чек-листы:</b> Разбивайте большие задачи на подпункты.
• <b>Повторы:</b> Настройте регулярные дела (например, "Оплата счетов").

> 📌 <b>Совет:</b> Используйте правило «2 минут»: если дело быстрое — сделайте сразу.`:`## ✅ Tasks
*Clear mind, organized life.*

• <b>Create:</b> Add name, deadline, and priority (🔥 High / ❄️ Low).
• <b>Checklists:</b> Break big tasks into smaller sub-steps.
• <b>Recurring:</b> Set up repeating tasks (e.g., "Pay bills").

> 📌 <b>Tip:</b> The "2-Minute Rule": if a task takes <2 mins, do it now.`;default:return e?o:r}}export{A as default};
