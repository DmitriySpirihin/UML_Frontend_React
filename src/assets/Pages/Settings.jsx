import React, { useEffect, useState } from 'react'
import { AppData, UserData } from '../StaticClasses/AppData'
import { motion, AnimatePresence } from 'framer-motion'
import Colors, { THEME } from "../StaticClasses/Colors";
import { sendBugreport } from '../StaticClasses/NotificationsManager'
import { FaAddressCard, FaLanguage, FaHighlighter, FaVolumeMute, FaVolumeUp, FaBug, FaCrown, FaChevronRight, FaHome, FaUser, FaCog, FaPaperPlane, FaTelegramPlane, FaTimes, FaCloudUploadAlt, FaCloudDownloadAlt, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa'
import { LuVibrate, LuVibrateOff } from 'react-icons/lu'
import { RiFontSize2 } from 'react-icons/ri'
import { clearAllSaves } from '../StaticClasses/SaveHelper';
import { MdBackup, MdInfoOutline } from 'react-icons/md'
import { IoIosArrowBack } from 'react-icons/io'
import { setTheme as setGlobalTheme, theme$, premium$, setLang, lang$, vibro$, sound$, fontSize$, setFontSize, setPage, lastPage$ } from '../StaticClasses/HabitsBus';
import { cloudBackup, cloudRestore, deleteCloudBackup } from '../StaticClasses/NotificationsManager';
import { playEffects } from '../StaticClasses/Effects';

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

    const goBack = () => {
        const prev = lastPage$.value;
        setPage(prev && prev !== 'settings' ? prev : 'MainMenu');
        playEffects(transitionSound);
    };

    const setFontPreference = async (nextSize) => {
        setFSize(nextSize);
        setFontSize(nextSize);
        await AppData.setPrefs(4, nextSize);
        playEffects(null);
    };

    const styles = s(theme, fSize);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            style={styles.screen}
        >
            <style>{`@keyframes shine-effect { 0% { left: -100%; } 20% { left: 100%; } 100% { left: 100%; } }`}</style>

            <div style={styles.content} className="no-scrollbar">
                {!hasPremium && (
                    <PremiumSettingsCard
                        theme={theme}
                        langIndex={langIndex}
                        onClick={() => { setPage('premium'); playEffects(null); }}
                    />
                )}

                <div style={styles.heroCard}>
                    <div style={styles.heroGlow} />
                    <div style={styles.heroMainRow}>
                        <UserPanelInner theme={theme} fSize={fSize} />
                        <div style={styles.heroSettingsBadge}>
                            <FaCog size={13} />
                            <span>{langIndex === 0 ? 'Настройки' : 'Settings'}</span>
                        </div>
                    </div>
                    <div style={styles.heroQuickRow}>
                        <span style={styles.heroQuickChip}>{getThemeShortName(langIndex, theme)}</span>
                        <span style={styles.heroQuickChip}>{langIndex === 0 ? 'Русский' : 'English'}</span>
                        <span style={styles.heroQuickChip}>{sound === 0 ? (langIndex === 0 ? 'Звук вкл' : 'Sound on') : (langIndex === 0 ? 'Без звука' : 'Muted')}</span>
                    </div>
                </div>

                <SettingsSection title={langIndex === 0 ? 'Приложение' : 'App'} theme={theme} fSize={fSize}>
                    <SettingsItem theme={theme} fSize={fSize} icon={<FaLanguage />} label={langIndex === 0 ? 'Язык' : 'Language'} value={langIndex === 0 ? 'Русский' : 'English'} color="#66D9E8"
                        onClick={() => { changeSettings(0); const n = langIndex === 0 ? 1 : 0; setLang(n === 0 ? 'ru' : 'en'); AppData.setPrefs(0, n); }} />
                    <SettingsItem theme={theme} fSize={fSize} icon={<FaHighlighter />} label={langIndex === 0 ? 'Тема' : 'Theme'} value={getThemeShortName(langIndex, theme)} color="#8A7CD6"
                        onClick={() => { changeSettings(1); playEffects(null); }} />
                    <FontSizeControl
                        theme={theme}
                        fSize={fSize}
                        langIndex={langIndex}
                        onChange={setFontPreference}
                    />
                    <SettingsItem theme={theme} fSize={fSize} icon={sound === 0 ? <FaVolumeUp /> : <FaVolumeMute />} label={langIndex === 0 ? 'Звук' : 'Sound'} value={sound === 0 ? (langIndex === 0 ? 'Вкл' : 'On') : (langIndex === 0 ? 'Выкл' : 'Off')} color="#5FB6C6" isActive={sound === 0}
                        onClick={() => { changeSettings(2); setSound(sound === 0 ? 1 : 0); }} />
                    <SettingsItem theme={theme} fSize={fSize} icon={vibro === 0 ? <LuVibrate /> : <LuVibrateOff />} label={langIndex === 0 ? 'Вибрация' : 'Haptics'} value={vibro === 0 ? (langIndex === 0 ? 'Вкл' : 'On') : (langIndex === 0 ? 'Выкл' : 'Off')} color="#C9A24B" isActive={vibro === 0}
                        onClick={() => { changeSettings(3); setVibro(vibro === 0 ? 1 : 0); playEffects(null); }} />
                </SettingsSection>

                <SettingsSection title={langIndex === 0 ? 'Помощь' : 'Support'} theme={theme} fSize={fSize}>
                    <SettingsItem theme={theme} fSize={fSize} icon={<MdInfoOutline />} label={langIndex === 0 ? 'Как пользоваться' : 'How to use'} color="#6F8BD6"
                        onClick={() => { setPage('InfoPanel'); playEffects(null); }} />
                    <SettingsItem theme={theme} fSize={fSize} icon={<FaBug />} label={langIndex === 0 ? 'Сообщить об ошибке' : 'Bug report'} color="#D95C5C"
                        onClick={() => { setAdditionalPanel(true); setAdditionalPanelNum(1); }} />
                    <SettingsItem theme={theme} fSize={fSize} icon={<FaAddressCard />} label={langIndex === 0 ? 'Контакты' : 'Contacts'} color="#7AA988"
                        onClick={() => { setAdditionalPanel(true); setAdditionalPanelNum(3); playEffects(null); }} />
                </SettingsSection>

                <SettingsSection title={langIndex === 0 ? 'Данные' : 'Data'} theme={theme} fSize={fSize}>
                    <SettingsItem theme={theme} fSize={fSize} icon={<MdBackup />} label={langIndex === 0 ? 'Бекап' : 'Backup'} color="#D49A5C"
                        onClick={() => { setAdditionalPanel(true); setAdditionalPanelNum(4); }} />
                </SettingsSection>

                <div style={styles.version}>{version}</div>
            </div>

            <AdditionalPanel theme={theme} langIndex={langIndex} isOpen={additionalPanel} setIsOpen={setAdditionalPanel} panelNum={additionalPanelNum} />
            <SettingsDock
                theme={theme}
                langIndex={langIndex}
                onBack={goBack}
                onHome={() => { setPage('MainMenu'); playEffects(null); }}
                onProfile={() => { setPage('UserPanel'); playEffects(null); }}
            />
        </motion.div>
    );
};

