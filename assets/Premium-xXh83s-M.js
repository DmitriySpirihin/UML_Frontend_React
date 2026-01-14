import{U as d,t as N,f as L,p as O,A as Q,l as X,o as K,L as Z,a2 as T,be as $,j as t,C as s,bf as ee,z as te,bg as ie,bh as ne,s as B,bi as E}from"./index-Brx5udi2.js";import{r as l}from"./recharts-Bg6K2Pzo.js";const re="https://ultymylife.ru",{WebApp:ye}=window.Telegram;async function se(e,c){try{const r=await ae(e,c);if(!r.success||!r.confirmation?.confirmation_url||!r.paymentId)throw new Error("Invalid payment response: missing paymentId or URL");localStorage.setItem("pendingPaymentId",r.paymentId),window.Telegram?.WebApp?.openLink?window.Telegram.WebApp.openLink(r.confirmation.confirmation_url):window.open(r.confirmation.confirmation_url,"_blank")}catch(r){throw console.error("Failed to start payment:",r),r}}async function ae(e,c){try{const r=await fetch(`${re}/api/sbp-invoice`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e,plan:c})});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(r){throw console.error("Network error in createSbpInvoice:",r),new Error("Network error: could not reach payment server")}}async function oe(e,c){if(!window.Telegram?.WebApp){alert("Telegram Stars payments are only available inside Telegram.");return}try{const u=await(await fetch("/api/tg-stars-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e,plan:c})})).json();if(!u.success)throw new Error(u.error||"Failed to create Stars invoice");window.Telegram.WebApp.openTelegramLink(u.invoice_link)}catch(r){throw console.error("Stars payment error:",r),alert("Не удалось создать счёт Telegram Stars. Попробуйте позже."),r}}async function le(e,c){try{const u=await(await fetch("/api/ton-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:e,plan:c})})).json();if(!u.success)throw new Error(u.error||"Failed to create TON invoice");const{address:y,amount:b,comment:n}=u,f=Math.round(b*1e9),a=encodeURIComponent(n),p=`ton://transfer/${y}?amount=${f}&text=${a}`;window.Telegram?.WebApp?window.Telegram.WebApp.openTelegramLink(p):window.open(p,"_blank")}catch(r){throw console.error("TON payment error:",r),alert("Не удалось открыть платеж TON. Попробуйте позже."),r}}async function fe(){if(!window.Telegram?.WebApp){alert("Available only in Telegram");return}const e=d.id;if(!e){alert("User ID not found");return}const c=`${window.location.origin}/?ref=${e}`;window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(c)}&text=${encodeURIComponent("Привет! Присоединяйся к UltyMyLife и получим оба по месяцу Premium бесплатно! 🎁")}`)}const M=new Date;M.setDate(M.getDate()+365);const de=[["Января","Февраля","Марта","Апреля","Мая","Июня","Июля","Августа","Сентября","Октября","Ноября","Декабря"],["January","February","March","April","May","June","July","August","September","October","November","December"]],h=[["149₽","399₽","999₽"],["89⭐","229⭐","699⭐"],["0.35💎","0.95💎","3.2💎"]],U=[["","139 / ","89 / "],["","76 / ","58 / "],["","0.32 / ","0.26 / "]],ce=()=>{const[e,c]=l.useState(N.value),[r,u]=l.useState(L.value),[y,b]=l.useState(O.value),[n,f]=l.useState(Q.prefs[0]),[a,p]=l.useState(3),[k,_]=l.useState(d.premiumEndDate),[v,V]=l.useState(!1),[P,C]=l.useState(d.isValidation),[o,j]=l.useState(2),[W,D]=l.useState(!1),[G,z]=l.useState(!1),H=()=>{const m=a===3?30:a===2?90:365,x=new Date;return x.setDate(x.getDate()+m),x},[me,J]=l.useState(H());l.useEffect(()=>{const m=a===3?30:a===2?90:365,x=new Date;x.setDate(x.getDate()+m),J(x)},[a]),l.useEffect(()=>{const m=N.subscribe(c),x=L.subscribe(u),g=X.subscribe(q=>{f(q==="ru"?0:1)}),w=O.subscribe(b),S=K.subscribe(V);return()=>{m.unsubscribe(),g.unsubscribe(),x.unsubscribe(),w.unsubscribe(),S.unsubscribe()}},[]),l.useEffect(()=>{_(d.premiumEndDate)},[d.premiumEndDate]);function A(){if(!k)return n===0?"Нет подписки":"No subscription";const m=new Date(k).toISOString().split("T")[0],x=m.slice(0,4),g=parseInt(m.slice(8),10),w=parseInt(m.slice(5,7),10)-1;return`${g} ${de[n][w]} ${x}`}async function Y(){if(d.id===null){T(n===0?"Пользовательский ID не найден...":"User ID not found...",2e3,!1);return}try{o===1?await se(d.id,a):o===2?await oe(d.id,a):o===3&&await le(d.id,a),C(!0),$(!0)}catch{T(n===0?"Не возможно запустить оплату...":"Could not start payment...",2e3,!1)}}const R=l.useRef(0);return l.useEffect(()=>{if(!P)return;const m=setTimeout(async()=>{const x=Date.now();if(!(x-R.current<5e4)){R.current=x;try{const{hasPremium:g,premiumEndDate:w,isValidation:S}=await Z(d.id);(g||!g&&!S)&&(T(n===0?"Поздравляем! Подписка активирована!":"Congratulations! Subscription activated!",4e3,!0),C(!1),$(!1))}catch(g){console.error("Validation failed:",g)}}},5e4);return()=>clearTimeout(m)},[P,n,d.id]),t.jsxs("div",{style:{...i(e).container},children:[W&&t.jsx("div",{style:{...i(e).confirmContainer},children:t.jsxs("div",{style:{...i(e).cP,borderRadius:"24px",width:"90%"},children:[t.jsxs("div",{style:{display:"flex",flexDirection:"column",width:"100%",alignItems:"center",justifyContent:"start"},children:[t.jsx("div",{style:{...i(e).text,whiteSpace:"pre-line",textAlign:"left",paddingLeft:"10px"},children:pe(n)}),t.jsx("div",{style:{...i(e).text,alignSelf:"start",fontStyle:"italic",textDecoration:"underline",paddingLeft:"10px"},onClick:()=>z(!0),children:n===0?"Читать весь текст":"Read all text"})]}),t.jsxs("div",{children:[t.jsx(I,{clickHandler:()=>Y(),langIndex:n,theme:e,textToShow:["Оплатить "+h[o-1][a-1],"Pay "+h[o-1][a-1]],needSparcle:!1}),t.jsx("button",{style:{...i(e).button,height:"40px",marginTop:"30px",borderRadius:"20px",border:`2px solid ${s.get("border",e)}`},onClick:()=>D(!1),children:n===0?"Назад":"Back"})]}),t.jsx("div",{style:{...i(e).subtext,display:"flex",alignItems:"center",gap:"4px",marginBottom:"1px"},children:t.jsx("span",{children:F[n][o-1]})})]})}),G&&t.jsx("div",{style:{...i(e).confirmContainer},children:t.jsxs("div",{style:{...i(e).cP,width:"100vw",height:"100vh",overflow:"scroll"},children:[t.jsx("div",{style:{...i(e).subtext,whiteSpace:"pre-line",textAlign:"left",marginLeft:"10px"},children:xe(n)}),t.jsx("a",{style:{marginBottom:"25px",...i(e).subtext,alignSelf:"start",marginLeft:"10px",color:s.get("currentDateBorder",e)},href:"https://t.me/diiimaaan777",target:"_blank",children:n===0?"Свяжитесь со мной в Telegram":"Contact me on Telegram"}),t.jsx("button",{style:{...i(e).button,height:"40px",borderRadius:"20px",border:`2px solid ${s.get("border",e)}`,marginBottom:"50px"},onClick:()=>z(!1),children:n===0?"Назад":"Back"})]})}),!y&&!v&&t.jsxs("div",{style:{...i(e).panel},children:[t.jsx("img",{src:e==="dark"||e==="specialdark"?"images/Ui/Main_Dark.png":"images/Ui/Main_Light.png",style:{width:"50%"}}),t.jsx("div",{style:{...i(e).subtext,fontSize:"22px"},children:"premium"}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",width:"90vw",height:"22%",alignItems:"center",justifyContent:"center"},children:[t.jsxs("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",justifyItems:"center",height:"35px"},children:[t.jsx(ee,{style:{...i(e).miniIcon}}),t.jsx("div",{style:i(e).text,children:n===0?"Персональные ИИ инсайты":"Personal AI insights"})]}),t.jsxs("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",justifyItems:"center",height:"35px"},children:[t.jsx(te,{style:{...i(e).miniIcon}}),t.jsx("div",{style:i(e).text,children:n===0?"Расширенные функции":"Premium features"})]}),t.jsxs("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",justifyItems:"center",height:"35px"},children:[t.jsx(ie,{style:{...i(e).miniIcon}}),t.jsx("div",{style:i(e).text,children:n===0?"Детальная статистика":"Detailed statistics"})]}),t.jsxs("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",justifyItems:"center",height:"35px"},children:[t.jsx(ne,{style:{...i(e).miniIcon}}),t.jsx("div",{style:i(e).text,children:n===0?"Тестирование новых функций":"Testing new features"})]})]}),t.jsxs("div",{style:{position:"relative",display:"flex",margin:"5px",width:"70vw",height:"65px",borderRadius:"12px"},children:[t.jsx("div",{className:"premium-border"}),t.jsxs("div",{onClick:()=>{p(3)},id:3,style:{position:"relative",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:a===3?"#6197cdff":s.get("simplePanel",e),borderRadius:"12px",width:"100%",height:"100%",paddingLeft:"12px",paddingRight:"12px",zIndex:2},children:[t.jsx("div",{style:{...i(e).text,fontSize:"28px"},children:n===0?"1 год":"1 year"}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end"},children:[t.jsx("div",{style:{...i(e).text,fontSize:"24px"},children:h[o-1][2]}),t.jsx("div",{style:{...i(e).text,fontSize:"14px"},children:U[o-1][2]+(n===0?"мес":"mon")})]})]}),t.jsx("div",{style:{position:"absolute",top:"-8px",left:"50%",transform:"translateX(-50%)",background:"linear-gradient(90deg, #00B4FF, #FF00C8)",color:"white",fontSize:"12px",fontWeight:"bold",padding:"2px 10px",borderRadius:"12px",boxShadow:"0 2px 4px rgba(0,0,0,0.2)",zIndex:3,whiteSpace:"nowrap"},children:n===0?"ХИТ":"HIT"})]}),t.jsxs("div",{onClick:()=>{p(2)},id:2,style:{display:"flex",margin:"5px",flexDirection:"row",borderRadius:"12px",alignItems:"center",backgroundColor:a===2?"#6197cdff":s.get("simplePanel",e),justifyContent:"space-between",width:"70vw",height:"65px"},children:[t.jsx("div",{style:{...i(e).text,marginLeft:"12px",fontSize:"28px"},children:n===0?"3 месяца":"3 month"}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyItems:"center"},children:[t.jsx("div",{style:{...i(e).text,marginRight:"12px",fontSize:"24px"},children:h[o-1][1]}),t.jsx("div",{style:{...i(e).text,marginRight:"12px",fontSize:"14px"},children:U[o-1][1]+(n===0?"мес":"mon")})]})]}),t.jsxs("div",{onClick:()=>{p(1)},id:1,style:{display:"flex",margin:"5px",flexDirection:"row",borderRadius:"12px",alignItems:"center",backgroundColor:a===1?"#6197cdff":s.get("simplePanel",e),justifyContent:"space-between",width:"70vw",height:"65px"},children:[t.jsx("div",{style:{...i(e).text,marginLeft:"12px",fontSize:"28px"},children:n===0?"1 месяц":"1 month"}),t.jsx("div",{style:{...i(e).text,marginRight:"12px",fontSize:"24px"},children:h[o-1][0]})]}),t.jsx("div",{style:{...i(e).text,marginTop:"16px"},children:n===0?"Выберите способ оплаты":"Choose payment method"}),t.jsxs("div",{style:{display:"flex",flexDirection:"row",marginBottom:"16px",justifyContent:"center",alignItems:"space-around",gap:"12px",marginTop:"16px",padding:"0 10px"},children:[t.jsxs("div",{onClick:()=>j(1),style:{...i(e).text,fontSize:o===1?"17px":"14px",borderBottom:o===1?`2px solid ${s.get("difficulty",e)} `:"none",display:"flex",alignItems:"center",gap:"4px"},children:["📱",t.jsx("span",{children:n===0?"СБП":"SBP"})]}),t.jsxs("div",{onClick:()=>j(2),style:{...i(e).text,fontSize:o===2?"17px":"14px",borderBottom:o===2?`2px solid ${s.get("difficulty",e)} `:"none",display:"flex",alignItems:"center",gap:"4px"},children:["⭐",t.jsx("span",{children:n===0?"TG звезды":"TG starts"})]}),t.jsxs("div",{onClick:()=>j(3),style:{...i(e).text,fontSize:o===3?"17px":"14px",borderBottom:o===3?`2px solid ${s.get("difficulty",e)} `:"none",display:"flex",alignItems:"center",gap:"4px"},children:["💎",t.jsx("span",{children:"TON"})]})]}),t.jsx(I,{langIndex:n,clickHandler:()=>D(!0),theme:e,needSparcle:!0}),t.jsx("button",{style:{...i(e).button,height:"40px",borderRadius:"20px",border:`2px solid ${s.get("border",e)}`},onClick:()=>B(E.value),children:n===0?"Оформлю позднее":"I will do it later"}),t.jsx("div",{style:{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",gap:"12px",marginTop:"16px",padding:"0 10px"},children:t.jsx("div",{style:{...i(e).subtext,display:"flex",alignItems:"center",gap:"4px",marginBottom:"16px"},children:t.jsx("span",{children:F[n][o-1]})})})]}),y&&!v&&t.jsxs("div",{style:{...i(e).panel},children:[t.jsx("img",{src:e==="dark"||e==="specialdark"?"images/Ui/Main_Dark.png":"images/Ui/Main_Light.png",style:{width:"50%"}}),t.jsxs("div",{style:{position:"relative",width:"60px",height:"60px",margin:"10px",borderRadius:"50%",overflow:"hidden",border:d.hasPremium?"none":`3px solid ${s.get("border",e)}`,boxSizing:"border-box"},children:[t.jsx("img",{style:{position:"absolute",top:2.5,left:3,width:"90%",height:"90%",objectFit:"cover",borderRadius:"50%",zIndex:1},src:Array.isArray(d.photo)?d.photo[0]:d.photo,alt:"images/Ui/Guest.jpg"}),t.jsx("img",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"contain",zIndex:2},src:"images/Ui/premiumborder.png"})]}),t.jsx("div",{style:{color:s.get("subText",e),fontSize:"18px",fontFamily:"Segoe UI"},children:d.name}),t.jsx("p",{style:i(e).text,children:n===0?"👑 премиум подписка активна 👑":"👑 premium subscription active 👑"}),t.jsx("div",{style:i(e).text,children:n===0?"действует до "+A():"active until "+A()})]}),v&&t.jsxs("div",{style:{...i(e).panel,justifyContent:"space-around",height:"50vh"},children:[t.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[t.jsx("span",{style:{fontSize:"55px"},children:"⏳"}),t.jsx("span",{style:i(e).text,children:n===0?"Проверяем оплату... Это может занять несколько минут.":"Verifying payment... This may take several minutes."})]}),t.jsx("button",{style:{...i(e).button,height:"40px",borderRadius:"20px",border:`2px solid ${s.get("border",e)}`},onClick:()=>B(E.value),children:n===0?"Выйти":"Exit"})]})]})},i=(e,c,r)=>({container:{position:"absolute",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0, 0, 0, 0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2900,width:"100vw"},panel:{display:"flex",flexDirection:"column",alignItems:"center",borderRadius:"24px",border:`1px solid ${s.get("border",e)}`,margin:"5px",backgroundColor:s.get("background",e),width:"95vw",height:"90vh"},text:{textAlign:"center",fontSize:"15px",color:s.get("mainText",e)},subtext:{textAlign:"center",fontSize:"13px",color:s.get("subText",e)},button:{width:"85vw",height:"80px",marginTop:"5px",color:s.get("mainText",e),backgroundColor:s.get("background",e),borderRadius:"30px",marginBottom:"5px",fontSize:"15px"},miniIcon:{fontSize:"22px",marginRight:"12px",marginBottom:"8px",color:s.get("icons",e)},cP:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",border:`1px solid ${s.get("border",e)}`,backgroundColor:s.get("background",e),height:"85vh"},confirmContainer:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0, 0, 0, 0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2900}});function I({langIndex:e,clickHandler:c,theme:r,w:u="90%",h:y="87px",fSize:b="20px",br:n="30px",textToShow:f=["Получить премиум","Get Premium"],needSparcle:a}){return t.jsxs("button",{onClick:c,style:{...i(r).button,position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"14px 32px",fontSize:"17px",fontWeight:"700",backgroundColor:"transparent",border:"none",cursor:"pointer",overflow:"hidden",width:u,height:y,marginTop:"5px",color:s.get("mainText",r),borderRadius:n,marginBottom:"5px",zIndex:1,boxShadow:"0 6px 20px rgba(21, 79, 236, 0.4)",transition:"transform 0.3s ease, box-shadow 0.3s ease, filter 0.2s ease"},onMouseEnter:p=>{p.currentTarget.style.transform="translateY(-2px)",p.currentTarget.style.boxShadow="0 8px 28px rgba(21, 79, 236, 0.6)",p.currentTarget.style.filter="brightness(1.05)"},onMouseLeave:p=>{p.currentTarget.style.transform="translateY(0)",p.currentTarget.style.boxShadow="0 6px 20px rgba(21, 79, 236, 0.4)",p.currentTarget.style.filter="brightness(1)"},children:[t.jsx("div",{style:{position:"absolute",top:"-50%",left:"-50%",width:"200%",height:"200%",background:"linear-gradient(45deg, #154fec, #4e73f2, #154fec, #6a82fb, #154fec)",backgroundSize:"300% 300%",animation:"premiumGradient 4s ease infinite",zIndex:-1}}),t.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(10, 15, 40, 0.4)",borderRadius:"30px",zIndex:-1}}),t.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:"6px"},children:[t.jsx("span",{style:{marginRight:"8px",marginLeft:"8px",marginBottom:"8px",fontSize:"1.2em"},children:a?"👑":""}),f[e],t.jsx("span",{style:{marginRight:"8px",marginLeft:"8px",marginBottom:"8px",fontSize:"1.2em"},children:a?"👑":""})]}),t.jsx("div",{style:{position:"absolute",top:"2px",left:"2px",right:"2px",bottom:"2px",borderRadius:"26px",boxShadow:"inset 0 0 12px rgba(255, 255, 255, 0.2)",pointerEvents:"none",zIndex:0}}),t.jsx("style",{children:`
        @keyframes premiumGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        button {
          will-change: transform, filter;
        }
      `})]})}const F=[["Быстрая и безопасная оплата через СБП 📱","Мгновенная покупка за Telegram Stars ⭐","Анонимная оплата в TON-криптовалюте 💎"],["Fast and secure payment via SBP 📱","Instant purchase with Telegram Stars ⭐","Anonymous payment in TON cryptocurrency 💎"]],pe=e=>e===0?`📌 Условия оплаты UltyMyLife

