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

const { Permissions, PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('kick a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Select the user you want to kick')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('Enter the reason for the kick')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'This command cannot be used in a DM',
        ephemeral: true,
      });
      return;
    }
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    if (interaction.member && !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    if (interaction.guild && interaction.guild.me && !interaction.guild.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'I do not have permission to kick members.', ephemeral: true });
    }

    if (user.id === interaction.guild.ownerId) {
      return interaction.reply({ content: 'You cannot kick the server owner.', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (interaction.guild.me && member && member.roles.highest.position >= interaction.guild.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot kick that user because their role is higher than mine.', ephemeral: true });
    }

    try {
        await interaction.guild.members.kick(user, { reason: reason });
        return interaction.reply(`User ${user.tag} has been kicked.`);
      } catch (error) {
        console.error(error);
        if (error.code === 50013) {
          return interaction.reply({ content: `I cannot kick ${user.tag} because their role is higher than mine or they are a bot.`, ephemeral: true });
        }
        return interaction.reply('An error occurred while trying to kick the user.');
      }
  },
};
