import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Colors from '../../StaticClasses/Colors'
import { AppData, UserData } from '../../StaticClasses/AppData.js'
import RecomendationMeasurments from '../../Helpers/RecomendationMeasurments'
import { getWeeklyTrainingAmount } from '../../StaticClasses/TrainingLogHelper.js'
import { FaWeight, FaRulerVertical, FaInfoCircle, FaFire, FaBullseye, FaHeartbeat } from 'react-icons/fa'
import { IoBody, IoAccessibility } from 'react-icons/io5'
import { MdClose } from 'react-icons/md'

// --- CONSTANTS (Kept Intact) ---
const icons = [
    ['images/BodyIcons/SideS.png', 'images/BodyIcons/SideSf.png'],
    ['images/BodyIcons/Side.png', 'images/BodyIcons/Sidef.png'],
    ['images/BodyIcons/SideL.png', 'images/BodyIcons/SideLf.png'],
    ['images/BodyIcons/SideXL.png', 'images/BodyIcons/SideXLf.png'],
];
export const names = [
    ['Вес тела', 'Body weight'],
    ['Обхват талии', 'Waist circumference'],
    ['Обхват бицепса', 'Biceps circumference'],
    ['Обхват груди', 'Chest circumference'],
    ['Обхват бедра', 'Hip circumference'],
]
const goalNames = [['Набор массы', 'Mass gain'], ['Сила', 'Strength'], ['Жиросжигание', 'Weight loss'], ['Здоровье', 'Health']]

