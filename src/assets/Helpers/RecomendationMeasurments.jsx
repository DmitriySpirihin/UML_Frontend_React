import {useState,useEffect} from 'react'
import { AppData,UserData } from '../StaticClasses/AppData.js'
import Colors from '../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$} from '../StaticClasses/HabitsBus'


const RecomendationMeasurments = ({bmi,trains}) => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);
    const [goal,setGoal] = useState(AppData.pData.goal);
    const [tdee , setTdee] = useState(getTDEE(bmi,trains));
   
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
    <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'center',width:'100%',alignSelf:'center',marginBottom:'20px'}}>
      <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? '💡Рекомендации для вас с учетом недельной нагрузки' : '💡Personal recomendations based on weekly worhload'}</div>
      <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'center',width:'95%',alignSelf:'center',border:'1px solid ' + Colors.get('border', theme)}}>
       <div style={{...styles(theme,fSize).simplePanelRow,}}>
         <div style={{...styles(theme,fSize).subtext,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Цель' : 'Goal'}
         </div>
         <div style={{...styles(theme,fSize).subtext,width:'50%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Калории' : 'Calories'}
         </div>
         <div style={{...styles(theme,fSize).subtext,width:'30%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'БЖУ(на кг веса)' : 'PFC(per kg of weight)'}
         </div>
        </div>
        <div style={{...styles(theme,fSize).simplePanelRow,border: goal === 0 || goal === 1 ? '2px solid ' + Colors.get('maxValColor', theme) : 'none'}}>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Набор' : 'Gain'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'50%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {`${Math.round(tdee * 1.1)} - ${Math.round(tdee * 1.15)} ${langIndex === 0 ? ' ккал' : ' kcal'}`  }
         </div>
         <div style={{...styles(theme,fSize).text,width:'30%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '1.8-2.2г/1г/4-6г' : '1.8-2.2g/1g/4-6g'}
         </div>
        </div>
        <div style={{...styles(theme,fSize).simplePanelRow}}>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Поддержание' : 'Maintenance'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'50%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
           {`${tdee.toFixed()} ${langIndex === 0 ? ' ккал' : ' kcal'}`  }
         </div>
         <div style={{...styles(theme,fSize).text,width:'30%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '1.2-1.6г/1г/4г' : '1.2-1.6g/1g/4g'}
         </div>
        </div>
        <div style={{...styles(theme,fSize).simplePanelRow,border: goal === 2 ? '2px solid ' + Colors.get('maxValColor', theme) : 'none'}}>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Похудение' : 'Weight loss'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'50%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {`${Math.round(tdee * 0.85)} - ${Math.round(tdee * 0.9)} ${langIndex === 0 ? ' ккал' : ' kcal'}`  }
         </div>
         <div style={{...styles(theme,fSize).text,width:'30%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '1.6-2г/0.8г/2-3г' : '1.6-2g/0.8g/2-3g'}
         </div>
        </div>
       </div>
    </div>
  )
}

export default RecomendationMeasurments

const styles = (theme,fSize) =>
({
  text :
  {
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginBottom:'5px'
  },
  subtext :
  {
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme)
  },
  icon:
  {
     fontSize:'14px',
     color:Colors.get('icons', theme),
     marginRight:'18px'
  },
simplePanelRow:
{
  width:'100%',
  height:'50px',
  display:'flex',
  flexDirection:'row',
  alignItems:'center',
  borderBottom: '1px solid ' + Colors.get('border', theme),
}
})

const getTDEE = (bmr, weeklyTrainingDays = 3) => {
  const days = Math.min(7, Math.max(0, weeklyTrainingDays));

  let multiplier;
  if (days === 0) multiplier = 1.2;
  else if (days <= 2) multiplier = 1.375;
  else if (days <= 4) multiplier = 1.55;
  else if (days === 5) multiplier = 1.725;
  else multiplier = 1.9; // 6–7 days

  return bmr * multiplier;
};