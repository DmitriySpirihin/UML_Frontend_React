import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaCloudDownloadAlt, FaLink, FaMoon, FaRedo, FaSyncAlt, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { lang$, theme$ } from '../../StaticClasses/HabitsBus';
import {
  SLEEP_INTEGRATION_PROVIDERS,
  getSleepIntegration,
  setSleepIntegrationState,
  startSleepIntegrationConnect,
  syncSleepIntegrationProvider,
  toggleSleepIntegrationAutoSync
} from '../../StaticClasses/SleepIntegrationService.js';
import { buildSleepAccent } from './SleepVisuals.js';

const SleepDevices = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [version, setVersion] = useState(0);
  const [syncingProvider, setSyncingProvider] = useState('');
  const [message, setMessage] = useState('');
  const accent = buildSleepAccent(AppData.sleepAccentColor || '#7C6CFF');
  const s = styles(theme, accent);

  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const updateIntegration = async (provider, patch) => {
    await setSleepIntegrationState(provider, patch);
    setVersion(prev => prev + 1);
  };

  const handleConnect = async (provider) => {
    try {
      startSleepIntegrationConnect(provider);
      await updateIntegration(provider, { connected: true, error: '' });
      setMessage(langIndex === 0 ? 'Подключение сохранено' : 'Connection saved');
    } catch (error) {
      await updateIntegration(provider, { error: error.message || 'Connection unavailable' });
      setMessage(error.message || 'Connection unavailable');
    }
  };

  const handleToggleAutoSync = async (provider) => {
    await toggleSleepIntegrationAutoSync(provider);
    setVersion(prev => prev + 1);
  };

  const handleSync = async (provider) => {
    setSyncingProvider(provider);
    setMessage('');
    const result = await syncSleepIntegrationProvider(provider);
    setSyncingProvider('');
    setVersion(prev => prev + 1);
    setMessage(result.success
      ? (langIndex === 0 ? `Импортировано записей: ${result.imported}` : `Imported records: ${result.imported}`)
      : result.error
    );
  };

  const connectedCount = SLEEP_INTEGRATION_PROVIDERS.filter(provider => getSleepIntegration(provider.key).connected).length;

  return (
    <div style={s.container}>
      <div style={s.scroll}>
        <div style={s.topBar}>
          <div style={s.brandWrap}>
            <div style={s.brand}>UltyMyLife</div>
            <div style={s.brandSub}>{langIndex === 0 ? 'Подраздел сна' : 'Sleep subsection'}</div>
          </div>
          <div style={s.counter}>{connectedCount}/{SLEEP_INTEGRATION_PROVIDERS.length}</div>
        </div>

        <section style={s.hero}>
          <div style={s.heroIcon}><FaMoon /></div>
          <div style={s.eyebrow}>{langIndex === 0 ? 'Устройства' : 'Devices'}</div>
          <h1 style={s.title}>{langIndex === 0 ? 'Подключенные источники сна' : 'Connected sleep sources'}</h1>
          <p style={s.subtitle}>
            {langIndex === 0
              ? 'Apple Health, WHOOP и Oura вынесены отдельно, чтобы главный экран сна оставался чистым.'
              : 'Apple Health, WHOOP and Oura live here so the main sleep screen stays focused.'}
          </p>
        </section>

        <div style={s.list}>
          {SLEEP_INTEGRATION_PROVIDERS.map(provider => {
            const state = getSleepIntegration(provider.key);
            const connected = state.connected === true;
            const isSyncing = syncingProvider === provider.key;

            return (
              <motion.section key={`${provider.key}-${version}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={s.deviceCard(connected)}>
                <div style={s.deviceTop}>
                  <div style={s.providerIcon(connected)}>{connected ? <FaCheck /> : <FaLink />}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.providerName}>{provider.label[langIndex]}</div>
                    <div style={s.providerScope}>{provider.scope}</div>
                  </div>
                  <div style={s.badge(connected)}>
                    {connected ? (langIndex === 0 ? 'Вкл' : 'On') : (langIndex === 0 ? 'Выкл' : 'Off')}
                  </div>
                </div>

                <p style={s.note}>{provider.note[langIndex]}</p>

                {state.lastSync && (
                  <div style={s.meta}>
                    <FaSyncAlt size={11} />
                    {langIndex === 0 ? 'Последняя синхронизация:' : 'Last sync:'} {new Date(state.lastSync).toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US')}
                  </div>
                )}
                {state.error && <div style={s.error}>{state.error}</div>}

                <div style={s.actions}>
                  <ActionButton icon={connected ? <FaRedo /> : <FaLink />} text={connected ? (langIndex === 0 ? 'Заново' : 'Reconnect') : (langIndex === 0 ? 'Связать' : 'Connect')} onClick={() => handleConnect(provider.key)} theme={theme} accent={accent} />
                  <ActionButton icon={state.autoSync ? <FaToggleOn /> : <FaToggleOff />} text={langIndex === 0 ? 'Авто' : 'Auto'} onClick={() => handleToggleAutoSync(provider.key)} theme={theme} accent={state.autoSync ? accent : null} />
                  <ActionButton icon={<FaCloudDownloadAlt />} text={isSyncing ? '...' : (langIndex === 0 ? 'Импорт' : 'Sync')} onClick={() => handleSync(provider.key)} theme={theme} accent={accent} disabled={isSyncing} filled />
                </div>
              </motion.section>
            );
          })}
        </div>

        {message && <div style={s.message}>{message}</div>}
      </div>
    </div>
  );
};

const ActionButton = ({ icon, text, onClick, theme, accent, disabled = false, filled = false }) => {
  const active = accent || buildSleepAccent('#7C6CFF');
  const isLight = theme === 'light' || theme === 'speciallight';
  return (
    <motion.button type="button" disabled={disabled} whileTap={!disabled ? { scale: 0.96 } : {}} onClick={onClick} style={{
      flex: 1,
      minHeight: 38,
      borderRadius: 13,
      border: `1px solid ${filled || accent ? active.ring : isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.08)'}`,
      background: filled ? active.hue : accent ? active.soft : 'transparent',
      color: filled ? '#fff' : accent ? active.hue : Colors.get('mainText', theme),
      fontSize: 11,
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      opacity: disabled ? 0.58 : 1
    }}>
      {icon}
      {text}
    </motion.button>
  );
};

export default SleepDevices;

const styles = (theme, accent) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const panel = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.045)';
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';

  return {
    container: {
      width: '100vw',
      height: '100vh',
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${Colors.get('background', theme)} 42%)`
        : `linear-gradient(180deg, rgba(${accent.rgb.r},${accent.rgb.g},${accent.rgb.b},0.12) 0%, ${Colors.get('background', theme)} 44%)`,
      fontFamily: 'inherit',
      color: Colors.get('mainText', theme),
      overflow: 'hidden'
    },
    scroll: { height: '100%', overflowY: 'auto', padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 18px 150px', boxSizing: 'border-box' },
    topBar: {
      display: 'grid',
      gridTemplateColumns: 'minmax(50px, 1fr) auto minmax(50px, 1fr)',
      alignItems: 'center',
      columnGap: 10,
      marginBottom: 16
    },
    brandWrap: {
      gridColumn: 2,
      minWidth: 0,
      textAlign: 'center'
    },
    brand: { color: Colors.get('mainText', theme), fontSize: 24, fontWeight: 950, lineHeight: 1.05 },
    brandSub: { color: Colors.get('subText', theme), fontSize: 12, fontWeight: 800, marginTop: 2 },
    counter: { gridColumn: 3, justifySelf: 'end', minWidth: 50, height: 38, borderRadius: 13, border: `1px solid ${accent.ring}`, background: accent.soft, color: accent.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950 },
    hero: { position: 'relative', borderRadius: 24, padding: 18, minHeight: 156, overflow: 'hidden', background: isLight ? `linear-gradient(135deg, #fff, ${accent.faint})` : `linear-gradient(135deg, rgba(255,255,255,0.075), ${accent.faint})`, border: `1px solid ${accent.ring}` },
    heroIcon: { position: 'absolute', right: -12, top: -14, width: 112, height: 112, borderRadius: 36, background: accent.soft, color: accent.hue, fontSize: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-8deg)' },
    eyebrow: { color: accent.hue, fontSize: 11, fontWeight: 950, textTransform: 'uppercase', marginBottom: 8 },
    title: { maxWidth: '72%', margin: 0, color: Colors.get('mainText', theme), fontSize: 26, fontWeight: 950, lineHeight: 1.06 },
    subtitle: { maxWidth: '76%', margin: '10px 0 0', color: Colors.get('subText', theme), fontSize: 13, fontWeight: 700, lineHeight: 1.38 },
    list: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 },
    deviceCard: (connected) => ({ borderRadius: 22, padding: 14, background: panel, border: `1px solid ${connected ? accent.ring : border}`, boxSizing: 'border-box' }),
    deviceTop: { display: 'flex', alignItems: 'center', gap: 12 },
    providerIcon: (connected) => ({ width: 42, height: 42, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: connected ? accent.soft : isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', color: connected ? accent.hue : Colors.get('subText', theme), border: `1px solid ${connected ? accent.ring : border}` }),
    providerName: { color: Colors.get('mainText', theme), fontSize: 16, fontWeight: 950 },
    providerScope: { color: Colors.get('subText', theme), fontSize: 11, fontWeight: 800, marginTop: 3 },
    badge: (connected) => ({ padding: '5px 9px', borderRadius: 999, background: connected ? accent.soft : isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)', color: connected ? accent.hue : Colors.get('subText', theme), fontSize: 10, fontWeight: 950, border: `1px solid ${connected ? accent.ring : border}` }),
    note: { margin: '12px 0 0', color: Colors.get('subText', theme), fontSize: 12, fontWeight: 700, lineHeight: 1.35 },
    meta: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, color: Colors.get('subText', theme), fontSize: 11, fontWeight: 800 },
    error: { marginTop: 10, color: Colors.get('skipped', theme), fontSize: 11, fontWeight: 800 },
    actions: { display: 'flex', gap: 8, marginTop: 13 },
    message: { marginTop: 14, borderRadius: 16, padding: 12, background: accent.soft, border: `1px solid ${accent.ring}`, color: accent.hue, fontSize: 12, fontWeight: 900, textAlign: 'center' }
  };
};
