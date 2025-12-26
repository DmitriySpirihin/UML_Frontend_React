import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'

const MentalMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]); 
      
    // subscriptions
    useEffect(() => {
          const subscription = theme$.subscribe(setthemeState); 
          const subscription2 = lang$.subscribe((lang) => {
          setLangIndex(lang === 'ru' ? 0 : 1);
          }); 
          const subscription3 = fontSize$.subscribe((fontSize) => {
          setFSize(fontSize);
          });
          return () => {
          subscription.unsubscribe();
          subscription2.unsubscribe();
          subscription3.unsubscribe();
          }
    }, []); 
       
    // render    
    return (
    <div style={styles(theme).container}>
      <MenuCard 
        text={['Быстрый счёт', 'Mental math']}
        decr={[
          'Тренируйте скорость счёта и точность под таймером, прокачивая базовую арифметику и концентрацию.',
          'Train calculation speed and accuracy under time pressure to boost basic arithmetic and focus.'
        ]} 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('MentalMath')}}
        svgColor={"#233837ff"}
        index={0}
      />   
      <MenuCard 
        text={['Память в действии', 'Memory in action']}
        decr={[
         'Укрепляйте рабочую память через последовательности и n-back‑упражнения.',
         'Strengthen working memory with sequences and n-back style exercises.'
        ]}
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {}}
        svgColor={"#563333ff"}
        index={1}
      /> 
      <MenuCard 
        text={['Числовая логика', 'Number logic']}
        decr={[
         'Развивайте умение замечать закономерности и решать логические числовые задачи.',
         'Improve pattern recognition and logical thinking with number series and puzzles.'
        ]} 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {}}
        svgColor={"#355436ff"}
        index={2}
      /> 
      <MenuCard 
        text={['Чистый фокус', 'Pure focus']}
        decr={[
         'Тренируйте избирательное внимание и когнитивный контроль в задачах Go/No-Go и Струпа.',
         'Train selective attention and cognitive control with Go/No-Go and Stroop-style tasks.'
        ]} 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {}}
        svgColor={"#46452bff"}
        index={3}
      /> 
    </div>
    
  )
}

export default MentalMain

const styles = (theme,fSize) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     paddingTop:'5vh',
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  mainText :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '15px' : '17px',
    color: Colors.get('mainText', theme),
    marginBottom:'2px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '12px' : '14px',
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
    icon:{
       fontSize:'26px',
       color: Colors.get('icons', theme),
    },
    simplePanelRow:
    {
      width:'75vw',
      display:'flex',
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-around',
    },
})

function MenuCard({text, decr , theme,lang, onClick,fontSize,index,svgColor} ){
    const bg = createSvgDataUrl(index,svgColor);
    const _style = {
        display:'flex',
        flexDirection:'row',
        alignItems: "center",
        justifyContent: "center",
        height: "13vh",
        width:'90vw',
        borderRadius: "12px",
        position: 'relative',
        backgroundImage: bg,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        boxShadow:'0px 0px 10px ' + Colors.get('mainText', theme),
        backgroundColor: Colors.get('mentalCategoryCard', theme)
    }
    
    return (
      <div>
        <div style={{display:'flex',flexDirection:'row',width:"35%",height:'15%',backgroundColor:'rgba(255, 242, 2, 0.12)',alignItems:'center',justifyContent:'center',position:'relative',
          top:'20%',left:'63%',borderRadius:'12px',fontSize:'15px',color:Colors.get('mainText', theme),zIndex:5}}>
           {getCategoryRecord(index)}
        </div>
      <div style={_style} onClick={onClick}>
          <div style={{width:'90%',marginLeft:'10%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
           <p style={{...styles(theme,fontSize).mainText,fontWeight:'bold'}}>{Array.isArray(text) ? text[lang] : text}</p>
           <p style={styles(theme,fontSize).subtext}>{Array.isArray(decr) ? decr[lang] : decr}</p>
          </div>
        </div> 
        
      </div>    
    )
}
const createSvgDataUrl = (index = 0, color = '#4ECDC4') => {
  const safeColor = color.replace(/[^a-zA-Z0-9#.%]/g, '');

  const patterns = [
    // 0: Mental Math — equations, grids, structure
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M20 20 L30 30 M30 20 L20 30 M70 70 L80 80 M80 70 L70 80"
            stroke="${safeColor}" stroke-width="4" fill="none" opacity="0.6"/>
      <path d="M15 85 L25 85 M20 80 L20 90" stroke="${safeColor}" stroke-width="3" fill="none" opacity="0.5"/>
      <path d="M85 15 L85 25 M80 20 L90 20" stroke="${safeColor}" stroke-width="3" fill="none" opacity="0.5"/>
      <path d="M0 50 L100 50 M50 0 L50 100" stroke="${safeColor}" stroke-width="1.6" opacity="0.25" fill="none"/>
    </svg>`,

    // 1: Memory in Action — flowing neural chain with clusters
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M20 50 Q40 30, 60 50 T100 50" stroke="${safeColor}" stroke-width="4" fill="none" opacity="0.55"/>
      <circle cx="20" cy="50" r="6" fill="${safeColor}" opacity="0.65"/>
      <circle cx="60" cy="50" r="6" fill="${safeColor}" opacity="0.65"/>
      <circle cx="100" cy="50" r="6" fill="${safeColor}" opacity="0.65"/>
      <circle cx="40" cy="30" r="4" fill="${safeColor}" opacity="0.5"/>
      <circle cx="80" cy="30" r="4" fill="${safeColor}" opacity="0.5"/>
      <circle cx="40" cy="70" r="3" fill="${safeColor}" opacity="0.4"/>
      <circle cx="80" cy="70" r="3" fill="${safeColor}" opacity="0.4"/>
    </svg>`,

    // 2: Number Logic — interconnected circuit with nodes & branches
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M20 20 L50 20 L50 50 L80 50 L80 80"
            stroke="${safeColor}" stroke-width="4.2" fill="none" opacity="0.6"/>
      <path d="M50 20 L80 20 L80 50" stroke="${safeColor}" stroke-width="3" fill="none" opacity="0.45"/>
      <circle cx="20" cy="20" r="6" fill="${safeColor}" opacity="0.7"/>
      <circle cx="50" cy="50" r="6" fill="${safeColor}" opacity="0.7"/>
      <circle cx="80" cy="80" r="6" fill="${safeColor}" opacity="0.7"/>
      <circle cx="80" cy="20" r="4" fill="${safeColor}" opacity="0.5"/>
      <circle cx="50" cy="20" r="4" fill="${safeColor}" opacity="0.5"/>
    </svg>`,

    // 3: Pure Focus — strong concentric target with crosshairs
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="22" stroke="${safeColor}" stroke-width="4.5" fill="none" opacity="0.65"/>
      <circle cx="50" cy="50" r="8" fill="${safeColor}" opacity="0.8"/>
      <path d="M50 15 L50 35 M50 65 L50 85 M15 50 L35 50 M65 50 L85 50"
            stroke="${safeColor}" stroke-width="3.6" fill="none" opacity="0.55"/>
      <circle cx="50" cy="50" r="18" stroke="${safeColor}" stroke-width="1.4" fill="none" opacity="0.3"/>
    </svg>`
  ];

  const svg = patterns[index % 4].trim();
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, "'");

  return `url("data:image/svg+xml;charset=utf-8,${encoded}")`;
};
const getCategoryRecord = (index,langIndex) => {
    const bestScore = 0;
    const record = langIndex === 0 ? 'рекорд: ' : 'top score: '
    return record + bestScore;
}
