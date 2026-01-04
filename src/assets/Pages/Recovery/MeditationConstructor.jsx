import { useState, useEffect} from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { MdClose , MdDone } from 'react-icons/md';
import { FaCaretLeft, FaCaretRight ,FaTrashAlt } from 'react-icons/fa';
import { useLongPress } from '../../Helpers/LongPress.js';


const MeditationConstructor = ({ theme, langIndex, fSize, setProtocol, show, setShow, showTimer }) => {
  const [meditateSeconds, setMeditateSeconds] = useState(300); // 5 min default
  const [restSeconds, setRestSeconds] = useState(0);         // no rest
  const [cycles, setCycles] = useState(1);

  const increment = (setter, current, min = 0, max = 3600, step = 30) => {
    setter(prev => Math.min(max, Math.max(min, prev + step)));
  };

  const decrement = (setter, current, min = 0, max = 3600, step = 30) => {
    setter(prev => Math.min(max, Math.max(min, prev - step)));
  };

  const formatTime = (seconds) => {
    if (seconds === 0) return langIndex === 0 ? 'нет' : 'none';
    const mins = seconds / 60;
    return `${mins} ${langIndex === 0 ? 'мин' : 'min'}`;
  };

  const formProtocol = () => {
    const strategy = langIndex === 0
      ? `${meditateSeconds / 60} мин медитации${restSeconds > 0 ? `, ${restSeconds / 60} мин отдыха` : ''} ×${cycles}`
      : `${meditateSeconds / 60} min meditation${restSeconds > 0 ? `, ${restSeconds / 60} min rest` : ''} ×${cycles}`;

    const newProtocol = {
      name: langIndex === 0 ? ['Своя медитация'] : ['Custom meditation'],
      aim: langIndex === 0
        ? ['Развить осознанность и снизить стресс']
        : ['Develop mindfulness and reduce stress'],
      instructions: langIndex === 0
        ? ['Сосредоточьтесь на дыхании или просто наблюдайте за мыслями без оценки.']
        : ['Focus on your breath or simply observe thoughts without judgment.'],
      levels: [{
        cycles,
        strategy,
        steps: [{ meditateSeconds, restSeconds }]
      }]
    };

    setProtocol(newProtocol);
    setShow(false);
    showTimer(true);
  };

  return (
    <div style={{
      ...styles(theme).container,
      transform: show ? 'translateX(0)' : 'translateX(-100%)',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      transition: 'transform 0.3s ease-in-out, background-color 0.1s ease-in-out',
    }}>
      <div style={styles(theme).panel}>
        <div style={{
          fontSize: fSize === 0 ? '15px' : '18px',
          color: Colors.get('mainText', theme),
          fontWeight: 'bold',
          marginBottom: '15px'
        }}>
          {langIndex === 0 ? 'Конструктор медитации' : 'Meditation Constructor'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '90%', gap: '16px', alignItems: 'center' }}>
          {/* Meditate Duration */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={styles(theme, fSize).text}>
              {langIndex === 0 ? 'Медитация' : 'Meditate'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => decrement(setMeditateSeconds, meditateSeconds, 60)}
                style={{ cursor: 'pointer' }}
              >
                <FaCaretLeft style={{ fontSize: '20px', color: Colors.get('icons', theme) }} />
              </div>
              <span style={styles(theme, fSize).text}>
                {formatTime(meditateSeconds)}
              </span>
              <div
                onClick={() => increment(setMeditateSeconds, meditateSeconds, 60)}
                style={{ cursor: 'pointer' }}
              >
                <FaCaretRight style={{ fontSize: '20px', color: Colors.get('icons', theme) }} />
              </div>
            </div>
          </div>

          {/* Rest Duration */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={styles(theme, fSize).text}>
              {langIndex === 0 ? 'Отдых' : 'Rest'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => decrement(setRestSeconds, restSeconds, 0)}
                style={{ cursor: 'pointer' }}
              >
                <FaCaretLeft style={{ fontSize: '20px', color: Colors.get('icons', theme) }} />
              </div>
              <span style={styles(theme, fSize).text}>
                {formatTime(restSeconds)}
              </span>
              <div
                onClick={() => increment(setRestSeconds, restSeconds, 0, 600)}
                style={{ cursor: 'pointer' }}
              >
                <FaCaretRight style={{ fontSize: '20px', color: Colors.get('icons', theme) }} />
              </div>
            </div>
          </div>

          {/* Cycles */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={styles(theme, fSize).text}>
              {langIndex === 0 ? 'Циклы' : 'Cycles'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => setCycles(prev => Math.max(1, prev - 1))}
                style={{ cursor: 'pointer' }}
              >
                <FaCaretLeft style={{ fontSize: '20px', color: Colors.get('icons', theme) }} />
              </div>
              <span style={styles(theme, fSize).text}>{cycles}</span>
              <div
                onClick={() => setCycles(prev => Math.min(10, prev + 1))}
                style={{ cursor: 'pointer' }}
              >
                <FaCaretRight style={{ fontSize: '20px', color: Colors.get('icons', theme) }} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: '24px'
        }}>
          <MdClose
            onClick={() => setShow(false)}
            style={{ fontSize: '42px', color: Colors.get('icons', theme), cursor: 'pointer' }}
          />
          <MdDone
            onClick={formProtocol}
            style={{ fontSize: '42px', color: Colors.get('icons', theme), cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};
export default MeditationConstructor;

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
    height: "60vh",
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
