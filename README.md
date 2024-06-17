<h1 align="center">
    💫 BeReal Notification Bot 💫
</h1>

<h4 align="center">
    ⚡️ Lightweight and fast Telegram Bot for delivering INSTANT BeReal notifications ⚡️
</h4>

<p align="center">
  <img src="https://i.ibb.co/jTY0yGz/2024-06-17-180303495.png" alt="BeReal Notification Bot"/>
</p>

## 🍹 **Try it out!**

📲 You can subscribe to INSTANT BeReal notifications in Telegram here: **https://t.me/BeRealNotifyBot**

## ❓ **How it works?**

- To obtain notification data, we use the internal API of the BeReal application, for example: [Click](https://mobile.bereal.com/api/bereal/moments/last/europe-west)
- To update the data, we use short polling with the interval specified in the `settings.json` file. Not the best variant, but this API does not support long polling or webhook methods.

## ☑️ **Installation**

### 🌄 **Requirements**

Tested on:
- **NodeJS** v21.7.1
- **NPM** v10.5.0

**Download:** https://nodejs.org/

### 💥 **Building**

1. Clone the repository and unzip to any folder.
2. Rename `settings.example.json` to `settings.json` and fill it with bot token and IDs of channels.
2. Run command: `npm i & npm run dev`

## 🎉 **Like it? Star it!**

Please rate this repository by giving it a star rating in the top right corner of the GitHub page (you must be logged in to your account). Thank you ❤️

![](https://i.ibb.co/x3hFFvf/2022-08-18-132617815.png)