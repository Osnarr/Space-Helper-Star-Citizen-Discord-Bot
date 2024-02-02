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

//#region Libarys
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder, Colors, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../../config/config.json');

//#endregion

const cache = {};

const { MongoClient } = require('mongodb');
const MongoStore = require('connect-mongo');

const uri = config.dbd.databaseLink;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'SpaceHelper';

client.connect(err => {
    if (err) throw err;
    console.log('Connected to MongoDB!');

    // Set up MongoDB session store for caching search results
    const store = MongoStore.create({
        client: client,
        dbName: dbName,
        collectionName: 'sessions',
        stringify: false,
        touchAfter: 6 * 3600, // Cache will expiry after 6 hours and then it will make the API request again.
    });
});

function generateShipEmbed(data) {
    const embed = new EmbedBuilder();

    if (!data || data.length === 0 || !data[0]) {
        embed.setTitle('Ship Not Found')
            .setColor('#ff0000')
            .setDescription('Sorry, the ship data is not available.');
    } else {
        const shipData = data[0];

        embed.setTitle(shipData.name || 'N/A')
            .setDescription(shipData.description || 'N/A')
            .setColor('#7842f5')
            .setImage(shipData.storeImage || '');

        const thumbnailUrl = shipData.manufacturer?.logo;
        if (thumbnailUrl && thumbnailUrl.trim() !== '') {
            embed.setThumbnail(thumbnailUrl);
        }

        embed.addFields(
            { name: 'Manufacturer', value: shipData.manufacturer?.name || 'N/A', inline: true },
            { name: 'Station sold at', value: shipData.soldAt && shipData.soldAt[0]?.locationLabel || 'N/A', inline: true },
            { name: 'Ingame Price', value: shipData.priceLabel || 'N/A', inline: true },
            { name: 'Cargo Capacity', value: shipData.cargoLabel || 'N/A', inline: true },
            { name: 'Size', value: shipData.sizeLabel || 'N/A', inline: true },
            { name: 'Focus', value: shipData.focus || 'N/A', inline: true },
            { name: 'Crew Size (min-max)', value: `${shipData.minCrew || 'N/A'}-${shipData.maxCrew || 'N/A'}`, inline: true },
            { name: 'Pledge Price', value: shipData.pledgePriceLabel || 'N/A', inline: true },
            { name: 'Sale Price', value: shipData.lastPledgePriceLabel || 'N/A', inline: true },
            { name: 'Flight Status', value: shipData.productionStatus || 'N/A', inline: true },
            { name: 'Pledge Store', value: shipData.storeUrl ? `[Store](${shipData.storeUrl})` : 'N/A', inline: true },
            { name: 'Buyable in Pledge Store', value: shipData.onSale ? 'True' : 'False', inline: true }
        );
    }

    return embed;
}


function generateOrgEmbed(data) {
    const embed = new EmbedBuilder()
        .setTitle(data[0].data.name)
        .setDescription(data[0].data.headline.plaintext)
        .setColor('#7842f5')
        .setImage(data[0].data.banner)
        .setThumbnail(data[0].data.logo)
        .addFields(
            { name: 'Archetype', value: data[0].data.archetype || 'N/A', inline: true },
            { name: 'Commitment', value: data[0].data.commitment || 'N/A', inline: true },
            { name: 'Focus Primary', value: data[0].data.focus.primary.name || 'N/A', inline: true },
            { name: 'Focus Secondary', value: data[0].data.focus.secondary.name || 'N/A', inline: true },
            { name: 'Org Language', value: data[0].data.lang || 'N/A', inline: true },
            { name: 'Recruiting', value: data[0].data.recruiting ? 'True' : 'False', inline: true },
            { name: 'Roleplay', value: data[0].data.roleplay ? 'True' : 'False', inline: true },
            { name: 'SID', value: data[0].data.sid || 'N/A', inline: true },
            { name: 'Org url', value: data[0].data.href ? `[URL](${data[0].data.href})` : 'N/A', inline: true }

        )
    return embed;
};