• Нет пробного периода — стартуйте с минимального тарифа.
• Возврат невозможен — услуга цифровая, цены минимальны.
• Данные — локально, без облака, анонимные LLM-запросы.
• Подписка не продлевается автоматически.
• Поддержка: @diiimaaan777

• Подписка станет доступна сразу после проверки оплаты ✅
• Проверка может занять до 5 минут ⏳

👉 Оплачивая, вы соглашаетесь с этими условиями.`:`📌 Summary: UltyMyLife Payment Terms

• No trial — start with the lowest plan
• No refunds — digital service at minimal cost
• Your data stays local, AI queries are anonymous
• No auto-renewal 
• Support: [@diiimaaan777](https://t.me/diiimaaan777)

• Your subscription will be activated right after payment verification ✅
• Verification may take up to 5 minutes ⏳

👉 By making a payment, you agree to these terms.`,xe=e=>e===0?`Политика оплаты UltyMyLife

> *Последнее обновление: 13 января 2026 г.*

1. Общие положения
UltyMyLife — Telegram Mini App для саморазвития с ИИ-аналитикой. Доступ к расширенным функциям (трекинг привычек, ИИ-анализ сна, ментальные практики, персонализированные рекомендации) предоставляется по подписке.

Оплата возможна через:
- **СБП (₽)** — рубли;
- **Telegram Stars (★)** — внутренняя валюта Telegram;
- **TON** — криптовалюта, поддерживаемая кошельками Telegram.

Цены указаны без НДС (для РФ НДС включён автоматически при оплате через СБП).

---

 2. Тарифы

| Период       | СБП     | Stars   | TON     |
|--------------|---------|---------|---------|
| 1 месяц      | 149 ₽   | 89 ★    | 0.35 TON |
| 3 месяца     | 399 ₽   | 229 ★   | 0.95 TON |
| 12 месяцев  | 999 ₽   | 699 ★   | 3.2 TON |

 Подписка даёт полный доступ ко всем функциям. Не продлевается автоматически.

---

3. Возврат средств
Возврат средств **не предусмотрен**, так как:
- Услуга является **цифровой и нематериальной**;
- Цены установлены на уровне **минимальной стоимости поддержания сервиса**;
- Продукт не требует установки и не имеет физической формы.

При технической ошибке (например, оплата прошла, но доступ не активирован) — напишите в [поддержку](https://t.me/diiimaaan777) — мы восстановим доступ вручную.

---

4. Пробный период
Пробный период **отсутствует**. Мы предлагаем **низкие цены** для максимально широкого доступа. Если вы не уверены — начните с **месячной подписки**.

---

5. Приватность данных
Все данные хранятся локально (SQLite), не передаются третьим лицам. Запросы к ИИ отправляются анонимно, без привязки к вашему аккаунту.

---

 6. Изменение условий
Мы оставляем за собой право изменять тарифы и условия. Об изменениях уведомим заранее через интерфейс приложения или Telegram-бота.

---

 7. Поддержка
📩 пишите с указанием Telegram ID и даты оплаты.


`:`UltyMyLife Payment Policy

> *Last updated: January 13, 2026*

1. General Provisions  
UltyMyLife is a Telegram Mini App for self-improvement powered by AI analytics. Access to advanced features (habit tracking, AI sleep analysis, mental exercises, and personalized recommendations) is available via subscription.

Payment methods supported:  
- **SBP (₽)** — Russian rubles;  
- **Telegram Stars (★)** — Telegram’s in-app currency;  
- **TON** — cryptocurrency supported by Telegram Wallet.

Prices are shown excluding VAT. For users in Russia, VAT is automatically included when paying via SBP.

---

2. Pricing Plans

| Duration     | SBP       | Stars    | TON        |
|--------------|-----------|----------|------------|
| 1 month      | 149 ₽     | 89 ★     | 0.35 TON   |
| 3 months     | 399 ₽     | 229 ★    | 0.95 TON   |
| 12 months    | 999 ₽     | 699 ★    | 3.2 TON    |

A subscription grants full access to all features. **Subscriptions do not auto-renew.**

---

3. Refunds  
**Refunds are not available**, because:  
- The service is **digital and intangible**;  
- Pricing reflects the **minimum cost required to maintain the service**;  
- The product requires no installation and has no physical form.

In case of a technical issue (e.g., payment succeeded but access was not activated), please contact [Support](https://t.me/diiimaaan777) — we will manually restore your access.

---

4. Free Trial  
There is **no free trial period**. We offer **low entry prices** to ensure broad accessibility. If you’re unsure, start with the **monthly plan**.

---

5. Data Privacy  
All data is stored **locally** (SQLite) and **never shared with third parties**. AI requests are sent **anonymously**, with no linkage to your Telegram account.

---

6. Changes to Terms  
We reserve the right to update pricing or terms. Users will be notified in advance via the app interface or Telegram bot.

---

7. Support  
📩  please include your **Telegram ID** and **payment date** when contacting us.


`,he=Object.freeze(Object.defineProperty({__proto__:null,PremiumButton:I,default:ce},Symbol.toStringTag,{value:"Module"}));export{I as P,he as a,fe as s};
