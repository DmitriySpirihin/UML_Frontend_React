
import {AppData} from "../StaticClasses/AppData";
import { useState } from "react";
import { saveData } from "../StaticClasses/SaveHelper";
import {setShowPopUpPanel} from "../StaticClasses/HabitsBus";
import Colors from "../StaticClasses/Colors";
export class MuscleIcon{
    static muscleIconsSrc = {
        0:'images/BodyIcons/0.png',
        1:'images/BodyIcons/1.png',
        2:'images/BodyIcons/2.png',
        3:'images/BodyIcons/3.png',
        4:'images/BodyIcons/4.png',
        5:'images/BodyIcons/5.png',
        6:'images/BodyIcons/6.png',
        7:'images/BodyIcons/7.png',
        8:'images/BodyIcons/8.png',
        9:'images/BodyIcons/9.png',
        10:'images/BodyIcons/10.png',
        11:'images/BodyIcons/11.png',
        12:'images/BodyIcons/12.png',
        13:'images/BodyIcons/13.png'
    }
    static names = [
    [
        'Грудь',
        'Плечи',
        'Широчайшие',
        'Бицепс',
        'Трицепс',
        'Трапеции',
        'Нижняя спина',
        'Пресс',
        'Предплечья',
        'Квадрицепс',
        'Бицепс бедра',
        'Ягодицы',
        'Икры',
        'Шея'
    ],
    [
        'Chest',
        'Shoulders',
        'Lats',
        'Biceps',
        'Triceps',
        'Traps',
        'LowerBack',
        'Abs',
        'Forearms',
        'Quads',
        'Hamstrings',
        'Glutes',
        'Calves',
        'Neck'
    ]
];
    static get(name,lang,theme,needAmount = true) {
        return (
            <div style={{ display:'flex',width:'80%',marginLeft:'5%',flexDirection:'row',alignItems:'space-around',justifyContent:'space-between' }}>
            <p style={{ color: Colors.get('mainText',theme) ,fontSize:'13px'}}>{this.names[lang][name]}</p>
            <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            {needAmount ? <p style={{ color: Colors.get('subText',theme) ,fontSize:'12px',marginRight:'5px'}}>{allExercises().filter((exercise) => exercise.mgId == name).length + (lang === 0 ? ' упр' : ' ex')}</p> : null}
            <div style={{ width: '45px', height: '45px',border:`2px solid ${Colors.get('border',theme)}`,borderRadius:'50%',overflow:'hidden' }}>
                <img 
                    src={this.muscleIconsSrc[name]} 
                    style={{ width: '45px', height: '45px' }}
                />
            </div>
            </div>
            </div>
        );
    }
    static getForList(name,lang,theme) {
        return (
            <div style={{ width: '50px', height: '50px',fontSize:'12px',color:Colors.get('subText',theme)}}>
                <img 
                    src={this.muscleIconsSrc[name]} 
                    style={{ width: '50px'}}
                />
                {this.names[lang][name]}
            </div>
        );
    }
}
export const MuscleView = ({ programmId, theme, langIndex, programs }) => {
  const baseSrc = 'images/BodyIcons/Full.png';
  const muscleIconsSrc = {
    0: 'images/BodyIcons/Full_0.png',
    1: 'images/BodyIcons/Full_1.png',
    2: 'images/BodyIcons/Full_2.png',
    3: 'images/BodyIcons/Full_3.png',
    4: 'images/BodyIcons/Full_4.png',
    5: 'images/BodyIcons/Full_5.png',
    6: 'images/BodyIcons/Full_6.png',
    7: 'images/BodyIcons/Full_7.png',
    8: 'images/BodyIcons/Full_8.png',
    9: 'images/BodyIcons/Full_9.png',
    10: 'images/BodyIcons/Full_10.png',
    11: 'images/BodyIcons/Full_11.png',
    12: 'images/BodyIcons/Full_12.png',
    13: 'images/BodyIcons/Full_13.png'
  };

  const exercises = allExercises();
  const program = programs.find(p => p.id === programmId);

  // Safely handle missing program
  if (!program) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35vw', height: '35vw' }}>
        <div style={{ color: Colors.get('subText', theme), fontSize: '6px' }}>
          {langIndex === 0 ? 'Программа не найдена' : 'Program not found'}
        </div>
      </div>
    );
  }

  // 🔁 Collect unique muscle groups from ALL exercises in ALL days
  const categorySet = new Set(); // Use Set to avoid duplicates automatically

  program.schedule.forEach(day => {
    if (!Array.isArray(day.exercises)) return;
    day.exercises.forEach(({ exId }) => {
      const exercise = exercises.find(ex => ex.id === exId);
      if (exercise && exercise.mgId != null) {
        categorySet.add(exercise.mgId);
      }
    });
  });

  const categoryArray = Array.from(categorySet);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '35vw', height: '35vw', margin: '2%' }}>
      <div style={{ fontSize: '6px', marginBottom: '2px', color: Colors.get('subText', theme) }}>
        {langIndex === 0 ? 'Анализ мышц' : 'Muscle analysis'}
      </div>
      <div style={{ position: 'relative', display: 'block', width: '95%', height: '95%' }}>
        <img
          src={baseSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Body base"
        />
        {categoryArray.map((category, index) => (
          <img
            key={index}
            src={muscleIconsSrc[category]}
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: '1'
            }}
            alt={`Muscle group ${category}`}
          />
        ))}
      </div>
    </div>
  );
};
export const LastWeekMuscleView = ({ theme, langIndex }) => {
  const baseSrc = 'images/BodyIcons/Full.png';
  const muscleIconsSrc = {
    0: 'images/BodyIcons/Full_0.png',
    1: 'images/BodyIcons/Full_1.png',
    2: 'images/BodyIcons/Full_2.png',
    3: 'images/BodyIcons/Full_3.png',
    4: 'images/BodyIcons/Full_4.png',
    5: 'images/BodyIcons/Full_5.png',
    6: 'images/BodyIcons/Full_6.png',
    7: 'images/BodyIcons/Full_7.png',
    8: 'images/BodyIcons/Full_8.png',
    9: 'images/BodyIcons/Full_9.png',
    10: 'images/BodyIcons/Full_10.png',
    11: 'images/BodyIcons/Full_11.png',
    12: 'images/BodyIcons/Full_12.png',
    13: 'images/BodyIcons/Full_13.png'
  };

  // Helper function to format date key
  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Get last 7 days of sessions
  const today = new Date();
  const lastWeekSessions = [];
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = formatDateKey(date);
    
    if (AppData.trainingLog[dateKey]?.length) {
      lastWeekSessions.push(...AppData.trainingLog[dateKey]);
    }
  }

  const hasSessions = lastWeekSessions.length > 0;
  
  if (!hasSessions) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '35vw', 
        height: '35vw', 
        margin: '2%',
        color: Colors.get('subText', theme)
      }}>
        <div style={{ fontSize: '6px', textAlign: 'center' }}>
          {langIndex === 0 ? 'Нет тренировок за последнюю неделю' : 'No sessions in the last week'}
        </div>
      </div>
    );
  }

  // 🔸 Declare categorySet HERE (outside conditional blocks)
  const categorySet = new Set();
  const exercises = allExercises();
  
  // Collect unique muscle groups from all exercises in last week's sessions
  lastWeekSessions.forEach(session => {
  if (!session?.completed) return;
  
  Object.keys(session.exercises).forEach(exIdStr => {
    const exId = parseInt(exIdStr);
    const exercise = session.exercises[exIdStr];
    
    if (Array.isArray(exercise.sets) && exercise.sets.length > 0) {
      const exerciseObj = exercises.find(ex => ex.id === exId);
      if (exerciseObj?.mgId != null) {
        categorySet.add(exerciseObj.mgId);
      }
    }
  });
});

 const categoryArray = Array.from(categorySet);
