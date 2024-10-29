const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const bedrock = require('bedrock-protocol');

// Replace with your webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1297609003123216524/ez0RnlIKJ9hC-PLLty7fUkCb1mkY7aeTR0q2sTqIaqXWgoAP2ON6RRwfYO5kNp8WuXL7';

// Minecraft bot options
const botOptions = {
  host: 'emosjavasmp.aternos.me',
  port: 33960,
  username: 'Hachinaa'
};

// Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

let mcBot;
let players = [];
let reconnecting = false; // Track reconnect state
let spamQueue = [];

// Setup event listeners
client.on("ready", async () => {
  await sendWebhookMessage(`${client.user.tag} has awakened`);
  client.user.setActivity(`Joined the emos smp rn`);

  try {
    await client.application.commands.set([
      {
        name: 'start',
        description: 'Starting the program'
      },
      {
        name: 'close',
        description: 'Terminating the program'
      },
      {
        name: 'say',
        description: 'Sends messages in chat',
        options: [
          {
            name: 'message',
            type: 3, // string
            description: 'Enter message to be sent in server',
            required: true
          }
        ]
      },
      {
        name: 'list',
        description: 'Shows list of active players in server'
      },
      {
        name: 'spamm',
        description: 'Spams messages in emos server',
        options: [
          {
            name: 'msg',
            type: 3,
            description: 'Message to be spammed',
            required: true
          },
          {
            name: 'times',
            type: 4,
            description: 'Number of times to spam message',
            required: true
          }
        ]
      }
    ]);

    await sendWebhookMessage('Commands registered successfully.');
  } catch (error) {
    await sendWebhookMessage('Failed to register commands: ' + error.message);
  }
});

// Handle incoming commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'start':
        await interaction.deferReply();
        await handleRecruitment(interaction);
        break;

      case 'close':
        await interaction.reply('Terminating the program...');
        await sendWebhookMessage('Program terminated.');
        process.exit(0);
        break;

      case 'say':
        await handleSayCommand(interaction);
        break;

      case 'list':
        await handleListCommand(interaction);
        break;

      case 'spamm':
        await handleSpamCommand(interaction);
        break;

      default:
        await interaction.reply('Unknown command.');
    }
  } catch (error) {
    await sendWebhookMessage(`Error handling command: ${error.message}`);
  }
});

// Handle 'say' command
async function handleSayCommand(interaction) {
  const servMsg = interaction.options.getString('message');
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Hachinaa')
    .setDescription('Message sent successfully');

  await interaction.deferReply();
  await interaction.followUp({ embeds: [embed] });

  mcBot.queue('text', {
    type: 'chat',
    needs_translation: false,
    source_name: mcBot.options.username,
    xuid: '',
    platform_chat_id: '',
    message: servMsg
  });
}

// Handle 'list' command
async function handleListCommand(interaction) {
  if (players.length === 0) {
    await interaction.reply('No players currently online.');
  } else {
    const embed = new EmbedBuilder()
      .setTitle('Online Players')
      .setDescription('List of players currently online:')
      .setColor(0x00FF00); // Green color for embed

    players.forEach(player => {
      embed.addFields({
        name: player.name,
        value: `Platform: ${player.platform}`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
}

// Handle 'spamm' command
async function handleSpamCommand(interaction) {
  const msg = interaction.options.getString('msg');
  const times = interaction.options.getInteger('times');

  if (times > 20) {
    await interaction.reply('Spamming more than 20 times is not allowed.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Hachinaa')
    .setDescription(`Spamming ${times} messages.`);

  await interaction.deferReply();
  await interaction.followUp({ embeds: [embed] });

  for (let i = 0; i < times; i++) {
    spamQueue.push(msg); // Queue the spam messages
    await delay(500); // Delay between messages to avoid overwhelming the server
  }

  processSpamQueue();
}

// Process the spam queue to avoid overloading the server
async function processSpamQueue() {
  while (spamQueue.length > 0) {
    const msg = spamQueue.shift();
    mcBot.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: mcBot.options.username,
      xuid: '',
      platform_chat_id: '',
      message: msg
    });

    await delay(500);
  }
}

// Handle bot connection and reconnection
async function handleRecruitment(interaction) {
  await sendWebhookMessage('Starting recruitment process...');

  mcBot = bedrock.createClient(botOptions);

  mcBot.on('connect', () => {
    sendWebhookMessage('Connected to the server');
    reconnecting = false; // Reset reconnecting flag on successful connection
  });

  mcBot.on('disconnect', (packet) => {
    sendWebhookMessage('Disconnected from the server: ' + JSON.stringify(packet));
    reconnect(); // Start reconnection process
  });

  mcBot.on('error', (error) => {
    sendWebhookMessage(`Connection error: ${error.message}`);
    reconnect(); // Retry connecting on errors
  });
  mcBot.on('text', (packet) => {
    sendWebhookMessage(`Text message received: ${packet.message}`);
  });

  mcBot.on('end', () => {
    sendWebhookMessage('Connection to server has ended.');
    reconnect(); // Start reconnection process
  });

  mcBot.on('player_list', (packet) => {
    handlePlayerList(packet);
  });

  mcBot.connect(); // Attempt to connect to the server
}

// Handle the player list
function handlePlayerList(packet) {
  if (packet.records && packet.records.records && packet.records.records.length > 0) {
    if (packet.records.type === "add") {
      for (const playerRecord of packet.records.records) {
        const id = playerRecord.build_platform;
        const username = playerRecord.username;
        const devices = {
          "0": "Undefined",
          "1": "Android",
          "2": "iPhone",
          "3": "Mac PC",
          "4": "Amazon Fire",
          "5": "Oculus Gear VR",
          "6": "Hololens VR",
          "7": "Windows PC 64",
          "8": "Windows PC 32",
          "9": "Dedicated Server",
          "10": "T.V OS",
          "11": "PlayStation",
          "12": "Nintendo Switch",
          "13": "Xbox One",
          "14": "WindowsPhone",
          "15": "Linux"
        };

        const existingPlayerIndex = players.findIndex((x) => x.uuid === playerRecord.uuid);
        if (existingPlayerIndex === -1) {
          players.push({
            name: username,
            uuid: playerRecord.uuid,
            platform: devices[id]
          });
          console.log(`\nPlayer Joined: ${username}\nUsing: ${devices[id]}\nTotal Players: ${players.length}`);
        }
      }
    } else if (packet.records.type === "remove") {
      for (const playerRecord of packet.records.records) {
        const index = players.findIndex((x) => x.uuid === playerRecord.uuid);
        const removedPlayer = players.splice(index, 1)[0];
        console.log(`\nPlayer left: ${removedPlayer.name}\nTotal Players: ${players.length}`);
      }
    }
  }
}

// Reconnect logic
function reconnect(attempt = 1) {
    if (reconnecting) return;
    reconnecting = true;
  
    const delay = Math.min(5000 * attempt, 60000); // Exponential backoff up to 1 minute
  
    sendWebhookMessage(`Attempting to reconnect in ${delay / 1000} seconds (Attempt ${attempt})...`);
  
    setTimeout(() => {
      mcBot.connect(); // Attempt to reconnect
      reconnecting = false;
      reconnect(attempt + 1); // Retry with increased delay if it fails again
    }, delay);
  }

// Send webhook message
async function sendWebhookMessage(message) {
  try {
    await axios.post(WEBHOOK_URL, {
      content: message
    });
  } catch (error) {
    console.error('Failed to send webhook message:', error.message);
  }
}

// Delay function for timing
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

client.login(process.env.TOKEN);
