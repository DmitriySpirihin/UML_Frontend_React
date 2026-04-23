import React, { useEffect, useState } from 'react'
import { AppData, UserData } from '../StaticClasses/AppData'
import { motion, AnimatePresence } from 'framer-motion'
import Colors, { THEME } from "../StaticClasses/Colors";
import TelegramIcon from '@mui/icons-material/Telegram';
import { sendBugreport } from '../StaticClasses/NotificationsManager'
import { FaAddressCard, FaLanguage, FaHighlighter, FaVolumeMute, FaVolumeUp, FaBug, FaCrown, FaChevronRight } from 'react-icons/fa'
import { LuVibrate, LuVibrateOff } from 'react-icons/lu'
import { RiFontSize2 } from 'react-icons/ri'
import { clearAllSaves } from '../StaticClasses/SaveHelper';
import { MdBackup, MdInfoOutline } from 'react-icons/md'
import { IoIosArrowBack } from 'react-icons/io'
import { setTheme as setGlobalTheme, theme$, premium$, setLang, lang$, vibro$, sound$, fontSize$, setFontSize, setPage, lastPage$ } from '../StaticClasses/HabitsBus';
import { cloudBackup, cloudRestore, deleteCloudBackup } from '../StaticClasses/NotificationsManager';

const transitionSound = new Audio('Audio/Transition.wav');
const version = '2.c.88.1.s';
const HEADER_TOP_PADDING = 'calc(env(safe-area-inset-top, 0px) + 18px)';

