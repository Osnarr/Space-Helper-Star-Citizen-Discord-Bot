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

const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Send feedback to the bot developers'),

        async execute(interaction) {
            const modal = new ModalBuilder()
                .setTitle('Feedback')
                .setCustomId('modal')

            const name = new TextInputBuilder()
                .setCustomId('name')
                .setRequired(false)
                .setLabel("Discord username (not requireed)")
                .setStyle(TextInputStyle.Short);

            const feedback = new TextInputBuilder()
                .setCustomId('feedback')
                .setRequired(true)
                .setLabel("Provide us with the feedback here")
                .setStyle(TextInputStyle.Paragraph);

            const firstActionRow = new ActionRowBuilder().addComponents(name)
            const secondActionRow = new ActionRowBuilder().addComponents(feedback)

            modal.addComponents(firstActionRow, secondActionRow)

            await interaction.showModal(modal);
        }

    }
