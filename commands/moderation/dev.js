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

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dev')
    .setDescription('Change the bot status')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to display in the status')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.user.id !== '332638959383347201') {
      return interaction.reply('You are not authorized to use this command.');
    }
    const text = interaction.options.getString('text');
    const activity = interaction.client.user.activities ? interaction.client.user.activities[0] : null;
    const type = activity ? activity.type : null;
    await interaction.client.user.setPresence({ activities: [{ name: text, type }] });
    interaction.reply(`Bot status text set to ${text}`);
  },
};
