import{t as P,l as I,j as a,C as i,E as L,G as k,H as v,A as l,U as s,I as C,J as M,K as D,L as N,s as x}from"./index-CPDBZ9HG.js";import{r}from"./recharts-Bg6K2Pzo.js";function E(){const[e,w]=r.useState("dark"),[c,S]=r.useState(0),[g,m]=r.useState("Guest"),[p,f]=r.useState("images/Ui/Guest.jpg"),[h,b]=r.useState(!0);return r.useEffect(()=>{async function d(){try{await L();const o=typeof window<"u"?!window.Telegram?.WebApp:!0;await k({mock:o});const{user:t,languageCode:U,colorScheme:j}=v();if(t?(l.isFirstStart&&(l.prefs[0]=U==="ru"?0:1,l.prefs[1]=j==="dark"?0:2),s.Init(t.id,t.username,t.photo_url||"images/Ui/Guest.jpg"),m(t.username),f(Array.isArray(t.photo_url)?t.photo_url[0]:t.photo_url)):(s.Init(0,l.prefs[0]===0?"гость":"guest","images/Ui/Guest.jpg"),m(l.prefs[0]===0?"гость":"guest"),f("images/Ui/Guest.jpg")),await C(),M(),D(),s.id!==0&&s.id!==null){const n=new URLSearchParams(window.location.search).get("ref");if(n&&!isNaN(n)&&Number(n)!==s.id){const y=`ref_processed_${n}`;if(!localStorage.getItem(y))try{await fetch("/api/record-referral",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({referrerId:Number(n),newUserId:s.id})}),localStorage.setItem(y,"1")}catch(T){console.warn("Referral submission failed:",T)}}}s.id!==0&&await N(s.id),b(!1),setTimeout(()=>x("MainMenu"),300)}catch(o){console.error("Initialization error:",o),b(!1),setTimeout(()=>x("MainMenu"),300)}}d()},[]),r.useEffect(()=>{const d=P.subscribe(w),o=I.subscribe(t=>S(t==="ru"?0:1));return()=>{d.unsubscribe(),o.unsubscribe()}},[]),a.jsxs("div",{style:u(e).container,children:[a.jsx("img",{src:e==="dark"?"images/Ui/Main_Dark.png":"images/Ui/Main_Light.png",style:u(e).logo,alt:"UltyMyLife"}),h?a.jsx("div",{className:"spinner",children:a.jsx("style",{children:`
            .spinner {
              margin-top: 20%;
              border: 4px solid ${i.get("subText",e)};
              border-top: 4px solid ${i.get("habitCardSkipped",e)};
              border-radius: 50%;
              width: 10vw;
              height: 10vw;
              animation: spinner 1.6s linear infinite;
            }
            @keyframes spinner {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `})}):p&&a.jsx("img",{src:p,style:u(e).userPhoto,alt:"User"}),a.jsx("h2",{style:u(e).mainText,children:h?c===0?"Загружаю данные...":"Loading data...":c===0?`Добро пожаловать в UltyMyLife, ${g}!`:`Welcome to UltyMyLife, ${g}!`})]})}const u=e=>({container:{backgroundColor:i.get("background",e),display:"flex",flexDirection:"column",justifyContent:"start",alignItems:"center",height:"100vh",width:"100vw"},logo:{width:"256px",objectFit:"contain",marginTop:"40%"},mainText:{marginTop:"10%",fontSize:"14px",color:i.get("subText",e)},userPhoto:{border:"4px solid "+i.get("border",e),boxShadow:"0px 0px 10px "+i.get("shadow",e),width:"10vw",height:"10vw",borderRadius:"50%",objectFit:"cover",marginTop:"20%"}});export{E as default};
