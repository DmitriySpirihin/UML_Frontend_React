
import { useState, useEffect} from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { addPanel$ ,theme$,lang$,fontSize$,setAddPanel} from '../../StaticClasses/HabitsBus';
import { getInsight , getInsightPrompt} from './InsightHelper.js';
import { MdClose } from 'react-icons/md';

const click = new Audio('Audio/Click.wav');




const SleepInsight = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [addPanelState,setAddPanelState] = useState(addPanel$.value);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
    const subscription = theme$.subscribe(setTheme);
    const fontSizeSubscription = fontSize$.subscribe(setFontSize);
    return () => {
      subscription.unsubscribe();
      fontSizeSubscription.unsubscribe();
    };
    }, []);
    useEffect(() => {
            const themeSubscription = theme$.subscribe(setTheme);
            const langSubscription = lang$.subscribe((lang) => {
                setLangIndex(lang === 'ru' ? 0 : 1);
            });
            return () => {
                themeSubscription.unsubscribe();
                langSubscription.unsubscribe();
            };
        }, []);
    useEffect(() => {
      const subscription = addPanel$.subscribe(setAddPanelState);
      if(addPanelState === 'SleepInsight')setTimeout(() => setOpacity(1),400);
      else setOpacity(0);
      return () => {
        subscription.unsubscribe();
      };
    }, [addPanelState]);
    
    return (
        <div style={{...styles(theme).container,
          transform: addPanelState === 'SleepInsight' ? 'translateX(0)' : 'translateX(-100%)',
          backgroundColor: opacity === 1 ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          transition: 'transform 0.3s ease-in-out, background-color 0.1s ease-in-out',
        }}>
         <div  style={styles(theme).panel}>
           
           <div style={{fontSize:fSize === 0 ? '15px' : '18px',color:Colors.get('mainText', theme),fontWeight:'bold'}}>{langIndex === 0 ? 'ИИ анализ🤖✨' : 'AI analysis🤖✨'}</div>
           <div style={{width:'90%',height:'80%',overflowY:'scroll',borderTop:`1px solid ${Colors.get('border', theme)}`,
           borderBottom:`1px solid ${Colors.get('border', theme)}`,padding:'16px', fontSize:fSize === 0 ? '14px' : '16px',color:Colors.get('mainText', theme),textAlign:'left'}}>
           {
           //getInsightPrompt(langIndex).systemPrompt
           //'Weekly Fitness Snapshot (Dec 29 – Jan 4)Overall Activity: Low physical activity—only one recorded meditation and three logged sleep nights. No structured workouts, breathing, or cold exposure. Walking was inconsistent (0 = skipped, –1 = partial), and smoking occurred daily.Strengths:One solid meditation session (nearly 2 minutes)—a great start!One excellent night of sleep (8.5 hrs, mood 5)—proof you can recover well.Problem Areas:Zero structured workouts and no breathing/cold exposure logged.Walking habit missed or incomplete 4 out of 7 days.Daily smoking contradicts fitness and recovery goals.Inconsistent sleep tracking—only 3 nights logged; two were under 7 hours.Action Plan for Next Week:Walk 20 min daily—even if just around the block. Mark it done before bed.Add 2 short (5-min) breathing sessions—morning and post-walk. Use a free app if needed.Protect sleep: Aim for 7.5–8 hrs. Set a bedtime alarm for 11 PM.Replace one smoking urge with a 2-min meditation—use your Jan 3 success as a template.Log every night’s sleep—even if rough. Awareness drives improvement.You’ve got the foundation—now build consistency, not perfection. Every small win compounds! 💪'
           'Отличная работа над собой за последнюю неделю!;Активность пока низкая: ходьба выполнена лишь 3 из 7 дней, тренировок, дыхания и закаливания не зафиксировано. Однако сон и отказ от курения — твои сильные стороны.Ты полностью удерживаешь отказ от курения — это мощный прогресс! Сон в последние два дня стал качественнее (настроение 5/5), а значит, восстановление улучшается.;Проблемы: ходьба пропущена в 4 днях подряд, нет данных по тренировкам, дыханию, медитации (кроме одного дня) и закаливанию. Это ключевые зоны роста.;Рекомендации на неделю:Гуляй каждый день — даже 20 минут после ужина.Добавь 5‑минутную дыхательную практику утром (например, 4‑7‑8).Стабилизируй отход ко сну — ложись до 23:30, чтобы закрепить высокое качество сна.Попробуй 1 короткую тренировку (10–15 мин) на этой неделе — хоть раз!Повтори медитацию в спокойный вечер — даже 5 минут улучшат фокус и отдых.Ты уже на пути — теперь добавь немного движения, и результаты придут быстрее!'
           }
           </div>
          <div>
          <MdClose onClick={() => {setAddPanel('')}} style={{fontSize:'42px',color:Colors.get('icons', theme)}}/>
          <div style={{fontSize:'9px',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'закрыть' : 'close'}</div>
          </div>
         </div> 
        </div>
    )
}
export default SleepInsight;

const styles = (theme, fSize) => ({
  // Container styles
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2900,
    width:'100vw'
  },
  panel :
  {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'space-around',
    borderRadius:"24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('background', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    marginTop:'10vh',
    width:"95vw",
    height: "79vh",
    padding:'5px',
    marginBottom:'16%'
  },
  text :
  {
    textAlign: "center",
    fontSize:fSize ? "13px" : "15px",
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  }
  
})


