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
    .setName('userinfo')
    .setDescription('Displays information about a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to display information for'),
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) {
        await interaction.reply({
          content: 'This command cannot be used in a DM',
          ephemeral: true,
        });
        return;
      }
    const user = interaction.options.getUser('user') || interaction.user; 
    const member = interaction.guild.members.cache.get(user.id);

    const joinedTimestamp = member.joinedTimestamp;
    const createdTimestamp = user.createdTimestamp;

    const roles = member.roles.cache
      .filter((role) => role.name !== '@everyone')
      .map((role) => {
        return {
          name: 'Roles',
          value: `<@&${role.id}>`,
          inline: true,
        };
      });

    const embed = new EmbedBuilder()
      .setColor('#7842f5')
      .setTitle(`User information for ${user.tag}`)
      .setDescription(`Here's the information we could find for ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User Handle', value: `<@${user.id}>`, inline: true },
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(joinedTimestamp / 1000)}:R>` },
        { name: 'Account Created', value: `<t:${Math.floor(createdTimestamp / 1000)}:R>` },
        ...roles,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
