import telegramAnalitics from '@telegram-apps/analytics';

const ANALYTICS_TOKEN = 'eyJhcHBfbmFtZSI6InVsdHlteWxpZmUiLCJhcHBfdXJsIjoiaHR0cHM6Ly90Lm1lL1VsdHlNeUxpZmVfYm90IiwiYXBwX2RvbWFpbiI6Imh0dHBzOi8vZG1pdHJpeXNwaXJpaGluLmdpdGh1Yi5pby9VTUxfRnJvbnRlbmRfUmVhY3QvIn0=!YWQmPYQPeWy2yoZukgsefCMjc+IdM0qmIjMzLOuvbBc=';
const APP_ID = 'ultymylife';


telegramAnalitics.init({
    token:ANALYTICS_TOKEN,
    appName:APP_ID,
})