import{R as h,r as x,A as y,t as u,l as w,f as v,j as o,C as n,s as b}from"./index-D8p1Zp9Z.js";const C=()=>{const[e,i]=h.useState("dark"),[t,c]=x.useState(y.prefs[0]),[r,s]=x.useState(y.prefs[4]);return x.useEffect(()=>{const d=u.subscribe(i),p=w.subscribe(l=>{c(l==="ru"?0:1)}),f=v.subscribe(l=>{s(l)});return()=>{d.unsubscribe(),p.unsubscribe(),f.unsubscribe()}},[]),o.jsxs("div",{style:g(e).container,children:[o.jsx(a,{text:["Быстрый счёт","Mental math"],decr:["Тренируйте скорость счёта и точность под таймером, прокачивая базовую арифметику и концентрацию.","Train calculation speed and accuracy under time pressure to boost basic arithmetic and focus."],theme:e,lang:t,fontSize:r,onClick:()=>{b("MentalMath")},svgColor:"#233837ff",index:0}),o.jsx(a,{text:["Память в действии","Memory in action"],decr:["Укрепляйте рабочую память через последовательности и n-back‑упражнения.","Strengthen working memory with sequences and n-back style exercises."],theme:e,lang:t,fontSize:r,onClick:()=>{},svgColor:"#563333ff",index:1}),o.jsx(a,{text:["Числовая логика","Number logic"],decr:["Развивайте умение замечать закономерности и решать логические числовые задачи.","Improve pattern recognition and logical thinking with number series and puzzles."],theme:e,lang:t,fontSize:r,onClick:()=>{},svgColor:"#355436ff",index:2}),o.jsx(a,{text:["Чистый фокус","Pure focus"],decr:["Тренируйте избирательное внимание и когнитивный контроль в задачах Go/No-Go и Струпа.","Train selective attention and cognitive control with Go/No-Go and Stroop-style tasks."],theme:e,lang:t,fontSize:r,onClick:()=>{},svgColor:"#46452bff",index:3})]})},g=(e,i)=>({container:{backgroundColor:n.get("background",e),display:"flex",flexDirection:"column",overflowY:"scroll",justifyContent:"start",alignItems:"center",height:"78vh",paddingTop:"5vh",width:"100vw",fontFamily:"Segoe UI"},mainText:{textAlign:"left",fontSize:i===0?"15px":"17px",color:n.get("mainText",e),marginBottom:"2px"},subtext:{textAlign:"left",fontSize:i===0?"12px":"14px",color:n.get("mainText",e),marginBottom:"12px"},icon:{fontSize:"26px",color:n.get("icons",e)},simplePanelRow:{width:"75vw",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-around"}});function a({text:e,decr:i,theme:t,lang:c,onClick:r,fontSize:s,index:d,svgColor:p}){const l={display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",height:"13vh",width:"90vw",borderRadius:"12px",position:"relative",backgroundImage:m(d,p),backgroundRepeat:"no-repeat",backgroundSize:"cover",boxShadow:"0px 0px 10px "+n.get("mainText",t),backgroundColor:n.get("mentalCategoryCard",t)};return o.jsxs("div",{children:[o.jsx("div",{style:{display:"flex",flexDirection:"row",width:"35%",height:"15%",backgroundColor:"rgba(255, 242, 2, 0.12)",alignItems:"center",justifyContent:"center",position:"relative",top:"20%",left:"63%",borderRadius:"12px",fontSize:"15px",color:n.get("mainText",t),zIndex:5},children:k()}),o.jsx("div",{style:l,onClick:r,children:o.jsxs("div",{style:{width:"90%",marginLeft:"10%",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center"},children:[o.jsx("p",{style:{...g(t,s).mainText,fontWeight:"bold"},children:Array.isArray(e)?e[c]:e}),o.jsx("p",{style:g(t,s).subtext,children:Array.isArray(i)?i[c]:i})]})})]})}const m=(e=0,i="#4ECDC4")=>{const t=i.replace(/[^a-zA-Z0-9#.%]/g,""),r=[`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M20 20 L30 30 M30 20 L20 30 M70 70 L80 80 M80 70 L70 80"
            stroke="${t}" stroke-width="4" fill="none" opacity="0.6"/>
      <path d="M15 85 L25 85 M20 80 L20 90" stroke="${t}" stroke-width="3" fill="none" opacity="0.5"/>
      <path d="M85 15 L85 25 M80 20 L90 20" stroke="${t}" stroke-width="3" fill="none" opacity="0.5"/>
      <path d="M0 50 L100 50 M50 0 L50 100" stroke="${t}" stroke-width="1.6" opacity="0.25" fill="none"/>
    </svg>`,`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M20 50 Q40 30, 60 50 T100 50" stroke="${t}" stroke-width="4" fill="none" opacity="0.55"/>
      <circle cx="20" cy="50" r="6" fill="${t}" opacity="0.65"/>
      <circle cx="60" cy="50" r="6" fill="${t}" opacity="0.65"/>
      <circle cx="100" cy="50" r="6" fill="${t}" opacity="0.65"/>
      <circle cx="40" cy="30" r="4" fill="${t}" opacity="0.5"/>
      <circle cx="80" cy="30" r="4" fill="${t}" opacity="0.5"/>
      <circle cx="40" cy="70" r="3" fill="${t}" opacity="0.4"/>
      <circle cx="80" cy="70" r="3" fill="${t}" opacity="0.4"/>
    </svg>`,`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M20 20 L50 20 L50 50 L80 50 L80 80"
            stroke="${t}" stroke-width="4.2" fill="none" opacity="0.6"/>
      <path d="M50 20 L80 20 L80 50" stroke="${t}" stroke-width="3" fill="none" opacity="0.45"/>
      <circle cx="20" cy="20" r="6" fill="${t}" opacity="0.7"/>
      <circle cx="50" cy="50" r="6" fill="${t}" opacity="0.7"/>
      <circle cx="80" cy="80" r="6" fill="${t}" opacity="0.7"/>
      <circle cx="80" cy="20" r="4" fill="${t}" opacity="0.5"/>
      <circle cx="50" cy="20" r="4" fill="${t}" opacity="0.5"/>
    </svg>`,`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="22" stroke="${t}" stroke-width="4.5" fill="none" opacity="0.65"/>
      <circle cx="50" cy="50" r="8" fill="${t}" opacity="0.8"/>
      <path d="M50 15 L50 35 M50 65 L50 85 M15 50 L35 50 M65 50 L85 50"
            stroke="${t}" stroke-width="3.6" fill="none" opacity="0.55"/>
      <circle cx="50" cy="50" r="18" stroke="${t}" stroke-width="1.4" fill="none" opacity="0.3"/>
    </svg>`][e%4].trim();return`url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(r).replace(/'/g,"%27").replace(/"/g,"'")}")`},k=(e,i)=>"top score: "+0;export{C as default};
