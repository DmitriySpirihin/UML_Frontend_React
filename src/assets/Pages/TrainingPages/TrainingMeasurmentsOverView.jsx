import Colors from '../../StaticClasses/Colors'
import { AppData , UserData} from '../../StaticClasses/AppData.js'
import RecomendationMeasurments from '../../Helpers/RecomendationMeasurments'
import {getWeeklyTrainingAmount} from '../../StaticClasses/TrainingLogHelper.js'
const icons = [
  ['images/BodyIcons/SideS.png','images/BodyIcons/SideSf.png'],
  ['images/BodyIcons/Side.png','images/BodyIcons/Sidef.png'],
  ['images/BodyIcons/SideL.png','images/BodyIcons/SideLf.png'],
  ['images/BodyIcons/SideXL.png','images/BodyIcons/SideXLf.png'],
];
export const names = [
  ['Вес тела','Body weight'],
  ['Обхват талии','Waist circumference'],
  ['Обхват бицепса','Biceps circumference'],
  ['Обхват груди','Chest circumference'],
  ['Обхват бедра','Hip circumference'], 
]
const goalNames = [['Сила','Strength'],['Набор массы','Mass gain'],['Потеря веса','Weight loss']]
const TrainingMeasurmentsOveview = ({theme,langIndex,fSize,data,filled,height,age,gender,goal,wrist}) => {




    return (
        <div style={{width:'100%',display:'flex',flexDirection:'column'}}>
            {!filled && <div style={{...styles(theme,fSize).subtext,textAlign:'center',marginTop:'10vh'}}>{langIndex === 0 ? 'Заполните персональные данные для рекомендаций и статистики' : 'Fill personal data to get statistic'} </div>}
      {filled && data[0].length > 0 && <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-start',alignItems:'center',width:'95%',alignSelf:'center',marginBottom:'20px'}} >
         <img src={icons[getBMIIndex(data,height)][gender]} alt="" style={{width:'30vw',height:'60vw',margin:'10px'}} />
         <div style={{width:'70%',justifyContent:'flex-start',alignItems:'flex-start'}}>
          <div style={{border:`1px solid ${Colors.get('border', theme)}`,borderRadius:'12px',boxShadow:`0px 0px 10px ${Colors.get('shadow', theme)}`,marginTop:'10px',display:'flex',flexDirection:'column',width:'90%',justifyContent:'center',alignItems:'flex-start',padding:'10px'}}>
           
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Возраст: ' : 'Age: ') + age + (langIndex === 0 ? ' лет' : ' yers old')}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Рост: ' : 'Height: ') + height + (langIndex === 0 ? ' см' : ' sm')}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Вес: ' : 'Weight: ') + measurmentString(data,0,langIndex)}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '% жира: ' : '% fat: ') + fatPercentString(data,height,age,gender)}</div>

           <div style={{...styles(theme, fSize).text,color:Colors.get('light', theme)}}>{(langIndex === 0 ? 'Цель: ' : 'Goal: ') + goalNames[goal][langIndex]}</div>
          </div>

          <div style={{border:`1px solid ${Colors.get('border', theme)}`,borderRadius:'12px',boxShadow:`0px 0px 10px ${Colors.get('shadow', theme)}`,display:'flex',flexDirection:'column',width:'90%',justifyContent:'center',alignItems:'flex-start',padding:'10px',marginTop:'8px'}}>
            <div style={{...styles(theme, fSize).text,width:'90%',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Пропорции' : 'Proportions'}</div>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center',width:'90%'}}>
              <GetWHR theme={theme} langIndex={langIndex} data={data}/>
              <GetWHTr theme={theme} langIndex={langIndex} data={data} height={AppData.pData.height}/>
            </div>
            <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Талия: ' : 'Waist: ') + measurmentString(data,1,langIndex)}</div>
            <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Бедра: ' : 'Hip: ') + measurmentString(data,4,langIndex)}</div>
            <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Грудь: ' : 'Chest: ') + measurmentString(data,3,langIndex)}</div>
            
          </div>

           <div style={{border:`1px solid ${Colors.get('border', theme)}`,borderRadius:'12px',boxShadow:`0px 0px 10px ${Colors.get('shadow', theme)}`,display:'flex',flexDirection:'column',width:'90%',justifyContent:'center',alignItems:'flex-start',padding:'10px',marginTop:'8px'}}>
            <div style={{...styles(theme, fSize).text,width:'90%',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Расчеты' : 'Calculations'}</div>
             <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Тип телосложения: ' : 'Body type: ') + bodyTypesNames(getBodyType(height,wrist,gender),langIndex)}</div>
           <div style={{...styles(theme, fSize).text,color:getBMIColor(theme,data, AppData.pData.height)}}>{(langIndex === 0 ? 'ИМТ: ' : 'BMI: ') + bmiString(data,langIndex,height)}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Идеальный вес: ' : 'Ideal weight: ') + (getIdealWeight(height,gender,getBodyType(height,wrist,gender)).toFixed(1)) + (langIndex === 0 ? ' кг':' kg')}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Базовый метаболизм: ' : 'Basic metabolism: ') + baseMetabolismString(data,langIndex,height,age,gender)}</div>
            
          </div>

         </div>
         
      </div>} 
      
      {filled && data[0].length > 0 &&  <RecomendationMeasurments bmi={getBaseMetabolism(data[0][data[0].length - 1]?.value, height, age, gender)} trains={getWeeklyTrainingAmount()}/>}
        </div>
    )
}
export default TrainingMeasurmentsOveview;
const styles = (theme,fSize,isCurrentGroup = false) =>
({
    panel :
        {
      display:'flex',
      flexDirection:'column',
      width: "100%",
      alignItems: "center",
      justifyItems: "center",
    },
  panelRow:
  {
    display:'flex',
    width:'90%',
    alignItems:'center',
    justifyContent:'flex-start',
    marginTop:'10px',
    gap:'10px',
    borderBottom:`1px solid ${Colors.get('border', theme)}`,
  },
  textDate:
    {
      textAlign: "center",
      fontSize: "18px",
      color: Colors.get('mainText', theme),
      marginBottom:'4px'
    },
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    margin:'2px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme)
  },
  icon:
  {
    fontSize: '18px',
    marginLeft:'15px',
    color: Colors.get('icons', theme)
  }
})

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
    status === 'normal' ? Colors.get('maxValColor', theme) :
    status === 'elevated' ? Colors.get('minValColor', theme) :
    Colors.get('danger', theme);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: bgColor,
      borderRadius: '5px',
      minWidth: '45%'
    }}>
      <span style={{ ...styles(theme, false, false, 14).text, color: Colors.get('background', theme), fontSize: '12px' }}>
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
    status === 'normal' ? Colors.get('maxValColor', theme) :
    status === 'elevated' ? Colors.get('minValColor', theme) :
    Colors.get('danger', theme);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: bgColor,
      borderRadius: '5px',
      minWidth: '45%'
    }}>
      <span style={{ ...styles(theme, false, false, 14).text, color: Colors.get('background', theme), fontSize: '12px' }}>
        {langIndex === 0 ? 'WHtR: ' : 'WHtR: '}
        {whtr.toFixed(2)}
      </span>
    </div>
  );
};
