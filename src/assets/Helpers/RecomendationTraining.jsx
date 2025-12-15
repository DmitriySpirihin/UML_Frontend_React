import {useState,useEffect} from 'react'
import { AppData,UserData } from '../StaticClasses/AppData.js'
import Colors from '../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$} from '../StaticClasses/HabitsBus'


const RecomendationTraining = ({max}) => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);
    const [goal,setGoal] = useState(AppData.pData.goal);
   
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
      <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? 'Рекомендации для вас' : 'Personal recomendations'}</div>
      <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'center',width:'95%',alignSelf:'center',border:'1px solid ' + Colors.get('border', theme)}}>
       <div style={{...styles(theme,fSize).simplePanelRow,}}>
         <div style={{...styles(theme,fSize).subtext,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Цель' : 'Goal'}
         </div>
         <div style={{...styles(theme,fSize).subtext,width:'40%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Вес-повторы' : 'Weight-reps'}
         </div>
         <div style={{...styles(theme,fSize).subtext,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Отдых между сетами' : 'Rest between sets'}
         </div>
         <div style={{...styles(theme,fSize).subtext,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Восстановление' : 'Recovery'}
         </div>
        </div>
        <div style={{...styles(theme,fSize).simplePanelRow,border: goal === 0 ? '2px solid ' + Colors.get('maxValColor', theme) : 'none'}}>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Сила' : 'Strength'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'40%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {`${Math.round(max * 0.85)} - ${Math.round(max * 0.95)} ${langIndex === 0 ? 'кг' : 'kg'} / 3-6 ${langIndex === 0 ? 'повт.' : 'reps'}`  }
         </div>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '3-5мин' : '3-5min'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '72ч' : '72h'}
         </div>
        </div>
        <div style={{...styles(theme,fSize).simplePanelRow,border: goal === 1 ? '2px solid ' + Colors.get('maxValColor', theme) : 'none'}}>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Набор' : 'Gain'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'40%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {`${Math.round(max * 0.68)} - ${Math.round(max * 0.82)} ${langIndex === 0 ? 'кг' : 'kg'} / 10-12 ${langIndex === 0 ? 'повт.' : 'reps'}`  }
         </div>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '1.5-2мин' : '1.5-2min'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '48ч' : '48h'}
         </div>
        </div>
        <div style={{...styles(theme,fSize).simplePanelRow,border: goal === 2 ? '2px solid ' + Colors.get('maxValColor', theme) : 'none'}}>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? 'Сушка' : 'Drying'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'40%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {`${Math.round(max * 0.5)} - ${Math.round(max * 0.65)} ${langIndex === 0 ? 'кг' : 'kg'} / 14-20+ ${langIndex === 0 ? 'п.' : 'r.'}`  }
         </div>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '30-60сек' : '30-60sec'}
         </div>
         <div style={{...styles(theme,fSize).text,width:'20%',height:'40px',alignContent:'center',borderRight:'1px solid ' + Colors.get('border', theme)}}>
            {langIndex === 0 ? '24-48ч' : '24-48h'}
         </div>
        </div>
       </div>
    </div>
  )
}

export default RecomendationTraining

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
