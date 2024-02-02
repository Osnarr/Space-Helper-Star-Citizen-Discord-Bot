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

// Will need to updat this to use the api to get all the Manufacturers

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manufacturers')
    .setDescription('Displays information about the Star Citizen Manufacturers'),
  async execute(interaction) {
    if (!interaction.inGuild()) {
        await interaction.reply({
          content: 'This command cannot be used in a DM',
          ephemeral: true,
        });
        return;
      }
    const listOfShips = new EmbedBuilder()
      .setColor('#7842f5')
      .setTitle('Manufacturers')
      .setDescription('Here is list of all the manufacturers')
      .addFields(
        { name: '\u200B', value: '[Aegis Dynamics](https://starcitizen.tools/Aegis_Dynamics)\n[Anvil Aerospace](https://starcitizen.tools/Anvil_Aerospace)\n[AopoA](https://starcitizen.tools/AopoA)\n[ARGO Astronautics](https://starcitizen.tools/ARGO_Astronautics)\n[Banu Souli](https://starcitizen.tools/Banu)\n[Consolidated Outland](https://starcitizen.tools/Consolidated_Outland)\n[Crusader Industries](https://starcitizen.tools/Crusader_Industries)\n[Drake Interplanetary](https://starcitizen.tools/Drake_Interplanetary)\n[Esperia Inc.](https://starcitizen.tools/Esperia)\n[Gatac Manufacture](https://starcitizen.tools/Gatac_Manufacture)\n[Gatac Manufacture](https://starcitizen.tools/Gatac_Manufacture)\n[Kruger Intergalactic](https://starcitizen.tools/Kruger_Intergalactic)\n[Musashi Industrial and Starflight Concern](https://starcitizen.tools/Musashi_Industrial_and_Starflight_Concern)\n[Origin Jumpworks GmbH](https://starcitizen.tools/Origin_Jumpworks)\n[Roberts Space Industries](https://starcitizen.tools/Roberts_Space_Industries)'}
      )
      

    try {
      await interaction.reply({ embeds: [listOfShips] });
    } catch (error) {
      console.error(`Error sending help message: ${error}`);
    }
  },
};
