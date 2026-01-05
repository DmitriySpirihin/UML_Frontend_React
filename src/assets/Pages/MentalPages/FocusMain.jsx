import React, { useState, useEffect } from 'react';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$, setPage, premium$ } from '../../StaticClasses/HabitsBus.js';
import { FaStarHalf, FaStar, FaInfinity, FaSpa } from 'react-icons/fa';
import { GiStarsStack, GiCrownedSkull } from 'react-icons/gi';
import { focusTrainingLevels } from './MentalHelper.js';
import MentalGamePanel from './MentalGamePanelFocus.jsx';

const FocusMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [show, setShow] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

  useEffect(() => {
    const subscription = premium$.subscribe(setHasPremium);
    return () => subscription.unsubscribe();
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

  // Safe record lookup
  const getRecord = (levelIndex) => {
    return AppData.mentalRecords?.[3]?.[levelIndex] || 0; // type=3 for focus
  };

  return (
    <div style={styles(theme).container}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
        <div
          style={{
            width: '90%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px', // better spacing
          }}
        >
          {focusTrainingLevels.slice(0, 4).map((protocol, ind) => {
            const cardColor = `difficulty${ind}`;
            const needBlur = ind > 1 && !hasPremium; // levels 2,3 require premium

            return (
              <MenuCard
                key={ind}
                width="46vw"
                difficulty={ind}
                protocol={protocol}
                setLevel={setCurrentLevel}
                color={Colors.get(cardColor, theme)}
                theme={theme}
                lang={langIndex}
                click={() => {
                  if (!needBlur) {
                    setCurrentLevel(ind);
                    setShow(true);
                  }
                }}
                fSize={fSize}
                hasPremium={hasPremium}
                needBlur={needBlur}
                record={getRecord(ind)}
              />
            );
          })}
        </div>
      </div>

      {show && (
        <MentalGamePanel
          type={3}
          difficulty={currentLevel}
          show={show}
          setShow={setShow}
        />
      )}
    </div>
  );
};

export default FocusMain;

// === Styles (unchanged) ===
const styles = (theme, fSize) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    alignItems: 'center',
    height: '78vh',
    paddingTop: '5vh',
    width: '100vw',
    fontFamily: 'Segoe UI',
  },
  mainText: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '15px' : '17px',
    color: Colors.get('mainText', theme),
  },
  cardText: {
    textAlign: 'left',
    marginBottom: '5px',
    fontSize: fSize === 0 ? '14px' : '16px',
    color: Colors.get('mainText', theme),
    marginLeft: '30px',
  },
  text: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '10px' : '12px',
    color: Colors.get('subText', theme),
    marginLeft: '30px',
  },
  btn: {
    width: '70%',
    height: '40px',
    borderRadius: '12px',
    fontSize: fSize === 0 ? '13px' : '14px',
    color: Colors.get('mainText', theme),
    backgroundColor: Colors.get('simplePanel', theme),
  },
});

// === MenuCard ===
function MenuCard({ protocol, difficulty, click, width, color, theme, lang, fSize, hasPremium = false, needBlur = false, record = 0 }) {
  const getIcon = () => {
    if (difficulty === 0) return <FaStarHalf style={backIconStyle(theme)} />;
    if (difficulty === 1) return <FaStar style={backIconStyle(theme)} />;
    if (difficulty === 2) return <GiStarsStack style={backIconStyle(theme)} />;
    if (difficulty === 3) return <GiCrownedSkull style={backIconStyle(theme)} />;
    return null;
  };

  const _style = {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    width: width,
    flexDirection: 'row',
    height: '12vh',
    marginTop: '15px',
    borderRadius: '24px',
    backgroundColor: color,
    position: 'relative',
    overflow:'hidden',
    boxShadow: '3px 3px 2px rgba(0,0,0,0.3)',
    cursor: needBlur ? 'not-allowed' : 'pointer',
    opacity: needBlur ? 0.8 : 1,
  };

  return (
    <div style={_style} onClick={click}>
      {needBlur && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(8px)',
            zIndex: 2,
          }}
        >
          <div style={{ ...styles(theme, fSize).mainText }}>
            {lang === 0 ? 'Про категория' : 'Pro category'}
          </div>
          <div style={{ ...styles(theme, fSize).mainText }}>👑 {lang === 0 ? 'премиум' : 'premium'} 👑</div>
          <button onClick={() => setPage('premium')} style={{ ...styles(theme, fSize).btn }}>
            {lang === 0 ? 'Стать премиум' : 'Get premium'}
          </button>
        </div>
      )}

      {/* Record Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          top: '5%',
          right: '10px',
          fontWeight: 'bold',
          fontSize: '14px',
          color: Colors.get('maxValColor', theme),
        }}
      >
        <FaStar style={{ marginRight: '4px' }} />
        {record}
      </div>

      <div
        style={{
          width: '90%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingLeft: '16px',
        }}
      >
        <h2 style={styles(theme, fSize).cardText}>{protocol.level[lang]}</h2>
        {/* ✅ FIXED: use 'title', not 'difficulty' */}
        <p style={styles(theme, fSize).text}>{protocol.title[lang]}</p>
      </div>

      {getIcon()}
    </div>
  );
}

const backIconStyle = (theme) => ({
  fontSize: '86px',
  rotate: '-20deg',
  position: 'absolute',
  right: '-10px',
  top: '30%',
  color: Colors.get('svgColor', theme),
});