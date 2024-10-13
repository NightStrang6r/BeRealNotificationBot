import c from 'chalk';
import fetch from 'node-fetch';

import log from './log.js';
import constants from './constants.js';

import Region from './enums/Region.js';
import NotificationData from './interfaces/NotificationData.js';

class API {
    private readonly baseUrl: string = constants.BeRealAPI;

    totalRequests: number = 0;
    successfulRequests: number = 0;
    failedRequests: number = 0;
    totalRequestTime: number = 0;
    requestCount: number = 0;
    pollingInterval: number = 500;
    statsInterval: number = 3600000;

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

    async get(url: string): Promise<NotificationData | null> {
        const startTime = Date.now();
        this.totalRequests++;
        
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

            const endTime = Date.now();
            this.successfulRequests++;
            const requestTime = endTime - startTime;
            this.updateAverageRequestTime(requestTime);

            return json;
        } catch (error) {
            const endTime = Date.now();
            this.failedRequests++;
            const requestTime = endTime - startTime;
            this.updateAverageRequestTime(requestTime);

            log(`Error fetching data from ${url}`, 'r');
            console.error(error);
            return null;
        }
    }

    updateAverageRequestTime(requestTime: number) {
        this.requestCount++;
        this.totalRequestTime += requestTime;
    }

    getAverageRequestTime(): number {
        return this.requestCount > 0 ? this.totalRequestTime / this.requestCount : 0;
    }

    async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getNotificationStatus(region: Region): Promise<NotificationData | null> {
        try {
            const url = `${this.baseUrl}/${this.regions[region as keyof typeof this.regions]}`;
            return await this.get(url);
        } catch (error) {
            log(`Error fetching notification status for ${region}`, 'r');
            console.error(error);
            return null;
        }
    }

    async checkForNewNotification(region: Region): Promise<boolean | null> {
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
        this.startStatsLogging();

        while (true) {
            const promises = [];

            for (const region of regions) {
                promises.push(this.checkForNewNotification(region));
            }

            const results = await Promise.all(promises);

            for (let i = 0; i < regions.length; i++) {
                if (results[i]) {
                    log(`New notification in ${c.white(regions[i])}!`, 'g');
                    notificationCallback(regions[i], this.lastNotifications[regions[i]]);
                }
            }

            await this.sleep(this.pollingInterval);
        }
    }

    startStatsLogging() {
        setInterval(() => {
            const total = this.totalRequests;
            const successful = this.successfulRequests;
            const failed = this.failedRequests;
            const avgTime = this.getAverageRequestTime();

            log(`Stats for the last hour:`);
            log(`Total requests: ${total}`);
            log(`Successful requests: ${successful}`);
            log(`Failed requests: ${failed}`);
            log(`Average request time: ${avgTime.toFixed(2)} ms`);

            this.totalRequests = 0;
            this.successfulRequests = 0;
            this.failedRequests = 0;
            this.totalRequestTime = 0;
            this.requestCount = 0;

        }, this.statsInterval);
    }
}


export default API;