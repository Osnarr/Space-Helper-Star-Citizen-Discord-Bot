/***
 *       _____                                   _    _          _                       
 *      / ____|                                 | |  | |        | |                      
 *     | (___    _ __     __ _    ___    ___    | |__| |   ___  | |  _ __     ___   _ __ 
 *      \___ \  | '_ \   / _` |  / __|  / _ \   |  __  |  / _ \ | | | '_ \   / _ \ | '__|
 *      ____) | | |_) | | (_| | | (__  |  __/   | |  | | |  __/ | | | |_) | |  __/ | |   
 *     |_____/  | .__/   \__,_|  \___|  \___|   |_|  |_|  \___| |_| | .__/   \___| |_|   
 *              | |                                                 | |                  
 *              |_|                                                 |_|                  
 *
 *               
 *                          ┌──────────────────────────────────┐
 *                          │ Website: spacehelper.xyz         │
 *                          │ Dashboard: dash.spacehelper.xyz  │
 *                          │ Dasboard currently offline       │
 *                          └──────────────────────────────────┘
 *  
 */

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays information about the commands the bot has'),
  async execute(interaction) {
    const exampleEmbed = new EmbedBuilder()
      .setColor('#7842f5')
      .setTitle('Command List')
      .setDescription('Here are all the available commands:')
      .addFields(
        { name: 'Star Citizen 🚀', value: '`/search model model:<ship or vehicle name>`: Search for ships or ground vehicles\n`/search org org:<organization name>`: Search for organizations (requires Spectrum ID)\n`/search system system:<star system name>`: Search for star systems\n`/manufacturers`: Get a list of all the manufacturers\n`/rsistatus`: Get the status of RSI servers\n`/status`: Get the latest patch note that hit the live servers\n`/patchnotes`: Choose which patch note info you want to read' },
        { name: 'General 📔', value: '`/help`: Display all the commands\n`/user <user>`: Get user info\n`/rules`: Send predefined rules to a channel of your choice; once users accept the rules, they receive a role called "accepted-roles"\n`/dev`: Bot dev only command' },
        { name: 'Administration 🛠️', value: '`/ban <user>`: Ban members\n`/kick <user>`: Kick members\n`/timeout <user>`: Timeout members\n`/purge <amount>`: Remove messages' },
        { name: 'Star Citizen Lore 📖', value: '`/pyro`: Lore command bot will join voice channel\n`/banshee `: Lore command bot will join voice channel' }

      )


    try {
      await interaction.reply({ embeds: [exampleEmbed] });
    } catch (error) {
      console.error(`Error sending help message: ${error}`);
    }
  },
};
