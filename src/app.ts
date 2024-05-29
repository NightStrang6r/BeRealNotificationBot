import c from 'chalk';
import fs from 'fs';

import log from './log.js';
import TelegramBot from './telegram.js';
import API from './API.js';
import constants from './constants.js';

import Settings from './Settings.js';
import Region from './enums/Region.js';
import NotificationData from './interfaces/NotificationData.js';


class App {
    private bot: TelegramBot;
    private api: API;

    constructor() {
        console.log(c.cyan(`BeReal Notification Bot v${constants.version}\n`));
        console.log(c.magenta(`By NightStranger\n\n`));
        process.on('uncaughtException', err => this.onUncaughtException(err));

        Settings.load();

        this.bot = new TelegramBot(Settings.token);
        this.api = new API(Settings.pollingInterval);
    }

    async run() {
        await this.bot.start();
        await this.api.startPolling([Region.EU], (region: Region, notification: NotificationData) => this.onNotification(region, notification));
    }

    async onNotification(region: Region, notification: NotificationData) {
        const message = `⚠️ It's time to BeReal. ⚠️`;

        log(`Sending notification for ${region}...`, 'g');
        await this.bot.sendNotification(region, message);
    }

    onUncaughtException(err: Error) {
        console.error('Caught exception: ', err);
        console.error(err.stack);
    }
}

export default App;