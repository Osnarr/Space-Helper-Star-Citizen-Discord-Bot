const { MongoClient } = require('mongodb');
const config = require('../Spacehelper/config/config.json');

class GuildSettings {
  constructor() {
    this.client = new MongoClient(config.dbd.databaseLink, { useNewUrlParser: true, useUnifiedTopology: true });
    this.settings = new Map();
  }

  async connect() {
    await this.client.connect();
    // Select the database and collection
    const db = this.client.db('SpaceHelper');
    this.collection = db.collection('guildSettings');
  }

  async get(guild, key, defaultValue) {
    const guildId = this.getGuildId(guild);
    let guildSettings = this.settings.get(guildId);
    if (!guildSettings) {
      guildSettings = await this.collection.findOne({ guildId });
      if (guildSettings) {
        this.settings.set(guildId, guildSettings);
      }
    }
    if (!guildSettings) {
      return defaultValue;
    }
    return guildSettings[key] ?? defaultValue;
  }

  async set(guild, key, value) {
    const guildId = this.getGuildId(guild);
    let guildSettings = this.settings.get(guildId);
    if (!guildSettings) {
      guildSettings = await this.collection.findOne({ guildId });
      if (guildSettings) {
        this.settings.set(guildId, guildSettings);
      } else {
        guildSettings = { guildId };
      }
    }
    guildSettings[key] = value;
    this.settings.set(guildId, guildSettings);
    await this.collection.updateOne({ guildId }, { $set: guildSettings }, { upsert: true });
  }

  async delete(guild, key) {
    const guildId = this.getGuildId(guild);
    let guildSettings = this.settings.get(guildId);
    if (!guildSettings) {
      guildSettings = await this.collection.findOne({ guildId });
      if (guildSettings) {
        this.settings.set(guildId, guildSettings);
      } else {
        return;
      }
    }
    delete guildSettings[key];
    this.settings.set(guildId, guildSettings);
    await this.collection.updateOne({ guildId }, { $unset: { [key]: '' } });
  }

  async clear(guild) {
    const guildId = this.getGuildId(guild);
    this.settings.delete(guildId);
    await this.collection.deleteOne({ guildId });
  }

  getGuildId(guild) {
    if (guild === null || guild === undefined) {
      throw new Error('Invalid guild object');
    }
    return guild.id ?? guild;
  }
}

module.exports = GuildSettings;
