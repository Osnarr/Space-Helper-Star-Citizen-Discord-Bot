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
    .setName('changelog')
    .setDescription('Displays bot changes'),
  async execute(interaction) {
    const exampleEmbed = new EmbedBuilder()
      .setColor('#7842f5')
      .setTitle('Changelog')
      .addFields(
        { name: 'New Features:', value: '- Added the ability to search for all Star Citizen star systems using the "search system" command.\n- Added the new "search image" command, which allows users to search for model images.\n- Added the new "search video" command, which allows users to search for videos of the model.' },
        { name: 'Improvements:', value: '- Improved the "search system" command to provide more accurate and relevant results.\n- Optimized the "search image" command to retrieve images quickly and efficiently.\n- Enhanced the "search video" command to display high-quality videos and filter out irrelevant results.' },
        { name: 'Bug Fixes:', value: '- Fixed a bug that caused the "search system" command to return incomplete or inaccurate results.\n- Fixed a bug that prevented the "search image" command from retrieving some images.\n- Fixed a bug that caused the "search video" command to crash or display errors.' }
      )
     
      .setFooter({ text: 'Version 1.1.0 | 03/04/2023' });

    try {
      await interaction.reply({ embeds: [exampleEmbed] });
    } catch (error) {
      console.error(`Error sending help message: ${error}`);
    }
  },
};