const Settings = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [sound, setSound] = useState(1);
    const [vibro, setVibro] = useState(0);
    const [fSize, setFSize] = useState(0);
    const [additionalPanel, setAdditionalPanel] = useState(false);
    const [additionalPanelNum, setAdditionalPanelNum] = useState(1);
    const [hasPremium, setHasPremium] = useState(false);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            lang$.subscribe((l) => setLangIndex(l === 'ru' ? 0 : 1)),
            sound$.subscribe(setSound),
            vibro$.subscribe(setVibro),
            fontSize$.subscribe(setFSize),
            premium$.subscribe(setHasPremium),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1001, paddingBottom: '100px', overflowY: 'auto', backgroundColor: Colors.get('background', theme) }}
        >
            <style>{`@keyframes shine-effect { 0% { left: -100%; } 20% { left: 100%; } 100% { left: 100%; } }`}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: `${HEADER_TOP_PADDING} 20px 20px`, minHeight: '76px', borderBottom: `1px solid ${Colors.get('border', theme)}` }}>
                <motion.div
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setPage(lastPage$.value || 'MainMenu'); playEffects(transitionSound); }}
                    style={{ width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0, backgroundColor: Colors.get('bottomPanel', theme), display: 'flex', alignItems: 'center', justifyContent: 'center', color: Colors.get('icons', theme) }}
                >
                    <IoIosArrowBack size={20} />
                </motion.div>
                <UserPanelInner theme={theme} fSize={fSize} />
            </div>

            {/* Settings list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0' }}>
                {!hasPremium ? (
                    <motion.div style={s(theme).premiumEl} whileTap={{ scale: 0.98 }} onClick={() => { setPage('premium'); playEffects(null); }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', borderRadius: '20px' }}>
                            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent)', transform: 'skewX(-20deg)', animation: 'shine-effect 4s infinite' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
                            <div style={{ ...s(theme).iconBox, border: '1px solid #E0AA3E', color: '#E0AA3E' }}><FaCrown size={18} /></div>
                            <p style={s(theme, fSize).premiumText}>{langIndex === 0 ? 'Премиум версия' : 'Premium Version'}</p>
                        </div>
                        <FaChevronRight color="#E0AA3E" size={14} style={{ zIndex: 2 }} />
                    </motion.div>
                ) : (
                    <SettingsItem theme={theme} fSize={fSize} icon={<FaCrown />} label={langIndex === 0 ? 'Премиум' : 'Premium'} value={langIndex === 0 ? 'Активен' : 'Active'} color="#E0AA3E" onClick={() => { setPage('premium'); playEffects(null); }} />
                )}

                <SettingsItem theme={theme} fSize={fSize} icon={<FaLanguage />} label={langIndex === 0 ? 'Язык' : 'Language'} value={langIndex === 0 ? 'Русский' : 'English'} color="#4DA6FF"
                    onClick={() => { changeSettings(0); const n = langIndex === 0 ? 1 : 0; setLang(n === 0 ? 'ru' : 'en'); AppData.setPrefs(0, n); }} />
                <SettingsItem theme={theme} fSize={fSize} icon={<FaHighlighter />} label={langIndex === 0 ? 'Тема' : 'Theme'} value={getThemeShortName(langIndex, theme)} color="#A64DFF"
                    onClick={() => { changeSettings(1); playEffects(null); }} />
                <SettingsItem theme={theme} fSize={fSize} icon={<RiFontSize2 />} label={langIndex === 0 ? 'Шрифт' : 'Font Size'} value={fSize === 0 ? (langIndex === 0 ? 'Малый' : 'Small') : (langIndex === 0 ? 'Обычный' : 'Regular')} color="#FF4D88"
                    onClick={() => changeSettings(4, fSize)} />
                <SettingsItem theme={theme} fSize={fSize} icon={sound === 0 ? <FaVolumeUp /> : <FaVolumeMute />} label={langIndex === 0 ? 'Звук' : 'Sound'} value={sound === 0 ? (langIndex === 0 ? 'Вкл' : 'On') : (langIndex === 0 ? 'Выкл' : 'Off')} color="#00E5FF" isActive={sound === 0}
                    onClick={() => { changeSettings(2); setSound(sound === 0 ? 1 : 0); }} />
                <SettingsItem theme={theme} fSize={fSize} icon={vibro === 0 ? <LuVibrate /> : <LuVibrateOff />} label={langIndex === 0 ? 'Вибрация' : 'Haptics'} value={vibro === 0 ? (langIndex === 0 ? 'Вкл' : 'On') : (langIndex === 0 ? 'Выкл' : 'Off')} color="#FFD700" isActive={vibro === 0}
                    onClick={() => { changeSettings(3); setVibro(vibro === 0 ? 1 : 0); playEffects(null); }} />
                <SettingsItem theme={theme} fSize={fSize} icon={<FaBug />} label={langIndex === 0 ? 'Ошибка' : 'Bug Report'} color="#FF4D4D"
                    onClick={() => { setAdditionalPanel(true); setAdditionalPanelNum(1); }} />
                <SettingsItem theme={theme} fSize={fSize} icon={<FaAddressCard />} label={langIndex === 0 ? 'Контакты' : 'Contacts'} color="#4DFF88"
                    onClick={() => { setAdditionalPanel(true); setAdditionalPanelNum(3); playEffects(null); }} />
                <SettingsItem theme={theme} fSize={fSize} icon={<MdBackup />} label={langIndex === 0 ? 'Бекап' : 'Backup'} color="#FFA64D"
                    onClick={() => { setAdditionalPanel(true); setAdditionalPanelNum(4); }} />
                <SettingsItem theme={theme} fSize={fSize} icon={<MdInfoOutline />} label={langIndex === 0 ? 'Как пользоваться' : 'How to use'} color="#8b98ff"
                    onClick={() => { setPage('InfoPanel'); playEffects(null); }} />
            </div>

            <div style={{ fontSize: '10px', textAlign: 'right', marginRight: '55px', color: Colors.get('subText', theme), fontFamily: 'Segoe UI', marginBottom: '10px' }}>{version}</div>

            <AdditionalPanel theme={theme} langIndex={langIndex} isOpen={additionalPanel} setIsOpen={setAdditionalPanel} panelNum={additionalPanelNum} />
        </motion.div>
    );
};

const UserPanelInner = ({ theme, fSize }) => {
    const [hasPremium, setHasPremium] = useState(false);
    useEffect(() => {
        const sub = premium$.subscribe(setHasPremium);
        return () => sub.unsubscribe();
    }, []);
    return (
        <div onClick={() => setPage('UserPanel')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '20px', border: `1px solid ${hasPremium ? '#FFD700' : Colors.get('border', theme)}`, padding: '6px', position: 'relative' }}>
                {UserData.photo ? (
                    <img src={UserData.photo} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} alt="user" />
                ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: '900' }}>
                        {UserData.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                {hasPremium && (
                    <div style={{ position: 'absolute', bottom: '0px', right: '0px', backgroundColor: '#FFD700', color: '#000', width: '20px', height: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: '2px solid #000', zIndex: 1 }}>
                        <FaCrown size={10} />
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '8px' }}>
                {hasPremium && <div style={{ color: '#FFD700', fontSize: '10px', fontFamily: 'Segoe UI', fontWeight: 'bold' }}>PREMIUM</div>}
                <div style={{ color: Colors.get('subText', theme), fontSize: fSize === 0 ? '16px' : '18px', fontFamily: 'Segoe UI' }}>{UserData.name}</div>
            </div>
        </div>
    );
};

const SettingsItem = ({ theme, fSize, icon, label, value, onClick, color, isActive = true }) => (
    <motion.div style={s(theme).listEl} whileTap={{ scale: 0.97 }} onClick={onClick}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...s(theme).iconBox, color: isActive ? color : Colors.get('subText', theme), backgroundColor: isActive ? (color + '22') : Colors.get('background', theme), border: `1px solid ${isActive ? (color + '44') : 'transparent'}` }}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <p style={s(theme, fSize).textNoMargin}>{label}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {value && <span style={{ fontSize: '13px', color: isActive ? Colors.get('mainText', theme) : Colors.get('subText', theme), fontWeight: 500, opacity: isActive ? 0.8 : 0.5 }}>{value}</span>}
            <FaChevronRight size={12} color={Colors.get('subText', theme)} style={{ opacity: 0.4 }} />
        </div>
    </motion.div>
);

const AdditionalPanel = ({ theme, langIndex, isOpen, setIsOpen, panelNum }) => {
    const [report, setReport] = useState('');
    const [showDanger, setShowDanger] = useState(false);
    const sendReport = () => { sendBugreport(report); setReport(''); };
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }} animate={{ x: '0%' }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ ...s(theme).panel, width: '100vw', height: '100vh', borderRadius: '0', left: 0, zIndex: 9500, justifyContent: 'flex-start' }}
                >
                    <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => { setIsOpen(false); playEffects(transitionSound); }}
                            style={{ display: 'flex', marginTop: '85px', alignItems: 'center', gap: '5px', padding: '10px', borderRadius: '12px', background: Colors.get('bottomPanel', theme) }}>
                            <FaChevronRight style={{ transform: 'rotate(180deg)' }} />
                            <span style={{ fontFamily: 'Segoe UI', fontSize: '14px' }}>{langIndex === 0 ? 'Назад' : 'Back'}</span>
                        </motion.div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', flexGrow: 1, overflow: 'auto' }}>
                        {panelNum === 1 && (
                            <div style={{ width: '80%', height: '80%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <p style={inputStyles(theme).text}>{langIndex === 0 ? 'Опишите проблему:' : 'Describe problem:'}</p>
                                <textarea maxLength={860} onChange={(e) => setReport(e.target.value)} style={inputStyles(theme).input} rows={5} />
                                {report.length > 0 && <motion.div whileTap={{ scale: 0.95 }} style={{ padding: '15px', borderRadius: '12px', background: '#FF4D4D', color: 'white', textAlign: 'center', fontWeight: 'bold' }} onClick={sendReport}>{langIndex === 0 ? 'Отправить' : 'Send'}</motion.div>}
                            </div>
                        )}
                        {panelNum === 3 && (
                            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                                <div style={{ borderRadius: '36px', width: '65vw', height: '40vw', zIndex: 1, display: 'flex', overflow: 'hidden' }}>
                                    <img src={'images/Our_Faces.png'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <a href={`https://t.me/Diiimaan777`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
                                    <div style={{ padding: '15px', borderRadius: '12px', background: Colors.get('bottomPanel', theme), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <TelegramIcon style={{ color: '#4DA6FF' }} /><span style={inputStyles(theme).text}>Diiimaan777</span>
                                    </div>
                                </a>
                                <a href={`https://t.me/DemianWorkSelf`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
                                    <div style={{ padding: '15px', borderRadius: '12px', background: Colors.get('bottomPanel', theme), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <TelegramIcon style={{ color: '#4DA6FF' }} /><span style={inputStyles(theme).text}>DemianWorkSelf</span>
                                    </div>
                                </a>
                            </div>
                        )}
                        {panelNum === 4 && (
                            <div style={{ width: '85%', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'center' }}>
                                <MdBackup size={50} color={Colors.get('mainText', theme)} style={{ margin: '0 auto' }} />
                                <p style={{ ...inputStyles(theme).text, fontSize: '12px', opacity: 0.7 }}>
                                    {AppData.lastBackupDate === '' || AppData.lastBackupDate === null
                                        ? (langIndex === 0 ? 'Нет копий' : 'No backups')
                                        : AppData.lastBackupDate?.split('T')[0]}
                                </p>
                                <ActionButton text={langIndex === 0 ? 'Создать' : 'Backup'} onClick={cloudBackup} theme={theme} color="#FFA64D" />
                                <ActionButton text={langIndex === 0 ? 'Восстановить' : 'Restore'} onClick={cloudRestore} theme={theme} color="#4DA6FF" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '3px solid #b32323', borderRadius: '16px', padding: '15px', margin: '15px 0' }}>
                                    <div onClick={() => setShowDanger(prev => !prev)} style={{ color: '#dd4b4b', fontWeight: 'bold', fontSize: '12px', opacity: 0.7 }}>
                                        {langIndex === 0 ? 'Опасная зона!' : 'Danger zone!'}
                                    </div>
                                    {showDanger && <ActionButton text={langIndex === 0 ? 'Удалить сейв в облаке' : 'Delete from cloud'} onClick={deleteCloudBackup} theme={theme} color="#FF4D4D" />}
                                    {showDanger && <ActionButton text={langIndex === 0 ? 'Удалить сейв с устройства' : 'Delete save from device'} onClick={clearAllSaves} theme={theme} color="#FF4D4D" />}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ActionButton = ({ text, onClick, theme, color }) => (
    <motion.div whileTap={{ scale: 0.95 }} onClick={onClick} style={{ padding: '16px', borderRadius: '16px', background: Colors.get('bottomPanel', theme), border: `1px solid ${color}44`, color: Colors.get('mainText', theme), fontWeight: '600', fontFamily: 'Segoe UI', boxShadow: `0 4px 10px ${color}22` }}>{text}</motion.div>
);

const s = (theme, fSize) => ({
    panel: {
        position: 'fixed', left: 0, top: 0, bottom: 0,
        zIndex: 9000, width: '85vw',
        backgroundColor: Colors.get('background', theme),
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
        borderTopRightRadius: '24px', borderBottomRightRadius: '24px',
        borderRight: `1px solid ${Colors.get('border', theme)}`
    },
    listEl: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', margin: '0 14px', padding: '12px', borderRadius: '18px', backgroundColor: Colors.get('bottomPanel', theme), border: `1px solid ${Colors.get('border', theme)}` },
    iconBox: { width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    premiumEl: { position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', margin: '0 14px', padding: '16px', borderRadius: '20px', backgroundColor: Colors.get('simplePanel', theme), border: '1px solid #C5A059' },
    textNoMargin: { fontSize: fSize === 0 ? '15px' : '16px', color: Colors.get('mainText', theme), margin: '0', fontFamily: 'Segoe UI', fontWeight: 500 },
    premiumText: { fontSize: fSize === 0 ? '16px' : '17px', margin: '0', fontFamily: 'Segoe UI', fontWeight: 700, color: '#E0AA3E' },
});

const inputStyles = (theme) => ({
    text: { color: Colors.get('mainText', theme), fontSize: '13px', fontFamily: 'Segoe UI' },
    input: { width: '90%', height: '70%', fontSize: '16px', padding: '15px', border: `1px solid ${Colors.get('border', theme)}`, borderRadius: '16px', color: Colors.get('mainText', theme), backgroundColor: Colors.get('bottomPanel', theme) },
});

function getThemeShortName(langIndex, theme) {
    switch (theme) {
        case 'dark': return langIndex === 0 ? 'Тёмная' : 'Dark';
        case 'light': return langIndex === 0 ? 'Светлая' : 'Light';
        default: return '';
    }
}

function changeSettings(prefIndex, size) {
    switch (prefIndex) {
        case 0: setLang(AppData.prefs[0] == 0 ? 'en' : 'ru'); AppData.prefs[0] == 0 ? AppData.setPrefs(0, 1) : AppData.setPrefs(0, 0); break;
        case 1: toggleTheme(); break;
        case 2: AppData.prefs[2] == 0 ? AppData.setPrefs(2, 1) : AppData.setPrefs(2, 0); break;
        case 3: AppData.prefs[3] == 0 ? AppData.setPrefs(3, 1) : AppData.setPrefs(3, 0); break;
        case 4: AppData.prefs[4] == 0 ? AppData.setPrefs(4, 1) : AppData.setPrefs(4, 0); setFontSize(size === 0 ? 1 : 0); break;
    }
}

const toggleTheme = () => {
    let next; let themeNum = 0;
    if (Colors.theme === THEME.DARK) { themeNum = 1; next = THEME.LIGHT; }
    else { themeNum = 0; next = THEME.DARK; }
    AppData.setPrefs(1, themeNum); Colors.setTheme(next); setGlobalTheme(next);
};

function playEffects(sound) {
    if (AppData.prefs[2] == 0 && sound !== null) { if (!sound.paused) { sound.pause(); sound.currentTime = 0; } sound.volume = 0.5; sound.play(); }
    if (AppData.prefs[3] == 0 && window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
}

export default Settings;
