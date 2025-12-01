// Icons from different react-icons libraries
import { Colors } from './Colors';
import { 
  FaHeartbeat, FaAppleAlt, FaRunning, FaBook, FaBrain, FaWind,
  FaMoon, FaSun, FaCoffee, FaMedal, FaWater,FaSkull,
  FaBed, FaUtensils, FaBookReader, FaLaptopCode, FaMusic,
  FaRegSmile, FaRegClock, FaRegCalendarAlt, FaRegStar,
  FaUsers, FaUserFriends, FaShareAlt, FaPhone, FaComment, FaHeart,
  FaDollarSign, FaPiggyBank, FaChartLine, FaShoppingCart, FaChartPie,
  FaBroom, FaTshirt, FaShoppingBasket, FaUtensilSpoon, FaSeedling,
  FaHandHoldingHeart, FaHandsHelping, FaBookOpen, FaPrayingHands, FaYinYang, FaOm,
  FaGraduationCap, FaLanguage, FaSearch, FaCode, FaMobileAlt,
  FaGamepad, FaCamera, FaVideo, FaPalette, FaPenFancy, FaGuitar,
  FaPuzzlePiece, FaPlane, FaHiking, FaBicycle, FaCar, FaUmbrellaBeach,
  FaHourglassHalf, FaBullseye, FaListOl, FaClipboardList, FaLaptopHouse, 
  FaWalking, FaSwimmer, FaMountain, FaBus, FaTrain, FaSubway, FaShip, 
  FaTaxi, FaMotorcycle, FaTruck, FaBoxOpen, FaBox, FaBoxes, 
  FaStore, FaShoppingBag, FaGift, FaWineGlass, FaTools, FaWrench,
  FaPray, FaCrosshairs, FaRocket, FaPlaneDeparture, FaPlaneArrival, FaWarehouse,
  FaCloud, FaCloudRain, FaPooStorm, FaSnowflake, FaSmog, FaThermometerHalf,
  FaBath, FaShower, FaToilet, FaToiletPaper, FaPumpSoap, FaHandsWash,
  FaScrewdriver, FaHammer, FaToolbox, FaThumbsUp, FaThumbsDown, FaHandPeace,
  FaHandPointUp, FaHandPointRight, FaHandPointLeft, FaHandPointDown
} from 'react-icons/fa';
import { 
  GiMeditation, GiMuscleUp, GiSittingDog, GiCookingPot, 
  GiWeightLiftingUp, GiRunningShoe, GiFruitBowl, GiHealthIncrease
} from 'react-icons/gi';
import { 
  BsJournalBookmark, BsJournalText, BsJournalCheck, 
  BsDroplet, BsLightbulb, BsAlarm
} from 'react-icons/bs';
import React from 'react';

