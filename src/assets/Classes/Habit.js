import {AppData} from '../StaticClasses/AppData.js';

export class Habit
{
    id = 0;
    isCustom = false;
    name = ["",""];
    category = ["",""];
    description = ["",""];
    iconName = "";
    constructor(n = ["Привычка","Habit"],c = ["Другое","Other"],d = ["Своя привычка","My custom habit"],
        id,isCustom = false,iconName = "")
    {
        if(Array.isArray(n))
        {
           this.name = n;
           this.category = c;
           this.description = d;
        }
        else
        {
            this.name = [n,n];
            this.category = [c,c];
            this.description = [d,d];
        }
        this.id = id;
        this.isCustom = isCustom;
        this.iconName = iconName;
    } 
}
const path = 'images/HabitsIcons/';
const DefaultHabits = [
// Health / Здоровье
new Habit(["Пить воду","Drink water"],["Здоровье","Health"],
    ["Пить воду каждый день","Drink water every day"],0,false,""),
new Habit(["Хороший сон","Sleep well"],["Здоровье","Health"],
    ["Спать 7–8 часов каждую ночь","Sleep 7–8 hours every night"],1,false,""),
new Habit(["Двигаться каждый день","Daily movement"],["Здоровье","Health"],
    ["Минимум 30 минут активности в день","At least 30 minutes of activity per day"],2,false,""),
new Habit(["Здоровое питание","Healthy eating"],["Здоровье","Health"],
    ["Есть больше овощей и цельных продуктов","Eat more veggies and whole foods"],3,false,""),
new Habit(["Уход за телом","Body care"],["Здоровье","Health"],
    ["Чистить зубы и ухаживать за телом ежедневно","Brush teeth and care for body daily"],4,false,""),
new Habit(["Силовая тренировка","Strength training"],["Здоровье","Health"],
    ["Делать силовую тренировку 2–3 раза в неделю","Do strength training 2–3 times per week"],5,false,""),
new Habit(["Бег","Running"],["Здоровье","Health"],
    ["Бегать несколько раз в неделю для выносливости и сердца","Run a few times a week for endurance and heart health"],6,false,""),
new Habit(["Ходьба","Walking"],["Здоровье","Health"],
    ["Ходить пешком не менее 30 минут в день","Walk at least 30 minutes a day"],7,false,""),
new Habit(["Растяжка или йога","Stretching or yoga"],["Здоровье","Health"],
    ["Делать растяжку или йогу для гибкости и восстановления","Do stretching or yoga for flexibility and recovery"],8,false,""),
new Habit(["Медитация и дыхание","Meditation & breathing"],["Здоровье","Health"],
    ["Медитировать или делать дыхательные практики для снижения стресса","Meditate or do breathing exercises to reduce stress"],9,false,""),


// Growth / Развитие
new Habit(["Чтение","Reading"],["Развитие","Growth"],
    ["Читать хотя бы 10–20 минут в день","Read at least 10–20 minutes a day"],10,false,""),
new Habit(["Обучение навыкам","Skill learning"],["Развитие","Growth"],
    ["Изучать новый навык или тему каждый день","Learn a new skill or topic every day"],11,false,""),
new Habit(["Иностранный язык","Foreign language"],["Развитие","Growth"],
    ["Практиковать иностранный язык каждый день","Practice a foreign language every day"],12,false,""),
new Habit(["Ведение дневника","Journaling"],["Развитие","Growth"],
    ["Писать краткий дневник или заметки о дне","Write a short journal or daily notes"],13,false,""),
new Habit(["Рефлексия","Reflection"],["Развитие","Growth"],
    ["Переосмысливать день и делать выводы","Reflect on the day and take lessons"],14,false,""),

// Productivity / Продуктивность
new Habit(["Планирование дня","Plan the day"],["Продуктивность","Productivity"],
    ["Составлять план задач на день","Create a daily to‑do plan"],15,false,""),
new Habit(["Главная задача дня","Main task"],["Продуктивность","Productivity"],
    ["Сначала делать одну самую важную задачу","Do one most important task first"],16,false,""),
new Habit(["Работа по таймеру","Focus sprints"],["Продуктивность","Productivity"],
    ["Работать блоками по 25–50 минут без отвлечений","Work in 25–50 minute focus blocks"],17,false,""),
new Habit(["Разбор входящих","Inbox review"],["Продуктивность","Productivity"],
    ["Разбирать почту и сообщения в определённое время","Process email and messages at set times"],18,false,""),
new Habit(["Вечерний обзор","Evening review"],["Продуктивность","Productivity"],
    ["Подводить итоги дня и готовить список на завтра","Review the day and prep tomorrow’s list"],19,false,""),

// Relationships & Recreation / Отношения и отдых
new Habit(["Контакт с близкими","Stay in touch"],["Отношения и отдых","Relationships & recreation"],
    ["Ежедневно писать или звонить близкому человеку","Message or call a close person daily"],20,false,""),
new Habit(["Качественное общение","Quality time"],["Отношения и отдых","Relationships & recreation"],
    ["Проводить время без гаджетов с близкими","Spend gadget‑free time with loved ones"],21,false,""),
new Habit(["Поддержка","Support"],["Отношения и отдых","Relationships & recreation"],
    ["Сделать маленький добрый жест для кого‑то","Do a small kind act for someone"],22,false,""),
new Habit(["Активное слушание","Active listening"],["Отношения и отдых","Relationships & recreation"],
    ["Слушать без перебиваний и оценок","Listen without interrupting or judging"],23,false,""),
new Habit(["Благодарность","Gratitude to others"],["Отношения и отдых","Relationships & recreation"],
    ["Каждый день благодарить кого‑то словами","Say thanks to someone every day"],24,false,""),
new Habit(["Хобби","Hobby time"],["Отношения и отдых","Relationships & recreation"],
    ["Уделять время любимому хобби","Spend time on a favorite hobby"],25,false,""),
new Habit(["Прогулка","Walk"],["Отношения и отдых","Relationships & recreation"],
    ["Гулять на свежем воздухе","Walk outside in fresh air"],26,false,""),
new Habit(["Сознательный отдых","Mindful rest"],["Отношения и отдых","Relationships & recreation"],
    ["Делать короткие перерывы без телефона","Take short breaks without the phone"],27,false,""),
new Habit(["Творчество","Creativity"],["Отношения и отдых","Relationships & recreation"],
    ["Рисовать, писать или создавать что‑то своё","Draw, write or create something"],28,false,""),
new Habit(["Цифровой детокс","Digital detox"],["Отношения и отдых","Relationships & recreation"],
    ["Выбирать время без соцсетей и новостей","Have time without social media and news"],29,false,""),

// Bad habits to quit / Вредные привычки
new Habit(["Сладкое и фастфуд","Sugar & fast food"],["Отказ от вредного","Bad habits to quit"],
    ["Сократить сладкое и фастфуд","Reduce sugar and fast food"],30,false,""),
new Habit(["Поздний отход ко сну","Late bedtime"],["Отказ от вредного","Bad habits to quit"],
    ["Не засиживаться допоздна без причины","Avoid staying up late without reason"],31,false,""),
new Habit(["Прокрастинация","Procrastination"],["Отказ от вредного","Bad habits to quit"],
    ["Не откладывать важные задачи","Stop postponing important tasks"],32,false,""),
new Habit(["Лишний экран","Excess screen time"],["Отказ от вредного","Bad habits to quit"],
    ["Уменьшить бессмысленный скроллинг","Reduce meaningless scrolling"],33,false,""),
new Habit(["Нездоровые перекусы","Unhealthy snacking"],["Отказ от вредного","Bad habits to quit"],
    ["Не заедать стресс вредными перекусами","Avoid stress‑snacking on junk food"],34,false,""),
new Habit(["Игры слишком много","Excessive gaming"],["Отказ от вредного","Bad habits to quit"],
    ["Сократить время за играми каждый день","Reduce daily gaming time"],35,false,""),
new Habit(["Порно","Porn use"],["Отказ от вредного","Bad habits to quit"],
    ["Не смотреть порно и избегать триггеров","Avoid watching porn and its triggers"],36,false,""),
new Habit(["Курение","Smoking"],["Отказ от вредного","Bad habits to quit"],
    ["Сократить и полностью бросить курение","Cut down and quit smoking"],37,false,""),
new Habit(["Алкоголь","Alcohol use"],["Отказ от вредного","Bad habits to quit"],
    ["Сократить и отказаться от алкоголя","Reduce and quit alcohol use"],38,false,""), 
]

export let allHabits = [];

export function setAllHabits(){
    allHabits = [...DefaultHabits,...AppData.CustomHabits];
}



