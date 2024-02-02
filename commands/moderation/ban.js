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
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Select the user you want to ban')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('Enter the reason for the ban')
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

    if (interaction.member && !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    if (interaction.guild && interaction.guild.me && !interaction.guild.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'I do not have permission to ban members.', ephemeral: true });
    }

    if (user.id === interaction.guild.ownerId) {
      return interaction.reply({ content: 'You cannot ban the server owner.', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (interaction.guild.me && member && member.roles.highest.position >= interaction.guild.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot ban that user because their role is higher than mine.', ephemeral: true });
    }

    try {
        await interaction.guild.members.ban(user, { reason: reason });
        return interaction.reply(`User ${user.tag} has been banned. Reason: **${reason}**`);
      } catch (error) {
        console.error(error);
        if (error.code === 50013) {
          return interaction.reply({ content: `I cannot ban ${user.tag} because their role is higher than mine.`, ephemeral: true });
        }
        return interaction.reply('An error occurred while trying to ban the user.');
      }
  },
};
