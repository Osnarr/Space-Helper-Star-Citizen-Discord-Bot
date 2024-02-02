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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('incident')
    .setDescription('Displays the latest incident from RSI services'),

  async execute(interaction) {
    try {
      if (!interaction.inGuild()) {
        await interaction.reply({
          content: 'This command cannot be used in a DM',
          ephemeral: true,
        });
        return;
      }

      const htmlResponse = await axios.get('https://status.robertsspaceindustries.com/');
      const $ = cheerio.load(htmlResponse.data);

      const latestIncident = $('.issue:not(.resolved)').first();

      if (!latestIncident.length) {
        await interaction.reply('There are no ongoing incidents at this time.');
        return;
      }

      const incidentTitle = latestIncident.find('h3').text().trim();
      const incidentStatus = latestIncident.find('.resolved').text().trim();
      const incidentTime = latestIncident.find('.date').text().trim();
      const incidentTags = latestIncident.find('.tags .tag').map((_, el) => $(el).text()).get().join(', ');
      const incidentDescription = latestIncident.find('.issue__content').text().trim();

      const isResolved = incidentStatus.toLowerCase() === '✔ resolved';

      const embedDescription = `**Incident Description:**\n${incidentDescription}`;

      const embed = new EmbedBuilder()
        .setTitle(incidentTitle.slice(0, 256))
        .setColor(isResolved ? '#00ff00' : '#ff0000')
        .setDescription(embedDescription)
        .addFields(
          { name: 'Incident Status', value: incidentStatus, inline: true },
          { name: 'Incident Time', value: incidentTime, inline: true },
          { name: 'Tags', value: incidentTags || 'N/A', inline: true }
        )

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while fetching the RSI status. Please try again later.');
    }
  },
};
