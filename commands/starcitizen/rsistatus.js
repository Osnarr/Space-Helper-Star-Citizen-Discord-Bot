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

const axios = require('axios');
const cheerio = require('cheerio');
const { CommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');


const statusEmojis = {
  Operational: '<a:online:1081169135360294942>',
  Maintenance: '<a:offline:1081169189601022032>', 
  Partial: ':warning:', 
  Major: '<a:offline:1081169189601022032>', 
  Degraded: ':warning:', 
  Unknown: '❓', 
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rsistatus')
    .setDescription('Displays the current operational status of RSI services'),
    global: true,
  async execute(interaction = new CommandInteraction()) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'This command cannot be used in a DM',
        ephemeral: true,
      });
      return;
    }

    try {
      const htmlResponse = await axios.get('https://status.robertsspaceindustries.com/');
      const $ = cheerio.load(htmlResponse.data);

      const components = $('.component');

      const statusData = {};

      components.each((index, element) => {
        const componentName = $(element).text().trim();
        const status = $(element).find('.component-status').text().trim();
        statusData[componentName] = status;
      });

      const platformStatus = statusData['Platform'] || 'Operational';
      const puStatus = statusData['Persistent Universe'] || 'Operational';
      const eaStatus = statusData['Electronic Access'] || 'Operational';

      const isAllOperational =
        platformStatus === 'Operational' && puStatus === 'Operational' && eaStatus === 'Operational';

      const embedColor = isAllOperational ? '#00ff00' : '#ff9900';

      const embed = new EmbedBuilder()
        .setTitle('RSI Services Status')
        .setColor(embedColor)
        .addFields(
          {
            name: `Platform`,
            value: `${statusEmojis[platformStatus]} ${platformStatus}`,
          },
          {
            name: `Persistent Universe`,
            value: `${statusEmojis[puStatus]} ${puStatus}`,
          },
          {
            name: `Electronic Access`,
            value: `${statusEmojis[eaStatus]} ${eaStatus}`,
          }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while fetching the RSI services status. Please try again later.');
    }
  },
};
