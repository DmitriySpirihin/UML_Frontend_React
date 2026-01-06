import { useState, useEffect} from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { MdClose , MdDone } from 'react-icons/md';
import { FaCaretLeft, FaCaretRight ,FaTrash } from 'react-icons/fa';
import { useLongPress } from '../../Helpers/LongPress.js';


const BreathingConstructor = ({theme, langIndex, fSize, setProtocol, show, setShow, showTimer}) => {
    const [myprotocol, setMyprotocol] = useState({
        name: ['Своя дыхательная сессия', 'Custom breathing practice'], 
        aim: [''], 
        instructions: [''],
        levels: [{ cycles: 0, strategy: '', steps: [] }]
    });
    const [steps, setSteps] = useState([]);
    const [cycles, setCycles] = useState(1);
    const [inoutAmount,setInOutAmount] = useState(1);
    const [isProtocolComplete, setIsProtocolComplete] = useState(false);
    // Move useLongPress hooks to component level
    const incBind = useLongPress(() => {
        if (activeStepIndex !== null) {
            addTime(activeStepIndex, 'up');
        }
    });
    const decBind = useLongPress(() => {
        if (activeStepIndex !== null) {
            addTime(activeStepIndex, 'down');
        }
    });
    const [activeStepIndex, setActiveStepIndex] = useState(null);
function formProtocol() {
  const expandedSteps = [];

  steps.forEach(step => {
    const [typeLabel, value] = Object.entries(step)[0];

    // Map label to correct key
    const labelToKey = {
      'вдох': 'in',
      'выдох': 'out',
      'задержка': 'hold',
      'отдых': 'rest',
      'inhale': 'in',
      'exhale': 'out',
      'hold': 'hold',
      'rest': 'rest',
      'вдох/выдох': 'inout',
      'inhale/exhale': 'inout'
    };

    const key = labelToKey[typeLabel] || 'rest';
    const duration = typeof value === 'object' ? value.duration : value;
    const amount = typeof value === 'object' ? value.amount || 1 : 1;

    // Ensure duration is a number
    const numDuration = Number(duration);
    const numAmount = Number(amount);

    if (key === 'inout') {
      // Expand into in + out pairs
      for (let i = 0; i < numAmount; i++) {
        expandedSteps.push({ in: numDuration });
        expandedSteps.push({ out: numDuration });
      }
    } else {
      expandedSteps.push({ [key]: numDuration });
    }
  });

  // Validate and clean
  const cleanSteps = expandedSteps.map(step => {
    const [k, v] = Object.entries(step)[0];
    return { [k]: typeof v === 'number' && !isNaN(v) ? v : 4000 };
  });

  const strategy = cleanSteps
    .map(s => (s.in ?? s.out ?? s.hold ?? s.rest) / 1000)
    .map(t => t.toFixed(1))
    .join(',');

  const newProtocol = {
    name: langIndex === 0 
      ? ['Своя дыхательная сессия'] 
      : ['Custom breathing practice'],
    aim: langIndex === 0 
      ? ['Улучшить контроль дыхания и снизить уровень стресса'] 
      : ['Improve breath control and reduce stress levels'],
    instructions: langIndex === 0 
      ? ['Следуйте ритму: вдох — выдох. Сохраняйте спокойствие и фокус.'] 
      : ['Follow the rhythm: inhale — exhale. Stay calm and focused.'],
    levels: [{
      cycles: Math.max(1, Number(cycles)),
      strategy,
      steps: cleanSteps
    }]
  };

  setMyprotocol(newProtocol);
  setProtocol(newProtocol);
  setIsProtocolComplete(true);
  setShow(false);
  showTimer(true);
}
function addStep(stepType) {
  const defaultDurations = [4000, 4000, 1500, 4000, 2000]; // 0:in, 1:out, 2:inout, 3:hold, 4:rest
  const keyMap = ['in', 'out', 'inout', 'hold', 'rest'];
  const key = keyMap[stepType];

  let newStep;
  if (key === 'inout') {
    newStep = {
      [langIndex === 0 ? 'вдох/выдох' : 'inhale/exhale']: {
        duration: defaultDurations[stepType],
        amount: inoutAmount
      }
    };
  } else {
    // Use localized label for UI, but we'll convert to key later in formProtocol
    const labelMap = [
      { 0: 'вдох', 1: 'выдох', 2: 'вдох/выдох', 3: 'задержка', 4: 'отдых' },
      { 0: 'inhale', 1: 'exhale', 2: 'inhale/exhale', 3: 'hold', 4: 'rest' }
    ];
    const label = labelMap[langIndex][stepType];
    newStep = { [label]: defaultDurations[stepType] };
  }

  setSteps(prev => [...prev, newStep]);
  if (steps.length === 0) setIsProtocolComplete(true);
}
function addTime(index, dir, field = 'duration') {
  setSteps(prev => {
    const newSteps = [...prev];
    const stepEntry = { ...newSteps[index] };
    const [type, value] = Object.entries(stepEntry)[0];

    let newValue;
    if (typeof value === 'object' && value !== null) {
      // This is an in/out step (has duration and amount)
      newValue = { ...value };
      const delta = dir === 'up' ? (field === 'duration' ? 500 : 1) : (field === 'duration' ? -500 : -1);
      let next = newValue[field] + delta;

      // Clamp values
      if (field === 'duration') {
        next = Math.min(300000, Math.max(1000, next));
      } else if (field === 'amount') {
        next = Math.max(1, next); // at least 1 pair
      }
      newValue[field] = next;
    } else {
      // Regular step (just a number)
      const delta = dir === 'up' ? 500 : -500;
      newValue = Math.min(300000, Math.max(1000, value + delta));
    }

    newSteps[index] = { [type]: newValue };
    return newSteps;
  });
}
function onDelete(index) {
  setSteps(prev => {
    const newSteps = [...prev];
    newSteps.splice(index, 1);
    return newSteps;
  });
}

    return (
    <div style={{
        ...styles(theme).container,
        transform: show ? 'translateX(0)' : 'translateX(-100%)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        transition: 'transform 0.3s ease-in-out, background-color 0.1s ease-in-out',
    }}>
        <div style={styles(theme).panel}>
            <div style={{fontSize: fSize === 0 ? '15px' : '18px', color: Colors.get('mainText', theme), fontWeight: 'bold',marginBottom:'15px'}}>
                {langIndex === 0 ? 'Конструктор' : 'Constructor'}
            </div>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%'}}>
                <div onClick={() => addStep(0)} style={{...styles(theme, fSize).button, border: `2px solid ${Colors.get('in', theme)}`}}>
                    <div style={{fontSize: fSize === 0 ? '14px' : '16px', color: Colors.get('in', theme)}}>
                        {langIndex === 0 ? 'вдох' : 'in'}
                    </div>
                </div>
                <div onClick={() => addStep(1)} style={{...styles(theme, fSize).button, border: `2px solid ${Colors.get('out', theme)}`}}>
                    <div style={{fontSize: fSize === 0 ? '14px' : '16px', color: Colors.get('out', theme)}}>
                        {langIndex === 0 ? 'выдох' : 'out'}
                    </div>
                </div>
                <div onClick={() => addStep(2)} style={{...styles(theme, fSize).button, border: `2px solid ${Colors.get('reload', theme)}`}}>
                    <div style={{fontSize: fSize === 0 ? '14px' : '16px', color: Colors.get('reload', theme)}}>
                        {langIndex === 0 ? 'вдох/выдох' : 'in/out'}
                    </div>
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%'}}>
                <div onClick={() => addStep(3)} style={{...styles(theme, fSize).button, border: `2px solid ${Colors.get('hold', theme)}`}}>
                    <div style={{fontSize: fSize === 0 ? '14px' : '16px', color: Colors.get('hold', theme)}}>
                        {langIndex === 0 ? 'задержка' : 'hold'}
                    </div>
                </div>
                <div onClick={() => addStep(4)} style={{...styles(theme, fSize).button, border: `2px solid ${Colors.get('rest', theme)}`}}>
                    <div style={{fontSize: fSize === 0 ? '14px' : '16px', color: Colors.get('rest', theme)}}>
                        {langIndex === 0 ? 'отдых' : 'rest'}
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent:'space-evenly', alignItems: 'center',width:'90%' }}>
              <span style={styles(theme,fSize).text}>{langIndex === 0 ? "циклов" : 'cycles'}</span>
             <div onClick={(e) => {e.stopPropagation();setCycles(prev => prev-1 > 1 ? prev-1 : 1);}} style={{  display: 'flex', alignItems: 'center',userSelect: 'none',touchAction: 'none' }}>
               <FaCaretLeft style={{fontSize:'54px',color:Colors.get('icons', theme)}}/></div> 
                 <span style={styles(theme,fSize).text}>{cycles}</span>
                 <div   onClick={(e) => {e.stopPropagation();setCycles(prev => prev+1);}} style={{ userSelect: 'none',touchAction: 'none', display: 'flex', alignItems: 'center' }}>
                 <FaCaretRight style={{fontSize:'54px',color:Colors.get('icons', theme)}}/></div> </div>
            <div style={{
                width: '99%',
                height: '65%',
                overflowY: 'scroll',
                overflowX:'hidden',
                borderTop: `1px solid ${Colors.get('border', theme)}`,
                borderBottom: `1px solid ${Colors.get('border', theme)}`,
                padding: '16px',
                fontSize: fSize === 0 ? '14px' : '16px',
                color: Colors.get('mainText', theme),
                textAlign: 'left'
            }}>
              <div style={{ textAlign: 'center',fontSize:fSize === 0 ? '14px' : '16px',marginBottom:'16px',fontWeight:'bold', color: Colors.get('mainText', theme) }}>
                        {langIndex === 0 ? 'порядок выполнения' : 'breathing order'}
                    </div>
                {steps.map((step, index) => {
  const [type, value] = Object.entries(step)[0];
  const isInOut = type.includes('вдох/выдох') || type.includes('inhale/exhale');
  // color here
  return (
    <div 
      key={index} 
      style={{ 
        display: 'flex', 
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: activeStepIndex === index ? Colors.get('backgroundLight', theme) : 'transparent',
        borderRadius: '4px'
      }}
      onClick={() => setActiveStepIndex(index === activeStepIndex ? null : index)}
    >
      <FaTrash 
        onClick={() => onDelete(index)} 
        style={{ fontSize: '15px', color: Colors.get('icons', theme), marginRight:'16px' }} 
      />
      <div style={styles(theme, fSize).text}>{type}</div>

      <div style={{ display: 'flex', flexDirection: 'row', width: '50%', alignItems: 'center',justifyContent: 'space-between' }}>
        {/* Duration control */}
        <div style={{ display: 'flex', alignItems: 'center',width:'100%' ,justifyContent: 'space-between'}}>
          <div 
            {...decBind} 
            onClick={(e) => {
              e.stopPropagation();
              addTime(index, 'down', 'duration');
            }} 
            style={{ userSelect: 'none', touchAction: 'none' }}
          >
            <FaCaretLeft style={{ fontSize: '54px', color: Colors.get('icons', theme) }} />
          </div>
          <div style={styles(theme, fSize).text}>
            {isInOut ? (value.duration / 1000).toFixed(1) : (value / 1000).toFixed(1)}s
          </div>
          <div 
            {...incBind}
            onClick={(e) => {
              e.stopPropagation();
              addTime(index, 'up', 'duration');
            }}
            style={{  userSelect: 'none', touchAction: 'none' }}
          >
            <FaCaretRight style={{ fontSize: '54px', color: Colors.get('icons', theme) }} />
          </div>
        </div>

        
      </div>
      
        

        {/* Amount control — only for in/out */}
        {isInOut ? (
          <div style={{ display: 'flex', alignItems: 'center',width:'30%' ,justifyContent: 'space-between'}}>
            <div 
              {...decBind}
              onClick={(e) => {
                e.stopPropagation();
                addTime(index, 'down', 'amount');
              }}
              style={{  userSelect: 'none', touchAction: 'none' }}
            >
              <FaCaretLeft style={{ fontSize: '54px', color: Colors.get('icons', theme) }} />
            </div>
            <div style={styles(theme, fSize).text}>
              ×{value.amount}
            </div>
            <div 
              {...incBind}
              onClick={(e) => {
                e.stopPropagation();
                addTime(index, 'up', 'amount');
              }}
              style={{ userSelect: 'none', touchAction: 'none' }}
            >
              <FaCaretRight style={{ fontSize: '54px', color: Colors.get('icons', theme) }} />
            </div>
          </div>
        ) : (null)}
    
      
    </div>
    
  );
})}
            </div>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%'}}>
                <MdClose 
                    onClick={() => setShow(false)} 
                    style={{fontSize: '42px', color: Colors.get('icons', theme), cursor: 'pointer'}} 
                />
                <MdDone 
                    onClick={() => {
                        if (isProtocolComplete) {
                            formProtocol();
                        }
                    }} 
                    style={{
                        fontSize: '42px',
                        color: isProtocolComplete ? Colors.get('icons', theme) : Colors.get('disabled', theme),
                        cursor: isProtocolComplete ? 'pointer' : 'not-allowed',
                        opacity: isProtocolComplete ? 1 : 0.5
                    }}
                />
            </div>
        </div>
    </div>
);
}
export default BreathingConstructor;

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
    width:"95vw",
    height: "90vh",
    padding:'5px'
  },
  text :
  {
    textAlign: "center",
    fontSize:fSize ? "13px" : "15px",
    color: Colors.get('mainText', theme),
  },
  button:{
    width:'30%',
    height:'25px',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:'12px'
  }
  
})


