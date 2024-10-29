# Remote Minecraft Server Messager
A discord bot that sends messages to a Minecraft servers, only for Bedrock Edition using `bedrock-protocol`

## Features

- Allows users to send messages remotely from discord to Minecraft Bedrock Edition servers.
- Can also listen to global messages sent in server and display them in a specific channel using webhooks

## Commands

- `/start` creates a minecraft client that connects to mentioned server ip and port (check setup).
  
- `/say <message>` sends the `message` in global chat, works only after the client is connected.
  
  
- `/spamm <message> <n>` sends the `message` `n` times in global chat. DO NOT use in servers when not allowed.
  
  
- `/list` sends an embed consisting of list of currently online players in the server.
  
  
- `/close` terminates the client.

## Setup

### Prerequisits

You must have -

- Node.js `v21.6.2`
- npm package `10.5.0`

You need to clone the repo at your end, once done -

### 1. Install Dependencies

   Open prompt to working directory and run

   ```bash
   npm i
   ```

### 2. Pre-run setup

   - To setup the bot, You must first create a discord bot. [Heres how to, if you are a beginner](https://discord.com/developers/docs/quick-start/getting-started)
   - Once a bot is setup, you would need to create a xbox account for the bot. Tutorials can be found on any platform.
   - Once your xbox account is ready, go to `/src/` in the directory you cloned the repo and create a .env file. The file should have the following variables-

   ```
    TOKEN1 = <discord bot token>
    WEBHOOK_URL= <discord webhook url>
    IP = <ip of server>
    PORT = <port of server>
    USERNAME = <your bot username, which is the xbox account gamertag>
  ```
- Create a WebHook [Here's how to if you are a beginner](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks}
- Copy the webhook url and paste it in the .env file

### 3. Running the bot

  - Once you have properly setup the bot and the .env files, run the following command (if you are in working directory)
  ```bash
  cd src
  node .
  ```
- If done properly, your discord bot will be online.
- Run the `/start` command, you will be prompted to first login with the xbox account made for bot.
- AFter logging in, your bot wont be prompted for authorization for a while after.

  You can now run the bot. Make sure to terminate the client by `/close`. The next time you use the bot, u have to run the command mentioned above again. A proper close command is WIP.

## Note

I am not responsible for what is done with this bot. It is for educational purpose only

   





