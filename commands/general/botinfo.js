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

const { version: discordjsVersion } = require('discord.js');
const { version: nodejsVersion } = require('process');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Displays info about the bot.')
    .setDefaultPermission(false),

  async execute(interaction) {
    console.log(`Command '${interaction.commandName}' was called.`);
    
    // Calculate bot uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime) % 60;

    // Calculate total number of users across all guilds
    const totalUsers = await interaction.client.users.cache.size;

    // Calculate number of guilds the bot is in
    const guilds = await interaction.client.guilds.cache.size;

    // Calculate bot ping
    const ping = Date.now() - interaction.createdTimestamp;

    // Calculate error count (need to add logic for this)
    const errorCount = 0; 

    const botInfoEmbed = new EmbedBuilder()
      .setColor('#7842f5')
      .setTitle('Bot Info')
      .addFields(
        { name: '<:uptime:1090239714814066769> Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '<:ping:1090239716412096573> Ping', value: `${ping}ms`, inline: true },
        { name: ':globe_with_meridians: Guilds', value: guilds.toString(), inline: true },
        { name: '<:users:1090237284265250896> Total Users', value: totalUsers.toString(), inline: true },
        { name: '<:discordjs:1090234471179091989> Discord.js Version', value: discordjsVersion, inline: true },
        { name: '<:nodejs:1090234538074058873> Node.js Version', value: `${nodejsVersion}`, inline: true },
        { name: '<:errors:1090239712335237250> Error Count', value: errorCount.toString(), inline: true },
        { name: '<:website:1090239717867540551> Website', value: 'https://spacehelper.xyz', inline: true },
        { name: '<:developer:1090237577384173598> Developer', value: `Osnar#0007`, inline: true },


      );
    

    return interaction.reply({ embeds: [botInfoEmbed] });
  },
};