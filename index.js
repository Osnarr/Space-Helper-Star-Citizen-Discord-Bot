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


/* 

TODO: 

Optimize the modules and client.on stuff
Add premium features (Stripe intergration using the API)
Optimize search command logics
Move the modules to their own files
Make completely new Dashboard with next.js

*/


//#region Packages

//#region Discord stuff
const { Client, GatewayIntentBits, ChannelType, EmbedBuilder, Collection, Events, ActivityType, ModalBuilder, AuditLogEvent } = require('discord.js');

//#endregion

//#region Node Modules
const fs = require('node:fs');
const path = require('node:path');
const SoftUI = require('dbd-soft-ui');
//#endregion

//#region Guild Settings, Config, Discord Intents
const config = require('./Spacehelper/config/config.json');
let DBD = require('discord-dashboard');
const GuildSettings = require('./Spacehelper/utils/guildSettings.js');
const guildSettings = new GuildSettings();
const client = new Client({ intents: [3276791] })
const ejs = require('ejs')
client.login(config.discord.token);
//#endregion

//#endregion

//#region Database connection stuff
const MongoStore = require('connect-mongo');

guildSettings.connect()
    .then(() => {
        console.log('Connected to the database');
    })
    .catch((error) => {
        console.error('Failed to connect to the database', error);
    });
//#endregion

//#region REGISTERING SLASH COMMANDS
client.commands = new Collection();

// Specify the directories that contain command files
const commandDirs = ['general', 'moderation', 'starcitizen']; // These are also included in the files which you use to refresh the bot command cache