const UserPanelInner = ({ theme, fSize }) => {
    const [hasPremium, setHasPremium] = useState(false);
    useEffect(() => {
        const sub = premium$.subscribe(setHasPremium);
        return () => sub.unsubscribe();
    }, []);
    const styles = s(theme, fSize);
    return (
        <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => setPage('UserPanel')} style={styles.heroUserButton}>
            <div style={{ ...styles.heroAvatar, borderColor: hasPremium ? '#9FB4C4' : '#5fb6c6' }}>
                {UserData.photo ? (
                    <img src={UserData.photo} style={styles.heroAvatarImg} alt="user" />
                ) : (
                    <div style={styles.heroAvatarPlaceholder}>
                        {UserData.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
                {hasPremium && (
                    <div style={styles.heroPremiumBadge}>
                        <FaCrown size={10} />
                    </div>
                )}
            </div>
            <div style={styles.heroUserText}>
                <div style={styles.heroUserLabel}>{hasPremium ? 'PREMIUM' : (theme === 'dark' ? 'ULTYMYLIFE' : 'PROFILE')}</div>
                <div style={styles.heroUserName}>{UserData.name || 'User'}</div>
            </div>
        </motion.button>
    );
};

const SettingsSection = ({ title, children, theme, fSize = 0 }) => (
    <section style={s(theme).settingsSection}>
        <div style={s(theme, fSize).sectionTitle}>{title}</div>
        <div style={s(theme).sectionCard}>{children}</div>
    </section>
);

const PremiumSettingsCard = ({ theme, langIndex, onClick }) => {
    const styles = s(theme);
    return (
        <motion.button type="button" style={styles.premiumEl} whileTap={{ scale: 0.98 }} onClick={onClick}>
            <div style={styles.premiumHalo} />
            <div style={styles.premiumIcon}><FaCrown size={19} /></div>
            <div style={styles.premiumTextBlock}>
                <div style={styles.premiumText}>{langIndex === 0 ? 'Премиум версия' : 'Premium Version'}</div>
                <div style={styles.premiumSub}>{langIndex === 0 ? 'Открой расширенные возможности' : 'Unlock advanced features'}</div>
            </div>
            <FaChevronRight color="#9FB4C4" size={14} style={{ zIndex: 2, flexShrink: 0 }} />
        </motion.button>
    );
};

const SettingsItem = ({ theme, fSize, icon, label, value, onClick, color, isActive = true }) => (
    <motion.button type="button" style={s(theme, fSize).listEl} whileTap={{ scale: 0.98 }} onClick={onClick}>
        <div style={s(theme, fSize).itemLeft}>
            <div style={{ ...s(theme).iconBox, color: isActive ? color : Colors.get('subText', theme), backgroundColor: isActive ? (color + '20') : s(theme).faint, border: `1px solid ${isActive ? (color + '44') : 'transparent'}` }}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <p style={s(theme, fSize).textNoMargin}>{label}</p>
        </div>
        <div style={s(theme, fSize).itemRight}>
            {value && <span style={{ ...s(theme, fSize).itemValue, opacity: isActive ? 1 : 0.5 }}>{value}</span>}
            <FaChevronRight size={12} color={Colors.get('subText', theme)} style={{ opacity: 0.48 }} />
        </div>
    </motion.button>
);

const FontSizeControl = ({ theme, fSize, langIndex, onChange }) => {
    const styles = s(theme, fSize);
    const value = fSize === 0
        ? (langIndex === 0 ? 'Обычный' : 'Regular')
        : (langIndex === 0 ? 'Крупнее' : 'Larger');

    return (
        <motion.button
            type="button"
            style={styles.listEl}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(fSize === 0 ? 1 : 0)}
        >
            <div style={styles.itemLeft}>
                <div style={{ ...styles.iconBox, color: '#C65F9D', backgroundColor: 'rgba(198,95,157,0.13)', border: '1px solid rgba(198,95,157,0.28)' }}>
                    <RiFontSize2 size={18} />
                </div>
                <p style={styles.textNoMargin}>{langIndex === 0 ? 'Размер текста' : 'Text size'}</p>
            </div>
            <div style={styles.itemRight}>
                <span style={styles.itemValue}>{value}</span>
                <FaChevronRight size={12} color={Colors.get('subText', theme)} style={{ opacity: 0.48 }} />
            </div>
        </motion.button>
    );
};

const SettingsDock = ({ theme, langIndex, onBack, onHome, onProfile }) => (
    <div style={s(theme).settingsDock}>
        <SettingsDockButton icon={<IoIosArrowBack size={23} />} label={langIndex === 0 ? 'Назад' : 'Back'} onClick={onBack} theme={theme} />
        <SettingsDockButton icon={<FaHome size={21} />} label={langIndex === 0 ? 'Домой' : 'Home'} onClick={onHome} theme={theme} />
        <SettingsDockButton icon={<FaUser size={20} />} label={langIndex === 0 ? 'Профиль' : 'Profile'} onClick={onProfile} theme={theme} />
    </div>
);

const SettingsDockButton = ({ icon, label, onClick, theme }) => (
    <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onClick} aria-label={label} style={s(theme).settingsDockButton}>
        {icon}
    </motion.button>
);