const muscleNames = categoryArray
  .map(mgId => MuscleIcon.names[langIndex][mgId])
  .join(', ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45vw', margin: '2%' }}>
      
      <div style={{ position: 'relative', width: '95%', height: '45vw' }}>
        <img
          src={baseSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Body base"
        />
        {categoryArray.map((category, index) => (
          <img
            key={index}
            src={muscleIconsSrc[category]}
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: index + 1
            }}
            alt={`Muscle group ${category}`}
          />
        ))}
      </div>
      
      <p style={{ 
        fontSize: '13px', 
        color: Colors.get('subText', theme),
        textAlign: 'center',
        marginTop: '4px',
        maxHeight: '30px',
        overflow: 'hidden'
      }}>
        {langIndex === 0 ? 'Мышцы:' : 'Muscles:'} {muscleNames}
      </p>
    </div>
  );
};
export class Exercise{
    constructor(id,mgId,name,description,isBase){
        this.id = id;
        this.mgId = mgId;
        this.name = typeof name === 'string' ? [name,name] : name;
        this.description = typeof description === 'string' ? [description,description] : description;
        this.isBase = isBase;
    }
}

export class Program {
  constructor(id, name, description, schedule) {
    this.id = id;
    this.name = typeof name === 'string' ? [name, name] : name;
    this.description = typeof description === 'string' ? [description, description] : description;
    this.schedule = schedule || []; // array of { name, exercises }
  }
}

