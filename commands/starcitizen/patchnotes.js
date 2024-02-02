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
const { EmbedBuilder, SlashCommandBuilder, Colors, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const striptags = require('striptags');
const moment = require('moment');
const { splitItemsIntoPages } = require('discordjs-button-pagination');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config.json');


const { MongoClient } = require('mongodb');

async function saveDataToDatabase(data) {
    const uri = config.dbd.databaseLink;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('SpaceHelper');
        const collection = database.collection('patchnotes');
        await collection.insertOne(data);
        console.log('Data saved to database');
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}





module.exports = {
    data: new SlashCommandBuilder()
        .setName('patchnotes')
        .setDescription('Displays patch notes for Star Citizen')
        .addStringOption((option) =>
            option
                .setName('version')
                .setDescription('Select a patch note version')
                .setRequired(true)
                .addChoices(
                    { name: 'Star Citizen Alpha 3.20', value: 'https://robertsspaceindustries.com/comm-link//19456-Star-Citizen-Alpha-3200' },
                    { name: 'Star Citizen Alpha 3.18', value: 'https://robertsspaceindustries.com/comm-link//19126-Star-Citizen-Alpha-3180' },
                    { name: 'Star Citizen Alpha 3.17.5', value: 'https://robertsspaceindustries.com/comm-link//19091-Star-Citizen-Alpha-3175' },
                    { name: 'Star Citizen Alpha 3.17.4', value: 'https://robertsspaceindustries.com/comm-link//19017-Star-Citizen-Alpha-3174' }


                )
        ),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'This command cannot be used in a DM',
                ephemeral: true,
            });
            return;
        }

        const version = interaction.options.getString('version');
        console.log(`version: ${version}`);
        const url = version;

        let htmlResponse, $;
        try {
            htmlResponse = await axios.get(url);
            $ = cheerio.load(htmlResponse.data);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'An error occurred while trying to retrieve the patch notes.', ephemeral: true });
        }

        const titleElement = $('.title.no-subtitle').first();
        console.log('titleElement:', titleElement.text());
        const title = titleElement.text().trim();
        console.log('title:', title);

        const dateElement = $('div:contains("Date:")').first().find('p').text().trim();
        const date = moment(dateElement, 'MMMM Do YYYY').valueOf();
        const content = striptags($('div.content').first().html().trim());


        function splitContentIntoPages(content, maxCharsPerEmbed) {
            const pages = [];
            let currentPage = '';
            const lines = content.split('\n');
            for (const line of lines) {
                const currentLength = currentPage.length;
                const lineLength = line.length;
                if (currentLength + lineLength + 1 > maxCharsPerEmbed) {
                    pages.push(currentPage);
                    currentPage = line;
                } else {
                    currentPage += '\n' + line;
                }
            }
            pages.push(currentPage);
            return pages;
        }

        const formattedContent = content.replace(/\s*Back to Top\s*/, '');
        const MAX_EMBED_CHARS = 4096;
        const pages = splitContentIntoPages(formattedContent, MAX_EMBED_CHARS);



        const data = { title, date, content, pages };
        saveDataToDatabase(data);




        const embeds = pages.map((page, i) => {
            const newEmbed = new EmbedBuilder()
                .setTitle(title)
                .setURL(version)
                .setColor('#7842f5')
                .setTimestamp(date)
                .setDescription(Array.isArray(page) ? page.join('\n') : page);

            newEmbed.setFooter({ text: `Page ${i + 1} of ${pages.length}` });
            return { embed: newEmbed };
        });



        const paginationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle('Secondary')
                    .setDisabled(pages.length === 1),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle('Secondary')
                    .setDisabled(pages.length === 1)

            );

        embeds[0].components = [paginationRow];


        const message = await interaction.reply({ embeds: [embeds[0].embed], components: embeds[0].components });

        if (!message) {
            return interaction.reply({ content: 'Failed to send the message.', ephemeral: true });
        }


        const collector = message.createMessageComponentCollector({ time: 120000 });
        collector.on('error', console.error);



        const updateMessage = async (newPage) => {
            const embedToSend = embeds[newPage].embed;
            const componentsToSend = embeds[newPage].components;

            try {

                if (message.interaction && !message.deferred) {

                    await interaction.editReply({ embeds: [embedToSend], components: componentsToSend });
                } else {

                    await interaction.followUp({ embeds: [embedToSend], components: componentsToSend });
                }


                await interaction.followUp({ content: `You are now on page ${newPage + 1}`, ephemeral: true });
            } catch (error) {
                console.error(error);
            }
        };

        let currentPage = 0;
        let ephemeralMessage;


        collector.on('collect', async (interaction) => {
            switch (interaction.customId) {
                case 'prev':
                    if (currentPage !== 0) {
                        currentPage -= 1;
                        await updateMessage(currentPage);
                    }
                    break;

                case 'next':
                    if (currentPage !== pages.length - 1) {
                        currentPage += 1;
                        await updateMessage(currentPage);
                    }
                    break;
            }
        });



    }

}