module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a model, manufacturer, or star system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('model')
                .setDescription('Search for a model')
                .addStringOption(option =>
                    option.setName('model')
                        .setDescription('The name of the model you want to search for')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('org')
                .setDescription('Search for a org')
                .addStringOption(option =>
                    option.setName('org')
                        .setDescription('The name of the org you want to search for')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('system')
                .setDescription('Search for a star system')
                .addStringOption(option =>
                    option.setName('system')
                        .setDescription('The name of the star system you want to search for')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('video')
                .setDescription('Search for ship videos')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the model you want to see videos for')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('image')
                .setDescription('Search for a star system')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the model you want to see images for')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const searchQuery = interaction.options.getString('model') || interaction.options.getString('org') || interaction.options.getString('system') || interaction.options.getString('video') || interaction.options.getString('image'); // || interaction.options.getString('member')

        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'This command cannot be used in a DM',
                ephemeral: true,
            });
            return;
        }
        if (subcommand === 'model') {

            const modelNameSlug = interaction.options.getString('model');
            console.log(`Searching for model: ${modelNameSlug}`);

            const modelName = modelNameSlug.replace(/ /g, '-').toLowerCase();

            const cacheKey = `search_${modelName}`;
            const cachedResponse = cache[cacheKey];

            if (interaction.deferred || interaction.replied) {
                console.log('Interaction already replied to');
                console.log(`interaction.deferred: ${interaction.deferred}`);
                console.log(`interaction.replied: ${interaction.replied}`);
            } else {
                console.log('Deferring the interaction...');
                await interaction.deferReply({ ephemeral: false });
            }

            try {
                let data = [];
                let isModelFound = false;

                if (cachedResponse) {
                    const { data: cachedData, timestamp } = cachedResponse;
                    const elapsed = Date.now() - timestamp;
                    if (elapsed < 3600000) {
                        console.log(`Returning cached result for model: ${modelName}`);
                        const reply = await interaction.editReply({
                            embeds: [generateShipEmbed(cachedData)],
                            ephemeral: false,
                        });
                        return;
                    } else {
                        console.log(`Cached result expired for model: ${modelName}`);
                        delete cache[cacheKey];
                    }
                }

                console.log(`Fetching ship data for "${modelName}"...`);
                const response = await axios.get(
                    `https://api.fleetyards.net/v1/models/${encodeURIComponent(modelName)}`
                );
                if (response.data) {
                    data = { data: [response.data], timestamp: Date.now() };
                    isModelFound = true;
                } else {
                    console.log(`Ship not found for "${modelName}"`);
                    const similarShipsResponse = await axios.get(
                        `https://api.fleetyards.net/v1/models?search=${encodeURIComponent(modelName)}`
                    );
                    const similarShips = similarShipsResponse.data;
                    if (similarShips && similarShips.length > 0) {
                        const similarNames = similarShips.map((ship) => ship.slug);
                        const matches = stringSimilarity.findBestMatch(modelName, similarNames);
                        const mostSimilarName = matches.bestMatch.target;
                        console.log(`Did you mean: ${mostSimilarName}`);
                        return interaction.editReply({
                            content: `Ship not found. Did you mean "${mostSimilarName}"?`,
                            ephemeral: true,
                        });
                    } else {
                        console.log(`No similar match found for "${modelName}"`);
                        return interaction.editReply({
                            content: 'Ship not found.',
                            ephemeral: true,
                        });
                    }
                }

                if (isModelFound) {
                    const db = client.db(dbName);
                    const collection = db.collection('search_results');
                    await collection.insertOne({ model: modelName, data: data });
                    console.log(`Found ${data.data.length} result(s) for model: ${modelName}`);

                    cache[cacheKey] = data;
                    const reply = await interaction.editReply({
                        embeds: [generateShipEmbed(data.data)],
                        ephemeral: false,
                    });
                    return;
                }
            } catch (error) {
                console.error(error);
                console.log(`Error occurred while processing the command: ${error.message}`);
                return interaction.editReply({
                    content: `Model ${modelName} not found.`,
                    ephemeral: true,
                });
            }
            //#endregion

        } else if (subcommand === 'org') {
            const org = interaction.options.getString('org').replace(/ /g, '-');

            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: false });
            }

            try {
                let data = [];
                let isOrgFound = false;

                const response = await axios.get(`https://api.starcitizen-api.com/t4s8f43ILSxCRvUPiXbfWmVifYTYEzN1/v1/cache/organization/${encodeURIComponent(org)}`);

                if (response.data) {
                    data = { data: [response.data] };
                    isOrgFound = true;
                } else {
                    const similarOrgsResponse = await axios.get(`https://api.starcitizen-api.com/t4s8f43ILSxCRvUPiXbfWmVifYTYEzN1/v1/cache/organization/${encodeURIComponent(org)}`);
                    const similarOrgs = similarOrgsResponse.data;
                    if (similarOrgs && similarOrgs.length > 0) {
                        const firstSimilarOrg = similarOrgs[0].slug;
                        return interaction.editReply({
                            content: `Org not found. Did you mean "${firstSimilarOrg}"?`,
                            ephemeral: true,
                        });
                    } else {
                        return interaction.editReply({
                            content: 'Org not found.',
                            ephemeral: true,
                        });
                    }
                }

                if (isOrgFound) {
                    const reply = await interaction.editReply({
                        embeds: [generateOrgEmbed(data.data)],
                        ephemeral: false,
                    });
                    console.log(`Reply sent for org: ${org}`, reply);
                    return;
                }

            } catch (error) {
                console.error(error);
                console.log(`Error occurred while processing the command: ${error.message}`);
                return interaction.editReply({
                    content: `Org ${org} not found.`,
                    ephemeral: true,
                });
                //#endregion
            }

        } else if (subcommand === 'system') {

            // Here you can add more systems that will be replaced with a name that actually works it will swap the name that doesnt work with the correct one
            const systemNameMappings = {
                "ail'ka": "Ayr'ka",
                "th.us'ūng": "Pallas",
                "kai'pua": "Kayfa",
                "kyuk'ya": "Indra",
                "la'uo": "Virtus",
                "yā'mon": "Hadur"
                // MORE NAMES IF MORE ERRORS COME UP
            };

            const inputSystemName = interaction.options.getString('system').toLowerCase();
            const systemName = systemNameMappings[inputSystemName] || inputSystemName;

            const apiUrl = `https://api.starcitizen-api.com/t4s8f43ILSxCRvUPiXbfWmVifYTYEzN1/v1/cache/starmap/star-system?code=${encodeURIComponent(systemName)}`;
            console.log(`API URL: ${apiUrl}`);

            if (!interaction.deferred && !interaction.replied) {
                console.log('Deferring the interaction...');
                await interaction.deferReply({ ephemeral: false });
            }

            try {
                const response = await axios.get(apiUrl);

                if (response.data && response.data.data) {
                    const system = response.data.data;
                    const embed = new EmbedBuilder()
                        .setTitle(system.name)
                        .setDescription(system.description)
                        .setColor(system.affiliation[0].color ? system.affiliation[0].color : 'DarkAqua')
                        .addFields(
                            { name: 'Code', value: system.code, inline: true },
                            { name: 'Controlled by', value: system.affiliation[0].name, inline: true },
                            { name: 'Type', value: system.type, inline: true },
                            { name: 'Subtype', value: system.subtype ? system.subtype.name : 'Unknown', inline: true },
                            { name: 'Status', value: system.status, inline: true },
                            { name: 'Frost Line', value: system.frost_line, inline: true },
                            { name: 'Position', value: `x: ${system.position_x}, y: ${system.position_y}, z: ${system.position_z}` },
                            {
                                name: 'Celestial Objects',
                                value: system.celestial_objects.map(obj => `• ${obj.designation} (${obj.type})`).join('\n')
                            }

                        )
                        .setImage(system.thumbnail?.images?.product_thumb_large || 'https://cdn.discordapp.com/attachments/1089066701238313021/1092504589976227910/NO_IMAGE.png')
                    await interaction.editReply({ embeds: [embed], ephemeral: false });
                } else {
                    console.log(`No star system found with name ${systemName}.`);
                    await interaction.editReply({ content: `No star system found with name ${systemName}.`, ephemeral: true });
                }
            } catch (error) {
                console.error(error);
                console.log(`An error occurred while searching for the star system ${systemName}.`);
                await interaction.editReply({ content: `An error occurred while searching for the star system ${systemName}.`, ephemeral: true });
            }
        } else if (subcommand === 'video') {
            const modelName = interaction.options.getString('name');
            const modelNameSlug = modelName.replace(/ /g, '-').toLowerCase();
            const apiUrl = `https://api.fleetyards.net/v1/models/${modelNameSlug}/videos`;
            console.log(`API URL: ${apiUrl}`);

            if (!interaction.deferred && !interaction.replied) {
                console.log('Deferring the interaction...');
                await interaction.deferReply({ ephemeral: false });
            }

            try {
                const response = await axios.get(apiUrl);

                if (response.data.length > 0) {
                    const video = response.data[0];
                    const embed = new EmbedBuilder()
                        .setTitle(modelName)
                        .setDescription(`Here's a video of the ${modelName} model:`)
                        .setColor('#7842f5')
                        .setThumbnail(`https://api.fleetyards.net/v1/models/${modelNameSlug}/images`)
                        .setImage(`https://i3.ytimg.com/vi/${response.data[0].videoId}/hqdefault.jpg`)
                        .addFields(
                            { name: 'Video Type', value: video.type },
                            { name: 'Video URL', value: video.url }
                        );
                    await interaction.editReply({ embeds: [embed], ephemeral: false });
                } else {
                    console.log(`No ship model found with name ${modelName}.`);
                    await interaction.editReply({ content: `No ship model found with name ${modelName}.`, ephemeral: true });
                }
            } catch (error) {
                console.error(error);
                console.log(`An error occurred while searching for the ship model ${modelName}.`);
                await interaction.editReply({ content: `An error occurred while searching for the ship model ${modelName}.`, ephemeral: true });
            }
        } else if (subcommand === 'image') {
            client.connect((err) => {
                if (err) throw err;
                console.log('Connected to MongoDB!');

                // Create the collection to store image data
                const db = client.db(dbName);
                const collection = db.collection('images');
                collection.createIndex({ modelNameSlug: 1 }, { unique: true });
            });



            const modelName = interaction.options.getString('name');
            const modelNameSlug = modelName.replace(/ /g, '-').toLowerCase();
            const apiUrl = `https://api.fleetyards.net/v1/models/${modelNameSlug}/images`;

            if (!interaction.deferred && !interaction.replied) {
                console.log('Deferring the interaction...');
                await interaction.deferReply({ ephemeral: false });
            }

            try {
                const db = client.db(dbName);
                const collection = db.collection('images');

                let imageLinks = await collection.findOne({ modelNameSlug: modelNameSlug });
                if (!imageLinks) {
                    console.log('Not in cache, fetching from API...');
                    const response = await axios.get(apiUrl);
                    if (response.data.length > 0) {
                        imageLinks = response.data.map((image) => image.url);
                        collection.insertOne({ modelNameSlug: modelNameSlug, imageLinks: imageLinks });
                    } else {
                        console.log(`No ship model found with name ${modelName}.`);
                        await interaction.editReply({ content: `No ship model found with name ${modelName}.`, ephemeral: true });
                        return;
                    }
                } else {
                    console.log('Retrieved from cache!');
                    imageLinks = imageLinks.imageLinks;
                }

                // Only show the first 8 images
                imageLinks = imageLinks.slice(0, 8);

                const embeds = [];
                const thumbnail = `https://api.fleetyards.net/v1/models/${modelNameSlug}/images`;

                for (let i = 0; i < imageLinks.length; i++) {
                    const embed = new EmbedBuilder()
                        .setColor('#7842f5')
                        .setImage(imageLinks[i])
                        .setThumbnail(thumbnail)
                        .setURL('https://robertsspaceindustries.com/');

                    if (i === 0) {
                        embed.setTitle(modelName);
                        embed.setDescription(`Here are some images of the ${modelName} model:`);
                    }

                    embeds.push(embed);
                }

                await interaction.editReply({ embeds, ephemeral: false });
            } catch (error) {
                console.error(error);
                console.log(`An error occurred while searching for the ship model ${modelName}.`);
                await interaction.editReply({ content: `An error occurred while searching for the ship model ${modelName}.`, ephemeral: true });
            }
        }
    }
}