export const exercises = [
    // chest 0
    new Exercise(0,0,['Жим штанги лежа', 'Barbell Bench Press'],
    ['Упражнение для развития грудных мышц. Лягте на скамью, возьмитесь за штангу хватом чуть шире плеч, плавно опустите её к груди и выжмите вверх.',
    'A chest muscle exercise. Lie on the bench, grip the barbell slightly wider than shoulders, smoothly lower it to your chest and press up.'
    ],true),
    new Exercise(1,0,['Жим штанги лежа на наклонной скамье (угол 45°)','Incline Barbell Bench Press (45-degree angle)'],
    ['Упражнение для верхней части грудных мышц. Лягте на наклонную скамью под углом 45°, возьмитесь за штангу хватом чуть шире плеч. Медленно опустите её к верхней части груди и мощным движением выжмите вверх.',
    'An exercise for the upper chest muscles. Lie on a bench set at a 45-degree incline, grip the barbell slightly wider than shoulder width. Slowly lower the bar to the upper chest and press it up powerfully.'
    ],true),
    new Exercise(2,0,['Жим гантелей лежа','Dumbbell Bench Press'],
    ['Упражнение для грудных мышц. Лягте на горизонтальную скамью, возьмите гантели, опустите их к груди и выжмите вверх, сводя руки вместе.',
    'Chest exercise. Lie on a flat bench, hold dumbbells, lower them to your chest, then press up, bringing your arms together.'
    ],true),
    new Exercise(3,0,['Жим гантелей на наклонной скамье (угол 45°)','Incline Dumbbell Bench Press (45-degree angle)'],
    ['Упражнение для верхней части грудных мышц. Лягте на наклонную скамью под углом 45°, возьмите гантели, опустите их к верхней части груди и выжмите вверх.',
    'An exercise for the upper chest muscles. Lie on a bench set at a 45-degree incline, grip the barbell slightly wider than shoulder width. Slowly lower the bar to the upper chest and press it up powerfully.'
    ],true),
    new Exercise(4,0,['Разведения гантелей лежа','Dumbbell Flyes'],
    ['Изолирующее упражнение для грудных мышц. Лягте на горизонтальную скамью, держите гантели над грудью и мягко разводите руки в стороны до растяжения мышц, затем сводите обратно.',
    'Isolating chest exercise. Lie on a flat bench, hold dumbbells over your chest, slowly open your arms to the sides to stretch the muscles, then bring them back together.'
    ],false),
    new Exercise(5,0,['Пуловер','Dumbbell Pullover'],
    ['Упражнение для грудных и широчайших мышц. Лягте поперек скамьи, возьмите гантель двумя руками, вытяните ее за головой, почувствуйте растяжение, затем плавно верните в исходное положение.',
    'Exercise for chest and lat muscles. Lie across a bench, hold a dumbbell with both hands, extend it over your head, feel the stretch, then slowly return to the starting position.'
    ],false),
    new Exercise(6,0,['Жим в тренажёре','Machine Chest Press'],
    ['Упражнение для грудных мышц с контролем движения. Сядьте в тренажёр, возьмитесь за рукояти, плавно жмите их вперёд до полного выпрямления рук и возвращайте в исходное положение.',
    'Chest exercise with guided motion. Sit in the machine, grip the handles, press them forward until your arms are fully extended, then return to the starting position.'
    ],true),
    // shoulders
    new Exercise(7,1,['Жим гантелей сидя','Seated Dumbbell Shoulder Press'],
    ['Базовое упражнение для дельтовидных мышц. Сядьте на скамью, держите гантели на уровне плеч, выжмите их вверх до полного разгибания рук, затем плавно опустите обратно.',
    'Basic deltoid exercise. Sit on a bench, hold dumbbells at shoulder level, press them up until arms are fully extended, then slowly lower back down.'
    ],true),
    new Exercise(8,1,['Армейский жим штанги стоя','Standing Barbell Military Press'],
    ['Базовое упражнение для плеч. Встаньте, держите штангу на уровне плеч, выжмите вверх над головой и плавно опустите обратно.',
    'Basic shoulder exercise. Stand, hold the barbell at shoulder level, press it overhead, and slowly lower back down.'
    ],true),
    new Exercise(9,1,['Подъем гантелей в стороны','Dumbbell Lateral Raise'],
    ['Изолирующее упражнение для средней части плеч. Встаньте, держите гантели, поднимайте руки в стороны до уровня плеч, затем плавно опускайте.',
    'Isolating exercise for the middle deltoids. Stand, hold dumbbells, raise your arms sideways to shoulder level, then slowly lower.'
    ],false),
    new Exercise(10,1,['Тяга штанги к подбородку','Barbell Upright Row'],
    ['Базовое упражнение для плеч и трапеций. Встаньте, возьмите штангу узким хватом, подтяните её вертикально к подбородку, локти выше рук, затем опустите обратно.',
    'Basic exercise for shoulders and traps. Stand, grip the barbell narrowly, pull it vertically to your chin with elbows leading, then lower back down.'
    ],false),
    new Exercise(11,1,['Разведение гантелей в наклоне','Bent-Over Dumbbell Raise'],
    ['Изолирующее упражнение для задних дельт. Наклонитесь вперёд, держите гантели, разводите руки в стороны, концентрируясь на работе задней части плеч.',
    'Isolating exercise for rear delts. Bend forward, hold dumbbells, raise arms sideways, focusing on rear shoulder activation.'
    ],false),
    // lats
    new Exercise(12,2,['Подтягивания широким хватом','Wide-Grip Pull-Up'],
    ['Базовое упражнение для широчайших мышц спины. Возьмитесь за перекладину широким хватом, подтянитесь вверх, сводя лопатки, затем плавно опуститесь в исходное положение.',
    'Basic lat exercise. Grab the bar with a wide grip, pull yourself up while squeezing shoulder blades together, then slowly lower to the start.'
    ],true),
    new Exercise(13,2,['Тяга верхнего блока к груди','Lat Pulldown'],
    ['Упражнение для широчайших мышц. Сядьте в тренажёр, возьмитесь за рукоятку широкой хваткой, подтяните её к верхней части груди, затем плавно верните обратно.',
    'Lat muscle exercise. Sit in the machine, use a wide grip, pull the bar to your upper chest, then slowly release back.'
    ],true),
    new Exercise(14,2,['Тяга гантели одной рукой','One-Arm Dumbbell Row'],
    ['Изолирующее упражнение для широчайших. Упритесь одной рукой и коленом на скамью, второй рукой подтяните гантель к поясу, затем опустите.',
    'Isolating lat exercise. Place one hand and knee on the bench, pull the dumbbell to your waist with the other hand, then lower.'
    ],false),
    new Exercise(15,2,['Тяга штанги в наклоне','Bent-Over Barbell Row'],
    ['Базовое упражнение для спины. Наклонитесь вперёд со штангой в руках, подтяните её к поясу, сводя лопатки, затем плавно опустите.',
    'Basic back exercise. Bend forward with barbell in hands, row it to your waist while pinching shoulder blades, then lower slowly.'
    ],true),
    // biceps
    new Exercise(16,3,['Сгибание рук со штангой стоя','Barbell Curl'],
    ['Классическое упражнение для бицепса. Встаньте, возьмите штангу хватом снизу на ширине плеч, на вдохе согните руки в локтях, поднимая штангу к плечам, затем плавно опустите.',
    'Classic biceps exercise. Stand and hold a barbell with an underhand grip at shoulder width, curl it up to your shoulders, then slowly lower.'
    ],false),
    new Exercise(17,3,['Сгибание рук с гантелями поочередно','Alternating Dumbbell Curl'],
    ['Упражнение для бицепса. Стоя или сидя, поочередно сгибайте руки с гантелями, поднимая их к плечам, затем плавно опускайте.',
    'Biceps exercise. Stand or sit, alternately curl dumbbells up to your shoulders, then slowly lower back.'
    ],false),
    new Exercise(18,3,['Концентрированный подъем гантели','Concentration Curl'],
    ['Изолирующее упражнение для бицепса. Сидя, облокотите локоть на внутреннюю часть бедра, медленно поднимайте гантель до максимального сокращения, затем опускайте.',
    'Isolating biceps exercise. Sit and rest your elbow on your inner thigh, slowly curl the dumbbell up, fully contract, then lower.'
    ],false),
    new Exercise(19,3,['Тяга гантели одной рукой','One-Arm Dumbbell Row'],
    ['Изолирующее упражнение для бицепса. Сидя, облокотите локоть на внутреннюю часть бедра, медленно поднимайте гантель до максимального сокращения, затем опускайте.',
    'Isolating biceps exercise. Sit and rest your elbow on your inner thigh, slowly curl the dumbbell up, fully contract, then lower.'
    ],false),
    new Exercise(20,3,['Сгибание рук на скамье Скотта','Preacher Curl'],
    ['Упражнение для изоляции бицепса. Сядьте на скамью Скотта, возьмите гриф хватом снизу, медленно поднимайте к плечам и опускайте вниз.',
    'Isolating biceps exercise. Sit on the preacher bench, hold the barbell with an underhand grip, curl up to your shoulders, then lower.'
    ],false),
    new Exercise(21,3,['Молотковый подъем гантелей','Hammer Curl'],
    ['Упражнение для бицепса и предплечья. Держите гантели нейтральным хватом (ладони к телу), поднимайте их к плечам, затем опускайте.',
    'Biceps and forearm exercise. Hold dumbbells with a neutral grip (palms facing body), curl up to your shoulders, then lower.'
    ],false),
    // triceps
    new Exercise(22,4,['Жим штанги узким хватом','Close-Grip Barbell Bench Press'],
    ['Базовое упражнение для трицепса. Лягте на горизонтальную скамью, возьмите штангу узким хватом, опустите её к груди и выжмите вверх, чувствуя работу трицепса.',
    'Basic triceps exercise. Lie on a flat bench, grip the barbell with a narrow grip, lower it to your chest and press up, focusing on triceps activation.'
    ],true),
    new Exercise(23,4,['Французский жим лежа','Lying French Press (Skullcrusher)'],
    ['Упражнение для трицепса. Лягте на скамью, возьмите EZ-гриф или штангу узким хватом, опустите к лбу, затем выжмите вверх, сохраняя локти неподвижными.',
    'Triceps exercise. Lie on a bench, hold an EZ-bar or barbell with a narrow grip, lower it to your forehead, then press up, keeping elbows stationary.'
    ],false),
    new Exercise(24,4,['Разгибание рук на блоке','Triceps Pushdown'],
    ['Изолирующее упражнение для трицепса. Встаньте, возьмитесь за рукоятку верхнего блока, на выдохе разогните руки вниз, полностью сокращая трицепс, затем плавно верните.',
    'Isolating triceps exercise. Stand, grip the cable attachment, extend your arms down fully to contract triceps, then slowly return.'
    ],false),
    new Exercise(25,4,['Отжимания на брусьях','Dips'],
    ['Базовое упражнение для трицепса и груди. Удерживайтесь на брусьях, опуститесь до угла 90° в локтях, затем мощно выжмите себя вверх.',
    'Basic triceps and chest exercise. Support yourself on parallel bars, lower down until elbows are at 90°, then push yourself powerfully back up.'
    ],true),
    new Exercise(26,4,['Разгибание руки с гантелей в наклоне','Seated Overhead Dumbbell Extension'],
    ['Изолирующее упражнение для длинной головки трицепса. Сядьте, держите гантель двумя руками над головой, опустите её за голову, затем разогните вверх.',
    'Isolating long head triceps exercise. Sit, hold the dumbbell overhead with both hands, lower it behind your head, then extend arms upward.'
    ],false),
    //traps
    new Exercise(27,5,['Шраги со штангой','Barbell Shrugs'],
    ['Базовое упражнение для верхней части трапеций. Встаньте, возьмите штангу прямыми руками, поднимайте плечи вверх максимально высоко, затем опускайте вниз.',
    'Basic upper traps exercise. Stand and hold a barbell with arms straight, shrug your shoulders up as high as possible, then lower back down.'
    ],true),
    new Exercise(28,5,['Шраги с гантелями','Dumbbell Shrugs'],
    ['Аналогичное упражнение для трапеций с гантелями. Держите гантели по бокам, поднимайте плечи вверх максимально, затем опускайте вниз.',
    'Similar traps exercise using dumbbells. Hold dumbbells at your sides, shrug shoulders up as high as you can, then lower.'
    ],true),
    new Exercise(29,5,['Тяга штанги к подбородку','Barbell Upright Row'],
    ['Упражнение для трапеций и средней части плеч. Встаньте, возьмите штангу узким хватом, подтяните её вертикально к подбородку, локти выше кистей, затем опустите обратно.',
    'Exercise for traps and middle delts. Stand, grip the barbell narrowly, pull it vertically to your chin with elbows higher than wrists, then lower.'
    ],true),
    //lower back
    new Exercise(30,6,['Гиперэкстензия','Back Extension (Hyperextension)'],
    ['Базовое упражнение для укрепления поясницы. Лягте на гиперэкстензионную скамью, зафиксируйте ноги, опуститесь вниз с ровной спиной, затем поднимитесь до линии корпуса.',
    'Basic lower back exercise. Lie on a hyperextension bench, fix your legs, lower your torso with a straight back, then rise up to align with your body.'
    ],true),
    new Exercise(31,6,['Становая тяга','Deadlift'],
    ['Многосуставное базовое упражнение для всей задней цепи, включая поясницу. Возьмите штангу, спина прямая, поднимайте штангу до полного выпрямления корпуса и плавно опускайте.',
    'Compound basic exercise for the entire posterior chain, including the lower back. Grab the barbell, keep your back flat, lift it up until fully upright, then lower smoothly.'
    ],true),
    //Abs
    new Exercise(47,7,['Подъем ног в висе','Hanging Leg Raise'],
    ['Эффективное упражнение для развития мышц пресса. Повисните на турнике, держась руками, на выдохе поднимайте прямые ноги вверх, почувствуйте сокращение пресса, затем плавно опускайте ноги.',
    'Effective abs exercise. Hang from a pull-up bar with arms extended, raise straight legs up while exhaling to contract the abs, then slowly lower your legs back down.'
    ],false),
    //Forearms
    new Exercise(32,8,['Сгибание запястий со штангой','Barbell Wrist Curl'],
    ['Изолирующее упражнение для мышц предплечья. Сядьте, возьмите штангу снизу, положите предплечья на колени или скамью, выполняйте сгибание запястий вверх, затем опускайте вниз.',
    'Isolating forearm exercise. Sit, hold the barbell with an underhand grip, rest your forearms on knees or bench, curl wrists upward, then lower down.'
    ],false),
    new Exercise(33,8,['Разгибание запястий со штангой','Barbell Reverse Wrist Curl'],
    ['Упражнение для тыльной стороны предплечий. Сядьте, держите штангу сверху, предплечья на коленях или скамье, разгибайте запястья вверх и затем опускайте вниз.',
    'Forearm exercise for the extensor muscles. Sit, hold the barbell with an overhand grip, forearms rested, raise wrists upward and lower down.'
    ],false),
    //Quads
    new Exercise(34,9,['Приседания со штангой','Barbell Squat'],
    ['Базовое упражнение для квадрицепсов и всей нижней части тела. Встаньте, положите штангу на плечи, присядьте до параллели бедер с полом, затем вернитесь в исходное положение.',
    'Basic quad and lower body exercise. Stand, rest the barbell on your shoulders, squat down until your thighs are parallel to the floor, then return to standing.'
    ],true),
    new Exercise(35,9,['Приседания со штангой на груди','Barbell Front Squat'],
    ['Вариант базового упражнения для квадрицепсов и корпуса. Встаньте, держите штангу на передней части плеч, локти высоко, присядьте до параллели бедер с полом, затем поднимитесь.',
    'Variation of basic quad and core exercise. Stand, hold the barbell on the front of your shoulders, keep elbows high, squat down until thighs are parallel to the floor, then rise back up.'
    ],true),
    new Exercise(36,9,['Жим ногами в тренажере','Leg Press'],
    ['Упражнение для квадрицепсов и ягодиц. Сядьте в тренажёр, поставьте ноги на платформу на ширине плеч, выжмите платформу вверх, затем плавно опустите.',
    'Exercise for quads and glutes. Sit in the leg press machine, place feet shoulder-width on platform, press it upwards, then slowly lower.'
    ],true),
    new Exercise(37,9,['Выпады','Lunges'],
    ['Комплексное упражнение для квадрицепсов и ягодиц. Сделайте шаг вперед, опуститесь на одно колено, удерживая спину прямой, затем вернитесь в исходное положение.',
    'Compound exercise for quads and glutes. Step forward, lower into a lunge with rear knee almost touching the floor, keep your back straight, then return.'
    ],true),
    new Exercise(38,9,['Приседание на одной ноге с гантелей','Single-Leg Dumbbell Squat'],
    ['Упражнение для квадрицепсов, ягодиц и стабилизаторов. Встаньте на одну ногу, держите гантель в руках перед собой или в стороне, выполните приседание, сохраняя равновесие и опускаясь как можно ниже, затем вернитесь в исходное положение.',
    'Quad, glute, and stabilizer exercise. Stand on one leg, hold a dumbbell in front or at your side, squat down as low as you can while balancing, then return to the starting position.'
    ],true),
    //Hamstring
    new Exercise(39,10,['Сгибание ног лежа в тренажере','Lying Leg Curl'],
    ['Изолирующее упражнение для бицепса бедра. Лягте лицом вниз в тренажёр, зафиксируйте голени под валиком, сгибайте ноги, максимально сокращая мышцы, затем плавно опускайте.',
    'Isolating hamstring exercise. Lie face down in the machine, hook ankles under the pad, curl your legs up and fully contract the muscles, then slowly lower.'
    ],false),
    new Exercise(40,10,['Становая тяга на прямых ногах','Stiff-Legged Deadlift'],
    ['Базовое упражнение для задней группы бедра и поясницы. Встаньте, ноги чуть согнуты, держите штангу в руках, наклоняйтесь вперёд с ровной спиной, почувствуйте растяжение мышц, затем вернитесь.',
    'Basic hamstring and lower back exercise. Stand with knees slightly bent, hold barbell in hands, lean forward with flat back, feel the stretch in hamstrings, then return upright.'
    ],true),
    //Glutes
    new Exercise(41,11,['Ягодичный мостик','Hip Thrust'],
    ['Базовое упражнение для развития ягодичных мышц. Сядьте перед скамьёй, прижмитесь верхней частью спины, ноги согнуты, поставьте штангу на бедра, поднимайте таз вверх, затем плавно опускайте.',
    'Basic glute exercise. Sit in front of a bench, press your upper back against it, bend your knees, place a barbell on hips, thrust your hips up, then lower slowly.'
    ],true),
    new Exercise(42,11,['Выпады назад','Reverse Lunges'],
    ['Упражнение для ягодиц и ног. Стоя, сделайте широкий шаг назад, опуститесь до угла в колене, вернитесь в исходное положение.',
    'Glute and leg exercise. Stand, step backward wide, lower until knee bends, return to starting posture.'
    ],true),
    new Exercise(43,11,['Приседания сумо','Sumo Squat'],
    ['Упражнение для ягодиц и внутренней поверхности бедра. Встаньте широко, носки направлены наружу, держите гантель или штангу, присядьте, чувствуя работу ягодиц, затем вернитесь.',
    'Exercise for glutes and inner thigh. Stand wide, toes out, hold dumbbell or barbell, squat down feeling glutes, then return.'
    ],true),
    // Calves
    new Exercise(44,12,['Подъемы на носки стоя со штангой','Standing Barbell Calf Raise'],
    ['Базовое упражнение для икр. Встаньте прямо, положите штангу на плечи, поднимайтесь на носки максимально вверх, затем плавно опускайтесь вниз.',
    'Basic calf exercise. Stand upright with a barbell resting on your shoulders, rise up onto your toes as high as possible, then slowly lower back down.'
    ],true),
    new Exercise(45,12,['Подъем на носок одной ноги с гантелей','Single-Leg Dumbbell Calf Raise'],
    ['Упражнение для икр каждой ноги по отдельности. Встаньте на одну ногу на платформу, удерживайте гантель в руке, свободной рукой держитесь за опору, поднимайтесь на носок, затем опускайтесь вниз.',
    'Isolating calf exercise for each leg. Stand on one foot on a platform, hold a dumbbell in one hand, support yourself with the other hand, rise onto your toe, then lower down.'
    ],true),
    new Exercise(46,12,['Подъемы на носки сидя','Seated Calf Raise'],
    ['Упражнение для камбаловидной мышцы голени. Сядьте, поставьте стопы на платформу, разместите вес на коленях, поднимайте пятки вверх, затем опускайте.',
    'Exercise for the soleus muscle of the calf. Sit, place feet on a platform, rest weight on your knees, lift your heels up, then lower down.'
    ],false)
];
export const programs = [
    new Program(
        0,
        ['Трёхдневная классическая программа', '3 days classic'],
        ['Программа тренировок, рассчитанная на три дня в неделю, включает основные упражнения для всех групп мышц. После каждого тренировочного дня рекомендуется делать 1 или 2 дня отдыха для оптимального восстановления мышц и предотвращения перенапряжения.',
        'A training program designed for three days a week, includes basic exercises for all muscle groups. After each training day, it is recommended to take 1 or 2 rest days for optimal muscle recovery and injury prevention.'],
        [
           { name: ['Ноги и плечи', 'Legs & shoulders'], exercises:[{exId:34,sets:'3x12'},{exId:37,sets:'2x12'},{exId:7,sets:'3x12'},{exId:9,sets:'2x12'},{exId:27,sets:'2x15'}]},
           { name: ['Грудь,трицепсы','Chest & triceps'], exercises:[{exId:0,sets:'3x12'},{exId:3,sets:'2x12'},{exId:23,sets:'3x12'},{exId:26,sets:'2x12'},{exId:31,sets:'2x12'}]},
           { name: ['Спина,бицепсы','Back & biceps'], exercises:[{exId:31,sets:'1x12'},{exId:12,sets:'3x12'},{exId:17,sets:'3x12'},{exId:21,sets:'3x12'},{exId:45,sets:'3x15'}]}
        ]),
        
];