const TrainingMeasurmentsOveview = ({ theme, langIndex, fSize, data, filled, height, age, gender, goal, wrist }) => {
    const [showInfo, setShowInfo] = useState(false);

    // Helper Styles
    const isLight = theme === 'light' || theme === 'speciallight';
    const cardBg = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)';
    const borderColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    const textColor = Colors.get('mainText', theme);
    const subTextColor = Colors.get('subText', theme);

    if (!filled) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', opacity: 0.6 }}>
                <IoBody size={60} color={subTextColor} />
                <div style={{ ...styles(theme, fSize).subtext, textAlign: 'center', marginTop: '20px', maxWidth: '80%' }}>
                    {langIndex === 0 ? 'Заполните персональные данные для рекомендаций и статистики' : 'Fill personal data to get statistics'}
                </div>
            </div>
        );
    }

    const currentBMIColor = getBMIColor(theme, data, height);
    const currentWeight = data[0].length > 0 ? data[0][data[0].length - 1].value : 0;

    return (
        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 10px 100px 10px' }}>
            
            {/* --- HERO SECTION --- */}
            <div style={{ display: 'flex', gap: '15px', height: '220px' }}>
                {/* Body Visual Card */}
                <div style={{
                    flex: '0 0 35%',
                    backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    position: 'relative'
                }}>
                    <img 
                        src={icons[getBMIIndex(data, height)][gender]} 
                        alt="Body Type" 
                        style={{ height: '90%', objectFit: 'contain', opacity: 0.9, filter: isLight ? 'none' : 'brightness(0.9)' }} 
                    />
                    <div onClick={() => setShowInfo(true)} style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer', opacity: 0.6 }}>
                        <FaInfoCircle color={textColor} />
                    </div>
                </div>

                {/* Primary Stats Card */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '20px'
                }}>
                    <div>
                        <div style={{ fontSize: '12px', color: subTextColor, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>
                            {langIndex === 0 ? 'Профиль' : 'Profile'}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: textColor, lineHeight: '1.1' }}>
                            {age} <span style={{ fontSize: '14px', fontWeight: '500' }}>{langIndex === 0 ? 'лет' : 'y.o.'}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <StatRow icon={<FaRulerVertical />} label={langIndex === 0 ? 'Рост' : 'Height'} value={`${height} cm`} theme={theme} />
                        <StatRow icon={<FaBullseye />} label={langIndex === 0 ? 'Цель' : 'Goal'} value={goalNames[goal][langIndex]} theme={theme} highlight />
                    </div>
                </div>
            </div>

            {/* --- BENTO GRID (METRICS) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <MetricCard 
                    title={langIndex === 0 ? 'Вес' : 'Weight'} 
                    value={measurmentString(data, 0, langIndex)} 
                    icon={<FaWeight />} 
                    color={Colors.get('currentDateBorder', theme)} 
                    theme={theme} 
                />
                <MetricCard 
                    title={langIndex === 0 ? 'Жир' : 'Body Fat'} 
                    value={fatPercentString(data, height, age, gender)} 
                    icon={<IoAccessibility />} 
                    color="#FF9F43" 
                    theme={theme} 
                />
                <MetricCard 
                    title={langIndex === 0 ? 'ИМТ' : 'BMI'} 
                    value={bmiString(data, langIndex, height)} 
                    icon={<FaHeartbeat />} 
                    color={currentBMIColor} 
                    theme={theme} 
                />
                <MetricCard 
                    title={langIndex === 0 ? 'Метаболизм' : 'Metabolism'} 
                    value={baseMetabolismString(data, langIndex, height, age, gender)} 
                    icon={<FaFire />} 
                    color="#FF6B6B" 
                    theme={theme} 
                />
            </div>

            {/* --- DETAILS & CALCULATIONS --- */}
            <div style={{ backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                <SectionHeader title={langIndex === 0 ? 'Анализ Тела' : 'Body Analysis'} theme={theme} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <DetailRow label={langIndex === 0 ? 'Тип тела' : 'Body Type'} value={bodyTypesNames(getBodyType(height, wrist, gender), langIndex)} theme={theme} />
                    <DetailRow label={langIndex === 0 ? 'Идеальный вес' : 'Ideal Weight'} value={`${getIdealWeight(height, gender, getBodyType(height, wrist, gender)).toFixed(1)} ${langIndex === 0 ? 'кг' : 'kg'}`} theme={theme} />
                    
                    <div style={{ height: '1px', backgroundColor: borderColor, margin: '5px 0' }} />
                    
                    {/* Proportions Components rendered here */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <GetWHR theme={theme} langIndex={langIndex} data={data} />
                        <GetWHTr theme={theme} langIndex={langIndex} data={data} height={height} />
                    </div>
                </div>
            </div>

            {/* --- MEASUREMENTS LIST --- */}
            <div style={{ backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '20px' }}>
                <SectionHeader title={langIndex === 0 ? 'Обхваты' : 'Measurements'} theme={theme} />
                <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <MeasurementBox label={langIndex === 0 ? 'Талия' : 'Waist'} value={measurmentString(data, 1, langIndex)} theme={theme} />
                    <MeasurementBox label={langIndex === 0 ? 'Грудь' : 'Chest'} value={measurmentString(data, 3, langIndex)} theme={theme} />
                    <MeasurementBox label={langIndex === 0 ? 'Бедра' : 'Hips'} value={measurmentString(data, 4, langIndex)} theme={theme} />
                </div>
            </div>

            {/* --- INFO MODAL --- */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                        onClick={() => setShowInfo(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={{ backgroundColor: Colors.get('background', theme), borderRadius: '30px', padding: '30px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: textColor }}>{langIndex === 0 ? 'Информация' : 'Information'}</h3>
                                <MdClose size={24} color={subTextColor} onClick={() => setShowInfo(false)} style={{ cursor: 'pointer' }} />
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: fSize === 0 ? '14px' : '16px', color: textColor }}>
                                {infoText(langIndex)}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- RECOMMENDATIONS --- */}
            {filled && data[0].length > 0 && (
                <RecomendationMeasurments bmi={getBaseMetabolism(currentWeight, height, age, gender)} trains={getWeeklyTrainingAmount()} />
            )}
        </div>
    )
}

// --- SUB COMPONENTS ---

const StatRow = ({ icon, label, value, theme, highlight }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ color: highlight ? Colors.get('currentDateBorder', theme) : Colors.get('subText', theme), fontSize: '14px' }}>
            {icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: Colors.get('subText', theme), textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: Colors.get('mainText', theme) }}>{value}</span>
        </div>
    </div>
)

const MetricCard = ({ title, value, icon, color, theme }) => (
    <div style={{
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)',
        borderRadius: '20px', padding: '15px', border: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100px'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: Colors.get('subText', theme) }}>{title}</span>
            <div style={{ backgroundColor: `${color}20`, padding: '6px', borderRadius: '10px', color: color }}>
                {icon}
            </div>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: Colors.get('mainText', theme) }}>
            {value}
        </div>
    </div>
)

