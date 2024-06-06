import c from 'chalk';
import fetch from 'node-fetch';

import log from './log.js';
import constants from './constants.js';

import Region from './enums/Region.js';
import NotificationData from './interfaces/NotificationData.js';

class API {
    private readonly baseUrl: string = constants.BeRealAPI;
    private readonly pollingInterval: number;

    private readonly regions: { [key in Region]: string } = {
        [Region.EU]: "bereal/moments/last/europe-west",
        [Region.AW]: "bereal/moments/last/asia-west",
        [Region.AE]: "bereal/moments/last/asia-east",
        [Region.US]: "bereal/moments/last/us-central"
    };

    private lastNotifications: { [key in Region]: NotificationData } = {
        [Region.EU]: { id: "", startDate: new Date(), endDate: new Date() },
        [Region.AW]: { id: "", startDate: new Date(), endDate: new Date() },
        [Region.AE]: { id: "", startDate: new Date(), endDate: new Date() },
        [Region.US]: { id: "", startDate: new Date(), endDate: new Date() }
    };

    constructor(pollingInterval: number) {
        this.pollingInterval = pollingInterval;
    }

    async get(url: string): Promise<NotificationData | null>{
        try {
            const headers: HeadersInit = {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Accept': 'application/json',
                'Connection': 'keep-alive'
            };   
                
            const response = await fetch(url, { headers });
            const json = await response.json() as NotificationData;

            if (json.id === null || json.startDate === null || json.endDate === null) {
                throw new Error('Invalid response from API.');
            }

            json.startDate = new Date(json.startDate);
            json.endDate = new Date(json.endDate);
            
            return json;
        } catch (error) {
            log(`Error fetching data from ${url}`, 'r');
            console.error(error);
            return null;
        }
    }

    async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getNotificationStatus(region: Region): Promise<NotificationData | null> {
        try {
            const url = `${this.baseUrl}/${this.regions[region as keyof typeof this.regions]}`;
            const response = await this.get(url);

            if (!response) {
                return null;
            }

            return response;
        } catch (error) {
            log(`Error fetching notification status for ${region}`, 'r');
            console.error(error);
            return null;
        }
    }

    async checkForNewNotification(region: Region): Promise<boolean | null>{
        const notification = await this.getNotificationStatus(region);

        if (!notification) {
            return false;
        }

        if (this.lastNotifications[region].id === "") {
            this.lastNotifications[region] = notification;
            return false;
        }

        if (this.lastNotifications[region].id !== notification.id) {
            this.lastNotifications[region] = notification;
            return true;
        }

        return false;
    }

    async startPolling(regions: Region[], notificationCallback: (region: Region, notification: NotificationData) => Promise<void>) {
        while (true) {
            const promises = [];

            const timeStart = Date.now();
            for (const region of regions) {
                log(`Checking for new notifications in ${c.white(region)}...`, 'c');
                promises.push(this.checkForNewNotification(region));
            }

            const results = await Promise.all(promises);
            const timeEnd = Date.now();
            const timeElapsed = timeEnd - timeStart;
            log(`Checked in ${c.white(`${timeElapsed}ms`)}`, 'c');

            for (let i = 0; i < regions.length; i++) {
                if (results[i]) {
                    log(`New notification in ${c.white(regions[i])}!`, 'g');
                    notificationCallback(regions[i], this.lastNotifications[regions[i]]);
                }
            }

            await this.sleep(this.pollingInterval);
        }
    }
}

export default API;