export const allExercises = () => [...AppData.exercises]; 

export async function addExercise(mgId,name,description,isBase){
    const newId = allExercises().length;
    const exercise = new Exercise(newId,mgId,name,description,isBase);
    AppData.exercises.push(exercise);
    setShowPopUpPanel(AppData.prefs[0] === 0 ? 'Новое упражнение: '+ name +' успешно добавлено' : 'New exercise: '+ name +' successfully added',2000,true);
    await saveData();
}
export async function updateExercise(id,mgId,name,description,isBase){
    const exercise = new Exercise(id,mgId,name,description,isBase,true);
    AppData.exercises = AppData.exercises.filter(exercise => exercise.id !== id);
    AppData.exercises.push(exercise);
    setShowPopUpPanel(AppData.prefs[0] === 0 ? 'Изменения успешно сохранены' : 'Changes successfully saved',2000,true);
    await saveData();
}
export async function removeExercise(id){
    AppData.exercises = AppData.exercises.filter(exercise => exercise.id !== id);
    setShowPopUpPanel(AppData.prefs[0] === 0 ? 'Упражнение успешно удалено' : 'Exercise successfully removed',2000,true);
    await saveData();
}
export async function addProgram(name,description){
    const newId = AppData.programs.length;
    const descr = description.length > 3 ? description : AppData.prefs[0] === 0 ? 'Новая программа' : 'New program';
    const program = new Program(newId,name,descr,[]);
    AppData.programs.push(program);
    setShowPopUpPanel(AppData.prefs[0] === 0 ? 'Новая программа: '+ name +' успешно добавлена' : 'New program: '+ name +' successfully added',2000,true);
    await saveData();
}
export async function redactProgram(id,name,description){
    const index = AppData.programs.findIndex((program) => program.id === id);
    AppData.programs[index].name = name;
    AppData.programs[index].description = description;
    await saveData();
}
export async function removeProgram(id){
    const index = AppData.programs.findIndex((program) => program.id === id);
    AppData.programs.splice(index,1);
    await saveData();
}
export async function addDayToProgram(pId, dayName) {
  const program = AppData.programs.find(p => p.id === pId);
  program.schedule.push({
    name: typeof dayName === 'string' ? [dayName, dayName] : dayName,
    exercises: []
  });
  await saveData();
}
export async function redactDayInProgram(pId, dayIndex, dayName) {
  const program = AppData.programs.find(p => p.id === pId);
  program.schedule[dayIndex].name = typeof dayName === 'string'? [dayName, dayName]: dayName;
  await saveData();
}
export async function removeDayFromProgram(pId, dayIndex) {
  const program = AppData.programs.find(p => p.id === pId);
  if (!program) {
    throw new Error(`Program with id ${pId} not found.`);
  }
  if (dayIndex < 0 || dayIndex >= program.schedule.length) {
    throw new Error(`Invalid day index ${dayIndex}.`);
  }
  program.schedule.splice(dayIndex, 1);
  await saveData();
}

