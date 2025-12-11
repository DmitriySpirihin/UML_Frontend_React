import  {useState,useEffect} from 'react'
import Colors from '../StaticClasses/Colors'
import {MdClose,MdDone} from 'react-icons/md'
import {TbReload} from 'react-icons/tb'
import {FaPlay,FaSquare} from 'react-icons/fa6'
import Slider from '@mui/material/Slider';

const Stopwatch = ({theme,langIndex,setTime,setShowPanel}) => {

const [time,setCurrentTime] = useState(0);
const [wantedTime,setWantedTime] = useState(60000);
const [fillAmount, setFillAmount] = useState(0.0);
const [isStarted,setIsStarted] = useState(false);
const radius = 55;
const circumference = 2 * Math.PI * radius;
useEffect(() => {
    setFillAmount(Math.min(time / wantedTime,1));
}, [time,wantedTime]);
useEffect(() => {
  if (!isStarted) return;
  const interval = setInterval(() => {
    setCurrentTime(prev => prev + 100);
  }, 100);

  return () => clearInterval(interval);
}, [isStarted]);
const reload = () => {
    setCurrentTime(0);
    setIsStarted(false);
}
const onAccept = () => {
    reload();
    setTime(time);
    setShowPanel(false);
}
return (
    <div style={{...styles(theme).cP,height:'60%'}}>
        <div style={{display:'flex',flexDirection:'column',width:'100%',alignContent:'center',alignItems:'center'}}>
        <div style={{...styles(theme).text,fontSize:'18px'}}>{langIndex === 0 ? 'Желаемое время: ' : 'Wanted time: '}{Math.floor(wantedTime / 60000)}:{Math.floor((wantedTime % 60000) / 1000).toString().padStart(2, '0')}</div>
        <Slider style={{...styles(theme).slider,zIndex:3}} min={30}max={3600}step={30} value={wantedTime / 1000}valueLabelDisplay="off"onChange={(_, newValue) => { setWantedTime(newValue * 1000); }}/>
        </div>
        {/* svg */}
        <svg width="100vw" height="100vw" viewBox="0 0 150 150" style={{zIndex:2,position:'fixed',top:'27%'}}>
            <circle stroke={Colors.get('progressBar', theme)} fill="none" strokeWidth="5" r={radius} cx="75" cy="75"/>
            <circle className="smooth-stroke" stroke={getColor(theme,fillAmount)} fill="none" strokeWidth="5" r={radius} cx="75" cy="75" 
            strokeDasharray={circumference} strokeDashoffset={(circumference + (-fillAmount * circumference))} 
            style={{transition: 'stroke 1s linear, stroke-dashoffset 1s linear'}}   />
            {time > 0 && <text x="75" y="45" textAnchor="middle" dominantBaseline="middle" fontSize="14" fill={getColor(theme,fillAmount)}>{formatDurationWantedMs(time,wantedTime)}</text>}
            <text x="75" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="28" fill={Colors.get('mainText', theme)}>{formatDurationMs(time)}</text>
        </svg>
        {!isStarted && <div style={{display:'flex',flexDirection:'row',marginTop:'45%',alignItems:'center',justifyContent:'center'}}>
          <TbReload onClick={() => {reload()}} style={{fontSize:'40px',color:Colors.get('icons', theme),zIndex:3}}/>
          <FaPlay onClick={() => {setIsStarted(true)}} style={{fontSize:'40px',zIndex:3,color:Colors.get('done', theme),marginLeft:'12px'}}/>
        </div>}
        {isStarted && <FaSquare onClick={() => {setIsStarted(false)}} style={{fontSize:'40px',zIndex:3,color:Colors.get('skipped', theme),marginTop:'45%'}}/>}
        <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
        <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {setShowPanel(false)}}/>
        <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onAccept()}}/>
     </div>
    </div>
)
}
export default Stopwatch

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
function formatDurationMs(duration) {
  if (duration < 0) duration = 0;

  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
function formatDurationWantedMs(duration, wantedTime) {
  if (duration < 0) duration = 0;
  if (wantedTime <= 0) return formatDurationMs(duration); // fallback

  const remainingMs = wantedTime - duration;

  if (remainingMs > 0) {
    // show remaining time
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    //show extra time with +
    const extraMs = -remainingMs; // same as (duration - wantedTime)
    const totalExtraSeconds = Math.floor(extraMs / 1000);
    const extraMinutes = Math.floor(totalExtraSeconds / 60);
    const extraSeconds = totalExtraSeconds % 60;
    
    if (extraMinutes > 0) {
      return `+${extraMinutes}:${extraSeconds.toString().padStart(2, '0')}`;
    } else {
      return `+${extraSeconds.toString().padStart(2, '0')}`;
    }
  }
}
const getColor = (theme,fillAmount) => {
  if(fillAmount < 0.5) return Colors.get('skipped', theme);
  if(fillAmount < 0.99) return Colors.get('icons', theme);
  return Colors.get('done', theme);
}