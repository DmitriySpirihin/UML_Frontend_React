import { useState, useEffect } from 'react'
import { AppData, UserData } from '../StaticClasses/AppData.js'
import Colors from '../StaticClasses/Colors'
import { theme$, lang$, fontSize$ } from '../StaticClasses/HabitsBus'
import { FaDumbbell, FaStopwatch, FaBed, FaLayerGroup } from 'react-icons/fa6'

const RecomendationTraining = ({ max }) => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [goal, setGoal] = useState(AppData.pData.goal);

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

    // Helper to render the modern card content
    const RenderCard = ({ title, weightRange, rest, recovery, iconColor }) => (
        <div style={styles(theme).cardBody}>
            {/* Header / Goal Title */}
            <div style={styles(theme).cardHeaderRow}>
                <div style={{...styles(theme).iconBox, backgroundColor: iconColor}}>
                    <FaLayerGroup style={{color: '#fff', fontSize: '18px'}}/>
                </div>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={styles(theme, fSize).subtext}>{langIndex === 0 ? 'Ваша цель' : 'Current Goal'}</span>
                    <span style={{...styles(theme, fSize).text, fontSize: '20px', fontWeight: 'bold', margin:0}}>{title}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles(theme).gridContainer}>
                
                {/* Weight & Reps */}
                <div style={styles(theme).statBox}>
                    <div style={styles(theme).statHeader}>
                        <FaDumbbell style={{color: Colors.get('icons', theme), fontSize:'14px'}}/>
                        <span style={styles(theme, fSize).subtext}>{langIndex === 0 ? 'Нагрузка' : 'Load'}</span>
                    </div>
                    <span style={{...styles(theme, fSize).text, fontWeight:'bold', fontSize:'16px'}}>{weightRange}</span>
                </div>

                {/* Rest */}
                <div style={styles(theme).statBox}>
                    <div style={styles(theme).statHeader}>
                        <FaStopwatch style={{color: Colors.get('icons', theme), fontSize:'14px'}}/>
                        <span style={styles(theme, fSize).subtext}>{langIndex === 0 ? 'Отдых' : 'Rest'}</span>
                    </div>
                    <span style={{...styles(theme, fSize).text, fontWeight:'bold', fontSize:'16px'}}>{rest}</span>
                </div>

                {/* Recovery */}
                <div style={styles(theme).statBox}>
                    <div style={styles(theme).statHeader}>
                        <FaBed style={{color: Colors.get('icons', theme), fontSize:'14px'}}/>
                        <span style={styles(theme, fSize).subtext}>{langIndex === 0 ? 'Восстан.' : 'Recovery'}</span>
                    </div>
                    <span style={{...styles(theme, fSize).text, fontWeight:'bold', fontSize:'16px'}}>{recovery}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles(theme).container}>
            <div style={{ ...styles(theme, fSize).text, marginTop: '20px', marginBottom: '15px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>
                {langIndex === 0 ? 'Рекомендации для вас' : 'Personal recomendations'}
            </div>

            <div style={styles(theme).cardContainer}>
                {goal === 1 && (
                    <RenderCard 
                        title={langIndex === 0 ? 'Сила' : 'Strength'}
                        weightRange={`${Math.round(max * 0.85)} - ${Math.round(max * 0.95)} ${langIndex === 0 ? 'кг' : 'kg'} / 3-6 ${langIndex === 0 ? 'повт.' : 'reps'}`}
                        rest={langIndex === 0 ? '3-5 мин' : '3-5 min'}
                        recovery={langIndex === 0 ? '72 ч' : '72 h'}
                        iconColor={Colors.get('maxValColor', theme)}
                    />
                )}
                {goal === 0 && (
                    <RenderCard 
                        title={langIndex === 0 ? 'Набор массы' : 'Muscle Gain'}
                        weightRange={`${Math.round(max * 0.68)} - ${Math.round(max * 0.82)} ${langIndex === 0 ? 'кг' : 'kg'} / 10-12 ${langIndex === 0 ? 'повт.' : 'reps'}`}
                        rest={langIndex === 0 ? '1.5-2 мин' : '1.5-2 min'}
                        recovery={langIndex === 0 ? '48 ч' : '48 h'}
                        iconColor={Colors.get('done', theme)}
                    />
                )}
                {goal === 2 && (
                    <RenderCard 
                        title={langIndex === 0 ? 'Сушка / Рельеф' : 'Drying / Cutting'}
                        weightRange={`${Math.round(max * 0.5)} - ${Math.round(max * 0.65)} ${langIndex === 0 ? 'кг' : 'kg'} / 14-20+ ${langIndex === 0 ? 'п.' : 'r.'}`}
                        rest={langIndex === 0 ? '30-60 сек' : '30-60 sec'}
                        recovery={langIndex === 0 ? '24-48 ч' : '24-48 h'}
                        iconColor={Colors.get('skipped', theme)}
                    />
                )}
                {goal === 3 && (
                    <RenderCard 
                        title={langIndex === 0 ? 'Поддержание' : 'Maintenance'}
                        weightRange={`${Math.round(max * 0.6)} - ${Math.round(max * 0.7)} ${langIndex === 0 ? 'кг' : 'kg'} / 10-14 ${langIndex === 0 ? 'п.' : 'r.'}`}
                        rest={langIndex === 0 ? '1-2 мин' : '1-2 min'}
                        recovery={langIndex === 0 ? '72 ч' : '72 h'}
                        iconColor={Colors.get('icons', theme)}
                    />
                )}
            </div>
        </div>
    )
}

export default RecomendationTraining

const styles = (theme, fSize) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        padding: '10px 0'
    },
    text: {
        fontSize: fSize === 0 ? '14px' : '16px',
        color: Colors.get('mainText', theme),
    },
    subtext: {
        fontSize: fSize === 0 ? '11px' : '13px',
        color: Colors.get('subText', theme),
        marginBottom: '2px'
    },
    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        width: '94%',
        backgroundColor: Colors.get('bottomPanel', theme),
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        position: 'relative'
    },
    cardBody: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    cardHeaderRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: `1px solid ${Colors.get('border', theme)}`
    },
    iconBox: {
        width: '45px',
        height: '45px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr', // First column slightly wider for text
        gap: '10px',
    },
    statBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        border: `1px solid rgba(255,255,255,0.05)`
    },
    statHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '6px',
        opacity: 0.8
    }
})
