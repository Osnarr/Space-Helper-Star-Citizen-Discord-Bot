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
        .setName('serverinfo')
        .setDescription('Displays information about a user'),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'This command cannot be used in a DM',
                ephemeral: true,
            });
            return;
        }
        const guild = interaction.guild;
        const { createdAt, verificationLevel } = guild;

        const owner = await guild.fetchOwner();

        const botsCount = guild.members.cache.filter(member => member.user.bot).size;

        const textChannelsCount = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').size;
        const voiceChannelsCount = guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size;

        const bans = await guild.bans.fetch();

        // Text representation of verification levels
        const verificationLevels = [
            'None',
            'Low (Verified Email)',
            'Medium (Registered for 5 minutes)',
            'High (Member for 10 minutes)',
            'Very High (Verified Phone)'
        ];

        const guildInfoEmbed = new EmbedBuilder()
            .setColor('#7842f5')
            .setTitle(`Server (Guild) Information for ${guild.name}`)
            .setDescription(`Here's the information we could find for ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }) || 'No Icon')
            .addFields(
                { name: 'Guild ID', value: guild.id.toString(), inline: true },
                { name: 'Member Count', value: guild.memberCount.toString(), inline: true },
                { name: 'Guild Creation Date', value: createdAt.toUTCString(), inline: true },
                { name: 'Owner', value: `<@${owner.user.id.toString()}>`, inline: true },
                { name: 'Number of Bots', value: botsCount.toString(), inline: true },
                { name: 'Text Channels Count', value: textChannelsCount.toString(), inline: true },
                { name: 'Voice Channels Count', value: voiceChannelsCount.toString(), inline: true },
                { name: 'Verification Level', value: verificationLevels[verificationLevel], inline: true },
                { name: 'Number of Bans', value: bans.size.toString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [guildInfoEmbed] });

        // Get all colored roles in the guild
        const coloredRoles = guild.roles.cache.filter((role) => role.color !== 0).map((role) => role);

        // Create an array to store chunks of colored roles
        const roleChunks = [];

        // Split the colored roles into chunks to fit into the embeds
        const chunkSize = 70;
        while (coloredRoles.length) {
            roleChunks.push(coloredRoles.splice(0, chunkSize));
        }

        for (const chunk of roleChunks) {
            const roleEmbed = new EmbedBuilder()
                .setColor('#7842f5')
                .setTitle('Colored Roles')
                .setDescription(chunk.map((role) => `<@&${role.id}>`).join('\n'))
                .setTimestamp();

            await interaction.followUp({ embeds: [roleEmbed] });
        }
    },
};