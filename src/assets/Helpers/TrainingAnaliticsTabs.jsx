import Colors from '../StaticClasses/Colors'

export const VolumeTabs = ({type, theme, langIndex, activeTab, onChange }) => {
  const baseTab = {
    flex: 1,
    padding: '6px 0',
    borderRadius: 999,
    textAlign: 'center',
    fontSize: 12,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.18s ease',
    userSelect: 'none',
  };

  const getStyle = (tab) => {
    const isActive = activeTab === tab;
    return {
      ...baseTab,
      backgroundColor: isActive
        ? Colors.get('iconsHighlited', theme)
        : 'transparent',
      color: isActive
        ? Colors.get('bgMain', theme)
        : Colors.get('subText', theme),
      boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.35)' : 'none',
      opacity: isActive ? 1 : 0.8,
    };
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '90%',
        marginTop: 18,
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        borderRadius: 999,
        backgroundColor: Colors.get('tabsBg', theme) || 'transparent',
      }}
    >
      <div style={getStyle('volume')} onClick={() => onChange('volume')}>
        {type === 0 ? langIndex === 0 ? 'объём' : 'load' : langIndex === 0 ? 'замеры' : 'measurings'}
      </div>

      <div style={getStyle('muscles')} onClick={() => onChange('muscles')}>
        {type === 0 ? langIndex === 0 ? 'мышцы' : 'muscles' : langIndex === 0 ? 'обзор' : 'overview'}
      </div>

      <div style={getStyle('exercises')} onClick={() => onChange('exercises')}>
        {type === 0 ? langIndex === 0 ? 'упражнения' : 'exercises' : langIndex === 0 ? 'аналитика' : 'analitic'}
      </div>
    </div>
  );
};