class Icons {
    static ic = {
        // Default and general
        'default': FaRegSmile,
        'star': FaRegStar,
        'clock': FaRegClock,
        'calendar': FaRegCalendarAlt,
        'search': FaSearch,
        'settings': FaWrench,
        'tools': FaTools,
        'gift': FaGift,
        'shopping': FaShoppingBag,
        'store': FaStore,
        'box': FaBox,
        'boxes': FaBoxes,
        'package': FaBoxOpen,
        'transport': FaTruck,
        'travel': FaPlane,
        'bike': FaBicycle,
        'car': FaCar,
        'bus': FaBus,
        'train': FaTrain,
        'subway': FaSubway,
        'ship': FaShip,
        'taxi': FaTaxi,
        'motorcycle': FaMotorcycle,
        'hiking': FaHiking,
        'swimming': FaSwimmer,
        'mountain': FaMountain,
        'beach': FaUmbrellaBeach,
        'puzzle': FaPuzzlePiece,
        'game': FaGamepad,
        'camera': FaCamera,
        'video': FaVideo,
        'palette': FaPalette,
        'design': FaPenFancy,
        'music': FaMusic,
        'guitar': FaGuitar,
        'language': FaLanguage,
        'graduation': FaGraduationCap,
        'code': FaCode,
        'mobile': FaMobileAlt,
        'laptop': FaLaptopCode,
        'book': FaBook,
        'bookOpen': FaBookOpen,
        'users': FaUsers,
        'friends': FaUserFriends,
        'share': FaShareAlt,
        'phone': FaPhone,
        'comment': FaComment,
        'heart': FaHeart,
        'money': FaDollarSign,
        'savings': FaPiggyBank,
        'chart': FaChartLine,
        'pieChart': FaChartPie,
        'shoppingCart': FaShoppingCart,
        'basket': FaShoppingBasket,
        'clean': FaBroom,
        'clothes': FaTshirt,
        'utensils': FaUtensils,
        'spoon': FaUtensilSpoon,
        'seedling': FaSeedling,
        'helping': FaHandsHelping,
        'wine': FaWineGlass,

        // Health & Fitness
        'health': GiHealthIncrease,
        'heart': FaHeartbeat,
        'meditation': GiMeditation,
        'workout': GiWeightLiftingUp,
        'running': FaRunning,
        'exercise': GiMuscleUp,
        'stretching': GiRunningShoe, 
        'walking' : FaWalking,
        
        // Nutrition
        'food': FaUtensils,
        'fruit': FaAppleAlt,
        'meal': GiFruitBowl,
        'cooking': GiCookingPot,
        'water': BsDroplet,
        'coffee': FaCoffee,
        
        // Personal Development
        'reading': FaBook,
        'learning': FaBrain,
        'journaling': BsJournalText,
        'planning': BsJournalBookmark,
        'goals': FaMedal,
        'idea': BsLightbulb,
        
        // Sleep & Routine
        'sleep': FaBed,
        'wakeup': FaSun,
        'bedtime': FaMoon,
        'alarm': BsAlarm,
        'morning': FaSun,
        'night': FaMoon,
        
        // Work & Study
        'work': FaLaptopCode,
        'study': FaBookReader,
        'coding': FaLaptopCode,
        'meeting': BsJournalCheck,
        
        // Hobbies & Activities
        'music': FaMusic,
        'pet': GiSittingDog,
        'creativity': BsLightbulb,
        'hobby': FaRegSmile,
        'sport': GiRunningShoe,
        
        // Productivity
        'habit': BsJournalCheck,
        'task': FaRegCalendarAlt,
        'checklist': BsJournalCheck,
        'reminder': BsAlarm,
        'tracker': BsJournalBookmark,
        
        // Social & Relationships
        'family': FaUsers,
        'friends': FaUserFriends,
        'social': FaShareAlt,
        'phone': FaPhone,
        'message': FaComment,
        'date': FaHeart,
        
        // Finance
        'money': FaDollarSign,
        'savings': FaPiggyBank,
        'budget': FaChartLine,
        'shopping': FaShoppingCart,
        'investment': FaChartPie,
        
        // Home & Chores
        'cleaning': FaBroom,
        'laundry': FaTshirt,
        'grocery': FaShoppingBasket,
        'cooking': FaUtensilSpoon,
        'garden': FaSeedling,
        'bed': FaBed,
        
        // Mental Health
        'mindfulness': FaBrain,
        'gratitude': FaHandHoldingHeart,
        'therapy': FaHandsHelping,
        'breathing': FaWind,
        'journal': FaBookOpen,
        
        // Education
        'school': FaGraduationCap,
        'language': FaLanguage,
        'book': FaBook,
        'onlineCourse': FaLaptopHouse,
        'research': FaSearch,
        
        // Technology
        'coding': FaCode,
        'app': FaMobileAlt,
        'game': FaGamepad,
        'photo': FaCamera,
        'video': FaVideo,
        
        // Creative
        'art': FaPalette,
        'write': FaPenFancy,
        'music': FaGuitar,
        'dance': FaMusic,
        'craft': FaPuzzlePiece,
        
        // Travel
        'travel': FaPlane,
        'hike': FaHiking,
        'bike': FaBicycle,
        'car': FaCar,
        'beach': FaUmbrellaBeach,
        
        // Spiritual
        'prayer': FaPrayingHands,
        'yoga': FaYinYang,
        'meditation': FaOm,
        'gratitude': FaPray,
        'reflection': FaMoon,
        
        // Productivity
        'focus': FaCrosshairs,
        'time': FaHourglassHalf,
        'goal': FaBullseye,
        'routine': FaListOl,
        'plan': FaClipboardList,
        
        // Transportation
        'bus': FaBus,
        'train': FaTrain,
        'subway': FaSubway,
        'ship': FaShip,
        'taxi': FaTaxi,
        'motorcycle': FaMotorcycle,
        'truck': FaTruck,
        'rocket': FaRocket,
        'plane': FaPlane,
        'plane_departure': FaPlaneDeparture,
        'plane_arrival': FaPlaneArrival,
        
        // Shopping & Commerce
        'shopping_bag': FaShoppingBag,
        'gift': FaGift,
        'store': FaStore,
        'warehouse': FaWarehouse,
        'box': FaBox,
        'box_open': FaBoxOpen,
        'boxes': FaBoxes,
        
        // Weather
        'weather_sunny': FaSun,
        'weather_cloudy': FaCloud,
        'weather_rain': FaCloudRain,
        'weather_storm': FaPooStorm,
        'weather_snow': FaSnowflake,
        'weather_windy': FaWind,
        'weather_fog': FaSmog,
        'temperature': FaThermometerHalf,
        
        // Household
        'bath': FaBath,
        'shower': FaShower,
        'toilet': FaToilet,
        'toilet_paper': FaToiletPaper,
        'soap': FaPumpSoap,
        'hands_wash': FaHandsWash,
        
        // Tools
        'tools': FaTools,
        'wrench': FaWrench,
        'screwdriver': FaScrewdriver,
        'hammer': FaHammer,
        'toolbox': FaToolbox,
        
        // Hand Gestures
        'thumbs_up': FaThumbsUp,
        'thumbs_down': FaThumbsDown,
        'hand_peace': FaHandPeace,
        'hand_point_up': FaHandPointUp,
        'hand_point_right': FaHandPointRight,
        'hand_point_left': FaHandPointLeft,
        'hand_point_down': FaHandPointDown,
        'skull': FaSkull,
    };
    
