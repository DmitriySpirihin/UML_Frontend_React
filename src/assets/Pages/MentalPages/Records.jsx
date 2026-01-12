import { useState,useEffect} from 'react';
import { AppData, UserData} from '../../StaticClasses/AppData.js';
import { NotificationsManager } from '../../StaticClasses/NotificationsManager.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$} from '../../StaticClasses/HabitsBus';
import {FaStopwatch20,FaMemory,FaStar,FaUserAlt} from 'react-icons/fa'
import {GiLogicGateNxor,GiTargetShot} from 'react-icons/gi'
import {FaStarHalf,FaInfinity,FaMedal} from 'react-icons/fa'
import {GiStarsStack,GiCrownedSkull} from 'react-icons/gi'

// === Labels (same as your reference)
const categoryLabels = [
  ['Быстрый счет', 'quick math'],
  ['Память', 'memory'],
  ['Логика', 'logic'],
  ['Фокус', 'focus']
];

const difficultyLabels = [
  ['легкий', 'easy'],
  ['средний', 'medium'],
  ['тяжелый', 'hard'],
  ['безумный', 'insane'],
  ['бесконечный', 'endless']
];
const categoryIcons = [
   FaStopwatch20,
   FaMemory,
   GiLogicGateNxor,
   GiTargetShot
];

const difficultyIcons = [
   FaStarHalf,
   FaStar,
   GiStarsStack,
   GiCrownedSkull,
   FaInfinity
];
const getCategoryColor = (theme,index) => {
    const names = ['cold','skipped','done','medium'];
    return Colors.get(names[index], theme);
}
const getDifficultyColor = (theme,index) => {
    const names = ['light','medium','heavy','hot','cold'];
    return Colors.get(names[index], theme);
}

// === Togglers (identical to your code) ===

const CategoryTogglers = ({ theme, categoryIndex, setCategoryIndex, difficultyIndex ,setDifficultyIndex}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '5px',
      padding: '2px',
      backgroundColor: Colors.get('panel', theme),
      borderRadius: '12px'
    }}>
      {categoryIcons.map((Icon, idx) => (
        <span
          key={idx}
          onClick={() => {setCategoryIndex(idx);if(difficultyIndex > 3)setDifficultyIndex(3);}}
          style={{
            padding: '2px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: categoryIndex === idx
              ? getCategoryColor(theme,idx)
              : Colors.get('subText', theme), // ✅ Fixed: removed extra "Colors:"
            opacity: categoryIndex === idx ? 1 : 0.7,
            transition: 'all 0.2s ease'
          }}
          aria-label={categoryLabels[idx]?.[0] || 'Category'}
        >
          <Icon size={categoryIndex === idx ? 30 : 20} />
          
        </span>
      ))}
    </div>
  );
};

const DifficultTogglers = ({ theme, categoryIndex, setCategoryIndex, difficultyIndex, setDifficultyIndex }) => {
  const visibleIcons = categoryIndex > 0
    ? difficultyIcons.slice(0, -1)
    : difficultyIcons;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '8px 0'
    }}>
      {visibleIcons.map((Icon, idx) => (
        <span
          key={idx}
          onClick={() => setDifficultyIndex(idx)}
          style={{
            padding: '2px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: difficultyIndex === idx
              ? getDifficultyColor(theme,idx)
              : Colors.get('subText', theme),
            opacity: difficultyIndex === idx ? 1 : 0.8,
            transition: 'all 0.2s ease'
          }}
          aria-label={difficultyLabels[idx]?.[0] || 'Difficulty'}
        >
          <Icon size={difficultyIndex === idx ? 30 : 20} />
          
        </span>
      ))}
    </div>
  );
};


// === Main Component ===

const Records = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [difficultyIndex, setDifficultyIndex] = useState(0);

  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchGlobalData = async () => {
    try {
      const data = await NotificationsManager.getMentalRecordsGlobal();
      setGlobalData(data.message);
    } catch (err) {
      // Fallback to local user data only
      setGlobalData([{ name: UserData?.name, data: AppData.mentalRecords }]);
    } finally {
      setLoading(false);
    }
   };

   fetchGlobalData();
 }, []);

  useEffect(() => {
      const sub1 = theme$.subscribe(setThemeState);
      const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
      const sub3 = fontSize$.subscribe(setFSize);
      return () => {
        sub1.unsubscribe();
        sub2.unsubscribe();
        sub3.unsubscribe();
      };
    }, []);

  return (
    <div style={styles(theme).container}>
      {/* Togglers */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <CategoryTogglers
          theme={theme}
          langIndex={langIndex}
          fSize={fSize}
          categoryIndex={categoryIndex}
          difficultyIndex={difficultyIndex}
          setCategoryIndex={setCategoryIndex}
          setDifficultyIndex={setDifficultyIndex}
        />
        <DifficultTogglers
          categoryIndex={categoryIndex}
          theme={theme}
          langIndex={langIndex}
          fSize={fSize}
          difficultyIndex={difficultyIndex}
          setDifficultyIndex={setDifficultyIndex}
        />
      </div>
      <div style={styles(theme).list}>
        {
            loading ? <div>{langIndex === 0 ? 'Загрузка...' : 'Loading...'}</div> : globalData?.map((item,index)=>(
                <ListItem theme={theme} fSize={fSize} isUser={item.name === UserData.name} index={index} data={item} categoryIndex={categoryIndex} difficultyIndex={difficultyIndex}/>
            ))
        }
      </div>
    </div>
  );
};
const styles = (theme,fSize) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'absolute',
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     top:'14vh',
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  list:{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '12px',
    width: '90%',
    overflowY: 'scroll',
    height: '80%',
    borderBottom: '1px solid '+Colors.get('border', theme),
    borderTop: '1px solid '+Colors.get('border', theme),
  },
  listItem:{
     display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height:'30px',
    borderBottom: '1px solid '+Colors.get('border', theme),
  },
  text:{
    fontSize:fSize === 0 ? '14px' : '16px',
    color:Colors.get('mainText', theme),
    marginRight:'15px'
  },
  avatar:{
    width:'25px',
    height:'25px',
    borderRadius:'50%',
    border:'1px solid '+Colors.get('border', theme),
    overflow:'hidden'
  }
})

export default Records;

const medalColors = (theme,index) => {
    const names = ['barsColorWeight','difficultyAdd','hold'];
    return Colors.get(names[index], theme);
}

const ListItem = ({theme,fSize,isUser,index,data,categoryIndex,difficultyIndex}) => {
    
  return(
    <div style={{...styles(theme).listItem,borderBottomColor:isUser ? Colors.get('light', theme) : Colors.get('border', theme)}} >
      <div style={{...styles(theme).listItem,width:'40%',justifyContent:'start',borderBottom:'none'}} >
        <div style={styles(theme,fSize).text}>{index + 1}</div>
       <div style={{...styles(theme,fSize).text,marginLeft:'15px'}}>{data.name}</div>
       {index < 3 && <FaMedal size={20} color={medalColors(theme,index)} />}
       {isUser && <FaUserAlt size={15} color={Colors.get('light', theme)} />}
     </div>
       <div style={{...styles(theme,fSize).text,color:Colors.get('light', theme)}}>{data.data[categoryIndex][difficultyIndex]}</div>
    </div>
  )


}

