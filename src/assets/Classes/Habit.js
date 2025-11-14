import {AppData} from '../StaticClasses/AppData.js';

export class Habit
{
    id = 0;
    isCustom = false;
    name = ["",""];
    category = ["",""];
    description = ["",""];
    src = "";
    constructor(n = ["Привычка","Habit"],c = ["Другое","Other"],d = ["Своя привычка","My custom habit"],
        id,isCustom = false,src = 'Art/HabitsIcons/Default.png')
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
        const image = new Image();
        image.src = src;
        image.onload = () => {
            this.src = src;
        }
        image.onerror = () => {
            this.src = 'Art/HabitsIcons/Default.png';
        }
    }
}
const path = 'Art/HabitsIcons/';
const DefaultHabits = [
    new Habit(["Пить воду","Drink water"],["Здоровье","Health"],
    ["Пить воду каждый день","Drink water every day"],0,false,path + 'Drink water' + '.png'),
    new Habit(["Разминка утром","Morning stretch"],["Здоровье","Health"],
    ["Сделать легкую зарядку","Do a light morning stretch"],1,false,path + 'Morning stretch' + '.png'),
    new Habit(["Медитация","Meditation"],["Здоровье","Health"],
    ["Медитировать 10 минут","Meditate for 10 minutes"],2,false,path + 'Meditation' + '.png'),
    new Habit(["Читать 20 страниц","Read 20 pages"],["Обучение","Learning"],
    ["Читать каждый день","Read every day"],3,false,path + 'Read 20 pages' + '.png'),
    new Habit(["10 000 шагов","10,000 steps"],["Здоровье","Health"],
    ["Пройти не менее 10 000 шагов","Walk at least 10,000 steps"],4,false,path + '10,000 steps' + '.png'),
    new Habit(["Спать 8 часов","Sleep 8 hours"],["Здоровье","Health"],
    ["Ложиться вовремя и спать 8 часов","Go to bed on time and sleep 8 hours"],5,false,path + 'Sleep 8 hours' + '.png'),
    new Habit(["Без сахара","No sugar"],["Здоровье","Health"],
    ["Избегать сахара сегодня","Avoid sugar today"],6,false,path + 'No sugar' + '.png'),
    new Habit(["Ведение дневника","Journaling"],["Развитие","Growth"],
    ["Записать мысли и итоги дня","Write thoughts and daily summary"],7,false,path + 'Journaling' + '.png'),
    new Habit(["План на день","Plan the day"],["Продуктивность","Productivity"],
    ["Составить список задач на день","Create a to-do list for the day"],8,false,path + 'Plan the day' + '.png'),
    new Habit(["Английский 30 минут","English 30 minutes"],["Обучение","Learning"],
    ["Позаниматься английским языком 30 минут","Study English for 30 minutes"],9,false,path + 'English 30 minutes' + '.png'),
    new Habit(["Убрать рабочее место","Tidy workspace"],["Дом","Home"],
    ["Навести порядок на рабочем столе","Organize your desk"],10,false,path + 'Tidy workspace' + '.png'),
    new Habit(["Отжимания 20 раз","20 push-ups"],["Фитнес","Fitness"],
    ["Сделать 20 отжиманий","Do 20 push-ups"],11,false,path + '20 push-ups' + '.png'),
    new Habit(["Йога 15 минут","Yoga 15 minutes"],["Здоровье","Health"],
    ["Позаниматься йогой 15 минут","Do yoga for 15 minutes"],12,false,path + 'Yoga 15 minutes' + '.png'),
    new Habit(["Пробежка 3 км","Run 3 km"],["Фитнес","Fitness"],
    ["Пробежать 3 километра","Run 3 kilometers"],13,false,path + 'Run 3 km' + '.png'),
    new Habit(["Фрукты и овощи","Fruits and veggies"],["Питание","Nutrition"],
    ["Съесть порцию фруктов,овощей","Eat a serving of fruits,vegetables"],14,false,path + 'Fruits and veggies' + '.png'),
    new Habit(["Принимать витамины","Take vitamins"],["Здоровье","Health"],
    ["Принять витамины","Take your vitamins"],15,false,path + 'Take vitamins' + '.png'),
    new Habit(["Кодить 1 час","Code 1 hour"],["Обучение","Learning"],
    ["Практика программирования 1 час","Practice coding for 1 hour"],16,false,path + 'Code 1 hour' + '.png'),
    new Habit(["Повторить слова","Review vocabulary"],["Обучение","Learning"],
    ["Повторить слова в словаре","Review vocabulary words"],17,false,path + 'Review vocabulary' + '.png'),
    new Habit(["Без соцсетей 1 час","No social media 1 hour"],["Продуктивность","Productivity"],
    ["Избегать соцсетей как минимум 1 час","Avoid social media for at least 1 hour"],18,false,path + 'No social media 1 hour' + '.png'),
    new Habit(["Проверить бюджет","Review budget"],["Финансы","Finance"],
    ["Проверить расходы и бюджет","Review expenses and budget"],19,false,path + 'Review budget' + '.png'),
    new Habit(["Позвонить близким","Call family"],["Отношения","Relationships"],
    ["Связаться с родными или друзьями","Reach out to family or friends"],20,false,path + 'Call family' + '.png'),
    new Habit(["Растяжка перед сном","Evening stretch"],["Здоровье","Health"],
    ["Сделать растяжку перед сном","Do a stretching routine before bed"],21,false,path + 'Evening stretch' + '.png'),
    new Habit(["Стакан воды утром","Morning glass of water"],["Здоровье","Health"],
    ["Выпить воду сразу после пробуждения","Drink water right after waking up"],22,false,path + 'Morning glass of water' + '.png'),
    new Habit(["Прогулка 20 минут","Walk 20 minutes"],["Здоровье","Health"],
    ["Погулять на улице 20 минут","Take a 20-minute walk"],23,false,path + 'Walk 20 minutes' + '.png'),
    new Habit(["Свежий воздух","Get fresh air"],["Здоровье","Health"],
    ["Провести время на свежем воздухе","Spend time outdoors"],24,false,path + 'Get fresh air' + '.png'),
    new Habit(["Заправить кровать","Make the bed"],["Дом","Home"],
    ["Заправить кровать утром","Make your bed in the morning"],25,false,path + 'Make the bed' + '.png'),
]

export let allHabits = [];

export function setAllHabits(){
    allHabits = [...DefaultHabits,...AppData.CustomHabits];
}



