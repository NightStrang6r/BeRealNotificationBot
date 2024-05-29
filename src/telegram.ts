import { Telegraf } from "telegraf";

import log from "./log.js";
import Settings from "./Settings.js";
import Region from "./enums/Region.js";

class TelegramBot {
    private token: string;
    private bot: Telegraf;

    constructor(token: string) {
        this.token = token;
        this.bot = new Telegraf(this.token);
    }

    async start(): Promise<void> {
        log('Starting Telegram bot...', 'c');

        try {
            this.bot.launch();
        } catch (err) {
            log('Error launching Telegram Bot.', 'r');
            console.log(err);
            process.exit(1);
        }
        
        log('Telegram Bot launched.', 'g');
    }

    async sendNotification(region: Region, text: string): Promise<void> {
        try {
            const channel = Settings.channels[region];
            await this.bot.telegram.sendMessage(channel, text);
        } catch (err) {
            log('Error sending notification to Telegram.', 'r');
            console.log(err);
        }
    }
}

export default TelegramBot;