const DetailRow = ({ label, value, theme }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: Colors.get('subText', theme) }}>{label}</span>
        <span style={{ fontSize: '15px', fontWeight: '600', color: Colors.get('mainText', theme) }}>{value}</span>
    </div>
)

const SectionHeader = ({ title, theme }) => (
    <div style={{ fontSize: '13px', fontWeight: '800', color: Colors.get('subText', theme), textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
        {title}
    </div>
)

const MeasurementBox = ({ label, value, theme }) => (
    <div style={{ backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: Colors.get('subText', theme), marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: Colors.get('mainText', theme) }}>{value}</div>
    </div>
)


const styles = (theme, fSize) => ({
    text: {
        textAlign: "left",
        fontSize: fSize === 0 ? '13px' : '15px',
        color: Colors.get('mainText', theme),
    },
    subtext: {
        textAlign: "left",
        fontSize: fSize === 0 ? '11px' : '13px',
        color: Colors.get('subText', theme)
    }
})
export default TrainingMeasurmentsOveview;


const getBMI = (weight, height) => {
  if (weight <= 0 || height <= 0) return null;
  return weight / Math.pow(height / 100, 2); // height in cm → m
};

const getBodyType = (height, wristCircumference, gender) => {
  if (!height || !wristCircumference) return 'medium';

  // Normalize gender to string if needed
  const genderStr = typeof gender === 'number' 
    ? (gender === 0 ? 'male' : 'female') 
    : gender;

  const wrist = wristCircumference; // already in cm
  const heightInches = height / 2.54; // still needed for height groups

  // Convert inch-based wrist thresholds to cm (1 inch = 2.54 cm)
  if (genderStr === 'male') {
    if (heightInches > 65) {
      // Wrist thresholds: 6.5", 7.5" → cm
      if (wrist < 6.5 * 2.54) return 'small';      // < 16.51 cm
      if (wrist <= 7.5 * 2.54) return 'medium';    // ≤ 19.05 cm
      return 'large';
    } else if (heightInches >= 62) {
      // Thresholds: 6.0", 6.5"
      if (wrist < 6.0 * 2.54) return 'small';      // < 15.24 cm
      if (wrist <= 6.5 * 2.54) return 'medium';    // ≤ 16.51 cm
      return 'large';
    } else {
      // Thresholds: 5.5", 6.0"
      if (wrist < 5.5 * 2.54) return 'small';      // < 13.97 cm
      if (wrist <= 6.0 * 2.54) return 'medium';    // ≤ 15.24 cm
      return 'large';
    }
  } else {
    // Female — uses single threshold (no height dependency in classic method)
    // Thresholds: 5.5", 6.0"
    if (wrist < 5.5 * 2.54) return 'small';        // < 13.97 cm
    if (wrist <= 6.0 * 2.54) return 'medium';      // ≤ 15.24 cm
    return 'large';
  }
};

const getIdealWeight = (height, gender, bodyType = 'medium') => {
  const heightInches = height / 2.54; // height in cm → inches

  let idealWeightKg;
  if (gender === 0) { // male
    idealWeightKg = 50 + 2.3 * (heightInches - 60);
  } else { // female
    idealWeightKg = 45.5 + 2.3 * (heightInches - 60);
  }

  // Frame adjustment
  if (bodyType === 'small') idealWeightKg *= 0.9;
  else if (bodyType === 'large') idealWeightKg *= 1.1;

  // Ensure reasonable minimum (e.g., 30 kg)
  return Math.max(idealWeightKg, 30);
};

const getFatPercent = (BMI, age, gender) => {
  if (BMI <= 0 || age < 18) return null;
  const genderFactor = gender === 'male' ? 1 : 0;
  // Deurenberg formula: %BF = (1.20 × BMI) + (0.23 × age) - (10.8 × gender) - 5.4
  const bodyFat = 1.20 * BMI + 0.23 * age - (10.8 * genderFactor) - 5.4;
  return Math.max(0, Math.min(100, bodyFat)); // Clamp to [0,100]
};

const getBaseMetabolism = (weight, height, age, gender) => {
  if (weight <= 0 || height <= 0 || age <= 0) return null;

  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

const bmiNames = (BMI, langIndex) => {
  if (BMI < 16) {
    return langIndex === 0 ? 'выраженный дефицит массы' : 'severe thinness';
  } else if (BMI < 17) {
    return langIndex === 0 ? 'умеренный дефицит массы' : 'moderate thinness';
  } else if (BMI < 18.5) {
    return langIndex === 0 ? 'недостаточная масса' : 'mild thinness';
  } else if (BMI < 25) {
    return langIndex === 0 ? 'норма' : 'normal';
  } else if (BMI < 30) {
    return langIndex === 0 ? 'избыточная масса' : 'overweight';
  } else if (BMI < 35) {
    return langIndex === 0 ? 'ожирение I степени' : 'obesity class I';
  } else if (BMI < 40) {
    return langIndex === 0 ? 'ожирение II степени' : 'obesity class II';
  } else {
    return langIndex === 0 ? 'ожирение III степени' : 'obesity class III';
  }
};
const getBMIColor = (theme,data,height) =>{
  const bmi  = getBMI(data[0][data[0].length - 1].value,height);
  return bmi > 18.5 && bmi < 25 ? Colors.get('light', theme) : Colors.get('heavy', theme); 
}

const bodyTypesNames = (type, langIndex) => {
  switch (type) {
    case 'small':
      return langIndex === 0 ? 'астеник' : 'asthenic';
    case 'medium':
      return langIndex === 0 ? 'нормостеник' : 'normosthenic';
    case 'large':
      return langIndex === 0 ? 'гиперстеник' : 'hypersthenic';
    default:
      return langIndex === 0 ? 'неизвестно' : 'unknown';
  }
};
const measurmentString = (data,ind, langIndex) => {
  if(data[ind].length === 0)return '-';
  const label = ind < 1 ? (langIndex === 0 ? ' кг' : ' kg') : (langIndex === 0 ? ' см' : ' sm');
  const val  = data[ind][data[ind].length - 1].value.toFixed(1) + label;
  return val;
}
const bmiString = (data,langIndex,height) => {
  if(data[0][data[0].length - 1].value === null)return '-';
  const bmi  = getBMI(data[0][data[0].length - 1].value,height);
  return bmi.toFixed(1) + ' ' + bmiNames(bmi,langIndex);
}
const fatPercentString = (data,height,age,gender) => {
  if(data[0][data[0].length - 1].value === null)return '-';
  const fat  = getFatPercent(getBMI(data[0][data[0].length - 1].value,height),age,gender);
  return fat.toFixed();
}
const baseMetabolismString = (data,langIndex,height,age,gender) => {
  if(data[0][data[0].length - 1].value === null)return '-';
  const met  = getBaseMetabolism(data[0][data[0].length - 1].value, height, age, gender);
  return met.toFixed() + (langIndex === 0 ? ' ккал':' kcal');
}
const getBMIIndex = (data,height) => {
   if(data[0][data[0].length - 1].value === null)return 1;
   const BMI  = getBMI(data[0][data[0].length - 1].value,height);
  if (BMI < 18.5) {
    return 0;
  } else if (BMI < 25) {
    return 1;
  } else if (BMI < 35) {
    return 2;
  } else {
    return 3;
  }
}
function getPeriodName(period,langIndex){
  if (period === 0){
    return langIndex === 0 ? 'месяц' : 'month';
  }else if (period === 1){
    return langIndex === 0 ? 'год' : 'year';
  }else if (period === 2){
    return langIndex === 0 ? 'все' : 'all';
  }
}

const GetWHR = ({ theme, langIndex, data }) => {
  // Guard: ensure latest waist and hip exist
  const latestWaistEntry = data[1]?.[data[1]?.length - 1];
  const latestHipEntry = data[4]?.[data[4]?.length - 1];

  if (!latestWaistEntry || !latestHipEntry) {
    return null; // or show "no data"
  }

  const waist = latestWaistEntry.value;
  const hip = latestHipEntry.value;
  const whr = waist / hip;

  // Health risk thresholds (WHO standards)
  const isMale = AppData.pData.gender === 0; // assuming 0 = male, 1 = female
  let status = 'normal';
  let label = langIndex === 0 ? 'Норма' : 'Normal';

  if (isMale) {
    if (whr >= 0.90 && whr < 1.0) status = 'elevated';
    else if (whr >= 1.0) {
      status = 'high';
      label = langIndex === 0 ? 'Повышенный риск' : 'High risk';
    }
  } else {
    if (whr >= 0.85 && whr < 0.90) status = 'elevated';
    else if (whr >= 0.90) {
      status = 'high';
      label = langIndex === 0 ? 'Повышенный риск' : 'High risk';
    }
  }

  const bgColor = 
    status === 'normal' ? Colors.get('difficulty0', theme) :
   Colors.get('difficulty5', theme)

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderRadius: '5px',
      minWidth: '45%'
    }}>
      <span style={{ ...styles(theme, false, false, 14).text, color: bgColor, fontSize: '12px' }}>
        {langIndex === 0 ? 'WHR: ' : 'WHR: '}
        {whr.toFixed(2)}
        {label}
      </span>
    </div>
  );
};

