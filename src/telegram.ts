import { Context, Telegraf } from "telegraf";

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

        this.bot.start((ctx) => this.onStartCommand(ctx));
        this.bot.on('message', (ctx) => this.onMessage(ctx))

        try {
            this.bot.launch();
        } catch (err) {
            log('Error launching Telegram Bot.', 'r');
            console.log(err);
            process.exit(1);
        }
        
        log('Telegram Bot launched.', 'g');
    }

    async onStartCommand(ctx: Context) {
        await this.sendStartMessage(ctx);
    }

    async onMessage(ctx: Context) {
        await this.sendStartMessage(ctx);
    }

    async sendStartMessage(ctx: Context) {
        try {
            const msg = `👉 <b>Select your region:</b>

<b>🔸 Europe - @BeRealEurope</b>
<b>🔸 USA - soon</b>
<b>🔸 Asia West - soon</b>
<b>🔸 Asia East - soon</b>`;

            await ctx.replyWithSticker('CAACAgUAAxkBAAEaEOFmYYOn14kUoun-9DRaf3rQwcm_OAAC4gEAAt8fchlQx5sHHkFPODUE');
            await ctx.replyWithHTML(msg);
        } catch (err) {
            log('Error sending message to Telegram.', 'r');
            console.log(err);
        }
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