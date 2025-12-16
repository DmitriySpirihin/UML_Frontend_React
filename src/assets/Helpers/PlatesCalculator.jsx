import  {useState,useEffect} from 'react'
import Colors from '../StaticClasses/Colors'
import {saveData} from '../StaticClasses/SaveHelper'
import {MdClose,MdDone} from 'react-icons/md'
import {FaCaretLeft,FaCaretRight,FaCaretUp,FaCaretDown,FaPlus,FaMinus} from 'react-icons/fa'
import MyNumInput from '../Helpers/MyNumInput'
import { AppData } from '../StaticClasses/AppData'

const PLATE_WEIGHTS = [50, 25, 20, 15, 10, 5, 2.5, 1.25];
const PlatesCalculator = ({theme,langIndex,fSize,setShowCalculator}) => {
const [ownPlates,setOwnPlates] = useState(AppData.ownPlates);
const [platesAmount,setPlatesAmount] = useState(AppData.platesAmount);
const [barWeight,setBarWeight] = useState(20);
const [weight,setWeight] = useState(40);
const [plates,setPlates] = useState([]);
const [plateString,setPlateString] = useState('');

const getPlatesString = () => {
  const plateWeights = [50, 25, 20, 15, 10, 5, 2.5, 1.25]; // kg per plate
  const targetOneSide = (weight - barWeight) / 2;

  // Validation
  if (targetOneSide < 0) {
    return langIndex === 0 ? 'Вес меньше грифа!' : 'Weight less than bar!';
  }
  if (!Number.isInteger(targetOneSide * 100)) {
    return langIndex === 0 ? 'Невозможный вес (не кратен 2.5 кг)!' : 'Impossible weight (not multiple of 2.5 kg)!';
  }

  let remaining = targetOneSide;
  const result = []; // will hold plate weights to show (e.g., [25, 10, 5])

  // Make copies of available counts
  const available = plateWeights.map((_, i) =>
    ownPlates[i] ? platesAmount[i] : 0
  );

  // Greedy: go from heaviest to lightest
  for (let i = 0; i < plateWeights.length; i++) {
    const plate = plateWeights[i];
    while (remaining >= plate && available[i] > 0) {
      result.push(plate);
      remaining -= plate;
      available[i]--;
    }
  }

  // Check if we succeeded
  const tolerance = 0.01; // floating point safety
  if (Math.abs(remaining) > tolerance) {
    return langIndex === 0
      ? `Недостаточно пластин! Осталось: ${remaining.toFixed(2)} кг`
      : `Not enough plates! Left: ${remaining.toFixed(2)} kg`;
  }

  return result.join(' + ') || (langIndex === 0 ? 'Без пластин' : 'No plates');
};

const onAccept = () => {
  const targetOneSide = (weight - barWeight) / 2;

  if (targetOneSide < 0 || !Number.isInteger(targetOneSide * 100)) {
    setPlates([]);
    return;
  }

  let remaining = targetOneSide;
  const result = [];
  const available = PLATE_WEIGHTS.map((_, i) =>
    ownPlates[i] ? platesAmount[i] : 0
  );

  for (let i = 0; i < PLATE_WEIGHTS.length; i++) {
    const plate = PLATE_WEIGHTS[i];
    while (remaining >= plate - 0.01 && available[i] > 0) {
      result.push(plate); // store actual weight (e.g., 25)
      remaining -= plate;
      available[i]--;
    }
  }

  const tolerance = 0.01;
  if (Math.abs(remaining) <= tolerance) {
    setPlates(result);
  } else {
    setPlates([]);
  }
  setPlateString(getPlatesString());
};
const onBack = async() => {
  AppData.ownPlates = ownPlates;
  AppData.platesAmount = platesAmount;
  await saveData();
  setShowCalculator(false);
}

return (
    <div style={{...styles(theme).cP,height:'80%'}}>
        <div style={{display:'flex',flexDirection:'column',width:'95%',height:'40%',justifyContent:'flex-start',alignItems:'center',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'24px'}}>
          <div style={{display:'flex',flexDirection:'row',marginBottom:'20px',justifyContent:'space-around'}}>{langIndex === 0 ? 'ваше оборудование' : 'Your equipment'}</div>
        
        <div style={{display:'flex',flexDirection:'row',width:'95%',height:'20%',justifyContent:'space-around',alignItems:'center'}}>
          {platesAmount.map((size,index) => <ChoosenPlate 
          onClick={() => { setOwnPlates(prev =>  prev.map((plate, i) => (i === index ? !plate : plate)) );}}
          key={index} index={index} ownPlate={ownPlates[index] } theme={theme}/>)}
        </div>
        <div style={{display:'flex',flexDirection:'row',width:'95%',height:'10%',justifyContent:'space-around',alignItems:'center'}}>
          {platesAmount.map((size,index) => <FaCaretUp key={index} style={{fontSize:'28px',color:Colors.get('icons', theme)}}
          onClick={() => { if(ownPlates[index]){ setPlatesAmount(prev =>  prev.map((plate, i) => (i === index ? plate + 2 < 30 ? plate +  2 : plate : plate)) );}}} />)}
        </div>
        <div style={{display:'flex',flexDirection:'row',width:'95%',height:'10%',justifyContent:'space-around',alignItems:'center'}}>
          
          {platesAmount.map((size,index) => <div div key={index} style={{width:'10%'}}> < div style={{fontSize:'18px',color:ownPlates[index] ? Colors.get('mainText', theme) : '#363333ff'}}>{ownPlates[index] ? platesAmount[index] : 0 }</div></div>)}
          
        </div>
        <div style={{display:'flex',flexDirection:'row',width:'95%',height:'10%',justifyContent:'space-around',alignItems:'center'}}>
          {platesAmount.map((size,index) => <FaCaretDown key={index} style={{fontSize:'28px',color:Colors.get('icons', theme)}}
          onClick={() => {if(ownPlates[index]){ setPlatesAmount(prev =>  prev.map((plate, i) => (i === index ? plate - 2 > 2 ? plate - 2 : 2 : plate)) );}}} />)}
        </div>
        <div style={{display:'flex',flexDirection:'row',marginTop:'20px',width:'95%',height:'20%',justifyContent:'space-around',alignItems:'center'}}>
           <div style={{display:'flex',flexDirection:'row',width:'50%',height:'90%',justifyContent:'flex-start',alignItems:'center'}}>
             <div style={{width:'20vw',height:'3vw',backgroundColor:'#6c6868ff'}}></div>
             <div style={{width:'3vw',height:'7vw',backgroundColor:'#6c6868ff',borderRadius:'2px'}}></div>
             <div style={{width:'10vw',height:'4vw',backgroundColor:'#6c6868ff'}}></div>
          </div>
          <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around'}}>
            <FaCaretLeft onClick={() => {setBarWeight(prev => prev - 2.5 > 0 ? prev - 2.5 : 0)}} style={{fontSize:'28px',color:Colors.get('icons', theme)}}/>
              <div style={{fontSize:'18px',color:Colors.get('mainText', theme)}}>{barWeight + (langIndex === 0 ? ' кг' : ' kg')}</div>
            <FaCaretRight onClick={() => {setBarWeight(prev => prev + 2.5)}} style={{fontSize:'28px',color:Colors.get('icons', theme)}}/>
        </div>
        </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',width:'95%',height:'50%',justifyContent:'space-between',alignItems:'center',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'24px'}}>
          <div style={{...styles(theme,fSize).simplePanelRow,backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px',marginTop:'44px',userSelect:'none',touchAction:'none'}}>
            <FaMinus  style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {setWeight(prev => prev - 2.5 > barWeight ? prev - 2.5 : barWeight)}}/>
            <MyNumInput theme={theme} w={'100px'} h={'40px'}afterPointer={langIndex === 0 ? 'кг' : 'kg'} fSize={28} placeholder={'0'} value={weight} onChange={(value) => {setWeight(parseFloat(value))}}/>
            <FaPlus  style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {setWeight(prev => prev + 2.5)}}/>
          </div>
        <div style={{display:'flex',flexDirection:'row',width:'100%',height:'50%',justifyContent:'center',alignItems:'center'}}>
          {plates.length > 0 &&<div style={{width:'4vw',height:'4vw',backgroundColor:'#6c6868ff'}}></div>}
          {plates.map((weightValue, idx) => {
          const plateIndex = PLATE_WEIGHTS.indexOf(weightValue);
          return plateIndex !== -1 ? <Plate key={idx} index={plateIndex} /> : null;
          })}
          {plates.length > 0 &&<div style={{width:'3vw',height:'7vw',backgroundColor:'#242323ff',borderRadius:'2px'}}></div>}
          {plates.length > 0 && <div style={{width:'2vw',height:'4vw',backgroundColor:'#6c6868ff'}}></div>}
         </div>
         <div style={styles(theme).text}>{plateString}</div>
         

        </div>
        
     <div style={{...styles(theme,fSize).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
        <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onBack()}}/>
        <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onAccept()}}/>
     </div>
    </div>
)
}
export default PlatesCalculator