const AdditionalPanel = ({ theme, langIndex, isOpen, setIsOpen, panelNum }) => {
    const [report, setReport] = useState('');
    const [showDanger, setShowDanger] = useState(false);
    const styles = s(theme);
    const isBugPanel = panelNum === 1;
    const isContactsPanel = panelNum === 3;
    const isBackupPanel = panelNum === 4;
    const trimmedReport = report.trim();
    const closePanel = () => {
        setIsOpen(false);
        playEffects(transitionSound);
    };
    const sendReport = () => {
        if (!trimmedReport) return;
        sendBugreport(trimmedReport);
        setReport('');
        closePanel();
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }} animate={{ x: '0%' }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={styles.panelScreen}
                >
                    <div style={styles.panelContent} className="no-scrollbar">
                        <div style={styles.panelTopBar}>
                            <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={closePanel} style={styles.panelBackButton} aria-label={langIndex === 0 ? 'Назад' : 'Back'}>
                                <FaChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                            </motion.button>
                            <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={closePanel} style={styles.panelCloseButton} aria-label={langIndex === 0 ? 'Закрыть' : 'Close'}>
                                <FaTimes size={13} />
                            </motion.button>
                        </div>

                        {(isBugPanel || isContactsPanel || isBackupPanel) && (
                            <div style={styles.panelHero}>
                                <div style={{
                                    ...styles.panelHeroIcon,
                                    color: isBugPanel ? '#D95C5C' : isBackupPanel ? '#D49A5C' : '#7AA988',
                                    background: isBugPanel ? 'rgba(217,92,92,0.14)' : isBackupPanel ? 'rgba(212,154,92,0.14)' : 'rgba(122,169,136,0.14)',
                                    border: isBugPanel ? '1px solid rgba(217,92,92,0.28)' : isBackupPanel ? '1px solid rgba(212,154,92,0.28)' : '1px solid rgba(122,169,136,0.28)'
                                }}>
                                    {isBugPanel ? <FaBug size={22} /> : isBackupPanel ? <MdBackup size={24} /> : <FaAddressCard size={22} />}
                                </div>
                                <div style={styles.panelTitleBlock}>
                                    <div style={styles.panelKicker}>{isBackupPanel ? (langIndex === 0 ? 'Данные' : 'Data') : (langIndex === 0 ? 'Поддержка' : 'Support')}</div>
                                    <div style={styles.panelTitle}>
                                        {isBugPanel
                                            ? (langIndex === 0 ? 'Сообщить об ошибке' : 'Bug report')
                                            : isBackupPanel
                                                ? (langIndex === 0 ? 'Бекап' : 'Backup')
                                                : (langIndex === 0 ? 'Контакты' : 'Contacts')}
                                    </div>
                                    <div style={styles.panelSubtitle}>
                                        {isBugPanel
                                            ? (langIndex === 0 ? 'Опиши, что сломалось или выглядит неправильно' : 'Describe what is broken or looks wrong')
                                            : isBackupPanel
                                                ? (langIndex === 0 ? 'Создай копию, восстанови данные или очисти старые сохранения' : 'Create a copy, restore data, or clear old saves')
                                                : (langIndex === 0 ? 'Напиши нам в Telegram по вопросам приложения' : 'Reach us on Telegram about the app')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {panelNum === 1 && (
                            <div style={styles.reportCard}>
                                <textarea
                                    maxLength={860}
                                    value={report}
                                    onChange={(e) => setReport(e.target.value)}
                                    placeholder={langIndex === 0 ? 'Например: на странице профиля не открывается раздел...' : 'Example: the profile page section does not open...'}
                                    style={styles.reportInput}
                                    rows={8}
                                />
                                <div style={styles.reportFooter}>
                                    <span style={styles.reportCounter}>{report.length} / 860</span>
                                    <motion.button
                                        type="button"
                                        whileTap={trimmedReport ? { scale: 0.97 } : undefined}
                                        style={{
                                            ...styles.reportButton,
                                            ...(trimmedReport ? {} : styles.reportButtonDisabled)
                                        }}
                                        onClick={sendReport}
                                    >
                                        <FaPaperPlane size={13} />
                                        <span>{langIndex === 0 ? 'Отправить' : 'Send'}</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {panelNum === 3 && (
                            <div style={styles.contactsStack}>
                                <div style={styles.contactsImageCard}>
                                    <img src={'images/Our_Faces.png'} style={styles.contactsImage} alt="UltyMyLife team" />
                                </div>
                                <ContactLink
                                    theme={theme}
                                    href="https://t.me/DemianWorkSelf"
                                    name={langIndex === 0 ? 'Демиан' : 'Demian'}
                                    label="Founder"
                                    accent="#5FB6C6"
                                />
                                <ContactLink
                                    theme={theme}
                                    href="https://t.me/Diiimaan777"
                                    name={langIndex === 0 ? 'Дмитрий' : 'Dmitry'}
                                    label="Cofounder"
                                    accent="#7AA988"
                                />
                            </div>
                        )}

                        {panelNum === 4 && (
                                <div style={styles.backupStack}>
                                <div style={styles.backupStatusCard}>
                                    <div style={styles.backupStatusText}>
                                        <div style={styles.backupStatusLabel}>{langIndex === 0 ? 'Последняя копия' : 'Latest copy'}</div>
                                        <div style={styles.backupStatusValue}>
                                            {AppData.lastBackupDate === '' || AppData.lastBackupDate === null
                                                ? (langIndex === 0 ? 'Пока нет' : 'None yet')
                                                : AppData.lastBackupDate?.split('T')[0]}
                                        </div>
                                    </div>
                                </div>
                                <div style={styles.backupActionsGrid}>
                                    <ActionButton icon={<FaCloudUploadAlt />} text={langIndex === 0 ? 'Создать' : 'Backup'} onClick={cloudBackup} theme={theme} color="#D49A5C" />
                                    <ActionButton icon={<FaCloudDownloadAlt />} text={langIndex === 0 ? 'Восстановить' : 'Restore'} onClick={cloudRestore} theme={theme} color="#6F8BD6" />
                                </div>
                                <div style={styles.dangerCard}>
                                    <button type="button" onClick={() => setShowDanger(prev => !prev)} style={styles.dangerHeader}>
                                        <span style={styles.dangerIcon}><FaExclamationTriangle size={15} /></span>
                                        <span>{langIndex === 0 ? 'Опасная зона' : 'Danger zone'}</span>
                                        <FaChevronRight size={12} style={{ marginLeft: 'auto', transform: showDanger ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s ease' }} />
                                    </button>
                                    {showDanger && (
                                        <>
                                            <div style={styles.dangerText}>
                                                {langIndex === 0 ? 'Эти действия удаляют сохранения. Используй только если точно понимаешь последствия.' : 'These actions delete saves. Use only when you understand the impact.'}
                                            </div>
                                            <div style={styles.dangerActions}>
                                                <ActionButton icon={<FaTrashAlt />} text={langIndex === 0 ? 'Удалить облако' : 'Delete cloud'} onClick={deleteCloudBackup} theme={theme} color="#D95C5C" />
                                                <ActionButton icon={<FaTrashAlt />} text={langIndex === 0 ? 'Удалить устройство' : 'Delete device'} onClick={clearAllSaves} theme={theme} color="#D95C5C" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ContactLink = ({ theme, href, name, label, accent }) => {
    const styles = s(theme);
    return (
        <motion.a href={href} target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.98 }} style={styles.contactCard}>
            <div style={{ ...styles.contactIcon, color: accent, background: `${accent}18`, border: `1px solid ${accent}33` }}>
                <FaTelegramPlane size={18} />
            </div>
            <div style={styles.contactText}>
                <div style={styles.contactName}>{name}</div>
                <div style={styles.contactLabel}>{label}</div>
            </div>
            <FaChevronRight size={12} color={Colors.get('subText', theme)} style={{ opacity: 0.48 }} />
        </motion.a>
    );
};

const ActionButton = ({ icon, text, onClick, theme, color }) => (
    <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={onClick} style={s(theme).actionButton(color)}>
        {icon && <span style={s(theme).actionButtonIcon(color)}>{icon}</span>}
        <span>{text}</span>
    </motion.button>
);

const s = (theme, fSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)';
    const panel = isLight ? 'rgba(255,255,255,0.86)' : 'rgba(26,29,33,0.84)';
    const panelStrong = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,23,25,0.92)';
    const faint = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.04)';
    const heroAccent = '#5fb6c6';

    return {
        faint,
        screen: {
            position: 'fixed',
            inset: 0,
            zIndex: 1001,
            overflow: 'hidden',
            color: text,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            background: isLight
                ? 'radial-gradient(900px 450px at 80% -10%, rgba(201,162,75,0.11), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(111,139,214,0.1), transparent 58%), #F4F5F7'
                : 'radial-gradient(1000px 500px at 80% -10%, rgba(201,162,75,0.08), transparent 55%), radial-gradient(800px 400px at -10% 100%, rgba(138,124,214,0.06), transparent 55%), #0E1013'
        },
        content: {
            height: '100%',
            overflowY: 'auto',
            boxSizing: 'border-box',
            padding: `${HEADER_TOP_PADDING} 20px calc(118px + env(safe-area-inset-bottom, 0px))`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        heroCard: {
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '13px',
            minHeight: '124px',
            background: isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.96) 0%, ${heroAccent}12 58%, rgba(169,155,122,0.08) 100%)`
                : `linear-gradient(145deg, rgba(23,27,31,0.96) 0%, ${heroAccent}14 54%, rgba(169,155,122,0.08) 100%)`,
            border: `1px solid ${heroAccent}22`,
            boxShadow: isLight
                ? `0 16px 38px -34px ${heroAccent}45, 0 1px 0 rgba(255,255,255,0.72) inset`
                : `0 18px 40px -34px ${heroAccent}50, 0 1px 0 rgba(255,255,255,0.055) inset`
        },
        heroMainRow: {
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
        },
        heroGlow: {
            position: 'absolute',
            right: '-44px',
            top: '-58px',
            width: '170px',
            height: '170px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${heroAccent}22 0%, transparent 62%)`,
            pointerEvents: 'none'
        },
        heroUserButton: {
            position: 'relative',
            zIndex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit'
        },
        heroAvatar: {
            width: '58px',
            height: '58px',
            borderRadius: '18px',
            border: '1px solid',
            padding: '5px',
            position: 'relative',
            flexShrink: 0,
            background: faint,
            boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset'
        },
        heroAvatarImg: { width: '100%', height: '100%', borderRadius: '13px', objectFit: 'cover', display: 'block' },
        heroAvatarPlaceholder: {
            width: '100%',
            height: '100%',
            borderRadius: '13px',
            background: panelStrong,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '900',
            color: text
        },
        heroPremiumBadge: {
            position: 'absolute',
            bottom: '-3px',
            right: '-3px',
            backgroundColor: '#CAD6DF',
            color: '#000',
            width: '24px',
            height: '24px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${isLight ? '#fff' : '#0E1013'}`
        },
        heroUserText: { minWidth: 0 },
        heroUserLabel: {
            fontSize: '10px',
            color: sub,
            fontWeight: 850,
            letterSpacing: '0.08em',
            marginBottom: '5px'
        },
        heroUserName: {
            color: text,
            fontSize: fSize === 0 ? '20px' : '24px',
            fontWeight: 900,
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        heroSettingsBadge: {
            minHeight: '34px',
            padding: '0 11px',
            borderRadius: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            color: heroAccent,
            background: `${heroAccent}16`,
            border: `1px solid ${heroAccent}33`,
            fontSize: fSize === 0 ? '11px' : '13px',
            fontWeight: 850,
            whiteSpace: 'nowrap',
            flexShrink: 0
        },
        heroQuickRow: {
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '8px'
        },
        heroQuickChip: {
            minHeight: '30px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
            color: sub,
            background: faint,
            border: `1px solid ${border}`,
            fontSize: fSize === 0 ? '10px' : '12px',
            fontWeight: 760,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        settingsSection: { display: 'flex', flexDirection: 'column', gap: '9px' },
        sectionTitle: {
            color: sub,
            fontSize: fSize === 0 ? '11px' : '13px',
            fontWeight: 850,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0 2px'
        },
        sectionCard: {
            borderRadius: '22px',
            background: panel,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset',
            overflow: 'hidden'
        },
        listEl: {
            width: '100%',
            minHeight: fSize === 0 ? '58px' : '66px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: fSize === 0 ? '12px 14px' : '14px 15px',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${border}`,
            color: text,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left'
        },
        itemLeft: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
        iconBox: { width: '36px', height: '36px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
        textNoMargin: { fontSize: fSize === 0 ? '14px' : '18px', color: text, margin: '0', fontFamily: 'inherit', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'font-size 0.18s ease, color 0.18s ease' },
        itemRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
        itemValue: { fontSize: fSize === 0 ? '12px' : '15px', color: sub, fontWeight: 760 },
        premiumEl: {
            position: 'relative',
            width: '100%',
            minHeight: '76px',
            borderRadius: '22px',
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '13px',
            background: isLight
                ? 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(234,241,246,0.9))'
                : 'linear-gradient(135deg, rgba(25,31,36,0.94), rgba(18,22,26,0.9))',
            border: '1px solid rgba(159,180,196,0.3)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 34px -24px rgba(0,0,0,0.7)',
            cursor: 'pointer',
            overflow: 'hidden',
            fontFamily: 'inherit',
            textAlign: 'left',
            color: text
        },
        premiumHalo: {
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 100% 50%, rgba(159,180,196,0.16) 0%, transparent 60%)',
            pointerEvents: 'none'
        },
        premiumIcon: {
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #CAD6DF 0%, #9FB4C4 100%)',
            color: '#0E1013',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            zIndex: 1
        },
        premiumTextBlock: { flex: 1, minWidth: 0, zIndex: 1 },
        premiumText: { fontSize: fSize === 0 ? '15px' : '16px', margin: '0', fontFamily: 'inherit', fontWeight: 900, color: text },
        premiumSub: { marginTop: '4px', color: sub, fontSize: '12px', fontWeight: 650, lineHeight: 1.2 },
        version: { fontSize: '10px', textAlign: 'right', color: sub, opacity: 0.72, fontWeight: 700, padding: '0 4px' },
        settingsDock: {
            position: 'fixed',
            left: '50%',
            bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
            transform: 'translateX(-50%)',
            zIndex: 40,
            width: '230px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '10px 14px',
            boxSizing: 'border-box',
            borderRadius: '999px',
            background: panelStrong,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)'
        },
        settingsDockButton: {
            width: '44px',
            height: '44px',
            borderRadius: '999px',
            border: '1px solid transparent',
            cursor: 'pointer',
            background: 'transparent',
            color: sub,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: 0,
            fontFamily: 'inherit'
        },
        panelScreen: {
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            color: text,
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            background: isLight
                ? 'radial-gradient(900px 450px at 82% -10%, rgba(95,182,198,0.12), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(201,162,75,0.1), transparent 58%), #F4F5F7'
                : 'radial-gradient(900px 480px at 80% -10%, rgba(95,182,198,0.1), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(201,162,75,0.08), transparent 58%), #0E1013'
        },
        panelContent: {
            height: '100%',
            overflowY: 'auto',
            boxSizing: 'border-box',
            padding: `${HEADER_TOP_PADDING} 20px calc(118px + env(safe-area-inset-bottom, 0px))`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '16px'
        },
        panelTopBar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '44px'
        },
        panelBackButton: {
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            border: `1px solid ${border}`,
            background: panelStrong,
            color: sub,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset'
        },
        panelCloseButton: {
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            border: `1px solid ${border}`,
            background: faint,
            color: sub,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'inherit'
        },
        panelHero: {
            borderRadius: '24px',
            padding: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: panel,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset'
        },
        panelHeroIcon: {
            width: '52px',
            height: '52px',
            borderRadius: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        panelTitleBlock: { minWidth: 0 },
        panelKicker: {
            color: sub,
            fontSize: '10px',
            fontWeight: 850,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '5px'
        },
        panelTitle: {
            color: text,
            fontSize: fSize === 0 ? '20px' : '23px',
            fontWeight: 900,
            lineHeight: 1.08
        },
        panelSubtitle: {
            color: sub,
            fontSize: fSize === 0 ? '12px' : '14px',
            fontWeight: 650,
            lineHeight: 1.35,
            marginTop: '7px'
        },
        reportCard: {
            borderRadius: '24px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: panel,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset'
        },
        reportInput: {
            width: '100%',
            minHeight: '210px',
            resize: 'none',
            boxSizing: 'border-box',
            border: `1px solid ${border}`,
            borderRadius: '18px',
            outline: 'none',
            padding: '15px',
            color: text,
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
            fontFamily: 'inherit',
            fontSize: fSize === 0 ? '14px' : '16px',
            fontWeight: 650,
            lineHeight: 1.45
        },
        reportFooter: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
        },
        reportCounter: {
            color: sub,
            fontSize: '11px',
            fontWeight: 760
        },
        reportButton: {
            minHeight: '44px',
            borderRadius: '15px',
            border: '1px solid rgba(217,92,92,0.28)',
            background: 'linear-gradient(135deg, rgba(217,92,92,0.96), rgba(190,72,72,0.96))',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '0 16px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: 900,
            boxShadow: '0 18px 28px -24px rgba(217,92,92,0.75)'
        },
        reportButtonDisabled: {
            cursor: 'default',
            opacity: 0.42,
            filter: 'grayscale(0.35)'
        },
        contactsStack: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        contactsImageCard: {
            width: '100%',
            aspectRatio: '1.65',
            borderRadius: '24px',
            overflow: 'hidden',
            background: panel,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset'
        },
        contactsImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
        },
        contactCard: {
            minHeight: '70px',
            borderRadius: '22px',
            padding: '13px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: panel,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset',
            textDecoration: 'none',
            color: text,
            boxSizing: 'border-box'
        },
        contactIcon: {
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        contactText: { flex: 1, minWidth: 0 },
        contactName: {
            color: text,
            fontSize: fSize === 0 ? '15px' : '17px',
            fontWeight: 900,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        contactLabel: {
            color: sub,
            fontSize: fSize === 0 ? '12px' : '13px',
            fontWeight: 650,
            marginTop: '3px'
        },
        backupStack: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        backupStatusCard: {
            minHeight: '74px',
            borderRadius: '24px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            background: panel,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset',
            boxSizing: 'border-box'
        },
        backupStatusText: {
            flex: 1,
            minWidth: 0
        },
        backupStatusLabel: {
            color: sub,
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '5px'
        },
        backupStatusValue: {
            color: text,
            fontSize: fSize === 0 ? '18px' : '21px',
            fontWeight: 900,
            lineHeight: 1.1
        },
        backupActionsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px'
        },
        dangerCard: {
            borderRadius: '24px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: isLight ? 'rgba(255,255,255,0.76)' : 'rgba(30,22,22,0.72)',
            border: '1px solid rgba(217,92,92,0.24)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset'
        },
        dangerHeader: {
            width: '100%',
            minHeight: '42px',
            border: 'none',
            borderRadius: '15px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            background: 'rgba(217,92,92,0.12)',
            color: '#D95C5C',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: fSize === 0 ? '13px' : '15px',
            fontWeight: 900,
            textAlign: 'left'
        },
        dangerIcon: {
            width: '28px',
            height: '28px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(217,92,92,0.14)',
            flexShrink: 0
        },
        dangerText: {
            color: sub,
            fontSize: fSize === 0 ? '12px' : '13px',
            fontWeight: 650,
            lineHeight: 1.35,
            padding: '0 3px'
        },
        dangerActions: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px'
        },
        actionButton: (color) => ({
            minHeight: '56px',
            width: '100%',
            borderRadius: '18px',
            border: `1px solid ${color}44`,
            background: isLight ? `${color}13` : `${color}16`,
            color: text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
            fontSize: fSize === 0 ? '13px' : '15px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: `0 16px 28px -24px ${color}88`,
            padding: '0 12px',
            boxSizing: 'border-box'
        }),
        actionButtonIcon: (color) => ({
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }),
        panel: {
            position: 'fixed', left: 0, top: 0, bottom: 0,
            zIndex: 9000, width: '85vw',
            backgroundColor: Colors.get('background', theme),
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
            borderTopRightRadius: '24px', borderBottomRightRadius: '24px',
            borderRight: `1px solid ${Colors.get('border', theme)}`
        }
    };
};

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
        case 4: {
            const nextSize = size === 0 ? 1 : 0;
            AppData.setPrefs(4, nextSize);
            setFontSize(nextSize);
            break;
        }
    }
}

const toggleTheme = () => {
    let next; let themeNum = 0;
    if (Colors.theme === THEME.DARK) { themeNum = 1; next = THEME.LIGHT; }
    else { themeNum = 0; next = THEME.DARK; }
    AppData.setPrefs(1, themeNum); Colors.setTheme(next); setGlobalTheme(next);
};

export default Settings;
