import telegramAnalitics from '@telegram-apps/analytics';

const ANALYTICS_TOKEN = 5;//Secret token from ton builders
const APP_ID = 'ultymylife';


telegramAnalitics.init({
    token:ANALYTICS_TOKEN,
    appName:APP_ID,
})