const styles = (theme,fSize) =>
({
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginBottom:'5px'
  },
  icon:
  {
     fontSize:'14px',
     color:Colors.get('icons', theme),
     marginRight:'18px'
  },
  cP :
    {
      display:'flex',
      flexDirection:'column',
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius:"24px",
      backgroundColor:Colors.get('bottomPanel', theme),
      width:"100%",
      height:"90vh"
  },
simplePanelRow:
{
  width:'75vw',
  display:'flex',
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-around',
},
slider:
{
  width:'80%',
  userSelect: 'none',
  touchAction: 'none',
  color:Colors.get('icons', theme),
  backgroundColor:'rgba(0,0,0,0.2)',
},
})
const Plate = ({ index }) => {
  const plates = ['50','25','20','15','10','5','2.5','1.25'];
  const platesWidth = ['10vw','9vw','7vw','7vw','6vw','5vw','4vw','3vw'];
  const platesHeight = ['35vw','35vw','35vw','30vw','27vw','20vw','17vw','13vw'];
  const colors = ['#2ba435ff','#a42b2bff','#6c6c6cff','#a4942bff','#2b47a4ff','#2b98a4ff','#2ba44dff','#7e2ba4ff'];

  // Safety
  if (index < 0 || index >= plates.length) return null;

  return (
    <div style={{
      width: platesWidth[index],
      height: platesHeight[index],
      backgroundColor: colors[index],
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ fontSize: '8px', color: '#fffef9ff' }}>
        {plates[index]}
      </div>
    </div>
  );
};
const ChoosenPlate = ({index,ownPlate,theme , onClick}) => {
   const colors = ['#2ba435ff','#a42b2bff','#6c6c6cff','#a4942bff','#2b47a4ff','#2b98a4ff','#2ba44dff','#7e2ba4ff'];
   const plates = ['50','25','20','15','10','5','2.5','1.25'];
   const s = window.innerWidth / 12;
   return (
        <div onClick={onClick} style={{width:s,height:s,backgroundColor:ownPlate ? colors[index] : '#242323ff',borderRadius:'50%',border:`2px solid  ${Colors.get('border', theme)}`,display:'flex',alignItems:'center',margin:'2px',justifyContent:'center',position:'relative'}}>
            <div style={{fontSize:'18px',color:ownPlate ? '#f1ececff' : '#4e4646ff'}}>{plates[index]}</div>
        </div>
    )
}