/* 

# General -> General purpose commands
# Moderation -> Server Moderation purpose Commands
# Star Citizen -> Search commands that use diff API's to obtain the info
# Lore -> Star Citizen lore commands 

*/
for (const dir of commandDirs) {
    const commandsPath = path.join(__dirname, './commands', dir);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

//#endregion REGISTERING SLASH COMMANDS

//#region Database stuff for announcement module.. REMOVE THESE LINES IF WEBSITE BECOMES LAGGY
const { MongoClient } = require('mongodb');

const mongoClient = new MongoClient(config.dbd.databaseLink, { useNewUrlParser: true, useUnifiedTopology: true });

const mongoStore = MongoStore.create({
    mongoUrl: config.dbd.databaseLink,
    mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
});
//#endregion

//#region PM2 Stuff
const pm2 = require('pm2');


const { WebhookClient } = require('discord.js');
const hook = new WebhookClient({ url: '' });

pm2.launchBus((err, bus) => {
    if (err) throw err;

    bus.on('log:out', data => {
        hook.send(data.data);
    });
});
//#endregion

//#region licence
(async () => {
    await DBD.useLicense(config.dbd.license);
    DBD.Dashboard = DBD.UpdatedClass();
    //#endregion

    //#region Welcome Module (Move this module to its own file)


    const welcomeChannelOption = {
        optionId: 'welcomeChannel',
        optionName: 'Welcome Channel',
        optionDescription: 'The channel where the welcome message will be sent',
        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
        getActualSet: async ({ guild }) => {
            return guildSettings.get(guild, 'welcomeChannel');
        },
        setNew: async ({ guild, newData }) => {
            await guildSettings.set(guild, 'welcomeChannel', newData);
        },

    };
    const welcomeMessageOption = {
        optionId: 'welcomeMessage',
        optionName: 'Welcome Message',
        optionDescription: 'The message that will be sent to the welcome channel <br><br>Here is some stuff you can use to make your welcome message even more amazing!<br><br> <h5>User handles</h5> <b style="color: #9fb7cf"> {user}</b>: Mentions the user (e.g. @Space Helper)<br><br><h6>Server handles</h6><b style="color: #9fb7cf">{server} </b> : Display the name of the server/guild <br><b style="color: #9fb7cf">{guildMembers}</b> : Display the guild non bot count <br><b style="color: #9fb7cf"><#channel_id></b> : Mention a specific channel in a message or command (replace "channel_id" with the actual ID of the channel)<br><b style="color: #9fb7cf"><@&role_id></b> : Mention a specific role in a message or command (replace "role_id" with the actual ID of the role)<br><br><h6>Extra handles</h6><b style="color: #9fb7cf"><:emoji_name:emoji_id></b> : Display a custom emoji in a message or command (replace "emoji_id" with the actual ID of the custom emoji) to get the emoji id you will need to get it like this <b style="color: #9fb7cf">&#92;:emoji_name:</b> replace the emoji_name with the actual emoji name also remember to have the <b style="color: #9fb7cf">&#92</b> infront of the :emoji_name:<br> &lt;a:emoji_name:emoji_id&gt; : Display an animated custom emoji with a custom text overlay (replace "emoji_name", "emoji_id", and "emoji_text" with the actual values for the emoji) to get the emoji id you will need to get it like this <b style="color: #9fb7cf">&#92;:emoji_name:</b> replace the emoji_name with the actual emoji name also remember to have the  <b style="color: #9fb7cf">&#92</b> infront of the :emoji_name: <br><br><h6>Text formating</h6> **Space Helper** : Will show the <b>Space Helper</b> bold<br>*Space Helper* : Will <i>Space Helper</i> italic<br>||Space Helper|| : Will display <spoiler>Space Helper</spoiler> as a spoiler ',
        optionType: DBD.formTypes.textarea('Welcome to the server, {user}! The guild currently has {guildMembers} members.', null, 300, false),

        getActualSet: async ({ guild }) => {
            return await guildSettings.get(guild, 'welcomeMessage') || 'Welcome to the **{server}**, {user}! \nThe guild currently has {guildMembers} members.';
        },

        setNew: async ({ guild, newData }) => {
            await guildSettings.set(guild, 'welcomeMessage', newData);
        },

        parseWelcomeMessage: async (message, guild) => {
            const guildMemberCount = guild.members.cache.filter(member => !member.user.bot).size;
            const messageWithGuildMembers = message.replace('{guildMembers}', guildMemberCount);
            const parsedMessage = messageWithGuildMembers.replace('{server}', guild.name);



            return parsedMessage;
        }


    };

    const welcomeEmbedColorOption = {
        optionId: 'welcomeEmbedColor',
        optionName: 'Welcome Embed Color',
        optionDescription: 'The color of the embed for the welcome message',
        optionType: DBD.formTypes.colorSelect('#ffffff', false),
        getActualSet: async ({ guild }) => {
            return await guildSettings.get(guild, 'welcomeEmbedColor') || '#ffffff';
        },
        setNew: async ({ guild, newData }) => {
            await guildSettings.set(guild, 'welcomeEmbedColor', newData);
        },
    };
    const showWelcomeEmbedOption = {
        optionId: 'showWelcomeEmbed',
        optionName: 'Welcome Message Module',
        optionDescription: 'Disable or Enable the welcome message module',
        optionType: DBD.formTypes.switch(false),
        getActualSet: async ({ guild }) => {
            const welcomeEnabled = await guildSettings.get(guild, 'welcomeEnabled');
            const showWelcomeEmbed = await guildSettings.get(guild, 'showWelcomeEmbed');
            return welcomeEnabled && showWelcomeEmbed;
        },
        setNew: async ({ guild, newData }) => {
            await guildSettings.set(guild, 'showWelcomeEmbed', newData);
            await guildSettings.set(guild, 'welcomeEnabled', newData);
        },
    };
    const enableWelcomeMessageButton = {
        buttonId: 'enableWelcomeMessage',
        buttonName: 'Enable Welcome Message',
        buttonDescription: 'Disable or Enable the welcome message module',
        buttonType: DBD.formTypes.switch(false),
        onInteraction: async ({ guild, newSettings }) => {
            await guildSettings.set(guild, 'welcomeEnabled', newSettings.welcomeEnabled);

        },

    };


    const welcomeCategory = {
        categoryId: 'welcome',
        categoryName: 'Welcome Message',
        categoryDescription: 'Configure the welcome message settings',
        categoryOptionsList: [
            welcomeChannelOption,
            welcomeMessageOption,
            welcomeEmbedColorOption,
            showWelcomeEmbedOption,
        ],
        categoryButtonsList: [
            enableWelcomeMessageButton,
            {
                buttonId: 'submit',
                buttonName: 'Submit',
                buttonDescription: 'Save changes',
                buttonType: DBD.formTypes.checkbox(),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild, 'welcomeChannel', newSettings.welcomeChannel);
                    await guildSettings.set(guild, 'welcomeMessage', newSettings.welcomeMessage);
                    await guildSettings.set(guild, 'welcomeEmbedColor', newSettings.welcomeEmbedColor);
                    await guildSettings.set(guild, 'showWelcomeEmbed', newSettings.showWelcomeEmbed);
                    await guildSettings.set(guild, 'welcomeEnabled', newSettings.showWelcomeEmbed);
                },

            },

        ],
    };
    //#endregion

    //#region Welcome Role Module (Move this module to its own file)
    const welcomeRoleOption = {
        optionId: 'welcomeRole',
        optionName: 'Welcome Role',
        optionDescription: 'The role that will be given to users on guild join',
        optionType: DBD.formTypes.rolesSelect(false),
        getActualSet: async ({ guild }) => {
            return guildSettings.get(guild.id, 'welcomeRole');
        },
        setNew: async ({ guild, newData }) => {
            await guildSettings.set(guild.id, 'welcomeRole', newData);
        },
    };

    const enableWelcomeRoleOption = {
        optionId: 'enableWelcomeRole',
        optionName: 'Enable Welcome Role',
        optionDescription: 'Disable or Enable the welcome role module',
        optionType: DBD.formTypes.switch(false),
        getActualSet: async ({ guild }) => {
            const welcomeEnabledRole = await guildSettings.get(guild, 'welcomeEnabledRole');
            const showWelcomeRole = await guildSettings.get(guild, 'showWelcomeRole');
            return welcomeEnabledRole && showWelcomeRole;
        },
        setNew: async ({ guild, newData }) => {
            await guildSettings.set(guild, 'showWelcomeRole', newData);
            await guildSettings.set(guild, 'welcomeEnabledRole', newData);
        },
    };

    const enableWelcomeRoleButton = {
        buttonId: 'enableWelcomeRole',
        buttonName: 'Enable Welcome Role',
        buttonDescription: 'Disable or Enable the welcome role module',
        buttonType: DBD.formTypes.switch(false),
        onInteraction: async ({ guild, newSettings }) => {
            await guildSettings.set(guild.id, 'welcomeEnabledRole', newSettings.welcomeEnabledRole);
            await guildSettings.set(guild.id, 'showWelcomeRole', newSettings.showWelcomeRole);
        },
    };

    const welcomeRoleCategory = {
        categoryId: 'welcomeRole',
        categoryName: 'Welcome Role',
        categoryDescription: 'Configure the welcome role settings',
        categoryOptionsList: [welcomeRoleOption, enableWelcomeRoleOption],
        categoryButtonsList: [
            enableWelcomeRoleButton,
            {
                buttonId: 'submit',
                buttonName: 'Submit',
                buttonDescription: 'Save changes',
                buttonType: DBD.formTypes.checkbox(),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild.id, 'welcomeEnabledRole', newSettings.welcomeEnabledRole);
                    await guildSettings.set(guild.id, 'showWelcomeRole', newSettings.showWelcomeRole);
                },
            }
        ],
    };
    //#endregion

    //#region Logs Module (Move this module to its own file)
    const logOptions = [
        {
            optionId: 'kickLogs',
            optionName: 'Kick Logs',
            optionDescription: 'Disable or Enable logging of kicked members',
            optionType: DBD.formTypes.switch(false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'kickLogs');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'kickLogs', newData);
            },
        },
        {
            optionId: 'kickLogsEmbedColor',
            optionName: 'Kick Logs Embed Color',
            optionDescription: 'Change the color for the unban logs embed',
            optionType: DBD.formTypes.colorSelect('#ffffff', false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'kickLogsEmbedColor');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'kickLogsEmbedColor', newData);
            },
        },
        {
            optionId: 'banLogs',
            optionName: 'Ban Logs',
            optionDescription: 'Disable or Enable logging of banned members',
            optionType: DBD.formTypes.switch(false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'banLogs');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'banLogs', newData);
            },
        },
        {
            optionId: 'banLogsEmbedColor',
            optionName: 'Ban Logs Embed Color',
            optionDescription: 'Change the color for the unban logs embed',
            optionType: DBD.formTypes.colorSelect('#ffffff', false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'banLogsEmbedColor');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'banLogsEmbedColor', newData);
            },
        },
        {
            optionId: 'unbanLogs',
            optionName: 'Unban Logs',
            optionDescription: 'Disable or Enable logging of unbanned members',
            optionType: DBD.formTypes.switch(false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'unbanLogs');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'unbanLogs', newData);
            },
        },
        {
            optionId: 'unbanLogsEmbedColor',
            optionName: 'Unban Logs Embed Color',
            optionDescription: 'Change the color for the unban logs embed',
            optionType: DBD.formTypes.colorSelect('#ffffff', false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'unbanLogsEmbedColor');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'unbanLogsEmbedColor', newData);
            },
        },
        {
            optionId: 'nameChangeLogs',
            optionName: 'Name Change Logs',
            optionDescription: 'Disable or Enable logging of member name changes',
            optionType: DBD.formTypes.switch(false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'nameChangeLogs');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'nameChangeLogs', newData);
            },
        },
        {
            optionId: 'nameChangeLogsEmbedColor',
            optionName: 'Name Change Logs Embed Color',
            optionDescription: 'Change the color for the name change logs embed',
            optionType: DBD.formTypes.colorSelect('#ffffff', false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'nameChangeLogsEmbedColor');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'nameChangeLogsEmbedColor', newData);
            },
        },
        {
            optionId: 'roleLogs',
            optionName: 'Role Logs',
            optionDescription: 'Disable or Enable logging of member role changes',
            optionType: DBD.formTypes.switch(false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'roleLogs');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'roleLogs', newData);
            },
        },
        {
            optionId: 'roleLogsEmbedColor',
            optionName: 'Role Logs Embed Color',
            optionDescription: 'Change the color for the role logs embed',
            optionType: DBD.formTypes.colorSelect('#ffffff', false),
            getActualSet: async ({ guild }) => {
                return guildSettings.get(guild, 'roleLogsEmbedColor');
            },
            setNew: async ({ guild, newData }) => {
                await guildSettings.set(guild, 'roleLogsEmbedColor', newData);
            },

        },
    ];
    const logsCategory = {
        categoryId: 'logs',
        categoryName: 'Logs',
        categoryDescription: 'Configure logging settings',
        categoryOptionsList: [
            {
                optionId: 'logsChannel',
                optionName: 'Logs Channel',
                optionDescription: 'The channel where logs will be sent',
                optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild, 'logsChannel');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild, 'logsChannel', newData);
                }
            },
            ...logOptions
        ],
        categoryButtonsList: [

            {
                buttonId: 'enableKickLogs',
                buttonName: 'Enable Kick Logs',
                buttonDescription: 'Disable or Enable logging of kicked members',
                buttonType: DBD.formTypes.switch(false),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild, 'kickLogs', newSettings.enableKickLogs);
                },
            },
            {
                buttonId: 'kickLogsEmbedColor',
                buttonName: 'Kick Logs Embed Color',
                buttonDescription: 'Change the color for the kick logs embed',
                buttonType: DBD.formTypes.colorSelect('#ffffff', false),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild, 'kickLogsEmbedColor');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild, 'kickLogsEmbedColor', newData);
                },
            },
            {
                buttonId: 'enableBanLogs',
                buttonName: 'Enable Ban Logs',
                buttonDescription: 'Disable or Enable logging of banned members',
                buttonType: DBD.formTypes.switch(false),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild, 'banLogs', newSettings.enableBanLogs);
                },
            },
            {
                buttonId: 'banLogsEmbedColor',
                buttonName: 'Ban Logs Embed Color',
                buttonDescription: 'Change the color for the ban logs embed',
                buttonType: DBD.formTypes.colorSelect('#ffffff', false),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild, 'banLogsEmbedColor');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild, 'banLogsEmbedColor', newData);
                },
            },
            {
                buttonId: 'enableUnbanLogs',
                buttonName: 'Enable Unban Logs',
                buttonDescription: 'Disable or Enable logging of unbanned members',
                buttonType: DBD.formTypes.switch(false),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild, 'unbanLogs', newSettings.enableUnbanLogs);
                },
            },
            {
                buttonId: 'unbanLogsEmbedColor',
                buttonName: 'Unban Logs Embed Color',
                buttonDescription: 'Change the color for the name unban logs embed',
                buttonType: DBD.formTypes.colorSelect('#ffffff', false),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild, 'unbanLogsEmbedColor');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild, 'unbanLogsEmbedColor', newData);
                },
            },
            {
                buttonId: 'enableNameChangeLogs',
                buttonName: 'Enable Name Change Logs',
                buttonDescription: 'Disable or Enable logging of member name changes',
                buttonType: DBD.formTypes.switch(false),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild, 'nameChangeLogs', newSettings.enableNameChangeLogs);
                },
            },
            {
                buttonId: 'nameChangeLogsEmbedColor',
                buttonName: 'Role Logs Embed Color',
                buttonDescription: 'Change the color for the name change logs embed',
                buttonType: DBD.formTypes.colorSelect('#ffffff', false),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild, 'nameChangeLogsEmbedColor');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild, 'nameChangeLogsEmbedColor', newData);
                },
            },
            {
                buttonId: 'enableRoleLogs',
                buttonName: 'Role Logs',
                buttonDescription: 'Disable or Enable logging of member role changes',
                buttonType: DBD.formTypes.switch(false),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild, 'roleLogs', newSettings.enableRoleLogs);
                },
            },
            {
                buttonId: 'roleLogsEmbedColor',
                buttonName: 'Role Logs Embed Color',
                buttonDescription: 'Change the color for the role logs embed',
                buttonType: DBD.formTypes.colorSelect('#ffffff', false),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild, 'roleLogsEmbedColor');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild, 'roleLogsEmbedColor', newData);
                },
            },

            {
                buttonId: 'submit',
                buttonName: 'Submit',
                buttonDescription: 'Save changes',
                buttonType: DBD.formTypes.checkbox(),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild, 'logsChannel', newSettings.logsChannel);
                    for (const logOption of logOptions) {
                        await guildSettings.set(guild, logOption.optionId, newSettings[logOption.optionId]);
                    }
                },
            },
        ],
    }



    //#endregion

    //#region Announcement Module Remove this module if the website becomes laggy (Move this module to its own file)
    const updateAnnouncementSubscription = async (guild) => {
        const isEnabled = await guildSettings.get(guild.id, 'announcementEnabled');
        const channelID = await guildSettings.get(guild.id, 'announcementChannel');
        const webhookID = await guildSettings.get(guild.id, 'announcementWebhookId');
        const existingWebhookUrl = await guildSettings.get(guild.id, 'announcementWebhookUrl');

        if (isEnabled && channelID) {
            try {
                const channel = await client.channels.fetch(channelID);
                if (channel) {
                    let webhook;
                    const webhooks = await channel.fetchWebhooks();

                    webhook = webhooks.find(w => w.owner.id === client.user.id);

                    if (!webhook) {
                        webhook = await channel.createWebhook({
                            name: 'Space Helper Announcements',
                            avatar: 'https://cdn.discordapp.com/attachments/1084597909212909688/1088138489356353597/spacehelper_robot.png',
                        });
                    }

                    console.log(`Webhook created for channel ${channel.name}: ${webhook.url}`); // The webhook gets stored in the database where you can fetch it. Will need to make this automatic so it would take all the webhooks from the database.

                    if (webhook.url !== existingWebhookUrl) {
                        await guildSettings.set(guild.id, 'announcementWebhookUrl', webhook.url);
                        await guildSettings.set(guild.id, 'announcementWebhookId', webhook.id);
                    }
                }
            } catch (error) {
                console.error(`Error creating or retrieving webhook for channel ${channelID}: ${error}`);
            }
        } else if (!isEnabled && webhookID && channelID) {
            try {
                const webhook = await client.fetchWebhook(webhookID);
                const channel = await client.channels.fetch(channelID);
                await webhook.delete();
                console.log(`Webhook deleted for channel ${channel.name}`);

                await guildSettings.set(guild.id, 'announcementWebhookId', null);
                await guildSettings.set(guild.id, 'announcementWebhookUrl', null);
            } catch (error) {
                console.error(`Error deleting webhook for channel ${channelID}: ${error}`);
            }
        }

        console.log(`Announcement subscription module ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    const announcementSubscriptionCategory = {
        categoryId: 'announcementSubscription',
        categoryName: 'Bot Announcements',
        categoryDescription: 'Configure the bot announcement settings',
        categoryOptionsList: [
            {
                optionId: 'announcementChannel',
                optionName: 'Announcement Channel',
                optionDescription: 'The channel where the announcements will be posted',
                optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText]),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild.id, 'announcementChannel');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild.id, 'announcementChannel', newData);
                    await updateAnnouncementSubscription(guild);
                },
            },
            {
                optionId: 'enableAnnouncementSubscription',
                optionName: 'Enable Announcement Subscription',
                optionDescription: 'Disable or Enable the bot announcement module note: Make sure bot has necessary permissions (create webhooks)',
                optionType: DBD.formTypes.switch(false),
                getActualSet: async ({ guild }) => {
                    return guildSettings.get(guild.id, 'announcementEnabled');
                },
                setNew: async ({ guild, newData }) => {
                    await guildSettings.set(guild.id, 'announcementEnabled', newData);
                    await updateAnnouncementSubscription(guild);
                },
            },
        ],
        categoryButtonsList: [
            {
                buttonId: 'submit',
                buttonName: 'Submit',
                buttonDescription: 'Save changes',
                buttonType: DBD.formTypes.checkbox(),
                onInteraction: async ({ guild, newSettings }) => {
                    await guildSettings.set(guild.id, 'announcementChannel', newSettings.announcementChannel);
                    await guildSettings.set(guild.id, 'announcementEnabled', newSettings.enableAnnouncementSubscription);
                    await updateAnnouncementSubscription(guild);
                },
            },
        ],
    };
    //#endregion

    const rsiStatusEmojis = {
        Operational: '<a:online:1081169135360294942>',
        Maintenance: '<a:offline:1081169189601022032>',
        Partial: ':warning:',
        Major: '<a:offline:1081169189601022032>',
        Degraded: ':warning:',
        Unknown: '❓',
    };


    //#region Dashboard Settings

    const Handler = new DBD.Handler(
        /*
                Keyv storage instance
                Example: { store: new KeyvMongo('mongodb://user:pass@localhost:27017/dbname') }
     
                Can be left empty to use the default storage (Keyv with SQLite)
            */
    );


    const Dashboard = new DBD.Dashboard({
        port: config.dbd.port,
        client: config.discord.client,
        redirectUri: `${config.dbd.domain}${config.dbd.redirectUri}`,
        domain: config.dbd.domain,
        ownerIDs: config.dbd.ownerIDs,
        useThemeMaintenance: true,
        useTheme404: true,
        bot: client,
        acceptPrivacyPolicy: true,
        sessionSaveSession: MongoStore.create({ mongoUrl: config.dbd.databaseLink }),

        guildAfterAuthorization: {
            use: true,
            guildId: '1067050161030840340'
        },
        supportServer: {
            inviteUrl: 'https://discord.com/invite/KEePmxAN7R',
            slash: '/support'
        },
        underMaintenanceAccessKey: '57SAxnCghek3A9e5',
        underMaintenanceAccessPage: '/beta',
        useUnderMaintenance: false,
        underMaintenance: {
            title: 'Under Maintenance',
            contentTitle: 'This page is under maintenance',
            texts: [
                "We are constantly striving to improve our services for you.",
                "We're making some technical updates to enhance the quality of our services.",
                "Your satisfaction is our top priority, which is why we're introducing some updates to improve our offerings.",
                '<br>',
                'Join the Space Helper <a href="https://discord.com/invite/KEePmxAN7R">Discord Support Server.</a>',
                '<br>',
                '<br>',
                '<br>',
            ],
            infoCards: [
                {
                    title: "Users",
                    description: "The bot is being used by 993 users!"
                },
                {
                    title: "Guilds",
                    description: "The bot is part of 32 guilds. Thank you for using Space Helper!"
                },
                {
                    title: "Features",
                    description: "I am always working on new features!"
                },


            ],
            bodyBackgroundColors: ['#ffa191', '#ffc247'],
            buildingsColor: '#ff6347',
            craneDivBorderColor: '#ff6347',
            craneArmColor: '#f88f7c',
            craneWeightColor: '#f88f7c',
            outerCraneColor: '#ff6347',
            craneLineColor: '#ff6347',
            craneCabinColor: '#f88f7c',
            craneStandColors: ['#ff6347', '#f29b8b'],
            maintenancePage: path.join(__dirname, 'views', 'maintenance.ejs'),

        },
        //#endregion

        //#region SoftUI Theme
        theme: SoftUI({
            storage: Handler,
            error: {
                error404: {
                    title: "Error 404",
                    subtitle: "Page Not Found",
                    description: "It seems you have stumbled into the abyss. Click the button below to return to the dashboard"
                },
                dbdError: {
                    disableSecretMenu: false,
                    secretMenuCombination: ["69", "82", "82", "79", "82"]
                }
            },
            locales: {
                enUS: {
                    name: "English",
                    index: {
                        feeds: ['Uptime', 'Current User', 'Server Count', 'Total Users'],
                        card: {
                            category: 'Dashboard',
                            title: 'Space Helper dashboard',
                            description: 'Welcome to Space Helper, the only Star Citizen bot you ever will need in your server!',
                            image: 'https://cdn.discordapp.com/attachments/1059563842276954192/1081978599206289448/spacehelper_png.png',
                        }
                    },
                    manage: {
                        settings: {
                            categoryId: 'setup',
                            categoryName: "Setup",
                            categoryDescription: "Setup your bot with default settings!",
                            getActualSet: async ({ guild }) => {
                                return [
                                    {
                                        optionId: "lang",
                                        data: langsSettings[guild.id] || null
                                    }
                                ]
                            },
                            setNew: async ({ guild, data }) => {

                                for (const option of data) {
                                    if (option.optionId === "lang") langsSettings[guild.id] = option.data;
                                }
                                return;
                            },
                            categoryOptionsList: [
                                {
                                    optionId: 'lang',
                                    optionName: "Language",
                                    optionDescription: "Change bot's language easily",
                                    optionType: DBD.formTypes.select({ "Polish": 'pl', "English": 'en', "French": 'fr' })
                                },
                            ],

                            memberCount: 'Members',
                            info: {
                                info: 'Info',
                                server: 'Server Information'
                            }
                        }
                    },
                    privacyPolicy: {
                        title: 'Privacy Policy and Terms of Service/Use',
                        description: 'Thank you for using our Discord bot dashboard. We take your privacy seriously and are committed to protecting your personal information. This privacy policy explains how we collect, use, and share your information when you use our services.<br><h4><br><b>Information we collect</b></h4>  We collect information that you provide to us when you use our Discord bot dashboard. This may include your Discord username, email address, avatar, banner, and the servers that you are a member of.<br><h4><br><b>How we use your information</b></h4><br>We may use the information that we collect to provide our services to you, including managing your Discord server and providing other functions that we make available to you. <br>We may share your information with third-party service providers who help us operate our services, such as hosting providers and analytics providers.<br><br>We do not sell or rent your personal information to third parties. <br><h4><br><b>Security</b></h4> We take reasonable measures to protect your personal information from unauthorized access, use, and disclosure. However, no security measures are perfect, and we cannot guarantee the security of your information.<br><h4><br><b>Changes to this privacy policy</b></h4><br>We may update this privacy policy from time to time. If we make any material changes, we will notify you on our discord <a href="https://discord.com/invite/KEePmxAN7R">Discord server</a> or by posting a notice on our website prior to the change becoming effective. We encourage you to review this privacy policy periodically.<br><h4><br><b>Join our Discord server</b></h4>To stay up to date with any updates related to the dashboard, Discord bot or the policy, we encourage you to join our Discord server at <a href="https://discord.com/invite/KEePmxAN7R">Discord server</a>. By joining our server, you will receive timely updates and be able to communicate directly with our team.<br><h4><br><b>Contact us</b></h4><br>If you have any questions or concerns about this privacy policy or our practices, please contact us at out Discord server.<br><br><h3><br><b>Terms of Service</b></h3><br>These terms of service govern your use of our Discord bot dashboard. By using our services, you agree to these terms of service.<br><h4><br><b>Use of the bot</b></h4><br>You may use our Discord bot dashboard to manage your Discord server and perform other functions that we make available to you. You may not use the bot for any illegal or unauthorized purpose.<br><h4><br><b>Attempting to crash the bot</b></h4><br>Attempting to crash the bot or otherwise disrupt its functioning is strictly prohibited. If we determine that you have attempted to crash the bot, we may black list you from using the bot.<br><h4><br><b>Intellectual property</b></h4><br>We own all intellectual property rights in our Discord bot dashboard, including any software, code, and content. You may not copy, modify, distribute, or sell any part of our services without our prior written consent.<br><h4><br><b>Termination</b></h4><br>We may terminate your access to our Discord bot dashboard at any time, for any reason, without notice. You may also terminate your use of our services at any time.<br><h4><br><b>Disclaimer of warranties</b></h4><br>We provide our services "as is" and without any warranty or guarantee. We do not guarantee that our services will be available at all times or that they will be error-free or secure.<br><h4><br><b>Changes to these terms</b></h4><br>We may update these terms of service from time to time. If we make any',
                        pp: 'Privacy Policy, Terms of Service/Use'
                    },
                    partials: {
                        sidebar: {
                            dash: 'Dashboard',
                            manage: 'Manage Guilds',
                            commands: 'Commands',
                            pp: 'Privacy Policy',
                            account: 'Account Pages',
                            test: 'test',
                            login: 'Sign In',
                            logout: 'Sign Out',
                        },
                        navbar: {
                            home: 'Home',
                            pages: {
                                manage: 'Manage Guilds',
                                settings: 'Manage Guilds',
                                commands: 'Commands',
                                pp: 'Privacy Policy',
                                maintenance: 'Under Maintenance'
                            }
                        },
                        title: {
                            pages: {
                                manage: 'Manage Guilds',
                                settings: 'Manage Guilds',
                                commands: 'Commands',
                                error: 'Error',
                                maintenance: 'Under Maintenance',
                            }
                        },
                        preloader: {
                            text: 'Page is loading...'
                        },
                        premium: {
                            title: 'You want to support the project?',
                            description: 'Be the first one to gain access to premium features!',
                            buttonText: 'Coming soon'
                        },
                        settings: {
                            title: 'Site Configuration',
                            description: 'Configurable Viewing Options',
                            theme: {
                                title: 'Site Theme',
                                description: 'Make the site more appealing for your eyes!'
                            },
                            language: {
                                title: 'Site Language',
                                description: 'Select your preferred language!'
                            },
                            footer: {
                                replaceDefault: true,
                                text: "Bot developed by Oscar"

                            },
                        }
                    }
                }
            },
            //#endregion

            //#region CustomThemeOptions
            customThemeOptions: {
                index: async ({ req, res, config }) => {

                    //#region Functions for the cards

                    // Get all guild member count
                    const totalMembers = await client.guilds.cache.reduce(async (prev, guild) => {
                        const accumulator = await prev;
                        const memberCount = await guild.members.cache.filter(member => !member.user.bot).size;
                        return accumulator + memberCount;
                    }, Promise.resolve(0));

                    // Sign in card
                    let user = req.session?.user;
                    let userTag = user ? `${user.username}#${user.discriminator}` : "Guest/Not Signed In";
                    let guildCount = client.guilds.cache.size;

                    // Uptime card
                    const uptime = process.uptime();
                    const days = Math.floor(uptime / 86400);
                    const hours = Math.floor((uptime % 86400) / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = Math.floor(uptime % 60);

                    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`; // Uptime will be shown as 1d 1h 1m 1s

                    //#endregion

                    //#region Cards (Bot Uptime, Logged in Username, Guilds, Total Users)
                    const cards = [
                        {
                            title: "Bot Uptime",
                            icon: "time-alarm",
                            getValue: uptimeString,
                        },
                        {
                            title: "UserName",
                            getValue: userTag,
                            icon: "circle-08",
                        },
                        {
                            title: "Guilds",
                            getValue: guildCount,
                            icon: "world-2",
                        },
                        {
                            title: "Total Users",
                            getValue: totalMembers,
                            icon: "circle-08",
                        },

                    ]
                    const graph = {
                        values: [690, 524, 345, 645, 478, 592, 468, 783, 459, 230, 621, 345],
                        labels: ["1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "10m"],
                    };
                    return {
                        cards,
                        graph,
                    };
                    //#endregion
                }
            },
            websiteName: "Space Helper",
            colorScheme: "blue",
            supporteMail: "",
            icons: {
                favicon: "https://cdn.discordapp.com/attachments/1084597909212909688/1088138489356353597/spacehelper_robot.png",
                noGuildIcon: "https://cdn.discordapp.com/attachments/1084597909212909688/1085690653557661816/Discord-Logo-Circle-1024x1024.png",
                sidebar: {
                    darkUrl: "https://cdn.discordapp.com/attachments/1059563842276954192/1081978599206289448/spacehelper_png.png ",
                    lightUrl: "https://cdn.discordapp.com/attachments/1059563842276954192/1081978599206289448/spacehelper_png.png ",
                    hideName: true,
                    borderRadius: true,
                    alignCenter: true,
                },
            }, er: {
                image: "",
                spinner: false,
                text: "Page is loading",
            },
            index: {
                graph: {
                    enabled: false,
                    lineGraph: false,
                    tag: 'Uptime',
                    max: 100
                },
            },
            sweetalert: {
                errors: {},
                success: {
                    login: "Successfully logged in.",
                }
            },
            preloader: {
                image: "",
                spinner: false,
                text: "Page is loading",
            },
            premium: {
                enabled: true,
                card: {
                    title: "Want to support the Bot?",
                    description: "Be the first one to gain access to premium features when they arrive!",
                    bgImage: "https://cdn.discordapp.com/attachments/1059563842276954192/1081978599206289448/spacehelper_png.png",
                    button: {
                        text: "Coming soon",
                        url: "#"
                    },
                }
            },

            // Some of these are old commands need to update these
            commands: [
                {
                    category: "Command List",
                    subTitle: "",
                    categoryId: "1",
                    hideAlias: false,
                    hideDescription: false,
                    hideSidebarItem: false,
                    list: [

                        {
                            commandName: "search model",
                            commandUsage: `/search model model: carrack`,
                            commandDescription: "Search for a modal in the Star Citizen universe",
                            commandAlias: "search",
                        },
                        {
                            commandName: "search org",
                            commandUsage: `/search org org: corp`,
                            commandDescription: "Search for orgs in that exist in Star Citizen. Note: I do not own the corp I am simply using it as an example for this one you need to use the Spectrum ID.",
                            commandAlias: "search",
                        },
                        {
                            commandName: "search system",
                            commandUsage: `/search org org: corp`,
                            commandDescription: "Search for systems that exist in Star Citizen.",
                            commandAlias: "search",
                        },
                        {
                            commandName: "patchnotes",
                            commandUsage: `/patchnotes version:Star Citizen Alpha 3.18.0`,
                            commandDescription: "Check patch notes",
                            commandAlias: "No aliases",

                        },
                        {
                            commandName: "rsistatus",
                            commandUsage: `/rsistatus`,
                            commandDescription: "Check the status of rsi servers",
                            commandAlias: "No aliases",
                        },
                        {
                            commandName: "user",
                            commandUsage: `/userinfo user:@Osnar#0007`,
                            commandDescription: "Get user info",
                            commandAlias: "No aliases"
                        },
                        {
                            commandName: "rules",
                            commandUsage: `/rules rules_channel:#rules`,
                            commandDescription: "Send predifined rules to a channel, when user clicks accept rules button they receive a role called accepted-roles. This will be added to dashboard soon so it can be modified to your liking",
                            commandAlias: "No aliases"
                        },
                        {
                            commandName: "ban",
                            commandUsage: `/ban user:@Space Helper#3175 reason:too cool`,
                            commandDescription: "ban members",
                            commandAlias: "No aliases"
                        },
                        {
                            commandName: "kick",
                            commandUsage: `/kick user:@Space Helper#3175 reason:too cool`,
                            commandDescription: "kick members",
                            commandAlias: "No aliases"
                        },
                        {
                            commandName: "timeout",
                            commandUsage: `/timeout targetuser:@Space Helper#3175 duration:1d reason:too cool`,
                            commandDescription: "timeout members",
                            commandAlias: "No aliases"
                        },
                        {
                            commandName: "purge",
                            commandUsage: `/purge amount:1`,
                            commandDescription: "purge messages",
                            commandAlias: "No aliases"
                        },

                    ],
                }
            ]
        }),
        settings: [welcomeCategory, welcomeRoleCategory, logsCategory, announcementSubscriptionCategory,] // Here are the module settings
    });
    //#endregion

    //#region Dashboard init
    // Initialize the Discord Dashboard when it's ready
    Dashboard.init();
    //#endregion

    //#region Welcome Message Module

    // Welcome Message Module Event
    client.on('guildMemberAdd', async (member) => {
        const guild = member.guild;

        // Check if welcome message is enabled for this guild 
        const welcomeEnabled = await guildSettings.get(guild, 'welcomeEnabled');

        const welcomeMessage = await welcomeMessageOption.getActualSet({ guild });

        const welcomeChannelID = await guildSettings.get(guild, 'welcomeChannel');

        const welcomeChannel = guild.channels.cache.get(welcomeChannelID);

        const welcomeEmbedColor = await guildSettings.get(guild, 'welcomeEmbedColor');

        if (!welcomeChannel) {
            return;
        }

        //#region Default values for the welcome Message module

        // Use default embed color if not set by user
        const embedColor = welcomeEmbedColor || '#F9A602';

        // Check if welcomeEnabled (Switch is True) so it knows its enabled
        if (welcomeEnabled) {
            // Parse the welcome message to replace the {guildMembers} placeholder with the current member count of the guild
            const parsedWelcomeMessage = await welcomeMessageOption.parseWelcomeMessage(welcomeMessage, guild);

            // Replace '{user}' with the mention of the new member
            const messageWithMention = parsedWelcomeMessage.replace('{user}', `<@${member.id}>`);

            // Send the welcome message to the channel they selected in the dashboard 
            try {
                const welcomeEmbed = new EmbedBuilder()
                    .setDescription(messageWithMention)
                    .setColor(embedColor);
                await welcomeChannel.send({ embeds: [welcomeEmbed] });
            } catch (err) {
                console.error(`Failed to send welcome message to channel ${welcomeChannel}: ${err}`);
            }
        }
    });
    //#endregion

    //#endregion

    //#region Welcome Role Module

    client.on('guildMemberAdd', async (member) => {
        const guild = member.guild;
        const welcomeRoleId = await guildSettings.get(guild, 'welcomeRole');
        const showWelcomeRole = await guildSettings.get(guild, 'showWelcomeRole');
        const welcomeEnabledRole = await guildSettings.get(guild, 'welcomeEnabledRole');
        const welcomeChannelId = await guildSettings.get(guild, 'welcomeChannel');
        const welcomeChannel = guild.channels.cache.get(welcomeChannelId);

        if (welcomeEnabledRole && showWelcomeRole && welcomeRoleId) {
            const welcomeRole = guild.roles.cache.get(welcomeRoleId);
            if (welcomeRole) {
                try {
                    await member.roles.add(welcomeRole);
                } catch (error) {
                    
                    console.error(`Failed to add welcome role to user: ${error}`);
                    if (error.code === 50013 && welcomeChannel) {
                        welcomeChannel.send(`I do not have permission to add the welcome role to new members. Please make sure that my role is above the welcome role in the role hierarchy and has permissions to manage roles..`);
                    }
                    if (error.code === 50001 && welcomeChannel) {
                        welcomeChannel.send(`I do not have permission to add the welcome role to new members. Please make sure that my role is above the welcome role in the role hierarchy and has permissions to manage roles.`);
                    }
                }
            }
        }
    });

    //#endregion

    //#region Logs Module Events

    // Guild member Kicked Event
    client.on('guildMemberRemove', async (member) => {
        const guild = member.guild;
        const logsChannelId = await guildSettings.get(guild, 'logsChannel');
        const kickLogsEnabled = await guildSettings.get(guild, 'kickLogs');
        const kickLogsEmbedColor = await guildSettings.get(guild, 'kickLogsEmbedColor');

        try {
            const auditLogs = await guild.fetchAuditLogs({ limit: 1 });
            const lastLog = auditLogs.entries.first();

            if (kickLogsEnabled && lastLog && lastLog.action === AuditLogEvent.MemberKick && lastLog.target.id === member.user.id) {
                const logsChannel = guild.channels.cache.get(logsChannelId);

                if (logsChannel) {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle('Member Kicked')
                            .setDescription(`${member.user} (${member.user.tag}) was kicked from the server.`)
                            .setColor(kickLogsEmbedColor || '#F9A602')
                            .setTimestamp();

                        await logsChannel.send({ embeds: [embed] });
                    } catch (error) {
                        if (error.code === 50013 || error.code === 50001) {
                            console.error('Missing permissions to send log message.');
                        } else {
                            console.error(`Failed to send kick log: ${error}`);
                        }
                    }
                } else {
                    console.error('Unable to find logs channel.');
                }
            } else {
                // console.log('No audit logs or member kick action found.');
            }
        } catch (error) {
            console.error(`Failed to fetch audit logs: ${error}`);
        }
    });

    // Guild ban add event
    client.on('guildBanAdd', async (ban) => {
        const guild = ban.guild;
        const logsChannelId = await guildSettings.get(guild, 'logsChannel');
        const banLogsEnabled = await guildSettings.get(guild, 'banLogs');
        const banLogsEmbedColor = await guildSettings.get(guild, 'banLogsEmbedColor');

        if (banLogsEnabled) {
            const logsChannel = guild.channels.cache.get(logsChannelId);
            if (logsChannel) {
                try {


                    const embed = new EmbedBuilder()
                        .setTitle('Member Banned')
                        .setDescription(`${ban.user} (${ban.user.tag}) was banned from the server.`)
                        .setColor(banLogsEmbedColor || '#F9A602')
                        .setTimestamp();

                    await logsChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`Failed to send ban log: ${error}`);
                }
            }
        }
    });

    // Guild Unban Event
    client.on('guildBanRemove', async (ban) => {
        const guild = ban.guild;
        const logsChannelId = await guildSettings.get(guild, 'logsChannel');
        const unbanLogsEnabled = await guildSettings.get(guild, 'unbanLogs');
        const unbanLogsEmbedColor = await guildSettings.get(guild, 'unbanLogsEmbedColor');

        if (unbanLogsEnabled) {
            const logsChannel = guild.channels.cache.get(logsChannelId);
            if (logsChannel) {
                try {
                    const embed = new EmbedBuilder()
                        .setTitle('Member Unbanned')
                        .setDescription(`${ban.user} (${ban.user.tag}) was unbanned from the server.`)
                        .setColor(unbanLogsEmbedColor || '#F9A602')
                        .setTimestamp();
                    await logsChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`Failed to send unban log: ${error}`);
                }
            }
        }
    });

    // Guild Name change and Role updates Event
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const guild = oldMember.guild;
        const logsChannelId = await guildSettings.get(guild, 'logsChannel');
        const nameChangeLogsEnabled = await guildSettings.get(guild, 'nameChangeLogs');
        const roleLogsEnabled = await guildSettings.get(guild, 'roleLogs');
        const roleLogsColor = await guildSettings.get(guild, 'roleLogsEmbedColor');
        const nameChangeLogsEmbedColor = await guildSettings.get(guild, 'nameChangeLogsEmbedColor');

        // Name change logic needs a rework it currently send the embed as = Username Changed name to Username when it should change oldUserName changed name to NewUserName
        if (nameChangeLogsEnabled && oldMember.displayName !== newMember.displayName) {
            const logsChannel = guild.channels.cache.get(logsChannelId);
            if (logsChannel) {
                try {
                    const embed = new EmbedBuilder()
                        .setTitle('Member Name Changed')
                        .setDescription(`${oldMember.toString()} changed their name to ${newMember.toString()}.`)
                        .setColor(nameChangeLogsEmbedColor || '#F9A602')
                        .setTimestamp();
                    await logsChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`Failed to send name change log: ${error}`);
                }
            }
        }

        if (roleLogsEnabled && oldMember.roles.cache.size !== newMember.roles.cache.size) {
            const logsChannel = guild.channels.cache.get(logsChannelId);
            if (logsChannel) {
                try {
                    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
                    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

                    const embed = new EmbedBuilder()
                        .setTitle('Member Roles Updated')
                        .setColor(roleLogsColor || '#F9A602')
                        .setDescription(`${newMember.toString()}'s roles have been updated.`)
                        .setTimestamp();

                    if (addedRoles.size > 0) {
                        embed.addFields({ name: 'Roles Added', value: addedRoles.map(role => `<@&${role.id}>`).join(', '), inline: true });
                    }

                    if (removedRoles.size > 0) {
                        embed.addFields({ name: 'Roles Removed', value: removedRoles.map(role => `<@&${role.id}>`).join(', '), inline: true });
                    }

                    await logsChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`Failed to send role change log: ${error}`);
                }
            }
        }
    });

    //#endregion

    //#region Initialize the Modal CustomID at bot start
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isModalSubmit()) return;

        // Get the customID from the feedback command
        if (interaction.customId === 'modal') {
            await interaction.reply({ content: "Your modal has been submitted", ephemeral: true });
        }

        // Get the data entered by the user
        const name = interaction.fields.getTextInputValue('name'); // Not Required
        const feedback = interaction.fields.getTextInputValue('feedback'); // Required
        const user = interaction.user.tag;

        const embed = new EmbedBuilder()
            .setTitle(`New feedback from ${user}`)
            .setColor('#7842f5')
            .addFields(
                { name: 'Name', value: name || 'Not provided', inline: false }, // Will return "Not Provided" if they didnt add their username
                { name: 'Feedback', value: feedback, inline: false }, // Will return the text they entered in the feedback field
            )

        // Send the embed to a specific channel (SpaceHelper Discord server private channel.)
        const channel = interaction.client.channels.cache.get('635828957861904424');
        if (channel?.type === ChannelType.GuildText) {
            await channel.send({ embeds: [embed] });
        } else {
            console.log('Invalid channel ID');
        }
    });
    //#endregion

    //#region Accepted Rules CustomButtonID handler

    
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'accept_rules') {
            const guild = interaction.guild;
            const member = await guild.members.fetch(interaction.user.id);
            const role = guild.roles.cache.find(role => role.name === 'accepted-roles');
            if (!role) {
                console.error('The accepted-roles role does not exist');
                return;
            }
            if (member.roles.cache.has(role.id)) {
                await interaction.reply({ content: 'You have already accepted the server rules.', ephemeral: true });
            } else {
                member.roles.add(role);
                await interaction.reply({ content: 'Thank you for accepting the server rules!', ephemeral: true });
            }
        }
    });
    //#endregion

    //#region Bot Status on Ready

    // Bot Status on ready...
    client.on('ready', () => {
        client.user.setPresence({
            activities: [{ name: `/help - spacehelper.xyz`, type: ActivityType.Playing }],
            status: 'online',
        }, (error) => {
            if (error) {
                console.error('Error setting bot presence:', error);
            } else {
                console.log('Bot presence has been set.');
            }
        });
    });


    //#endregion

})();
