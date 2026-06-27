import{t as U,l as T,j as s,C as a,z as S,B as k,D as v,A as r,U as o,E as D,G as M,H as C,I as L,s as h}from"./index-BChLsca3.js";import{r as b}from"./recharts-DVuIdjrD.js";function E(){const[e,x]=useState("dark"),[u,y]=useState(0),[g,d]=useState("Guest"),[p,c]=useState("images/Ui/Guest.jpg"),[m,f]=useState(!0);return b.useEffect(()=>{async function l(){try{await S();const i=typeof window<"u"?!window.Telegram?.WebApp:!0;await k({mock:i});const{user:t,languageCode:w,colorScheme:j}=v();t?(r.isFirstStart&&(r.prefs[0]=w==="ru"?0:1,r.prefs[1]=j==="dark"?0:2),o.Init(t.id,t.username,t.photo_url||"images/Ui/Guest.jpg"),d(t.username),c(Array.isArray(t.photo_url)?t.photo_url[0]:t.photo_url)):(o.Init(0,r.prefs[0]===0?"гость":"guest","images/Ui/Guest.jpg"),d(r.prefs[0]===0?"гость":"guest"),c("images/Ui/Guest.jpg")),await D(),M(),C(),o.id!==0&&await L(o.id),f(!1),setTimeout(()=>h("MainMenu"),300)}catch(i){console.error("Initialization error:",i),f(!1),setTimeout(()=>h("MainMenu"),300)}}l()},[]),b.useEffect(()=>{const l=U.subscribe(x),i=T.subscribe(t=>y(t==="ru"?0:1));return()=>{l.unsubscribe(),i.unsubscribe()}},[]),s.jsxs("div",{style:n(e).container,children:[s.jsx("img",{src:e==="dark"?"images/Ui/Main_Dark.png":"images/Ui/Main_Light.png",style:n(e).logo,alt:"UltyMyLife"}),m?s.jsx("div",{className:"spinner",children:s.jsx("style",{children:`
            .spinner {
              margin-top: 20%;
              border: 4px solid ${a.get("subText",e)};
              border-top: 4px solid ${a.get("habitCardSkipped",e)};
              border-radius: 50%;
              width: 10vw;
              height: 10vw;
              animation: spinner 1.6s linear infinite;
            }
            @keyframes spinner {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `})}):p&&s.jsx("img",{src:p,style:n(e).userPhoto,alt:"User"}),s.jsx("h2",{style:n(e).mainText,children:m?u===0?"Загружаю данные...":"Loading data...":u===0?`Добро пожаловать в UltyMyLife, ${g}!`:`Welcome to UltyMyLife, ${g}!`})]})}const n=e=>({container:{backgroundColor:a.get("background",e),display:"flex",flexDirection:"column",justifyContent:"start",alignItems:"center",height:"100vh",width:"100vw"},logo:{width:"256px",objectFit:"contain",marginTop:"40%"},mainText:{marginTop:"10%",fontSize:"14px",color:a.get("subText",e)},userPhoto:{border:"4px solid "+a.get("border",e),boxShadow:"0px 0px 10px "+a.get("shadow",e),width:"10vw",height:"10vw",borderRadius:"50%",objectFit:"cover",marginTop:"20%"}});export{E as default};
