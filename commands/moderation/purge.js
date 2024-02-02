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

const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Removes a specified number of messages from the current channel.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('How many messages you want to remove')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'This command cannot be used in a DM',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await interaction.reply({ content: 'You do not have the required permissions to use this command. Make sure you have **manage messages** permission' });
      return;
    }

    if (interaction.guild && interaction.guild.me && !interaction.guild.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await interaction.reply({ content: 'I do not have the required permissions to use this command. Make sure I have **manage messages** permission' });
      return;
    }

    if (interaction.member.permissions.has('ManageMessages')) {
      const numToDelete = interaction.options.getInteger('amount');
      if (numToDelete <= 0 || numToDelete > 100) {
        return interaction.reply('You can only delete between 1 and 100 messages.');
      }
      await interaction.channel.bulkDelete(numToDelete, true);
      return interaction.reply(`${numToDelete} messages have been removed from this channel.`);
    } else {
      return interaction.reply('You do not have permission to use this command.');
    }
  }

}

