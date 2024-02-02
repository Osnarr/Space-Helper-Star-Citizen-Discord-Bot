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

const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Accept the server rules.')
        .addChannelOption(option =>
            option.setName('rules_channel')
                .setDescription('The channel where the server rules will be sent.')
                .setRequired(true)),

    async execute(interaction) {

        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'This command cannot be used in a DM',
                ephemeral: true,
            });
            return;
        }
        console.log('Starting the rules command...');
        const rulesChannel = interaction.options.getChannel('rules_channel');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await interaction.reply({ content: 'You do not have the required permissions to use this command. Also make sure I have **manage roles** permission' });
            return;
        }
        const exampleEmbed = new EmbedBuilder()
            .setColor('#7842f5')
            .setTitle('Rules')
            .setDescription('1. Be respectful\n You must respect all users, regardless of your liking towards them. Treat others the way you want to be treated.\n\n 2. No Inappropriate Language\nThe use of profanity should be kept to a minimum. However, any derogatory language towards any user is prohibited.\n\n3. No spamming\nDont send a lot of small messages right after each other. Do not disrupt chat by spamming.\n\n 4. No pornographic/adult/other NSFW material This is a community server and not meant to share this kind of material.\n\n5. No advertisements We do not tolerate any kind of advertisements, whether it be for other communities or streams. You can post your content in the media channel if it is relevant and provides actual value (Video/Art)\n\n 6. No offensive names and profile pictures You will be asked to change your name or picture if the staff deems them inappropriate.\n\n7. Server Raiding Raiding or mentions of raiding are not allowed.\n\n8. Direct & Indirect Threats\nThreats to other users of DDoS, Death, DoX, abuse, and other malicious threats are absolutely prohibited and disallowed.            ');
        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_rules')
                    .setLabel('Accept Rules')
                    .setStyle('Success')
            );

        try {
            await interaction.reply({ content: `Rules sent to ${rulesChannel}`, ephemeral: true });

            const message = await rulesChannel.send({ embeds: [exampleEmbed], components: [buttonRow] });
            console.log('Message sent');

            const filter = i => i.customId === 'accept_rules' && i.user.id === interaction.user.id;

            while (true) {
                const buttonInteraction = await interaction.channel.awaitMessageComponent({ filter });

                await buttonInteraction.deferReply({ ephemeral: true });

                // Check if the user has the required role
                const guild = buttonInteraction.guild;
                const member = await guild.members.fetch(buttonInteraction.user.id);
                const role = guild.roles.cache.find(role => role.name === 'accepted-roles');
                if (!role) {
                    try {
                        const createdRole = await guild.roles.create({
                            name: 'accepted-roles',
                            reason: 'Role for users who have accepted the server rules.'
                        });
                        console.log('Role created');
                        member.roles.add(createdRole);
                        console.log('Role added to member');
                        await buttonInteraction.editReply({ content: 'Thank you for accepting the server rules! ', ephemeral: true });
                    } catch (error) {
                        console.error(`Error creating role: ${error}`);
                    }
                } else if (member.roles.cache.has(role.id)) {
                    await buttonInteraction.editReply({ content: 'You have already accepted the server rules.', ephemeral: true });
                    console.log('User already has role');
                } else {
                    member.roles.add(role);
                    console.log('Role added to member');
                    await buttonInteraction.editReply({ content: 'Thank you for accepting the server rules!', ephemeral: true });
                }

                console.log('Reply sent');
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }
};