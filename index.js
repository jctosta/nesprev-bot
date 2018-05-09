// ################## IMPORTS ###################
const TeleBot = require('telebot');
const config = require('config');
const winston = require('winston');
const jetpack = require('fs-jetpack');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./subscribers');
const coffeeMachine = require('coffee-auto');

// ################## CONSTANTS #################

const APP_DIR =             config.get('bot_properties.application_dir');
const LOG_FOLDER =          config.get('bot_properties.log.folder');
const LOG_FILE =            config.get('bot_properties.log.file');
const TELEGRAM_TOKEN =      config.get('bot_properties.telegram_token');
const PROXY_ADDRESS =       config.get('bot_properties.proxy.address');

const coffeeMachine = new CoffeeMachine('/dev/ttyUSB0');

let subscribers = JSON.parse(localStorage.getItem('subscribers'));
if (subscribers === undefined || subscribers === null) {
    subscribers = [];
}

// ################## FILESYSTEM #################
jetpack.dir(APP_DIR).dir(LOG_FOLDER);

// ################## LOG ##################
winston.add(winston.transports.File, { filename: `${LOG_FOLDER}/${LOG_FILE}` });

// ################## TELEGRAM BOT ##################
const bot = new TeleBot({
    token: TELEGRAM_TOKEN,
    polling: {
        interval: 1000,
        timeout: 0,
        limit: 100,
        retryTimeout: 5000,
        proxy: PROXY_ADDRESS
    },
    usePlugins: ['askUser']
});

bot.on('/start', (msg) => {
    subscribers.push({
        chat_id: msg.from.id,
        name: msg.from.first_name
    });
    
    localStorage.setItem('subscribers', JSON.stringify(subscribers));
    
    return msg.reply.text(`Olá, eu sou o NesprevBot, o robô que te avisa se o café está pronto. Você não precisa fazer nada, eu sou bem pró-ativo, então vou sempre te avisar quando o café ficar pronto.`);
});

const processStandby = () => {
    bot.sendMessage(el.chat_id, `Olá ${el.name}, a cafeteira está parada!!!`)
                .then(() => { console.log('Message sent'); })
                .catch((e) => { console.error(e) });
};

const processWorking = () => {
    bot.sendMessage(el.chat_id, `Olá ${el.name}, a cafeteira está ligada, prepare a caneca!!!`)
                .then(() => { console.log('Message sent'); })
                .catch((e) => { console.error(e) });
};

const processFinished = () => {
    bot.sendMessage(el.chat_id, `Olá ${el.name}, o café está pronto. Pode subir!!!`)
                .then(() => { console.log('Message sent'); })
                .catch((e) => { console.error(e) });
};

coffeeMachine.on(CoffeeMachine.STAND_BY, processStandby);
coffeeMachine.on(CoffeeMachine.WORKING, processWorking);
coffeeMachine.on(CoffeeMachine.FINISH, processFinished);

coffeeMachine.powerOn();

bot.start();