    static getHabitIcon(habitName,props) {
      const iconMap = {
        "Пить воду": "water",
        "Хороший сон": "sleep",
        "Двигаться каждый день": "exercise",
        "Здоровое питание": "food",
        "Уход за телом": "health",
        "Силовая тренировка": "exercise",
        "Бег": "running",
        "Ходьба": "walking",
        "Растяжка или йога": "yoga",
        "Медитация и дыхание": "meditation",

        // Growth / Развитие
        "Чтение": "book",
        "Обучение навыкам": "learning",
        "Иностранный язык": "language",
        "Ведение дневника": "journaling",
        "Рефлексия": "reflection",

        // Productivity / Продуктивность
        "Планирование дня": "planning",
        "Главная задача дня": "goal",
        "Работа по таймеру": "focus",
        "Разбор входящих": "inbox",
        "Вечерний обзор": "planning",

        // Relationships & Recreation / Отношения и отдых
        "Контакт с близкими": "phone",
        "Качественное общение": "friends",
        "Поддержка": "helping",
        "Активное слушание": "friends",
        "Благодарность": "gratitude",
        "Хобби": "hobby",
        "Прогулка": "walking",
        "Сознательный отдых": "meditation",
        "Творчество": "creativity",
        "Цифровой детокс": "focus",

        // Bad habits to quit / Вредные привычки
        "Сладкое и фастфуд": "food",
        "Поздний отход ко сну": "bedtime",
        "Прокрастинация": "focus",
        "Лишний экран": "mobile",
        "Нездоровые перекусы": "food",
        "Игры слишком много": "game",
        "Порно": "skull",
        "Курение": "skull",
        "Алкоголь": "wine"
      };
      const iconName = iconMap[habitName] || 'default';
      return this.getIcon(iconName, props);
    }
    /**
     * Get an icon component by name
     * @param {string} name - The name of the icon
     * @param {Object} props - Additional props to pass to the icon
     * @returns {React.Element} A React element of the icon
     */
    static getIcon(name, props = {}) {
        const IconComponent = this.ic[name] || this.ic.default;
        const { style, ...otherProps } = props;
        return React.createElement(IconComponent, {
            size: 24,
            color: style?.color,  // Apply color directly as a prop
            style: {
                ...(style || {}),
                filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
                // Remove color from style to prevent conflicts
                ...(style?.color ? { color: undefined } : {})
            },
            ...otherProps
        });
    }
}

export default Icons;

