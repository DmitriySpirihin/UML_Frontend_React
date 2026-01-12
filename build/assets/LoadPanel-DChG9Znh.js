import{t as U,l as T,j as a,C as i,z as S,B as k,D as v,A as o,U as n,E as D,G as M,H as C,I as L,s as b}from"./index-BoSuaHMf.js";import{r as s}from"./recharts-DVuIdjrD.js";function E(){const[e,x]=s.useState("dark"),[g,y]=s.useState(0),[d,p]=s.useState("Guest"),[c,m]=s.useState("images/Ui/Guest.jpg"),[f,h]=s.useState(!0);return s.useEffect(()=>{async function u(){try{await S();const r=typeof window<"u"?!window.Telegram?.WebApp:!0;await k({mock:r});const{user:t,languageCode:w,colorScheme:j}=v();t?(o.isFirstStart&&(o.prefs[0]=w==="ru"?0:1,o.prefs[1]=j==="dark"?0:2),n.Init(t.id,t.username,t.photo_url||"images/Ui/Guest.jpg"),p(t.username),m(Array.isArray(t.photo_url)?t.photo_url[0]:t.photo_url)):(n.Init(0,o.prefs[0]===0?"гость":"guest","images/Ui/Guest.jpg"),p(o.prefs[0]===0?"гость":"guest"),m("images/Ui/Guest.jpg")),await D(),M(),C(),n.id!==0&&await L(n.id),h(!1),setTimeout(()=>b("MainMenu"),300)}catch(r){console.error("Initialization error:",r),h(!1),setTimeout(()=>b("MainMenu"),300)}}u()},[]),s.useEffect(()=>{const u=U.subscribe(x),r=T.subscribe(t=>y(t==="ru"?0:1));return()=>{u.unsubscribe(),r.unsubscribe()}},[]),a.jsxs("div",{style:l(e).container,children:[a.jsx("img",{src:e==="dark"?"images/Ui/Main_Dark.png":"images/Ui/Main_Light.png",style:l(e).logo,alt:"UltyMyLife"}),f?a.jsx("div",{className:"spinner",children:a.jsx("style",{children:`
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
          `})}):c&&a.jsx("img",{src:c,style:l(e).userPhoto,alt:"User"}),a.jsx("h2",{style:l(e).mainText,children:f?g===0?"Загружаю данные...":"Loading data...":g===0?`Добро пожаловать в UltyMyLife, ${d}!`:`Welcome to UltyMyLife, ${d}!`})]})}const l=e=>({container:{backgroundColor:i.get("background",e),display:"flex",flexDirection:"column",justifyContent:"start",alignItems:"center",height:"100vh",width:"100vw"},logo:{width:"256px",objectFit:"contain",marginTop:"40%"},mainText:{marginTop:"10%",fontSize:"14px",color:i.get("subText",e)},userPhoto:{border:"4px solid "+i.get("border",e),boxShadow:"0px 0px 10px "+i.get("shadow",e),width:"10vw",height:"10vw",borderRadius:"50%",objectFit:"cover",marginTop:"20%"}});export{E as default};
