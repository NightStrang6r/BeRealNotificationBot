import fs from 'fs';
import log from './log.js';

class Settings {
    static token: string;
    static pollingInterval: number;
    static channels: {
        EU: string;
        US: string;
        AW: string;
        AE: string;
    };

    static load() {
        try {
            const data = fs.readFileSync('settings.json', 'utf-8');
            const settings = JSON.parse(data);

            if (!settings.token || settings.pollingInterval == null || !settings.channels) {
                throw new Error('Invalid settings file.');
            }

            Settings.token = settings.token;
            Settings.pollingInterval = settings.pollingInterval;
            Settings.channels = settings.channels;
        } catch (error) {
            log('Error loading settings.', 'r');
            console.error(error);
            process.exit(1);
        }
    }
}

export default Settings;