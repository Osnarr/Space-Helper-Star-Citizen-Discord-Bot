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

const { Client, client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, User, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addMentionableOption(option =>
            option.setName('targetuser')
                .setDescription('The user you want to timeout.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (30m, 1h, 1 day')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('the reason for the timeout')
                .setRequired(false)
        ),
    global: true,

    permissionsRequired: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers],

    
    async execute(interaction) {
        if (!interaction.inGuild()) {
            await interaction.reply({
              content: 'This command cannot be used in a DM',
              ephemeral: true,
            });
            return;
          }
        console.log(interaction.options);
        const mentionable = interaction.options?.get('targetuser')?.value;
        console.log(mentionable);
        const duration = interaction.options?.get('duration')?.value;
        console.log(duration);
        const reason = interaction.options?.get('reason')?.value || "No reason provided";
        await interaction.deferReply();

        if (!mentionable) {
            await interaction.editReply("Please mention a valid user to timeout.");
            return;
        }

        const targerUser = await interaction.guild.members.fetch(mentionable);
        if (!targerUser) {
            await interaction.editReply("That user doesnt exist in this server");
            return;
        }
        if (targerUser.user.bot) {
            await interaction.editReply("I can't timeout a bot");
            return;
        }
        const msDuration = ms(duration);
        if (isNaN(msDuration)) {
            await interaction.editReply("Please provide a valid timeout duration");
            return;
        }
        if (msDuration < 5000 || msDuration > 2.419e9) {
            await interaction.editReply("Timeout duration cannot be less than 5 seconds or more than 28 days here is example how you use the command: /timeout username 10s this will mute them for 10s if you want to mute for 10 minutes do 10m");
            return;
        }
        const targetUserRolePosition = targerUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply("You can't timeout that user because they have the same/higher role than you");
            return;
        }
        if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply("I can't timeout that user because they have the same/higher role than me.");
            return;
        }

        try {
            const { default: prettyMs } = await import('pretty-ms');

            if (targerUser.isCommunicationDisabled()) {
                await targerUser.timeout(msDuration, reason);
                await interaction.editReply(`${targerUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}\nReason: ${reason}`);
                return;
            }

      await targerUser.timeout(msDuration, reason);
      await interaction.editReply(`${targerUser} was timed out for ${prettyMs(msDuration, { verbose: true })}\nReason: ${reason} `)

    } catch (error) {
      console.log(`there was an erro when timing out: ${error}`);
    }


  },

}