const GetWHTr = ({ theme, langIndex, data,height }) => {
  // WHtR = Waist-to-Height Ratio
  const latestWaistEntry = data[1]?.[data[1]?.length - 1];

  if (!latestWaistEntry ) {
    return null;
  }

  const waist = latestWaistEntry.value;
  const whtr = waist / height;

  // WHtR universal threshold: >0.5 = increased risk (Ashwell et al.)
  let status = 'normal';
  if (whtr >= 0.5 && whtr < 0.6) status = 'elevated';
  else if (whtr >= 0.6) status = 'high';

  const bgColor = 
    status === 'normal' ? Colors.get('difficulty0', theme) :
    Colors.get('difficulty5', theme)

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderRadius: '5px',
      minWidth: '45%'
    }}>
      <span style={{ ...styles(theme, false, false, 14).text, color: bgColor, fontSize: '12px' }}>
        {langIndex === 0 ? 'WHtR: ' : 'WHtR: '}
        {whtr.toFixed(2)}
      </span>
    </div>
  );
};

const infoText = (langIndex) => {
  if (langIndex === 0) {
    return `• **ИМТ (Индекс массы тела)** — соотношение веса и роста.  
Норма: 18.5–24.9. Выше 25 — избыточный вес, выше 30 — ожирение. ИМТ не учитывает мышечную массу.  

• **WHR (Талия–бедра)** — окружность талии ÷ окружность бёдер.  
У мужчин: <0.95 — низкий риск, >1.0 — высокий.  
У женщин: <0.80 — низкий риск, >0.85 — высокий.  
Высокий WHR связан с риском сердечно-сосудистых заболеваний и диабета.  

• **WHtR (Талия–рост)** — окружность талии ÷ рост.  
Здоровый уровень: <0.5. Значение ≥0.5 указывает на повышенный риск хронических заболеваний, независимо от ИМТ.  

• **Базальный метаболизм (BMR)** — количество калорий, необходимых организму в покое для поддержания жизненных функций.  
Рассчитывается по формулам (например, Миффлина–Сан Жеора) с учётом возраста, пола, веса и роста.  
Используется как основа для расчёта суточных энергозатрат.`;
  } else {
    return `• **BMI (Body Mass Index)** — weight-to-height ratio.  
Normal range: 18.5–24.9. ≥25 indicates overweight, ≥30 indicates obesity. BMI does not account for muscle mass.  

• **WHR (Waist-to-Hip Ratio)** — waist circumference ÷ hip circumference.  
Men: <0.95 = low risk, >1.0 = high risk.  
Women: <0.80 = low risk, >0.85 = high risk.  
High WHR is linked to increased risk of heart disease and type 2 diabetes.  

• **WHtR (Waist-to-Height Ratio)** — waist circumference ÷ height.  
Healthy target: <0.5. A value ≥0.5 suggests elevated risk of chronic diseases, regardless of BMI.  

• **Basal Metabolic Rate (BMR)** — calories your body needs at rest to maintain vital functions.  
Calculated using equations (e.g., Mifflin-St Jeor) based on age, sex, weight, and height.  
Serves as the foundation for estimating daily calorie needs.`;
  }
};