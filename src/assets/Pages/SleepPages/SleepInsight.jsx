
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
           'Недельный фитнес-разбор (29 дек — 4 янв)Общая активность: Очень низкая. Ни одной тренировки, дыхательной практики или закаливания. Ходьба — частично или пропущена 4 дня. Курение — каждый день. Сон отслежен лишь в 3 из 7 ночей.Сильные стороны:– Отличный сон 3 января: 8,5 часов, настроение 5/5 — это реальный образец восстановления!– Одна медитация (~2 мин) — первый шаг к осознанности. Молодец, что начал!Проблемные зоны:– Нет тренировок, дыхания, закаливания — ключевые привычки вообще не запускались.– Ходьба неустойчива (часто пропущена или неполная).– Ежедневное курение тормозит прогресс по всем направлениям.– Сон менее 7 часов в 2 из 3 записей — недостаточно для восстановления в 20 лет.Практические шаги на следующую неделю:✅ Ходи 20 минут каждый день — в любую погоду, без перерывов. Ставь галочку до сна.✅ 2 раза в день — дыхание по 3–5 минут (утром и после прогулки). Используй простой ритм: 4 сек вдох – 6 сек выдох.✅ Ложись до 23:00, чтобы спать 7,5–8 часов. Поставь напоминание за 30 мин до отбоя.✅ Замени одно желание покурить — на 2-минутную медитацию или глубокое дыхание.✅ Записывай сон каждый день — даже если спал плохо. Осознанность = контроль.Ты уже показал, что способен на качественный сон и медитацию — теперь сделай это привычкой. Маленькие шаги, но каждый день. 💪🔥'
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