export async function switchPosition(pId, type, switchType, index, exIndex = null) {
  const program = AppData.programs.find(p => p.id === pId);
  if (type === 0) {
    const schedule = program.schedule;
    const len = schedule.length;
    if (index < 0 || index >= len) return;

    if (switchType === 0) {
      const target = index + 1;
      if (target >= len) return;
      [schedule[index], schedule[target]] = [schedule[target], schedule[index]];
    } else if (switchType === 1) {
      const target = index - 1;
      if (target < 0) return;
      [schedule[index], schedule[target]] = [schedule[target], schedule[index]];
    }

   } else if (type === 1) {

    const day = program.schedule[index];
    if (!day) return;

    const exercises = day.exercises;
    const len = exercises.length;

    if (exIndex < 0 || exIndex >= len) return;

    if (switchType === 0) {
      // Move exercise DOWN
      const target = exIndex + 1;
      if (target >= len) return;
      [exercises[exIndex], exercises[target]] = [exercises[target], exercises[exIndex]];
    } else if (switchType === 1) {
      // Move exercise UP
      const target = exIndex - 1;
      if (target < 0) return;
      [exercises[exIndex], exercises[target]] = [exercises[target], exercises[exIndex]];
    }
  }
  await saveData();
}

export async function addExerciseToSchedule(pId, dayIndex, exerciseId, strategy = '3x10-12') {
  const program = AppData.programs.find(p => p.id === pId);
  const existing = program.schedule[dayIndex].exercises.find(ex => ex.exId === exerciseId);
  program.schedule[dayIndex].exercises.push({
    exId: exerciseId,
    sets: strategy
  });
  await saveData();
}
export async function removeExerciseFromSchedule(pId, dayIndex, exerciseId) {
  const program = AppData.programs.find(p => p.id === pId);
  const exercises = program.schedule[dayIndex].exercises;
  const index = exercises.findIndex(ex => ex.exId === exerciseId);
  if (index !== -1) {
    exercises.splice(index, 1);
  }
  await saveData();
}
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

