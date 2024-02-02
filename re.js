const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const config = require('./Spacehelper/config/config.json');
const clientId = '1057655132373921812';
const guildId = '1089058359631683705';
const token = config.discord.token;;


const commands = [];

const commandDirs = ['general', 'moderation', 'starcitizen'];

for (const dir of commandDirs) {
  const commandFiles = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${dir}/${file}`);
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
